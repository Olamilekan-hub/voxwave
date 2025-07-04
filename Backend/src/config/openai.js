const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  // Convert language codes from frontend format to OpenAI format
  static convertLanguageCode(languageCode) {
    if (!languageCode) return null;
    
    // Language mapping: frontend format -> OpenAI ISO-639-1 format
    const languageMap = {
      'en-US': 'en',
      'en-GB': 'en',
      'es-ES': 'es',
      'es-MX': 'es',
      'fr-FR': 'fr',
      'de-DE': 'de',
      'it-IT': 'it',
      'pt-BR': 'pt',
      'ja-JP': 'ja',
      'ko-KR': 'ko',
      'zh-CN': 'zh',
      'ar-SA': 'ar',
      'ru-RU': 'ru',
      'hi-IN': 'hi',
      'nl-NL': 'nl',
      'pl-PL': 'pl',
      'tr-TR': 'tr',
    };

    // If exact match found, return mapped code
    if (languageMap[languageCode]) {
      return languageMap[languageCode];
    }

    // If already in ISO-639-1 format (2 characters), return as is
    if (languageCode.length === 2) {
      return languageCode;
    }

    // Extract first 2 characters for other formats
    return languageCode.split('-')[0].toLowerCase();
  }

  // Test OpenAI connection
  static async testConnection() {
    try {
      console.log('🔌 Testing OpenAI API connection...');
      const models = await openai.models.list();
      console.log('✅ OpenAI API connected successfully');
      return true;
    } catch (error) {
      console.error('❌ OpenAI API connection failed:', error.message);
      return false;
    }
  }

  // Transcribe audio using Whisper
  static async transcribeAudio(audioFilePath, options = {}) {
    try {
      const {
        language = null,
        prompt = null,
        response_format = 'verbose_json',
        temperature = 0,
      } = options;

      console.log(`🎙️ Transcribing audio: ${audioFilePath}`);

      // Convert language code to OpenAI format
      const convertedLanguage = this.convertLanguageCode(language);
      console.log(`🌐 Language: ${language} -> ${convertedLanguage || 'auto-detect'}`);

      // Prepare the transcription request
      const transcriptionOptions = {
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1',
        response_format,
        temperature,
      };

      // Add language only if valid and converted
      if (convertedLanguage) {
        transcriptionOptions.language = convertedLanguage;
      }

      // Add prompt if provided
      if (prompt) {
        transcriptionOptions.prompt = prompt;
      }

      const response = await openai.audio.transcriptions.create(transcriptionOptions);

      console.log(`✅ Transcription completed: ${response.text?.length || 0} characters`);

      // Process the response based on format
      if (response_format === 'verbose_json') {
        return {
          text: response.text,
          language: response.language,
          duration: response.duration,
          segments: response.segments || [],
          words: response.words || [],
        };
      } else {
        return {
          text: response.text || response,
          language: convertedLanguage || 'unknown',
          duration: 0,
          segments: [],
          words: [],
        };
      }
    } catch (error) {
      console.error('❌ OpenAI transcription error:', error);
      
      // Handle specific errors
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key');
      } else if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded');
      } else if (error.code === 'invalid_language_format') {
        throw new Error('Unsupported language format');
      } else if (error.message?.includes('file')) {
        throw new Error('Invalid audio file format');
      }
      
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  // Get supported languages (updated with correct format)
  static getSupportedLanguages() {
    return [
      { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
      { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
      { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
      { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
      { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
      { code: 'de-DE', name: 'German', flag: '🇩🇪' },
      { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
      { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
      { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
      { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
      { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
      { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
      { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
      { code: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
      { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
    ];
  }

  // Format transcription with timestamps
  static formatWithTimestamps(segments) {
    if (!segments || segments.length === 0) return '';

    return segments.map(segment => {
      const startTime = this.formatTime(segment.start);
      const endTime = this.formatTime(segment.end);
      return `[${startTime} - ${endTime}] ${segment.text}`;
    }).join('\n');
  }

  // Format time in MM:SS format
  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Speaker diarization (basic implementation using pauses)
  static addSpeakerDiarization(segments) {
    if (!segments || segments.length === 0) return '';

    let currentSpeaker = 1;
    let lastEndTime = 0;
    const speakerThreshold = 2; // 2 seconds pause = new speaker

    return segments.map(segment => {
      // If there's a significant pause, assume new speaker
      if (segment.start - lastEndTime > speakerThreshold) {
        currentSpeaker = currentSpeaker === 1 ? 2 : 1;
      }
      lastEndTime = segment.end;

      return `Speaker ${currentSpeaker}: ${segment.text}`;
    }).join('\n');
  }
}

module.exports = { OpenAIService };