const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
ensureDirectoryExists('./uploads/voices');
ensureDirectoryExists('./uploads/generated');
ensureDirectoryExists('./uploads/temp');

// Storage configuration for voice samples
const voiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/voices');
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `voice_${uniqueId}${extension}`);
  }
});

// Storage configuration for temporary audio files
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `audio_${uniqueId}${extension}`);
  }
});

// File filter for audio files
const audioFileFilter = (req, file, cb) => {
  // Allowed audio formats
  const allowedMimes = [
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
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed formats: ${allowedMimes.join(', ')}`), false);
  }
};

// Multer configurations
const uploadVoice = multer({
  storage: voiceStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024, // 25MB
    files: 5 // Allow up to 5 voice samples
  }
});

const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024, // 25MB
    files: 1
  }
});

// Helper function to clean up uploaded files
const cleanupFiles = (files) => {
  if (!files) return;
  
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log(`🗑️ Cleaned up temporary file: ${file.path}`);
      } catch (error) {
        console.error(`Failed to cleanup file ${file.path}:`, error.message);
      }
    }
  });
};

// Helper function to save generated audio
const saveGeneratedAudio = (audioBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join('./uploads/generated', filename);
    
    fs.writeFile(filePath, audioBuffer, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(filePath);
      }
    });
  });
};

// Middleware to handle upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'File too large',
          message: 'File size exceeds 25MB limit'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Too many files',
          message: 'Maximum 5 voice samples allowed'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Unexpected file field',
          message: 'Invalid file field name'
        });
      default:
        return res.status(400).json({
          error: 'Upload error',
          message: error.message
        });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }
  
  next(error);
};

// Scheduled cleanup of old files
const scheduleFileCleanup = () => {
  const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
  const maxAge = parseInt(process.env.AUDIO_CLEANUP_DAYS) || 7; // days
  
  setInterval(async () => {
    try {
      console.log('🧹 Starting scheduled file cleanup...');
      
      const directories = ['./uploads/temp', './uploads/generated'];
      const cutoffTime = Date.now() - (maxAge * 24 * 60 * 60 * 1000);
      
      for (const dir of directories) {
        if (!fs.existsSync(dir)) continue;
        
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime.getTime() < cutoffTime) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Cleaned up old file: ${filePath}`);
          }
        }
      }
      
      console.log('✅ File cleanup completed');
    } catch (error) {
      console.error('❌ File cleanup failed:', error.message);
    }
  }, cleanupInterval);
};

// Start cleanup scheduler
scheduleFileCleanup();

module.exports = {
  uploadVoice,
  uploadAudio,
  cleanupFiles,
  saveGeneratedAudio,
  handleUploadError
};