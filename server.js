require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

const app = express();
const PORT = process.env.NODE_ENV === "development" ? 3005 : 80;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const rawAudioParser = express.raw({
    type: 'application/octet-stream',
    limit: '25mb'
});

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const streamingSessions = new Map();

// Azure Speech Service configuration
const speechKey = process.env.SPEECH_KEY;
const speechRegion = process.env.SPEECH_REGION;
const sourceLanguage = process.env.SOURCE_LANGUAGE || 'en-US';
const targetLanguage = process.env.TARGET_LANGUAGE || 'es-ES';
const targetLangCode = targetLanguage.includes('-') ? targetLanguage.split('-')[0] : targetLanguage;

if (!speechKey || !speechRegion) {
    console.error('❌ Error: SPEECH_KEY and SPEECH_REGION must be set in .env file');
    process.exit(1);
}

const translationConfig = sdk.SpeechTranslationConfig.fromSubscription(
    speechKey,
    speechRegion
);
translationConfig.speechRecognitionLanguage = sourceLanguage;
translationConfig.addTargetLanguage(targetLangCode);
if (process.env.TARGET_VOICE) {
    translationConfig.voiceName = process.env.TARGET_VOICE;
}

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get current configuration
app.get('/api/config', (req, res) => {
    res.json({
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        region: speechRegion
    });
});

// Streaming endpoints
app.post('/api/stream/start', (req, res) => {
    const { sampleRate, sourceLanguage: reqSourceLang, targetLanguage: reqTargetLang } = req.body || {};

    if (!sampleRate) {
        return res.status(400).json({ error: 'sampleRate is required' });
    }

    const sessionId = randomUUID();
    const rawPath = path.join('uploads', `${sessionId}.pcm`);

    fs.writeFileSync(rawPath, Buffer.alloc(0));

    // Use requested languages or fall back to defaults
    const sessionSourceLang = reqSourceLang || sourceLanguage;
    const sessionTargetLang = reqTargetLang || targetLanguage;

    streamingSessions.set(sessionId, {
        rawPath,
        sampleRate,
        totalSamples: 0,
        sourceLanguage: sessionSourceLang,
        targetLanguage: sessionTargetLang
    });

    console.log(`🎬 Started streaming session: ${sessionId} (${sampleRate} Hz)`);
    console.log(`   Languages: ${sessionSourceLang} → ${sessionTargetLang}`);
    res.json({ sessionId });
});

app.post('/api/stream/chunk', rawAudioParser, (req, res) => {
    const sessionId = req.header('x-session-id');
    if (!sessionId) {
        return res.status(400).json({ error: 'Missing session id' });
    }

    const session = streamingSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ error: 'Chunk payload missing or empty' });
    }

    try {
        fs.appendFileSync(session.rawPath, req.body);
        session.totalSamples += req.body.length / 2; // Int16 samples
        res.status(204).end();
    } catch (error) {
        console.error(`❌ Failed to append audio chunk for session ${sessionId}:`, error);
        res.status(500).json({ error: 'Failed to append chunk' });
    }
});

app.post('/api/stream/stop', async (req, res) => {
    const { sessionId } = req.body || {};
    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = streamingSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    try {
        console.log(`🛑 Stopping stream session: ${sessionId}`);
        
        const rawBuffer = fs.readFileSync(session.rawPath);
        console.log(`📊 Raw PCM size: ${rawBuffer.length} bytes, Samples: ${session.totalSamples}`);
        
        const wavBuffer = buildWavFromPCM(rawBuffer, session.sampleRate);
        const wavPath = path.join('uploads', `${sessionId}.wav`);
        fs.writeFileSync(wavPath, wavBuffer);
        console.log(`💾 WAV file created: ${wavPath} (${wavBuffer.length} bytes)`);

        // Store WAV path for SSE endpoint
        session.wavPath = wavPath;
        session.status = 'ready';

        res.json({
            sessionId,
            status: 'ready',
            message: 'Audio ready for translation. Connect to SSE endpoint.'
        });
    } catch (error) {
        console.error('❌ Stream finalization error:', error);
        console.error('   Stack:', error.stack);
        
        // Cleanup on error
        if (session.rawPath && fs.existsSync(session.rawPath)) {
            fs.unlinkSync(session.rawPath);
        }
        streamingSessions.delete(sessionId);
        
        res.status(500).json({ error: 'Failed to finalize stream', details: error.message });
    }
});

