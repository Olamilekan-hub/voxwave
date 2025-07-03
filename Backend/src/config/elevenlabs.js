const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';

// Create axios instance with default headers
const elevenLabsAPI = axios.create({
  baseURL: ELEVENLABS_BASE_URL,
  headers: {
    'xi-api-key': ELEVENLABS_API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 second timeout for voice creation
});

// Enhanced ElevenLabs API Functions
class ElevenLabsService {
  
  // Get available voices with enhanced error handling
  static async getVoices() {
    try {
      console.log('🎤 Fetching voices from ElevenLabs...');
      const response = await elevenLabsAPI.get('/voices');
      
      // Filter and format voices for better UX
      const voices = response.data.voices.map(voice => ({
        voice_id: voice.voice_id,
        name: voice.name,
        description: voice.description || voice.category || 'AI Voice',
        category: voice.category || 'premade',
        preview_url: voice.preview_url,
        is_custom: voice.category === 'cloned' || voice.category === 'professional'
      }));
      
      console.log(`✅ Retrieved ${voices.length} voices from ElevenLabs`);
      return { voices };
    } catch (error) {
      console.error('ElevenLabs API Error (getVoices):', error.response?.data || error.message);
      throw new Error(`Failed to fetch voices: ${error.response?.data?.detail?.message || error.message}`);
    }
  }

  // Enhanced Text to Speech with better options
  static async textToSpeech(text, voiceId, options = {}) {
    try {
      console.log(`🗣️ Generating speech: ${text.length} chars with voice ${voiceId}`);
      
      const {
        model_id = 'eleven_monolingual_v1',
        voice_settings = {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        },
        output_format = 'mp3_44100_128'
      } = options;

      const response = await elevenLabsAPI.post(
        `/text-to-speech/${voiceId}`,
        {
          text,
          model_id,
          voice_settings,
          output_format
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      console.log(`✅ Speech generated: ${response.data.byteLength} bytes`);
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (textToSpeech):', error.response?.data || error.message);
      
      // Handle specific errors
      if (error.response?.status === 400) {
        throw new Error('Invalid text or voice parameters');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API key');
      } else if (error.response?.status === 422) {
        throw new Error('Text too long or contains invalid characters');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Speech generation failed: ${error.message}`);
    }
  }

  // Enhanced Speech to Speech conversion
  static async speechToSpeech(audioFilePath, voiceId, options = {}) {
    try {
      console.log(`🔄 Converting speech: ${audioFilePath} to voice ${voiceId}`);
      
      // Validate file exists
      if (!fs.existsSync(audioFilePath)) {
        throw new Error('Audio file not found');
      }

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
          responseType: 'arraybuffer',
          timeout: 120000, // 2 minutes for conversion
          maxContentLength: 50 * 1024 * 1024 // 50MB max
        }
      );

      console.log(`✅ Speech converted: ${response.data.byteLength} bytes`);
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (speechToSpeech):', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid audio file or voice parameters');
      } else if (error.response?.status === 413) {
        throw new Error('Audio file too large (max 25MB)');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Speech conversion failed: ${error.message}`);
    }
  }

  // Create Voice Clone with enhanced validation
  static async createVoice(name, description, audioFilePaths, labels = {}) {
    try {
      console.log(`🎭 Creating voice clone: ${name} with ${audioFilePaths.length} samples`);
      
      // Validate inputs
      if (!name || name.trim().length < 1) {
        throw new Error('Voice name is required');
      }
      
      if (!audioFilePaths || audioFilePaths.length === 0) {
        throw new Error('At least one audio file is required');
      }

      // Validate all files exist
      for (const filePath of audioFilePaths) {
        if (!fs.existsSync(filePath)) {
          throw new Error(`Audio file not found: ${path.basename(filePath)}`);
        }
      }

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description || `Custom voice: ${name}`);
      
      // Add labels for better voice quality
      const defaultLabels = {
        accent: 'american',
        age: 'middle aged',
        gender: 'male',
        loudness: 'normal',
        tempo: 'normal',
        texture: 'smooth',
        stability: 'stable',
        ...labels
      };
      
      formData.append('labels', JSON.stringify(defaultLabels));

      // Add audio files with validation
      audioFilePaths.forEach((filePath, index) => {
        const stats = fs.statSync(filePath);
        console.log(`📁 Adding file ${index + 1}: ${path.basename(filePath)} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
        formData.append('files', fs.createReadStream(filePath));
      });

      const response = await axios.post(
        `${ELEVENLABS_BASE_URL}/voices/add`,
        formData,
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            ...formData.getHeaders()
          },
          timeout: 300000, // 5 minutes for voice creation
          maxContentLength: 100 * 1024 * 1024 // 100MB max
        }
      );

      console.log(`✅ Voice created successfully: ${response.data.voice_id}`);
      return {
        voice_id: response.data.voice_id,
        name: name,
        status: 'created',
        message: response.data.message || 'Voice created successfully'
      };
    } catch (error) {
      console.error('ElevenLabs API Error (createVoice):', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        const detail = error.response.data?.detail;
        if (detail?.includes('quota')) {
          throw new Error('Voice cloning quota exceeded');
        } else if (detail?.includes('duration')) {
          throw new Error('Audio files must be at least 10 seconds long');
        } else if (detail?.includes('quality')) {
          throw new Error('Audio quality too low. Please use high-quality recordings');
        }
        throw new Error(detail || 'Invalid voice creation parameters');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 402) {
        throw new Error('Insufficient credits for voice cloning');
      }
      
      throw new Error(`Voice creation failed: ${error.message}`);
    }
  }

  // Enhanced voice details retrieval
  static async getVoice(voiceId) {
    try {
      console.log(`🔍 Getting voice details: ${voiceId}`);
      const response = await elevenLabsAPI.get(`/voices/${voiceId}`);
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (getVoice):', error.response?.data || error.message);
      throw new Error(`Failed to get voice details: ${error.message}`);
    }
  }

  // Enhanced voice deletion
  static async deleteVoice(voiceId) {
    try {
      console.log(`🗑️ Deleting voice: ${voiceId}`);
      const response = await elevenLabsAPI.delete(`/voices/${voiceId}`);
      console.log(`✅ Voice deleted: ${voiceId}`);
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error (deleteVoice):', error.response?.data || error.message);
      throw new Error(`Failed to delete voice: ${error.message}`);
    }
  }

  // Get user information and quota
  static async getUserInfo() {
    try {
      const response = await elevenLabsAPI.get('/user');
      return {
        ...response.data,
        subscription: response.data.subscription || {},
        usage: response.data.usage || {},
        available_chars: response.data.subscription?.character_limit - response.data.subscription?.character_count || 0
      };
    } catch (error) {
      console.error('ElevenLabs API Error (getUserInfo):', error.response?.data || error.message);
      throw new Error(`Failed to get user information: ${error.message}`);
    }
  }

  // Enhanced connection test
  static async testConnection() {
    try {
      console.log('🔌 Testing ElevenLabs API connection...');
      const userInfo = await this.getUserInfo();
      console.log(`✅ ElevenLabs API connected - Plan: ${userInfo.subscription?.tier || 'Free'}`);
      console.log(`📊 Available characters: ${userInfo.available_chars || 0}`);
      return true;
    } catch (error) {
      console.error('❌ ElevenLabs API connection failed:', error.message);
      return false;
    }
  }

  // Validate audio file for voice cloning
  static async validateAudioForCloning(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return { valid: false, error: 'File not found' };
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = stats.size / 1024 / 1024;

      // Check file size (max 25MB per file)
      if (fileSizeMB > 25) {
        return { valid: false, error: 'File too large (max 25MB)' };
      }

      // Check minimum file size (should be at least 1MB for quality)
      if (fileSizeMB < 1) {
        return { valid: false, error: 'File too small (min 1MB recommended)' };
      }

      return { valid: true, sizeMB: fileSizeMB };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Get voice cloning quota
  static async getVoiceQuota() {
    try {
      const userInfo = await this.getUserInfo();
      return {
        voices_used: userInfo.subscription?.voice_limit - userInfo.subscription?.voice_count || 0,
        voices_limit: userInfo.subscription?.voice_limit || 0,
        can_create_voice: (userInfo.subscription?.voice_count || 0) < (userInfo.subscription?.voice_limit || 0)
      };
    } catch (error) {
      console.error('Error getting voice quota:', error.message);
      return { voices_used: 0, voices_limit: 0, can_create_voice: false };
    }
  }
}

module.exports = {
  ElevenLabsService,
  elevenLabsAPI
};