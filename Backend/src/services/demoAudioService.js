const { ElevenLabsService } = require('../config/elevenlabs');
const { query, updateUsageStats } = require('../config/database');
const { saveGeneratedAudio } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Elon Musk's voice configuration
const ELON_VOICE_ID = 'XbhZXnmUIwsK7EPFVolW';
const ELON_VOICE_SETTINGS = {
  stability: 0.7,
  similarity_boost: 0.9,
  style: 0.3,
  use_speaker_boost: true
};

// Demo texts that will be pre-generated
const DEMO_TEXTS = [
  "Welcome to VoxWave, the future of AI voice technology.",
  "Transform any text into natural, human-like speech instantly.",
  "Experience the power of artificial intelligence in voice generation.",
  "Create custom voices that sound incredibly realistic and engaging.",
  "The possibilities are endless with VoxWave's advanced AI platform."
];

class DemoAudioService {
  // Generate all demo audio files
  static async generateAllDemoAudio() {
    console.log('🎙️ Starting demo audio generation with Elon Musk voice...');
    
    try {
      // Clear existing demo audio
      await query('DELETE FROM demo_audio');
      console.log('🗑️ Cleared existing demo audio');

      const results = [];

      for (let i = 0; i < DEMO_TEXTS.length; i++) {
        const text = DEMO_TEXTS[i];
        const demoId = `demo_${i + 1}`;
        
        console.log(`🔄 Generating audio for demo ${i + 1}: "${text.substring(0, 50)}..."`);

        try {
          // Generate speech using ElevenLabs
          const audioBuffer = await ElevenLabsService.textToSpeech(
            text,
            ELON_VOICE_ID,
            {
              model_id: "eleven_monolingual_v1",
              voice_settings: ELON_VOICE_SETTINGS,
              output_format: "mp3_44100_128"
            }
          );

          // Generate unique filename
          const filename = `demo_elon_${demoId}_${Date.now()}.mp3`;
          
          // Save audio file
          const filePath = await saveGeneratedAudio(audioBuffer, filename);
          const publicUrl = `/uploads/generated/${filename}`;

          // Estimate duration (rough calculation)
          const estimatedDuration = Math.ceil(text.length / 12); // ~12 characters per second

          // Save to database
          const result = await query(
            `INSERT INTO demo_audio 
             (demo_id, text, voice_id, voice_name, file_path, file_url, file_size, duration) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [
              demoId,
              text,
              ELON_VOICE_ID,
              'Elon Musk',
              filePath,
              publicUrl,
              audioBuffer.length,
              estimatedDuration
            ]
          );

          results.push(result.rows[0]);

          // Update usage statistics
          await updateUsageStats('characters_processed', text.length);
          await updateUsageStats('audio_files_generated', 1);

          console.log(`✅ Generated demo ${i + 1}: ${filename} (${audioBuffer.length} bytes)`);

        } catch (error) {
          console.error(`❌ Failed to generate demo ${i + 1}:`, error.message);
          throw error;
        }
      }

      console.log(`🎉 Successfully generated ${results.length} demo audio files`);
      return results;

    } catch (error) {
      console.error('❌ Demo audio generation failed:', error.message);
      throw error;
    }
  }

  // Get all demo audio
  static async getAllDemoAudio() {
    try {
      const result = await query(
        'SELECT * FROM demo_audio ORDER BY demo_id',
        []
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching demo audio:', error.message);
      throw error;
    }
  }

  // Get specific demo audio by ID
  static async getDemoAudio(demoId) {
    try {
      const result = await query(
        'SELECT * FROM demo_audio WHERE demo_id = $1',
        [demoId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching demo audio:', error.message);
      throw error;
    }
  }

  // Check if demo audio exists and is accessible
  static async validateDemoAudio() {
    try {
      const demoAudios = await this.getAllDemoAudio();
      const validAudios = [];

      for (const demo of demoAudios) {
        // Check if file exists
        if (fs.existsSync(demo.file_path)) {
          validAudios.push(demo);
        } else {
          console.warn(`⚠️ Demo audio file missing: ${demo.file_path}`);
        }
      }

      return {
        total: demoAudios.length,
        valid: validAudios.length,
        missing: demoAudios.length - validAudios.length,
        audios: validAudios
      };
    } catch (error) {
      console.error('Error validating demo audio:', error.message);
      throw error;
    }
  }

  // Regenerate specific demo audio
  static async regenerateDemoAudio(demoId) {
    try {
      console.log(`🔄 Regenerating demo audio: ${demoId}`);

      // Get demo text
      const demoIndex = parseInt(demoId.replace('demo_', '')) - 1;
      if (demoIndex < 0 || demoIndex >= DEMO_TEXTS.length) {
        throw new Error('Invalid demo ID');
      }

      const text = DEMO_TEXTS[demoIndex];

      // Delete existing record
      await query('DELETE FROM demo_audio WHERE demo_id = $1', [demoId]);

      // Generate new audio
      const audioBuffer = await ElevenLabsService.textToSpeech(
        text,
        ELON_VOICE_ID,
        {
          model_id: "eleven_monolingual_v1",
          voice_settings: ELON_VOICE_SETTINGS,
          output_format: "mp3_44100_128"
        }
      );

      // Save new file
      const filename = `demo_elon_${demoId}_${Date.now()}.mp3`;
      const filePath = await saveGeneratedAudio(audioBuffer, filename);
      const publicUrl = `/uploads/generated/${filename}`;
      const estimatedDuration = Math.ceil(text.length / 12);

      // Save to database
      const result = await query(
        `INSERT INTO demo_audio 
         (demo_id, text, voice_id, voice_name, file_path, file_url, file_size, duration) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [
          demoId,
          text,
          ELON_VOICE_ID,
          'Elon Musk',
          filePath,
          publicUrl,
          audioBuffer.length,
          estimatedDuration
        ]
      );

      console.log(`✅ Regenerated demo audio: ${demoId}`);
      return result.rows[0];

    } catch (error) {
      console.error(`❌ Failed to regenerate demo ${demoId}:`, error.message);
      throw error;
    }
  }

  // Get demo texts (for frontend reference)
  static getDemoTexts() {
    return DEMO_TEXTS.map((text, index) => ({
      demo_id: `demo_${index + 1}`,
      text
    }));
  }
}

module.exports = { DemoAudioService };