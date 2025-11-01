# Azure Voice-to-Voice Translation

A real-time voice-to-voice translation web application using Azure Cognitive Services. Speak in one language and hear the translation in another language instantly through an intuitive web interface!

## 🌟 Features

- **Web-Based Interface**: Beautiful, modern UI accessible from any browser
- **Hold-to-Record**: Simple push-and-hold recording interface
- **Real-time Speech Recognition**: Converts your speech to text using Azure Speech Services
- **Automatic Translation**: Translates recognized text to your target language
- **Text-to-Speech Synthesis**: Converts translated text back to speech
- **Audio Playback**: Play translated audio directly in the browser
- **Multi-language Support**: Supports 100+ languages available in Azure Cognitive Services
- **Customizable Voices**: Choose from various neural voices for natural-sounding output
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
2. **Azure Account** - [Create free account](https://azure.microsoft.com/free/)
3. **Microphone and Speakers** - For voice input and output

## 🚀 Setup Instructions

### Step 1: Create Azure Speech Service

1. Go to [Azure Portal](https://portal.azure.com/)
2. Click **"Create a resource"**
3. Search for **"Speech"** and select **"Speech Services"**
4. Click **"Create"**
5. Fill in the required information:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose a region (e.g., `eastus`, `westeurope`)
   - **Name**: Give it a unique name
   - **Pricing Tier**: Select **Free F0** (for testing) or **Standard S0**
6. Click **"Review + Create"** then **"Create"**
7. Once deployed, go to your resource
8. Navigate to **"Keys and Endpoint"** section
9. Copy **Key 1** and **Region** - you'll need these!

### Step 2: Clone/Download Project

```bash
cd c:\Users\mehmo\Desktop\Projects\local\voice-voice-translation
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `microsoft-cognitiveservices-speech-sdk`: Azure Speech SDK
- `dotenv`: Environment variable management
- `readline`: Interactive command-line interface

### Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` file and add your Azure credentials:
   ```env
   SPEECH_KEY=your_actual_azure_speech_key
   SPEECH_REGION=your_actual_region
   SOURCE_LANGUAGE=en-US
   TARGET_LANGUAGE=es-ES
   ```

   **Example:**
   ```env
   SPEECH_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   SPEECH_REGION=eastus
   SOURCE_LANGUAGE=en-US
   TARGET_LANGUAGE=fr-FR
   ```

### Step 5: Run the Application

```bash
npm start
```

The server will start at `http://localhost:3000`

### Step 6: Open in Browser

Open your web browser and navigate to:
```
http://localhost:3000
```

## 🎯 Usage

1. **Open the web app**: Navigate to `http://localhost:3000` in your browser
2. **Grant microphone permission**: Allow the browser to access your microphone when prompted
3. **Hold to record**: 
   - Press and hold the microphone button
   - Speak clearly in your source language
   - Release the button when finished
4. **View results**: The app will:
   - Display your spoken text
   - Show the translation
   - Provide a button to play the translated audio
5. **Play audio**: Click the "Play Translation" button to hear the translation
6. **Repeat**: Hold the button again for another translation

## 🌍 Supported Languages

Here are some popular language codes you can use:

### Common Source/Target Languages

| Language | Code | Example Voice (Neural) |
|----------|------|----------------------|
| English (US) | `en-US` | `en-US-JennyNeural` |
| Spanish (Spain) | `es-ES` | `es-ES-ElviraNeural` |
| French (France) | `fr-FR` | `fr-FR-DeniseNeural` |
| German | `de-DE` | `de-DE-KatjaNeural` |
| Italian | `it-IT` | `it-IT-ElsaNeural` |
| Portuguese (Brazil) | `pt-BR` | `pt-BR-FranciscaNeural` |
| Japanese | `ja-JP` | `ja-JP-NanamiNeural` |
| Korean | `ko-KR` | `ko-KR-SunHiNeural` |
| Chinese (Mandarin) | `zh-CN` | `zh-CN-XiaoxiaoNeural` |
| Arabic | `ar-SA` | `ar-SA-ZariyahNeural` |
| Hindi | `hi-IN` | `hi-IN-SwaraNeural` |
| Russian | `ru-RU` | `ru-RU-SvetlanaNeural` |

[View all supported languages](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support)

## ⚙️ Configuration Options

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SPEECH_KEY` | ✅ Yes | Azure Speech Service key | `a1b2c3d4...` |
| `SPEECH_REGION` | ✅ Yes | Azure region | `eastus` |
| `SOURCE_LANGUAGE` | ❌ No | Source language code | `en-US` |
| `TARGET_LANGUAGE` | ❌ No | Target language code | `es-ES` |
| `TARGET_VOICE` | ❌ No | Specific voice for synthesis | `es-ES-ElviraNeural` |

### Custom Voice Example

To use a specific voice, add to your `.env`:

```env
TARGET_VOICE=fr-FR-DeniseNeural
```

## 🔧 Troubleshooting

### Issue: "No speech could be recognized"

**Solutions:**
- Check your microphone is connected and working
- Ensure microphone permissions are granted
- Speak clearly and closer to the microphone
- Check Windows sound settings

### Issue: "Recognition canceled: Error"

**Solutions:**
- Verify your `SPEECH_KEY` is correct
- Confirm your `SPEECH_REGION` matches your Azure resource
- Check your internet connection
- Ensure your Azure subscription is active

### Issue: "Module not found"

**Solution:**
```bash
npm install
```

### Issue: Audio not playing

**Solutions:**
- Check speaker/headphone connections
- Verify Windows audio output settings
- Ensure volume is not muted
- Try a different audio output device

## 📁 Project Structure

```
voice-voice-translation/
├── server.js             # Express server with Azure integration
├── public/
│   └── index.html        # Web interface
├── uploads/              # Temporary audio files (auto-created)
├── package.json          # Project dependencies
├── .env                  # Your configuration (create this)
├── .env.example          # Example configuration
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── SETUP_GUIDE.md       # Quick setup guide
└── LANGUAGES.md         # Language reference
```

## 🔐 Security Notes

- **Never commit your `.env` file** to version control
- Keep your `SPEECH_KEY` confidential
- Rotate keys regularly in Azure Portal
- Use separate keys for development and production

## 💰 Pricing

Azure Speech Services offers:
- **Free Tier (F0)**: 5 audio hours per month for Speech-to-Text and Text-to-Speech
- **Standard Tier (S0)**: Pay-as-you-go pricing

[View detailed pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/)

## 📚 Additional Resources

- [Azure Speech Service Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- [Speech SDK for JavaScript](https://learn.microsoft.com/en-us/javascript/api/microsoft-cognitiveservices-speech-sdk/)
- [Language Support](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support)
- [Voice Gallery](https://speech.microsoft.com/portal/voicegallery)

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Azure Speech Service documentation
3. Verify your Azure resource is properly configured
4. Check the [Azure Status Page](https://status.azure.com/)

---

**Happy Translating! 🌍🗣️**
