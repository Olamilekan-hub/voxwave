const { ElevenLabsService } = require('../config/elevenlabs');
const { query, updateUsageStats } = require('../config/database');
const { saveGeneratedAudio } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// FIXED: Get available voices from ElevenLabs (no duplicates)
const getVoices = async (req, res) => {
  try {
    console.log('🎤 Fetching available voices...');
    
    // Get voices from ElevenLabs
    const voicesData = await ElevenLabsService.getVoices();
    
    // Also get custom voices from database
    const customVoicesResult = await query(
      'SELECT voice_id, elevenlabs_voice_id, name, description, created_at FROM voices ORDER BY created_at DESC'
    );

    // FIXED: Transform custom voices properly
    const customVoices = customVoicesResult.rows.map(voice => ({
      voice_id: voice.voice_id, // Use our internal voice_id
      elevenlabs_voice_id: voice.elevenlabs_voice_id,
      name: voice.name,
      description: voice.description,
      category: 'custom',
      is_custom: true,
      created_at: voice.created_at
    }));

    // FIXED: Filter out ElevenLabs voices that are already custom voices
    const elevenLabsOnlyVoices = (voicesData.voices || []).filter(voice => {
      // Filter out any voice that matches a custom voice's ElevenLabs ID
      return !customVoices.some(customVoice => 
        customVoice.elevenlabs_voice_id === voice.voice_id
      );
    });
    
    const response = {
      success: true,
      data: {
        elevenLabsVoices: elevenLabsOnlyVoices, // FIXED: Only pure ElevenLabs voices
        customVoices: customVoices, // Custom voices separately
        total: elevenLabsOnlyVoices.length + customVoices.length
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
    
    // FIXED: Check if it's a custom voice from our database
    let actualVoiceId = voiceId;
    let voiceName = 'Unknown Voice';
    let isCustomVoice = false;
    
    const customVoiceResult = await query(
      'SELECT elevenlabs_voice_id, name FROM voices WHERE voice_id = $1',
      [voiceId]
    );
    
    if (customVoiceResult.rows.length > 0) {
      actualVoiceId = customVoiceResult.rows[0].elevenlabs_voice_id;
      voiceName = customVoiceResult.rows[0].name;
      isCustomVoice = true;
      console.log(`🎭 Using custom voice mapping: ${voiceId} -> ${actualVoiceId} (${voiceName})`);
    } else {
      // It's a regular ElevenLabs voice, try to get the name
      try {
        const voicesData = await ElevenLabsService.getVoices();
        const voice = voicesData.voices.find(v => v.voice_id === voiceId);
        voiceName = voice ? voice.name : voiceId;
      } catch (error) {
        console.warn('Could not fetch voice name:', error.message);
        voiceName = voiceId;
      }
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
          originalVoiceId: voiceId,
          voiceName: voiceName,
          isCustomVoice: isCustomVoice
        })
      ]
    );
    
    // Update usage statistics
    await updateUsageStats('characters_processed', text.length);
    await updateUsageStats('audio_files_generated', 1);
    await updateUsageStats('api_calls_made', 1);
    
    console.log(`✅ Speech generated successfully: ${filename} using ${isCustomVoice ? 'custom' : 'ElevenLabs'} voice: ${voiceName}`);
    
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
        voiceName: voiceName,
        isCustomVoice: isCustomVoice,
        createdAt: new Date().toISOString()
      },
      message: `Speech generated successfully using ${isCustomVoice ? 'custom' : 'ElevenLabs'} voice: ${voiceName}`
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