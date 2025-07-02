const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Use /tmp directory in production (Render's temporary storage)
const getUploadPath = (subdir) => {
  const baseDir = process.env.NODE_ENV === 'production' ? '/tmp' : './uploads';
  return path.join(baseDir, subdir);
};

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
ensureDirectoryExists(getUploadPath('voices'));
ensureDirectoryExists(getUploadPath('generated'));
ensureDirectoryExists(getUploadPath('temp'));

// Storage configuration for voice samples
const voiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadPath('voices'));
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
    cb(null, getUploadPath('temp'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `audio_${uniqueId}${extension}`);
  }
});

// File filter for audio files
const audioFileFilter = (req, file, cb) => {
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
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024,
    files: 5
  }
});

const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024,
    files: 1
  }
});

// Helper function to save generated audio
const saveGeneratedAudio = (audioBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(getUploadPath('generated'), filename);
    
    fs.writeFile(filePath, audioBuffer, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(filePath);
      }
    });
  });
};

// Updated cleanup for production
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

// Scheduled cleanup - more aggressive in production
const scheduleFileCleanup = () => {
  const cleanupInterval = process.env.NODE_ENV === 'production' 
    ? 60 * 60 * 1000  // 1 hour in production
    : 24 * 60 * 60 * 1000; // 24 hours in development
  
  const maxAge = process.env.NODE_ENV === 'production'
    ? 30 * 60 * 1000  // 30 minutes in production
    : parseInt(process.env.AUDIO_CLEANUP_DAYS) * 24 * 60 * 60 * 1000; // days in development
  
  setInterval(async () => {
    try {
      console.log('🧹 Starting scheduled file cleanup...');
      
      const directories = [
        getUploadPath('temp'), 
        getUploadPath('generated'),
        getUploadPath('voices')
      ];
      const cutoffTime = Date.now() - maxAge;
      
      for (const dir of directories) {
        if (!fs.existsSync(dir)) continue;
        
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          try {
            const stats = fs.statSync(filePath);
            
            if (stats.mtime.getTime() < cutoffTime) {
              fs.unlinkSync(filePath);
              console.log(`🗑️ Cleaned up old file: ${filePath}`);
            }
          } catch (error) {
            console.error(`Error processing file ${filePath}:`, error.message);
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
  handleUploadError: (error, req, res, next) => {
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
  },
  getUploadPath
};