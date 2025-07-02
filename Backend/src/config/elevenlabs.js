const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';

// Create axios instance with default headers
const elevenLabsAPI = axios.create({
  baseURL: ELEVENLABS_BASE_URL,
  headers: {
    'xi-api-key': ELEVENLABS_API_KEY,
    'Content-Type': 'application/json'
  }
});

// ElevenLabs API Functions
class ElevenLabsService {
  
  // Get available voices
  static async getVoices() {
    try {
      const response = await elevenLabsAPI.get('/voices');
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (getVoices):', error.response?.data || error.message);
      throw new Error('Failed to fetch voices from ElevenLabs');
    }
  }

  // Text to Speech
  static async textToSpeech(text, voiceId, options = {}) {
    try {
      const {
        model_id = 'eleven_monolingual_v1',
        voice_settings = {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      } = options;

      const response = await elevenLabsAPI.post(
        `/text-to-speech/${voiceId}`,
        {
          text,
          model_id,
          voice_settings
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (textToSpeech):', error.response?.data || error.message);
      throw new Error('Failed to generate speech from text');
    }
  }

  // Speech to Speech (Voice Conversion)
  static async speechToSpeech(audioFilePath, voiceId, options = {}) {
    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(audioFilePath));
      
      const {
        model_id = 'eleven_english_sts_v2',
        voice_settings = {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      } = options;

      formData.append('model_id', model_id);
      formData.append('voice_settings', JSON.stringify(voice_settings));

      const response = await axios.post(
        `${ELEVENLABS_BASE_URL}/speech-to-speech/${voiceId}`,
        formData,
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            ...formData.getHeaders(),
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer'
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (speechToSpeech):', error.response?.data || error.message);
      throw new Error('Failed to convert speech to speech');
    }
  }

  // Create Voice Clone
  static async createVoice(name, description, audioFilePaths) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);

      // Add audio files (ElevenLabs accepts multiple samples)
      audioFilePaths.forEach((filePath, index) => {
        formData.append('files', fs.createReadStream(filePath));
      });

      const response = await axios.post(
        `${ELEVENLABS_BASE_URL}/voices/add`,
        formData,
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            ...formData.getHeaders()
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (createVoice):', error.response?.data || error.message);
      throw new Error('Failed to create voice clone');
    }
  }

  // Get Voice Details
  static async getVoice(voiceId) {
    try {
      const response = await elevenLabsAPI.get(`/voices/${voiceId}`);
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (getVoice):', error.response?.data || error.message);
      throw new Error('Failed to get voice details');
    }
  }

  // Delete Voice
  static async deleteVoice(voiceId) {
    try {
      const response = await elevenLabsAPI.delete(`/voices/${voiceId}`);
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (deleteVoice):', error.response?.data || error.message);
      throw new Error('Failed to delete voice');
    }
  }

  // Get User Info (for checking usage/limits)
  static async getUserInfo() {
    try {
      const response = await elevenLabsAPI.get('/user');
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (getUserInfo):', error.response?.data || error.message);
      throw new Error('Failed to get user information');
    }
  }

  // Speech to Text (if available in your ElevenLabs plan)
  static async speechToText(audioFilePath, options = {}) {
    try {
      // Note: This might not be available in all ElevenLabs plans
      // You might need to use a different service like OpenAI Whisper
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(audioFilePath));
      
      const { language = 'en' } = options;
      formData.append('language', language);

      const response = await axios.post(
        `${ELEVENLABS_BASE_URL}/speech-to-text`,
        formData,
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            ...formData.getHeaders()
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (speechToText):', error.response?.data || error.message);
      // Fallback: Return a mock response for now
      return {
        text: "Speech-to-text feature will be implemented with OpenAI Whisper API",
        confidence: 0.0
      };
    }
  }

  // Test API Connection
  static async testConnection() {
    try {
      await this.getUserInfo();
      console.log('✅ ElevenLabs API connection successful');
      return true;
    } catch (error) {
      console.error('❌ ElevenLabs API connection failed:', error.message);
      return false;
    }
  }
}

module.exports = {
  ElevenLabsService,
  elevenLabsAPI
};