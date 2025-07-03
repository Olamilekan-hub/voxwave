const express = require('express');
const { ElevenLabsService } = require('../config/elevenlabs');
const { query, updateUsageStats } = require('../config/database');
const { saveGeneratedAudio, cleanupFiles } = require('../middleware/upload');
const { uploadAudio, handleUploadError } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const router = express.Router();

// GET /api/speech-to-speech/info - Get conversion info and supported formats
const getConversionInfo = async (req, res) => {
  try {
    const userInfo = await ElevenLabsService.getUserInfo();
    
    const info = {
      success: true,
      data: {
        supportedFormats: [
          'audio/mpeg',
          'audio/mp3', 
          'audio/wav',
          'audio/wave',
          'audio/x-wav',
          'audio/flac',
          'audio/x-flac',
          'audio/mp4',
          'audio/m4a',
          'audio/aac',
          'audio/ogg',
          'audio/webm'
        ],
        maxFileSize: '25MB',
        maxFileSizeBytes: 25 * 1024 * 1024,
        supportedModels: [
          {
            id: 'eleven_english_sts_v2',
            name: 'English Speech-to-Speech v2',
            description: 'Optimized for English speech conversion with high quality',
            recommended: true
          },
          {
            id: 'eleven_multilingual_sts_v2', 
            name: 'Multilingual Speech-to-Speech v2',
            description: 'Supports multiple languages with good quality'
          },
          {
            id: 'eleven_turbo_v2',
            name: 'Turbo Model v2',
            description: 'Fastest processing with good quality'
          }
        ],
        voiceSettings: {
          stability: {
            min: 0,
            max: 1,
            default: 0.5,
            description: 'Higher values make voice more stable but less expressive'
          },
          similarity_boost: {
            min: 0,
            max: 1, 
            default: 0.8,
            description: 'Enhances similarity to the target voice'
          },
          style: {
            min: 0,
            max: 1,
            default: 0.0,
            description: 'Influences the style and emotion of the voice'
          }
        },
        quota: {
          character_limit: userInfo.subscription?.character_limit || 10000,
          character_count: userInfo.subscription?.character_count || 0,
          characters_remaining: userInfo.available_chars || 0,
          subscription_tier: userInfo.subscription?.tier || 'Free'
        },
        features: {
          custom_voices: true,
          voice_cloning: userInfo.subscription?.can_create_voices !== false,
          instant_cloning: true,
          professional_cloning: userInfo.subscription?.tier !== 'Free'
        }
      },
      message: 'Speech-to-speech conversion info retrieved successfully'
    };
    
    res.json(info);
    
  } catch (error) {
    console.error('❌ Error getting conversion info:', error.message);
    
    // Return basic info even if ElevenLabs call fails
    res.json({
      success: true,
      data: {
        supportedFormats: [
          'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/flac'
        ],
        maxFileSize: '25MB',
        maxFileSizeBytes: 25 * 1024 * 1024,
        supportedModels: [
          {
            id: 'eleven_english_sts_v2',
            name: 'English Speech-to-Speech v2',
            description: 'Optimized for English speech conversion'
          }
        ],
        quota: {
          character_limit: 10000,
          character_count: 0,
          characters_remaining: 10000,
          subscription_tier: 'Free'
        },
        warning: 'Could not fetch full quota information'
      },
      message: 'Basic conversion info retrieved'
    });
  }
};

