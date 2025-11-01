# Quick Setup Guide

## 🎯 Quick Start (5 Minutes)

### 1. Get Azure Credentials

1. Visit [Azure Portal](https://portal.azure.com/)
2. Create a **Speech Service** resource
3. Copy your **Key** and **Region**

### 2. Install & Configure

```bash
# Install dependencies
npm install

# Create configuration file
copy .env.example .env
```

### 3. Edit .env File

Open `.env` and add your credentials:

```env
SPEECH_KEY=paste_your_key_here
SPEECH_REGION=paste_your_region_here
SOURCE_LANGUAGE=en-US
TARGET_LANGUAGE=es-ES
```

### 4. Run the Server

```bash
npm start
```

### 5. Open in Browser

Navigate to: **http://localhost:3000**

## 🎤 How to Use

1. **Hold** the microphone button
2. **Speak** clearly into your microphone
3. **Release** the button when done
4. **View** the original and translated text
5. **Click** "Play Translation" to hear the audio

## 🌍 Popular Language Combinations

### English to Other Languages
```env
SOURCE_LANGUAGE=en-US
TARGET_LANGUAGE=es-ES    # Spanish
# TARGET_LANGUAGE=fr-FR  # French
# TARGET_LANGUAGE=de-DE  # German
# TARGET_LANGUAGE=ja-JP  # Japanese
# TARGET_LANGUAGE=zh-CN  # Chinese
```

### Other Languages to English
```env
SOURCE_LANGUAGE=es-ES    # Spanish
TARGET_LANGUAGE=en-US    # English
```

## ⚠️ Common Issues

### "No speech recognized"
- Check microphone is connected
- Speak louder and clearer
- Grant microphone permissions

### "Error: Invalid credentials"
- Double-check SPEECH_KEY in .env
- Verify SPEECH_REGION matches Azure

### "Module not found"
- Run: `npm install`

## 💡 Tips

- **Speak clearly** for best results
- **Wait** for the beep before speaking
- **Short phrases** work better than long sentences
- **Quiet environment** improves accuracy

## 🔗 Need Help?

- Check the full [README.md](README.md)
- Visit [Azure Speech Docs](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/)
