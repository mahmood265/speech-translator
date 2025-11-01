# Debugging Guide

## Testing the Streaming Workflow

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open browser console:**
   - Navigate to `http://localhost:3005`
   - Press `F12` to open Developer Tools
   - Go to the **Console** tab

3. **Test recording:**
   - Hold the microphone button
   - Speak clearly
   - Release the button

## Expected Console Logs

### Frontend (Browser Console)

When you **press** the button:
```
🎤 Starting recording...
📡 Starting streaming session...
✅ Session started: <session-id>
📦 Chunks queued: 10, Queue size: 1
📦 Chunks queued: 20, Queue size: 1
...
```

When you **release** the button:
```
🛑 Stop recording called (skipFinalize: false)
🔄 Cleaning up audio nodes...
⏳ Draining chunk queue (X chunks remaining)...
✅ Queue drained, finalizing session...
📤 Sending finalize request for session: <session-id>
📥 Finalize response status: 200
📦 Received translation data: {...}
✅ Session finalized, received data: {...}
```

### Backend (Server Console)

When you **press** the button:
```
🎬 Started streaming session: <session-id> (48000 Hz)
```

When you **release** the button:
```
🛑 Stopping stream session: <session-id>
📊 Raw PCM size: X bytes, Samples: Y
💾 WAV file created: uploads/<session-id>.wav (Z bytes)
🔄 Starting translation...
✅ Recognized: "your spoken text"
📝 Translated: "translated text"
🔊 Audio generated: X chars (base64)
```

## Common Issues

### Issue: No logs after releasing button

**Check:**
1. Browser console for any JavaScript errors
2. Network tab to see if `/api/stream/stop` request is being sent
3. Server console to see if the request is received

**Possible causes:**
- JavaScript error preventing `stopRecording()` from running
- Network request failing silently
- Session ID mismatch

### Issue: "Session not found" error

**Cause:** Session was already cleaned up or never created

**Solution:** Check that the session ID from start matches the one in stop request

### Issue: Empty audio or no speech recognized

**Possible causes:**
- Not enough audio data (speak longer)
- Microphone not working
- Sample rate mismatch
- PCM data corruption

**Debug:**
- Check the WAV file size in server logs (should be > 1000 bytes for 1 second)
- Verify sample rate matches between frontend and backend

### Issue: Translation works but no audio

**Check:**
- Server logs for "Audio generated" message
- Verify `TARGET_LANGUAGE` is set correctly in `.env`
- Check if `TARGET_VOICE` (if set) is valid for the target language

## Manual Testing

You can test the endpoints manually:

### 1. Start a session
```bash
curl -X POST http://localhost:3005/api/stream/start \
  -H "Content-Type: application/json" \
  -d '{"sampleRate": 48000}'
```

### 2. Check active sessions
Look at server console or add a debug endpoint

### 3. Stop a session
```bash
curl -X POST http://localhost:3005/api/stream/stop \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "your-session-id"}'
```

## Tips

- **Clear browser cache** if you made changes to the HTML/JS
- **Hard refresh** with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Check microphone permissions** in browser settings
- **Use a quiet environment** for better speech recognition
- **Speak clearly and at normal pace**