// POST /api/speech-to-speech/convert - Convert speech to speech
const convertSpeech = async (req, res) => {
  let uploadedFile = null;
  
  try {
    const { voiceId, options = {} } = req.body;
    uploadedFile = req.file;
    
    console.log('🎵 Starting speech-to-speech conversion...');
    console.log('Voice ID:', voiceId);
    console.log('Options:', options);
    console.log('File:', uploadedFile ? uploadedFile.filename : 'No file');
    
    // Validation
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        error: 'Missing audio file',
        message: 'Please upload an audio file'
      });
    }
    
    if (!voiceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing voice ID',
        message: 'Please select a target voice'
      });
    }
    
    // Validate file size and type
    if (uploadedFile.size > 25 * 1024 * 1024) {
      cleanupFiles([uploadedFile]);
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'Audio file must be smaller than 25MB'
      });
    }
    
    // Check if it's a custom voice from our database
    let actualVoiceId = voiceId;
    let voiceName = voiceId;
    let isCustomVoice = false;
    
    const customVoiceResult = await query(
      'SELECT elevenlabs_voice_id, name FROM voices WHERE voice_id = $1',
      [voiceId]
    );
    
    if (customVoiceResult.rows.length > 0) {
      actualVoiceId = customVoiceResult.rows[0].elevenlabs_voice_id;
      voiceName = customVoiceResult.rows[0].name;
      isCustomVoice = true;
      console.log(`🎭 Using custom voice: ${voiceName} (${actualVoiceId})`);
    } else {
      // Try to get voice name from ElevenLabs
      try {
        const voiceDetails = await ElevenLabsService.getVoice(voiceId);
        voiceName = voiceDetails.name || voiceId;
      } catch (error) {
        console.warn('Could not fetch voice details:', error.message);
      }
    }
    
    // Parse options with defaults and validation
    const conversionOptions = {
      model_id: options.model_id || 'eleven_english_sts_v2',
      voice_settings: {
        stability: Math.max(0, Math.min(1, parseFloat(options.stability) || 0.5)),
        similarity_boost: Math.max(0, Math.min(1, parseFloat(options.similarity_boost) || 0.8)),
        style: Math.max(0, Math.min(1, parseFloat(options.style) || 0.0)),
        use_speaker_boost: options.use_speaker_boost !== false
      }
    };
    
    console.log('🔄 Converting speech using ElevenLabs API...');
    console.log('Conversion options:', conversionOptions);
    
    // Convert speech using ElevenLabs
    const audioBuffer = await ElevenLabsService.speechToSpeech(
      uploadedFile.path, 
      actualVoiceId, 
      conversionOptions
    );
    
    // Generate unique filename for converted audio
    const fileId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sts_${timestamp}_${fileId}.mp3`;
    
    // Save converted audio file
    const filePath = await saveGeneratedAudio(audioBuffer, filename);
    const publicUrl = `/uploads/generated/${filename}`;
    
    // Get original file stats
    const originalFileStats = fs.statSync(uploadedFile.path);
    
    // Calculate estimated duration (rough estimate based on file size)
    const estimatedDurationSeconds = Math.ceil(audioBuffer.length / (128000 / 8)); // Assuming 128kbps
    
    // Save conversion record to database
    const audioRecord = await query(
      `INSERT INTO audio_files 
       (file_id, file_path, file_type, file_size, voice_used, original_text, processing_type, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        fileId,
        filePath,
        'audio/mpeg',
        audioBuffer.length,
        voiceId,
        `Speech conversion from ${uploadedFile.originalname} to ${voiceName}`,
        'speech-to-speech',
        JSON.stringify({
          originalFile: uploadedFile.originalname,
          originalSize: originalFileStats.size,
          conversionOptions,
          voiceUsed: actualVoiceId,
          originalVoiceId: voiceId,
          voiceName: voiceName,
          isCustomVoice: isCustomVoice,
          estimatedDuration: estimatedDurationSeconds,
          processedAt: new Date().toISOString()
        })
      ]
    );
    
    // Update usage statistics
    await updateUsageStats('audio_files_generated', 1);
    await updateUsageStats('api_calls_made', 1);
    
    // Clean up uploaded temporary file
    setTimeout(() => {
      cleanupFiles([uploadedFile]);
    }, 1000);
    
    console.log(`✅ Speech converted successfully: ${filename}`);
    
    const response = {
      success: true,
      data: {
        fileId,
        audioUrl: publicUrl,
        filename,
        fileSize: audioBuffer.length,
        originalFile: uploadedFile.originalname,
        originalSize: originalFileStats.size,
        voiceUsed: voiceId,
        voiceName: voiceName,
        isCustomVoice: isCustomVoice,
        conversionOptions,
        estimatedDuration: estimatedDurationSeconds,
        quality: conversionOptions.model_id.includes('turbo') ? 'fast' : 'high',
        createdAt: new Date().toISOString()
      },
      message: `Speech converted successfully using ${isCustomVoice ? 'custom' : 'ElevenLabs'} voice: ${voiceName}`
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error converting speech:', error.message);
    
    // Clean up files in case of error
    if (uploadedFile) {
      cleanupFiles([uploadedFile]);
    }
    
    // Handle specific ElevenLabs errors with better messaging
    if (error.message.includes('voice') || error.message.includes('Voice')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid voice',
        message: 'The specified voice is not available. Please select a different voice.',
        suggestion: 'Try refreshing the voice list or selecting a different voice.'
      });
    }
    
    if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('credits')) {
      return res.status(429).json({
        success: false,
        error: 'Quota exceeded',
        message: 'You have reached your usage limit. Please upgrade your plan or try again later.',
        suggestion: 'Check your quota in the dashboard or upgrade to a higher plan.'
      });
    }
    
    if (error.message.includes('file') || error.message.includes('audio') || error.message.includes('format')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid audio file',
        message: 'The uploaded file is not a valid audio format or is corrupted.',
        suggestion: 'Please upload a valid audio file in MP3, WAV, M4A, or FLAC format.'
      });
    }
    
    if (error.message.includes('duration') || error.message.includes('length')) {
      return res.status(400).json({
        success: false,
        error: 'Audio duration issue',
        message: 'The audio file is either too short or too long for processing.',
        suggestion: 'Use audio files between 1 second and 20 minutes long.'
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: 'Processing timeout',
        message: 'The conversion took too long and timed out.',
        suggestion: 'Try with a shorter audio file or try again later.'
      });
    }
    
    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Conversion failed',
      message: error.message || 'An unexpected error occurred during speech conversion.',
      suggestion: 'Please try again or contact support if the problem persists.'
    });
  }
};

// GET /api/speech-to-speech/history - Get conversion history
const getConversionHistory = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await query(
      `SELECT file_id, original_text, voice_used, file_size, created_at, metadata 
       FROM audio_files 
       WHERE processing_type = 'speech-to-speech' 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM audio_files WHERE processing_type = 'speech-to-speech'`
    );
    
    const conversions = result.rows.map(row => ({
      ...row,
      metadata: JSON.parse(row.metadata || '{}')
    }));
    
    res.json({
      success: true,
      data: {
        conversions,
        total: parseInt(totalResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      },
      message: 'Conversion history retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting conversion history:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversion history',
      message: error.message
    });
  }
};

// Setup routes
router.get('/info', getConversionInfo);
router.post('/convert', uploadAudio.single('audio'), handleUploadError, convertSpeech);
router.get('/history', getConversionHistory);

module.exports = router;