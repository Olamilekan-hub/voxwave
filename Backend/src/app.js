const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Import routes
const ttsRoutes = require("./routes/tts");
const voiceRoutes = require("./routes/voice");
const sttRoutes = require("./routes/stt");

const { DemoAudioService } = require('./services/demoAudioService');


// Import database
const { testConnection, initializeDatabase } = require("./config/database");
const { ElevenLabsService } = require("./config/elevenlabs");
const { OpenAIService } = require('./config/openai');
const { getUploadPath } = require("./middleware/upload");

const app = express();

// Security middleware with relaxed CSP for audio
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.elevenlabs.io"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:", "data:"],
      frameSrc: ["'none'"],
    },
  },
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration - FIXED for audio streaming
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://voxwave.vercel.app',
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Range'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'],
};

app.use(cors(corsOptions));

// Trust proxy (important for Render)
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// FIXED: Serve uploaded files with proper headers for audio streaming
const uploadsPath = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, "../uploads");

// Serve generated audio files with proper headers
app.use("/uploads/generated", express.static(path.join(uploadsPath, "generated"), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp3') || filePath.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Serve temporary uploaded files
app.use("/uploads/temp", express.static(path.join(uploadsPath, "temp"), {
  maxAge: '10m',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp3') || filePath.endsWith('.wav') || filePath.endsWith('.m4a')) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Serve voice samples
app.use("/uploads/voices", express.static(path.join(uploadsPath, "voices"), {
  maxAge: '24h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp3') || filePath.endsWith('.wav') || filePath.endsWith('.m4a')) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Health check endpoint (important for Render)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Render health check
app.get("/", (req, res) => {
  res.json({
    message: "VoxWave API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Info endpoint
app.get("/api/info", async (req, res) => {
  try {
    // Test ElevenLabs connection
    const elevenLabsStatus = await ElevenLabsService.testConnection();

    res.json({
      name: "VoxWave API",
      version: process.env.npm_package_version || "1.0.0",
      description: "AI Voice Platform Backend API",
      status: "running",
      environment: process.env.NODE_ENV,
      services: {
        database: "connected",
        elevenLabs: elevenLabsStatus ? "connected" : "disconnected",
      },
      endpoints: {
        textToSpeech: "/api/tts",
        speechToSpeech: "/api/voice/convert",
        speechToText: "/api/stt",
        voices: "/api/voice",
        health: "/health",
      },
    });
  } catch (error) {
    console.error("API info error:", error);
    res.status(500).json({
      name: "VoxWave API",
      version: process.env.npm_package_version || "1.0.0",
      status: "error",
      error: error.message,
    });
  }
});

// API Routes
app.use("/api/tts", ttsRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/stt', sttRoutes);

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /health",
      "GET /api/info",
      "POST /api/tts/generate",
      "GET /api/tts/voices",
      "POST /api/voice/create",
      "POST /api/voice/convert",
      "GET /api/voice/list",
      "POST /api/stt/transcribe",
      "GET /api/demo/audio",
      "POST /api/demo/generate", 
      "GET /api/demo/validate",
    ],
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("Global Error Handler:", error);

  // Multer errors
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File too large",
      message: "File size exceeds 25MB limit",
    });
  }

  // Database errors
  if (error.code && error.code.startsWith("23")) {
    return res.status(400).json({
      error: "Database constraint violation",
      message: "Data validation failed",
    });
  }

  // CORS errors
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: "CORS error",
      message: "Origin not allowed",
    });
  }

  // Default error response
  const statusCode = error.status || error.statusCode || 500;
  res.status(statusCode).json({
    error: error.name || "Internal Server Error",
    message: error.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Initialize services
const initializeServices = async () => {
  try {
    console.log('🚀 Initializing VoxWave services...');

    // Test database connection
    await testConnection();

    // Initialize database tables
    await initializeDatabase();

    // Test ElevenLabs connection
    const elevenLabsStatus = await ElevenLabsService.testConnection();
    if (!elevenLabsStatus) {
      console.warn('⚠️ ElevenLabs API connection failed. Check your API key.');
    }

    // Test OpenAI connection (NEW)
    const openAIStatus = await OpenAIService.testConnection();
    if (!openAIStatus) {
      console.warn('⚠️ OpenAI API connection failed. Check your API key.');
    }

    // Initialize demo audio (NEW)
    if (elevenLabsStatus) {
      try {
        console.log('🎙️ Checking demo audio availability...');
        const validation = await DemoAudioService.validateDemoAudio();
        
        if (validation.valid === 0) {
          console.log('📢 No demo audio found. Generating with Elon Musk voice...');
          await DemoAudioService.generateAllDemoAudio();
          console.log('✅ Demo audio generation completed');
        } else {
          console.log(`✅ Found ${validation.valid}/${validation.total} valid demo audio files`);
          
          // Regenerate missing files
          if (validation.missing > 0) {
            console.log(`🔄 Regenerating ${validation.missing} missing demo audio files...`);
            await DemoAudioService.generateAllDemoAudio();
          }
        }
      } catch (error) {
        console.warn('⚠️ Demo audio initialization failed:', error.message);
        console.log('💡 Demo audio can be generated later via /api/demo/generate');
      }
    } else {
      console.warn('⚠️ Skipping demo audio generation - ElevenLabs API not available');
    }

    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
    throw error;
  }
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = { app, initializeServices };