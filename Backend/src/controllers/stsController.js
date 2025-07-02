const { ElevenLabsService } = require('../config/elevenlabs');
const { query, updateUsageStats } = require('../config/database');
const { saveGeneratedAudio, cleanupFiles } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Convert speech to speech using different voice
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
    
    // Check if it's a custom voice from our database
    let actualVoiceId = voiceId;
    const customVoiceResult = await query(
      'SELECT elevenlabs_voice_id FROM voices WHERE voice_id = $1',
      [voiceId]
    );
    
    if (customVoiceResult.rows.length > 0) {
      actualVoiceId = customVoiceResult.rows[0].elevenlabs_voice_id;
      console.log(`🎭 Using custom voice mapping: ${voiceId} -> ${actualVoiceId}`);
    }
    
    // Parse options with defaults
    const conversionOptions = {
      model_id: options.model_id || 'eleven_english_sts_v2',
      voice_settings: {
        stability: parseFloat(options.stability) || 0.5,
        similarity_boost: parseFloat(options.similarity_boost) || 0.8,
        style: parseFloat(options.style) || 0.0,
        use_speaker_boost: options.use_speaker_boost !== false
      }
    };
    
    console.log('🔄 Converting speech using ElevenLabs API...');
    
    // Convert speech using ElevenLabs
    const audioBuffer = await ElevenLabsService.speechToSpeech(
      uploadedFile.path, 
      actualVoiceId, 
      conversionOptions
    );
    
    // Generate unique filename for converted audio
    const fileId = uuidv4();
    const filename = `sts_${fileId}.mp3`;
    
    // Save converted audio file
    const filePath = await saveGeneratedAudio(audioBuffer, filename);
    const publicUrl = `/uploads/generated/${filename}`;
    
    // Get original file stats
    const originalFileStats = fs.statSync(uploadedFile.path);
    
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
        `Speech conversion from ${uploadedFile.originalname}`,
        'speech-to-speech',
        JSON.stringify({
          originalFile: uploadedFile.originalname,
          originalSize: originalFileStats.size,
          conversionOptions,
          voiceUsed: actualVoiceId,
          originalVoiceId: voiceId
        })
      ]
    );
    
    // Update usage statistics
    await updateUsageStats('audio_files_generated', 1);
    await updateUsageStats('api_calls_made', 1);
    
    // Clean up uploaded temporary file
    cleanupFiles([uploadedFile]);
    
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
        conversionOptions,
        createdAt: new Date().toISOString()
      },
      message: 'Speech converted successfully'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error converting speech:', error.message);
    
    // Clean up files in case of error
    if (uploadedFile) {
      cleanupFiles([uploadedFile]);
    }
    
    // Handle specific ElevenLabs errors
    if (error.message.includes('voice')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid voice',
        message: 'The specified voice ID is not available'
      });
    }
    
    if (error.message.includes('quota') || error.message.includes('limit')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'ElevenLabs API quota exceeded. Please try again later.'
      });
    }
    
    if (error.message.includes('file') || error.message.includes('audio')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid audio file',
        message: 'Please upload a valid audio file (MP3, WAV, M4A, etc.)'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Speech conversion failed',
      message: error.message
    });
  }
};

// Get supported file formats and limits
const getConversionInfo = async (req, res) => {
  try {
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
            description: 'Optimized for English speech conversion'
          },
          {
            id: 'eleven_multilingual_sts_v2', 
            name: 'Multilingual Speech-to-Speech v2',
            description: 'Supports multiple languages'
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
        }
      },
      message: 'Speech-to-speech conversion info retrieved successfully'
    };
    
    res.json(info);
    
  } catch (error) {
    console.error('❌ Error getting conversion info:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversion info',
      message: error.message
    });
  }
};

module.exports = {
  convertSpeech,
  getConversionInfo
};