// SSE endpoint for real-time translation events
app.get('/api/stream/translate/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const session = streamingSessions.get(sessionId);

    if (!session || session.status !== 'ready') {
        return res.status(404).json({ error: 'Session not found or not ready' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        console.log(`🔄 Starting real-time translation for session: ${sessionId}`);
        console.log(`   Using languages: ${session.sourceLanguage} → ${session.targetLanguage}`);
        
        await translateAudioFileWithEvents(session.wavPath, sendEvent, session);
        
        sendEvent('complete', { message: 'Translation complete' });
        res.end();
        
        // Note: Don't delete session yet - audio needs to be fetched
        // Cleanup will happen after audio is downloaded or after timeout
    } catch (error) {
        console.error('❌ Translation error:', error);
        sendEvent('error', { message: error.message });
        res.end();
        
        // Cleanup on error
        if (fs.existsSync(session.rawPath)) fs.unlinkSync(session.rawPath);
        if (fs.existsSync(session.wavPath)) fs.unlinkSync(session.wavPath);
        streamingSessions.delete(sessionId);
    }
});

// Get audio for a session
app.get('/api/stream/audio/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = streamingSessions.get(sessionId);

    if (!session || !session.audioData) {
        return res.status(404).json({ error: 'Audio not found for this session' });
    }

    console.log(`🎵 Sending audio for session: ${sessionId}`);
    
    res.json({
        audioData: session.audioData,
        originalText: session.finalOriginalText,
        translatedText: session.finalTranslatedText,
        sourceLanguage: session.sourceLanguage,
        targetLanguage: session.targetLanguage
    });

    // Cleanup after sending audio
    setTimeout(() => {
        if (fs.existsSync(session.rawPath)) fs.unlinkSync(session.rawPath);
        if (fs.existsSync(session.wavPath)) fs.unlinkSync(session.wavPath);
        streamingSessions.delete(sessionId);
        console.log(`🧹 Cleaned up session: ${sessionId}`);
    }, 1000);
});

// Translate audio endpoint (legacy - kept for backward compatibility)
app.post('/api/translate', upload.single('audio'), async (req, res) => {
    const audioFile = req.file;

    if (!audioFile) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    try {
        console.log(`📥 Received audio file: ${audioFile.originalname}`);

        // Speech recognition + Translation + Speech synthesis
        const { originalText, translatedText, translatedAudio } = await translateAudioFile(audioFile.path);
        console.log(`✅ Recognized: "${originalText}"`);
        console.log(`📝 Translated: "${translatedText}"`);

        // Clean up uploaded file
        fs.unlinkSync(audioFile.path);

        // Send response
        res.json({
            originalText,
            translatedText: translatedText,
            audioData: translatedAudio,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage
        });

    } catch (error) {
        console.error('❌ Translation error:', error);
        
        // Clean up uploaded file if it exists
        if (audioFile && fs.existsSync(audioFile.path)) {
            fs.unlinkSync(audioFile.path);
        }

        res.status(500).json({
            error: 'Translation failed',
            details: error.message
        });
    }
});

// Speech Translation function (legacy - for non-streaming)
async function translateAudioFile(audioFilePath) {
    try {
        // Step 1: Recognize and translate speech
        const { originalText, translatedText } = await recognizeAndTranslate(audioFilePath);
        
        // Step 2: Synthesize translated text to speech
        const translatedAudio = await synthesizeTranslatedSpeech(translatedText);
        
        return {
            originalText,
            translatedText,
            translatedAudio
        };
    } catch (error) {
        throw error;
    }
}

// Event-based translation with real-time updates
async function translateAudioFileWithEvents(audioFilePath, sendEvent, session) {
    return new Promise((resolve, reject) => {
        // Create session-specific translation config
        const sessionTranslationConfig = sdk.SpeechTranslationConfig.fromSubscription(speechKey, speechRegion);
        sessionTranslationConfig.speechRecognitionLanguage = session.sourceLanguage;
        sessionTranslationConfig.addTargetLanguage(session.targetLanguage.split('-')[0]); // Extract language code (e.g., 'ar' from 'ar-SA')
        
        const wavBuffer = fs.readFileSync(audioFilePath);
        const audioConfig = sdk.AudioConfig.fromWavFileInput(wavBuffer);
        const recognizer = new sdk.TranslationRecognizer(sessionTranslationConfig, audioConfig);

        let finalOriginalText = '';
        let finalTranslatedText = '';
        const targetLangCode = session.targetLanguage.split('-')[0];
        
        // Find session ID
        let sessionId = null;
        for (const [id, sess] of streamingSessions.entries()) {
            if (sess === session) {
                sessionId = id;
                break;
            }
        }

        // Recognizing event - interim results
        recognizer.recognizing = (s, e) => {
            if (e.result.reason === sdk.ResultReason.TranslatingSpeech) {
                const translation = e.result.translations.get(targetLangCode) || '';
                console.log(`⏳ Recognizing: "${e.result.text}" -> "${translation}"`);
                
                sendEvent('recognizing', {
                    originalText: e.result.text,
                    translatedText: translation,
                    isFinal: false
                });
            }
        };

        // Recognized event - final results (non-async, just store data)
        recognizer.recognized = (s, e) => {
            if (e.result.reason === sdk.ResultReason.TranslatedSpeech) {
                const translation = e.result.translations.get(targetLangCode);
                finalOriginalText = e.result.text;
                finalTranslatedText = translation;
                
                console.log(`✅ Recognized: "${finalOriginalText}"`);
                console.log(`📝 Translated: "${finalTranslatedText}"`);
                
                sendEvent('recognized', {
                    originalText: finalOriginalText,
                    translatedText: finalTranslatedText,
                    isFinal: true
                });
            } else if (e.result.reason === sdk.ResultReason.NoMatch) {
                console.log('⚠️ No speech recognized');
                sendEvent('error', { message: 'No speech could be recognized' });
            }
        };

        recognizer.canceled = (s, e) => {
            console.error(`❌ Recognition canceled: ${e.reason}`);
            if (e.reason === sdk.CancellationReason.Error) {
                console.error(`   Error details: ${e.errorDetails}`);
            }
            recognizer.close();
            reject(new Error(e.errorDetails || 'Recognition canceled'));
        };

        let recognizerClosed = false;

        recognizer.sessionStopped = (s, e) => {
            console.log('⏹️ Recognition session stopped');
            if (!recognizerClosed) {
                recognizer.close();
                recognizerClosed = true;
            }
        };

        // Start recognition
        recognizer.recognizeOnceAsync(
            async result => {
                if (!recognizerClosed) {
                    recognizer.close();
                    recognizerClosed = true;
                }
                
                // After recognition completes, synthesize audio if we have translation
                if (finalTranslatedText) {
                    try {
                        console.log('🔊 Synthesizing audio...');
                        const audioData = await synthesizeTranslatedSpeech(finalTranslatedText, session.targetLanguage);
                        console.log(`✅ Audio generated: ${audioData.length} chars (base64)`);
                        
                        // Store audio in session for separate download
                        session.audioData = audioData;
                        session.finalOriginalText = finalOriginalText;
                        session.finalTranslatedText = finalTranslatedText;
                        
                        console.log(`📤 Sending audio-ready event for session: ${sessionId}`);
                        sendEvent('audio-ready', {
                            sessionId,
                            sourceLanguage: session.sourceLanguage,
                            targetLanguage: session.targetLanguage,
                            originalText: finalOriginalText,
                            translatedText: finalTranslatedText
                        });
                    } catch (audioError) {
                        console.error('❌ Audio synthesis error:', audioError);
                        sendEvent('error', { message: 'Audio synthesis failed', details: audioError.message });
                    }
                }
                
                resolve();
            },
            error => {
                if (!recognizerClosed) {
                    recognizer.close();
                    recognizerClosed = true;
                }
                reject(error);
            }
        );
    });
}

