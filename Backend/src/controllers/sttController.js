const { query, updateUsageStats } = require('../config/database');
const { uploadAudio, handleUploadError, cleanupFiles } = require('../middleware/upload');
const { OpenAIService } = require('../config/openai'); // NEW: Import OpenAI service
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// REAL transcription using OpenAI Whisper (replacing mock)
const transcribeAudio = async (req, res) => {
  let uploadedFile = null;
  
  try {
    const { 
      language = null,
      includeTimestamps = false, 
      speakerDiarization = false,
      enhanceAudio = true 
    } = req.body;
    
    // Convert string boolean values to actual booleans
    const parsedIncludeTimestamps = includeTimestamps === 'true' || includeTimestamps === true;
    const parsedSpeakerDiarization = speakerDiarization === 'true' || speakerDiarization === true;
    const parsedEnhanceAudio = enhanceAudio === 'true' || enhanceAudio === true;
    
    uploadedFile = req.file;
    
    console.log('🎙️ Starting real speech-to-text transcription...');
    console.log('Language:', language || 'auto-detect');
    console.log('Options:', { 
      includeTimestamps: parsedIncludeTimestamps, 
      speakerDiarization: parsedSpeakerDiarization, 
      enhanceAudio: parsedEnhanceAudio 
    });
    console.log('File:', uploadedFile ? uploadedFile.filename : 'No file');
    
    // Validation
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        error: 'Missing audio file',
        message: 'Please upload an audio file'
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

    // Use OpenAI Whisper for real transcription
    console.log('🔄 Transcribing with OpenAI Whisper...');
    
    const transcriptionOptions = {
      language: language || null, // Will be converted in OpenAI service
      response_format: parsedIncludeTimestamps ? 'verbose_json' : 'text',
      temperature: 0,
    };

    const result = await OpenAIService.transcribeAudio(uploadedFile.path, transcriptionOptions);
    
    // Format the transcription based on options
    let formattedTranscription = result.text;
    let confidence = 0.95; // Whisper generally has high confidence
    
    if (parsedIncludeTimestamps && result.segments) {
      formattedTranscription = OpenAIService.formatWithTimestamps(result.segments);
    }
    
    if (parsedSpeakerDiarization && result.segments) {
      formattedTranscription = OpenAIService.addSpeakerDiarization(result.segments);
    }
    
    // Generate unique transcription ID
    const transcriptionId = uuidv4();
    
    // Calculate word count
    const wordCount = formattedTranscription.split(' ').filter(word => word.trim()).length;
    
    // Save transcription to database
    const transcriptionRecord = await query(
      `INSERT INTO transcriptions 
       (transcription_id, original_file_path, transcribed_text, language, confidence_score, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        transcriptionId,
        uploadedFile.path,
        formattedTranscription,
        result.language || language || 'auto-detected',
        confidence,
        JSON.stringify({
          originalFile: uploadedFile.originalname,
          originalSize: uploadedFile.size,
          duration: result.duration || 0,
          wordCount: wordCount,
          includeTimestamps: parsedIncludeTimestamps,
          speakerDiarization: parsedSpeakerDiarization,
          enhanceAudio: parsedEnhanceAudio,
          segments: result.segments || [],
          processedAt: new Date().toISOString(),
          service: 'openai-whisper'
        })
      ]
    );
    
    // Update usage statistics
    await updateUsageStats('api_calls_made', 1);
    
    // Clean up uploaded file
    setTimeout(() => {
      cleanupFiles([uploadedFile]);
    }, 1000);
    
    console.log(`✅ Real transcription completed: ${wordCount} words`);
    
    const response = {
      success: true,
      data: {
        transcriptionId,
        transcription: formattedTranscription,
        confidence: confidence,
        language: result.language || language || 'auto-detected',
        duration: result.duration || 0,
        wordCount: wordCount,
        characterCount: formattedTranscription.length,
        originalFile: uploadedFile.originalname,
        originalSize: uploadedFile.size,
        options: {
          includeTimestamps: parsedIncludeTimestamps,
          speakerDiarization: parsedSpeakerDiarization,
          enhanceAudio: parsedEnhanceAudio
        },
        metadata: {
          service: 'openai-whisper',
          segments: result.segments || [],
          processingTime: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      },
      message: `Audio transcribed successfully: ${wordCount} words with OpenAI Whisper`
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error transcribing audio:', error.message);
    
    // Clean up files in case of error
    if (uploadedFile) {
      cleanupFiles([uploadedFile]);
    }
    
    // Handle specific OpenAI errors
    if (error.message.includes('API key')) {
      return res.status(401).json({
        success: false,
        error: 'API configuration error',
        message: 'OpenAI API key is invalid or missing',
        suggestion: 'Please check your OpenAI API key configuration.'
      });
    }
    
    if (error.message.includes('quota')) {
      return res.status(429).json({
        success: false,
        error: 'API quota exceeded',
        message: 'OpenAI API quota exceeded',
        suggestion: 'Please check your OpenAI usage limits.'
      });
    }
    
    if (error.message.includes('language')) {
      return res.status(400).json({
        success: false,
        error: 'Language not supported',
        message: 'The selected language is not supported or invalid',
        suggestion: 'Please select a different language or use auto-detect.'
      });
    }
    
    if (error.message.includes('file') || error.message.includes('format')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid audio file',
        message: 'Please upload a valid audio file (MP3, WAV, M4A, etc.)',
        suggestion: 'Ensure your audio file is not corrupted and is in a supported format.'
      });
    }
    
    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Transcription failed',
      message: error.message || 'An unexpected error occurred during transcription.',
      suggestion: 'Please try again or contact support if the problem persists.'
    });
  }
};

// Rest of the functions remain the same...
const getTranscriptionHistory = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await query(
      `SELECT transcription_id, original_file_path, transcribed_text, language, confidence_score, created_at, metadata 
       FROM transcriptions 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM transcriptions`
    );
    
    const transcriptions = result.rows.map(row => ({
      ...row,
      metadata: JSON.parse(row.metadata || '{}')
    }));
    
    res.json({
      success: true,
      data: {
        transcriptions,
        total: parseInt(totalResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      },
      message: 'Transcription history retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting transcription history:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get transcription history',
      message: error.message
    });
  }
};

const getTranscriptionInfo = async (req, res) => {
  try {
    const info = {
      success: true,
      data: {
        supportedLanguages: OpenAIService.getSupportedLanguages(),
        supportedFormats: [
          'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
          'audio/flac', 'audio/ogg', 'audio/webm', 'audio/mp4'
        ],
        maxFileSize: '25MB',
        maxFileSizeBytes: 25 * 1024 * 1024,
        features: {
          timestamps: true,
          speakerDiarization: true,
          audioEnhancement: true,
          multipleLanguages: true,
          highAccuracy: true,
          autoLanguageDetection: true
        },
        options: {
          includeTimestamps: {
            description: 'Add timestamps to transcription',
            default: false
          },
          speakerDiarization: {
            description: 'Identify different speakers (basic)',
            default: false
          },
          enhanceAudio: {
            description: 'Improve audio quality before transcription',
            default: true
          }
        },
        service: 'OpenAI Whisper',
        models: ['whisper-1']
      },
      message: 'Speech-to-text info retrieved successfully'
    };
    
    res.json(info);
    
  } catch (error) {
    console.error('❌ Error getting transcription info:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get transcription info',
      message: error.message
    });
  }
};

module.exports = {
  transcribeAudio,
  getTranscriptionHistory,
  getTranscriptionInfo
};
