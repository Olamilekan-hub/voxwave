const { query, updateUsageStats } = require('../config/database');
const { uploadAudio, handleUploadError, cleanupFiles } = require('../middleware/upload');
const { AudioProcessor } = require('../middleware/audioProcessor');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// For demo purposes - in production, use actual STT service like Whisper, Google Speech-to-Text, etc.
const mockTranscriptionService = async (audioPath, options = {}) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Get audio metadata
  const metadata = await AudioProcessor.getAudioMetadata(audioPath);
  
  // Mock transcriptions based on duration
  const mockTexts = [
    "Welcome to VoxWave, the revolutionary AI voice platform that transforms how we interact with audio content.",
    "In today's digital world, the ability to convert speech to text has become increasingly important for accessibility and productivity.",
    "Our advanced speech recognition technology can accurately transcribe multiple languages with high precision and speed.",
    "Whether you're transcribing meetings, interviews, or creating subtitles, VoxWave provides the tools you need for professional results.",
    "This is a sample transcription demonstrating our speech-to-text capabilities with high accuracy and natural language processing."
  ];
  
  const transcription = mockTexts[Math.floor(Math.random() * mockTexts.length)];
  const wordCount = transcription.split(' ').length;
  const confidence = 0.92 + Math.random() * 0.07; // 92-99% confidence
  
  return {
    transcription,
    confidence,
    language: options.language || 'en-US',
    duration: metadata.duration,
    wordCount,
    metadata: {
      sampleRate: metadata.sampleRate,
      channels: metadata.channels,
      format: metadata.format
    }
  };
};

// Transcribe audio to text
const transcribeAudio = async (req, res) => {
  let uploadedFile = null;
  
  try {
    const { 
      language = 'en-US', 
      includeTimestamps = false, 
      speakerDiarization = false,
      enhanceAudio = true 
    } = req.body;
    
    uploadedFile = req.file;
    
    console.log('🎙️ Starting speech-to-text transcription...');
    console.log('Language:', language);
    console.log('Options:', { includeTimestamps, speakerDiarization, enhanceAudio });
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
    
    let processedFilePath = uploadedFile.path;
    
    // Enhance audio quality if requested
    if (enhanceAudio) {
      console.log('🔧 Enhancing audio quality...');
      try {
        const enhancedResult = await AudioProcessor.processForVoiceCloning(uploadedFile.path, {
          normalize: true,
          trimSilence: true,
          optimize: false // Keep original format for STT
        });
        processedFilePath = enhancedResult.processedPath;
        console.log('✅ Audio enhanced successfully');
      } catch (error) {
        console.warn('⚠️ Audio enhancement failed, using original file:', error.message);
      }
    }
    
    // Perform transcription
    console.log('🔄 Transcribing audio...');
    const result = await mockTranscriptionService(processedFilePath, {
      language,
      includeTimestamps,
      speakerDiarization
    });
    
    // Generate unique transcription ID
    const transcriptionId = uuidv4();
    
    // Format transcription with timestamps if requested
    let formattedTranscription = result.transcription;
    if (includeTimestamps) {
      const words = result.transcription.split(' ');
      const timePerWord = result.duration / words.length;
      
      formattedTranscription = words.map((word, index) => {
        const timestamp = Math.floor(index * timePerWord);
        const minutes = Math.floor(timestamp / 60);
        const seconds = timestamp % 60;
        
        if (index % 10 === 0) {
          return `\n[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}] ${word}`;
        }
        return word;
      }).join(' ').trim();
    }
    
    // Add speaker diarization if requested
    if (speakerDiarization) {
      const sentences = formattedTranscription.split('. ');
      formattedTranscription = sentences.map((sentence, index) => {
        const speaker = index % 2 === 0 ? 'Speaker 1' : 'Speaker 2';
        return `${speaker}: ${sentence.trim()}`;
      }).join('. ');
    }
    
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
        language,
        result.confidence,
        JSON.stringify({
          originalFile: uploadedFile.originalname,
          originalSize: uploadedFile.size,
          duration: result.duration,
          wordCount: result.wordCount,
          includeTimestamps,
          speakerDiarization,
          enhanceAudio,
          audioMetadata: result.metadata,
          processedAt: new Date().toISOString()
        })
      ]
    );
    
    // Update usage statistics
    await updateUsageStats('api_calls_made', 1);
    
    // Clean up processed file if different from original
    if (processedFilePath !== uploadedFile.path) {
      try {
        fs.unlinkSync(processedFilePath);
      } catch (error) {
        console.warn('Failed to cleanup processed file:', error.message);
      }
    }
    
    // Clean up uploaded file
    setTimeout(() => {
      cleanupFiles([uploadedFile]);
    }, 1000);
    
    console.log(`✅ Transcription completed successfully: ${result.wordCount} words`);
    
    const response = {
      success: true,
      data: {
        transcriptionId,
        transcription: formattedTranscription,
        confidence: result.confidence,
        language,
        duration: result.duration,
        wordCount: result.wordCount,
        characterCount: formattedTranscription.length,
        originalFile: uploadedFile.originalname,
        originalSize: uploadedFile.size,
        options: {
          includeTimestamps,
          speakerDiarization,
          enhanceAudio
        },
        metadata: result.metadata,
        createdAt: new Date().toISOString()
      },
      message: `Audio transcribed successfully: ${result.wordCount} words with ${Math.round(result.confidence * 100)}% confidence`
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error transcribing audio:', error.message);
    
    // Clean up files in case of error
    if (uploadedFile) {
      cleanupFiles([uploadedFile]);
    }
    
    // Handle specific errors
    if (error.message.includes('file') || error.message.includes('audio')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid audio file',
        message: 'Please upload a valid audio file (MP3, WAV, M4A, etc.)',
        suggestion: 'Ensure your audio file is not corrupted and is in a supported format.'
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: 'Processing timeout',
        message: 'The transcription took too long and timed out.',
        suggestion: 'Try with a shorter audio file or try again later.'
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

// Get transcription history
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

// Get supported languages and options
const getTranscriptionInfo = async (req, res) => {
  try {
    const info = {
      success: true,
      data: {
        supportedLanguages: [
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
        ],
        supportedFormats: [
          'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
          'audio/flac', 'audio/ogg', 'audio/webm'
        ],
        maxFileSize: '25MB',
        maxFileSizeBytes: 25 * 1024 * 1024,
        features: {
          timestamps: true,
          speakerDiarization: true,
          audioEnhancement: true,
          multipleLanguages: true,
          highAccuracy: true
        },
        options: {
          includeTimestamps: {
            description: 'Add timestamps to transcription',
            default: false
          },
          speakerDiarization: {
            description: 'Identify different speakers',
            default: false
          },
          enhanceAudio: {
            description: 'Improve audio quality before transcription',
            default: true
          }
        }
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