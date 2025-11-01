# Supported Languages Reference

## 🌍 Popular Language Codes

Use these codes in your `.env` file for `SOURCE_LANGUAGE` and `TARGET_LANGUAGE`.

### Americas

| Language | Code | Neural Voice Example |
|----------|------|---------------------|
| English (US) | `en-US` | `en-US-JennyNeural` |
| English (Canada) | `en-CA` | `en-CA-ClaraNeural` |
| Spanish (Mexico) | `es-MX` | `es-MX-DaliaNeural` |
| Spanish (Spain) | `es-ES` | `es-ES-ElviraNeural` |
| Portuguese (Brazil) | `pt-BR` | `pt-BR-FranciscaNeural` |
| French (Canada) | `fr-CA` | `fr-CA-SylvieNeural` |

### Europe

| Language | Code | Neural Voice Example |
|----------|------|---------------------|
| French (France) | `fr-FR` | `fr-FR-DeniseNeural` |
| German | `de-DE` | `de-DE-KatjaNeural` |
| Italian | `it-IT` | `it-IT-ElsaNeural` |
| Spanish (Spain) | `es-ES` | `es-ES-ElviraNeural` |
| Portuguese (Portugal) | `pt-PT` | `pt-PT-RaquelNeural` |
| Dutch | `nl-NL` | `nl-NL-ColetteNeural` |
| Polish | `pl-PL` | `pl-PL-ZofiaNeural` |
| Russian | `ru-RU` | `ru-RU-SvetlanaNeural` |
| Turkish | `tr-TR` | `tr-TR-EmelNeural` |
| Swedish | `sv-SE` | `sv-SE-SofieNeural` |
| Norwegian | `nb-NO` | `nb-NO-PernilleNeural` |
| Danish | `da-DK` | `da-DK-ChristelNeural` |
| Finnish | `fi-FI` | `fi-FI-NooraNeural` |
| Greek | `el-GR` | `el-GR-AthinaNeural` |

### Asia Pacific

| Language | Code | Neural Voice Example |
|----------|------|---------------------|
| Chinese (Mandarin) | `zh-CN` | `zh-CN-XiaoxiaoNeural` |
| Chinese (Cantonese) | `zh-HK` | `zh-HK-HiuGaaiNeural` |
| Japanese | `ja-JP` | `ja-JP-NanamiNeural` |
| Korean | `ko-KR` | `ko-KR-SunHiNeural` |
| Hindi | `hi-IN` | `hi-IN-SwaraNeural` |
| Thai | `th-TH` | `th-TH-PremwadeeNeural` |
| Vietnamese | `vi-VN` | `vi-VN-HoaiMyNeural` |
| Indonesian | `id-ID` | `id-ID-GadisNeural` |
| Malay | `ms-MY` | `ms-MY-YasminNeural` |
| Filipino | `fil-PH` | `fil-PH-BlessicaNeural` |
| Tamil | `ta-IN` | `ta-IN-PallaviNeural` |
| Telugu | `te-IN` | `te-IN-ShrutiNeural` |

### Middle East & Africa

| Language | Code | Neural Voice Example |
|----------|------|---------------------|
| Arabic (Saudi Arabia) | `ar-SA` | `ar-SA-ZariyahNeural` |
| Arabic (Egypt) | `ar-EG` | `ar-EG-SalmaNeural` |
| Arabic (UAE) | `ar-AE` | `ar-AE-FatimaNeural` |
| Hebrew | `he-IL` | `he-IL-HilaNeural` |
| Swahili | `sw-KE` | `sw-KE-ZuriNeural` |
| Afrikaans | `af-ZA` | `af-ZA-AdriNeural` |

## 📝 Configuration Examples

### English to Spanish (Spain)
```env
SOURCE_LANGUAGE=en-US
TARGET_LANGUAGE=es-ES
TARGET_VOICE=es-ES-ElviraNeural
```

### Japanese to English
```env
SOURCE_LANGUAGE=ja-JP
TARGET_LANGUAGE=en-US
TARGET_VOICE=en-US-JennyNeural
```

### French to German
```env
SOURCE_LANGUAGE=fr-FR
TARGET_LANGUAGE=de-DE
TARGET_VOICE=de-DE-KatjaNeural
```

### Chinese to Korean
```env
SOURCE_LANGUAGE=zh-CN
TARGET_LANGUAGE=ko-KR
TARGET_VOICE=ko-KR-SunHiNeural
```

## 🎭 Voice Types

Azure offers different voice types:

- **Neural Voices**: Most natural-sounding (recommended)
- **Standard Voices**: Traditional TTS voices
- **Custom Voices**: Create your own voice (requires Custom Neural Voice)

## 🔗 More Information

- [Complete Language List](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support)
- [Voice Gallery](https://speech.microsoft.com/portal/voicegallery) - Listen to all voices
- [Regional Availability](https://azure.microsoft.com/en-us/global-infrastructure/services/?products=cognitive-services)

## 💡 Tips

1. **Neural voices** provide the best quality
2. **Match region** with your Azure resource for best performance
3. **Test different voices** to find the best fit
4. Some languages have **multiple regional variants** (e.g., en-US, en-GB, en-AU)
