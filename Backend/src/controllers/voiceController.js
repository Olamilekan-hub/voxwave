const { ElevenLabsService } = require('../config/elevenlabs');
const { query, updateUsageStats } = require('../config/database');
const { saveGeneratedAudio, cleanupFiles } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Create a custom voice clone
const createVoice = async (req, res) => {
  let uploadedFiles = [];
  
  try {
    const { name, description, labels } = req.body;
    uploadedFiles = req.files || [];
    
    console.log('🎭 Starting voice creation process...');
    console.log('Voice name:', name);
    console.log('Files uploaded:', uploadedFiles.length);
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing voice name',
        message: 'Please provide a name for the voice'
      });
    }
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No audio files',
        message: 'Please upload at least one audio file'
      });
    }

    // Validate each audio file
    for (const file of uploadedFiles) {
      const validation = await ElevenLabsService.validateAudioForCloning(file.path);
      if (!validation.valid) {
        cleanupFiles(uploadedFiles);
        return res.status(400).json({
          success: false,
          error: 'Invalid audio file',
          message: `${file.originalname}: ${validation.error}`
        });
      }
    }

    // Check voice quota
    const quota = await ElevenLabsService.getVoiceQuota();
    if (!quota.can_create_voice) {
      cleanupFiles(uploadedFiles);
      return res.status(429).json({
        success: false,
        error: 'Voice quota exceeded',
        message: `Voice limit reached (${quota.voices_used}/${quota.voices_limit})`
      });
    }

    // Parse labels if provided
    let parsedLabels = {};
    if (labels) {
      try {
        parsedLabels = typeof labels === 'string' ? JSON.parse(labels) : labels;
      } catch (error) {
        console.warn('Invalid labels format, using defaults');
      }
    }

    console.log('🔄 Creating voice with ElevenLabs...');
    
    // Create voice using ElevenLabs
    const voiceResult = await ElevenLabsService.createVoice(
      name.trim(),
      description || `Custom voice: ${name}`,
      uploadedFiles.map(file => file.path),
      parsedLabels
    );

    // Generate internal voice ID
    const internalVoiceId = uuidv4();

    // Store voice in database
    const voiceRecord = await query(
      `INSERT INTO voices 
       (voice_id, elevenlabs_voice_id, name, description, original_file_path, file_size, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [
        internalVoiceId,
        voiceResult.voice_id,
        name.trim(),
        description || `Custom voice: ${name}`,
        uploadedFiles[0].path, // Store first file path as reference
        uploadedFiles.reduce((total, file) => total + file.size, 0)
      ]
    );

    // Update usage statistics
    await updateUsageStats('voices_created', 1);
    await updateUsageStats('api_calls_made', 1);

    // Clean up uploaded files after successful processing
    setTimeout(() => {
      cleanupFiles(uploadedFiles);
    }, 5000); // Delay cleanup to ensure voice creation is complete

    console.log(`✅ Voice created successfully: ${voiceResult.voice_id}`);
    
    const response = {
      success: true,
      data: {
        voiceId: internalVoiceId,
        elevenLabsVoiceId: voiceResult.voice_id,
        name: name.trim(),
        description: description || `Custom voice: ${name}`,
        status: 'created',
        createdAt: new Date().toISOString(),
        filesProcessed: uploadedFiles.length,
        totalSize: uploadedFiles.reduce((total, file) => total + file.size, 0)
      },
      message: voiceResult.message || 'Voice created successfully'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error creating voice:', error.message);
    
    // Clean up files in case of error
    cleanupFiles(uploadedFiles);
    
    // Handle specific ElevenLabs errors
    if (error.message.includes('quota')) {
      return res.status(429).json({
        success: false,
        error: 'Quota exceeded',
        message: 'Voice cloning quota exceeded. Please upgrade your plan.'
      });
    }
    
    if (error.message.includes('duration')) {
      return res.status(400).json({
        success: false,
        error: 'Audio too short',
        message: 'Audio files must be at least 10 seconds long for voice cloning.'
      });
    }
    
    if (error.message.includes('quality')) {
      return res.status(400).json({
        success: false,
        error: 'Poor audio quality',
        message: 'Please upload high-quality audio recordings for better voice cloning.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Voice creation failed',
      message: error.message
    });
  }
};

// List all available voices (ElevenLabs + custom)
const listVoices = async (req, res) => {
  try {
    console.log('📋 Fetching all available voices...');
    
    // Get ElevenLabs voices
    const elevenLabsVoices = await ElevenLabsService.getVoices();
    
    // Get custom voices from database
    const customVoicesResult = await query(
      `SELECT voice_id, elevenlabs_voice_id, name, description, created_at, file_size 
       FROM voices 
       ORDER BY created_at DESC`
    );

    const customVoices = customVoicesResult.rows.map(voice => ({
      voice_id: voice.voice_id,
      elevenlabs_voice_id: voice.elevenlabs_voice_id,
      name: voice.name,
      description: voice.description,
      category: 'custom',
      is_custom: true,
      created_at: voice.created_at,
      file_size: voice.file_size
    }));
    
    const response = {
      success: true,
      data: {
        elevenLabsVoices: elevenLabsVoices.voices,
        customVoices: customVoices,
        total: elevenLabsVoices.voices.length + customVoices.length,
        counts: {
          elevenlabs: elevenLabsVoices.voices.length,
          custom: customVoices.length
        }
      },
      message: 'Voices retrieved successfully'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error listing voices:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to list voices',
      message: error.message
    });
  }
};

// Get voice details
const getVoice = async (req, res) => {
  try {
    const { voiceId } = req.params;
    
    console.log(`🔍 Getting voice details: ${voiceId}`);
    
    // Check if it's a custom voice first
    const customVoiceResult = await query(
      'SELECT * FROM voices WHERE voice_id = $1 OR elevenlabs_voice_id = $1',
      [voiceId]
    );
    
    if (customVoiceResult.rows.length > 0) {
      const voice = customVoiceResult.rows[0];
      
      // Get additional details from ElevenLabs
      try {
        const elevenLabsDetails = await ElevenLabsService.getVoice(voice.elevenlabs_voice_id);
        
        return res.json({
          success: true,
          data: {
            ...voice,
            ...elevenLabsDetails,
            is_custom: true,
            internal_id: voice.voice_id
          },
          message: 'Custom voice details retrieved'
        });
      } catch (error) {
        // If ElevenLabs call fails, return database info only
        return res.json({
          success: true,
          data: {
            ...voice,
            is_custom: true,
            warning: 'Could not fetch additional details from ElevenLabs'
          },
          message: 'Voice details retrieved (limited)'
        });
      }
    }
    
    // If not custom, try ElevenLabs directly
    const elevenLabsDetails = await ElevenLabsService.getVoice(voiceId);
    
    res.json({
      success: true,
      data: {
        ...elevenLabsDetails,
        is_custom: false
      },
      message: 'Voice details retrieved'
    });
    
  } catch (error) {
    console.error('❌ Error getting voice details:', error.message);
    res.status(404).json({
      success: false,
      error: 'Voice not found',
      message: error.message
    });
  }
};

// Delete a custom voice
const deleteVoice = async (req, res) => {
  try {
    const { voiceId } = req.params;
    
    console.log(`🗑️ Deleting voice: ${voiceId}`);
    
    // Get voice from database
    const voiceResult = await query(
      'SELECT * FROM voices WHERE voice_id = $1',
      [voiceId]
    );
    
    if (voiceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voice not found',
        message: 'Custom voice not found in database'
      });
    }
    
    const voice = voiceResult.rows[0];
    
    try {
      // Delete from ElevenLabs
      await ElevenLabsService.deleteVoice(voice.elevenlabs_voice_id);
    } catch (error) {
      console.warn('Failed to delete from ElevenLabs, continuing with database cleanup:', error.message);
    }
    
    // Delete from database
    await query('DELETE FROM voices WHERE voice_id = $1', [voiceId]);
    
    // Clean up audio files if they exist
    if (voice.original_file_path && fs.existsSync(voice.original_file_path)) {
      try {
        fs.unlinkSync(voice.original_file_path);
        console.log(`🗑️ Cleaned up audio file: ${voice.original_file_path}`);
      } catch (error) {
        console.warn('Failed to delete audio file:', error.message);
      }
    }
    
    res.json({
      success: true,
      data: {
        voiceId: voiceId,
        name: voice.name
      },
      message: 'Voice deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting voice:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete voice',
      message: error.message
    });
  }
};

// Convert speech using custom or ElevenLabs voice
const convertSpeech = async (req, res) => {
  let uploadedFile = null;
  
  try {
    const { voiceId, options = {} } = req.body;
    uploadedFile = req.file;
    
    console.log('🔄 Starting speech conversion...');
    console.log('Target voice:', voiceId);
    console.log('Audio file:', uploadedFile ? uploadedFile.filename : 'No file');
    
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
    
    // Determine actual ElevenLabs voice ID
    let actualVoiceId = voiceId;
    let isCustomVoice = false;
    
    // Check if it's a custom voice
    const customVoiceResult = await query(
      'SELECT elevenlabs_voice_id, name FROM voices WHERE voice_id = $1',
      [voiceId]
    );
    
    if (customVoiceResult.rows.length > 0) {
      actualVoiceId = customVoiceResult.rows[0].elevenlabs_voice_id;
      isCustomVoice = true;
      console.log(`🎭 Using custom voice: ${customVoiceResult.rows[0].name} (${actualVoiceId})`);
    }
    
    // Parse conversion options
    const conversionOptions = {
      model_id: options.model_id || 'eleven_english_sts_v2',
      voice_settings: {
        stability: parseFloat(options.stability) || 0.5,
        similarity_boost: parseFloat(options.similarity_boost) || 0.8,
        style: parseFloat(options.style) || 0.0,
        use_speaker_boost: options.use_speaker_boost !== false
      }
    };
    
    console.log('🔄 Converting speech with ElevenLabs...');
    
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
          originalVoiceId: voiceId,
          isCustomVoice: isCustomVoice,
          customVoiceName: isCustomVoice ? customVoiceResult.rows[0].name : null
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
        voiceName: isCustomVoice ? customVoiceResult.rows[0].name : voiceId,
        isCustomVoice: isCustomVoice,
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

// Get voice cloning quota and limits
const getVoiceQuota = async (req, res) => {
  try {
    console.log('📊 Getting voice quota information...');
    
    const quota = await ElevenLabsService.getVoiceQuota();
    const userInfo = await ElevenLabsService.getUserInfo();
    
    res.json({
      success: true,
      data: {
        voices_created: quota.voices_used,
        voices_limit: quota.voices_limit,
        voices_remaining: quota.voices_limit - quota.voices_used,
        can_create_voice: quota.can_create_voice,
        subscription_tier: userInfo.subscription?.tier || 'Free',
        character_usage: {
          used: userInfo.subscription?.character_count || 0,
          limit: userInfo.subscription?.character_limit || 10000,
          remaining: userInfo.available_chars || 0
        }
      },
      message: 'Quota information retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting quota:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get quota information',
      message: error.message
    });
  }
};

module.exports = {
  createVoice,
  listVoices,
  getVoice,
  deleteVoice,
  convertSpeech,
  getVoiceQuota
};