// Recognize speech and translate
function recognizeAndTranslate(audioFilePath) {
    return new Promise((resolve, reject) => {
        const wavBuffer = fs.readFileSync(audioFilePath);
        const audioConfig = sdk.AudioConfig.fromWavFileInput(wavBuffer);
        const recognizer = new sdk.TranslationRecognizer(translationConfig, audioConfig);

        recognizer.recognizeOnceAsync(
            result => {
                recognizer.close();

                if (result.reason === sdk.ResultReason.TranslatedSpeech) {
                    const translation = result.translations.get(targetLangCode);
                    if (!translation) {
                        reject(new Error(`No translation found for language code ${targetLangCode}`));
                        return;
                    }

                    resolve({
                        originalText: result.text,
                        translatedText: translation
                    });
                    return;
                }

                if (result.reason === sdk.ResultReason.NoMatch) {
                    reject(new Error('No speech could be recognized'));
                    return;
                }

                if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                    reject(new Error('Speech recognized but translation was not returned.'));
                    return;
                }

                const cancellation = sdk.CancellationDetails.fromResult(result);
                const errorMessage = cancellation.errorDetails
                    ? `Translation canceled: ${cancellation.reason}. Details: ${cancellation.errorDetails}`
                    : `Translation canceled: ${cancellation.reason}`;
                reject(new Error(errorMessage));
            },
            error => {
                recognizer.close();
                reject(error);
            }
        );
    });
}

// Synthesize translated text to speech
function synthesizeTranslatedSpeech(text, targetLang = targetLanguage) {
    return new Promise((resolve, reject) => {
        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechSynthesisLanguage = targetLang;
        
        if (process.env.TARGET_VOICE) {
            speechConfig.speechSynthesisVoiceName = process.env.TARGET_VOICE;
        }

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

        synthesizer.speakTextAsync(
            text,
            result => {
                synthesizer.close();
                
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    resolve(Buffer.from(result.audioData).toString('base64'));
                } else {
                    reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
                }
            },
            error => {
                synthesizer.close();
                reject(error);
            }
        );
    });
}

function buildWavFromPCM(rawPCMBuffer, sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = numChannels * (bitsPerSample / 8);
    const byteRate = sampleRate * blockAlign;
    const dataLength = rawPCMBuffer.length;
    const buffer = Buffer.alloc(44 + dataLength);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20); // AudioFormat PCM
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataLength, 40);

    rawPCMBuffer.copy(buffer, 44);
    return buffer;
}

// Start server
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   Azure Voice-to-Voice Translation Server            ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n🚀 Server running at: http://localhost:${PORT}`);
    console.log(`📍 Configuration:`);
    console.log(`   Source Language: ${sourceLanguage}`);
    console.log(`   Target Language: ${targetLanguage}`);
    console.log(`   Region: ${speechRegion}`);
    console.log(`\n💡 Open http://localhost:${PORT} in your browser\n`);
});
