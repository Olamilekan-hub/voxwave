const { ElevenLabsService } = require('../config/elevenlabs');
const { query, updateUsageStats } = require('../config/database');
const { saveGeneratedAudio } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Get available voices from ElevenLabs
const getVoices = async (req, res) => {
  try {
    console.log('🎤 Fetching available voices...');
    
    // Get voices from ElevenLabs
    const voicesData = await ElevenLabsService.getVoices();
    
    // Also get custom voices from database
    const customVoicesResult = await query(
      'SELECT voice_id, name, description, created_at FROM voices ORDER BY created_at DESC'
    );
    
    const response = {
      success: true,
      data: {
        elevenLabsVoices: voicesData.voices || [],
        customVoices: customVoicesResult.rows,
        total: (voicesData.voices?.length || 0) + customVoicesResult.rows.length
      },
      message: 'Voices fetched successfully'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error fetching voices:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voices',
      message: error.message
    });
  }
};

// Generate speech from text
const generateSpeech = async (req, res) => {
  try {
    const { text, voiceId, options = {} } = req.body;
    
    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field',
        message: 'Text is required'
      });
    }
    
    if (!voiceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field',
        message: 'Voice ID is required'
      });
    }
    
    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long',
        message: 'Text must be less than 5000 characters'
      });
    }
    
    console.log(`🗣️ Generating speech for ${text.length} characters using voice: ${voiceId}`);
    
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
    
    // Generate speech using ElevenLabs
    const audioBuffer = await ElevenLabsService.textToSpeech(text, actualVoiceId, options);
    
    // Generate unique filename
    const fileId = uuidv4();
    const filename = `tts_${fileId}.mp3`;
    
    // Save audio file
    const filePath = await saveGeneratedAudio(audioBuffer, filename);
    const publicUrl = `/uploads/generated/${filename}`;
    
    // Save to database
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
        text,
        'text-to-speech',
        JSON.stringify({
          options,
          characterCount: text.length,
          voiceUsed: actualVoiceId,
          originalVoiceId: voiceId
        })
      ]
    );
    
    // Update usage statistics
    await updateUsageStats('characters_processed', text.length);
    await updateUsageStats('audio_files_generated', 1);
    await updateUsageStats('api_calls_made', 1);
    
    console.log(`✅ Speech generated successfully: ${filename}`);
    
    const response = {
      success: true,
      data: {
        fileId,
        audioUrl: publicUrl,
        filename,
        fileSize: audioBuffer.length,
        duration: Math.ceil(text.length / 200), // Rough estimate: 200 chars per minute
        characterCount: text.length,
        voiceUsed: voiceId,
        createdAt: new Date().toISOString()
      },
      message: 'Speech generated successfully'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error generating speech:', error.message);
    
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
    
    res.status(500).json({
      success: false,
      error: 'Speech generation failed',
      message: error.message
    });
  }
};

module.exports = {
  getVoices,
  generateSpeech
};