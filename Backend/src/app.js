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
const speechToSpeechRoutes = require("./routes/sts");

// Import database
const { testConnection, initializeDatabase } = require("./config/database");
const { ElevenLabsService } = require("./config/elevenlabs");

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files with proper headers
app.use("/uploads", (req, res, next) => {
  // Set proper headers for audio files
  if (req.path.match(/\.(mp3|wav|m4a|ogg)$/)) {
    res.set({
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Cache-Control': 'public, max-age=3600'
    });
  }
  next();
}, express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Info endpoint
app.get("/api/info", async (req, res) => {
  try {
    // Test ElevenLabs connection
    const elevenLabsStatus = await ElevenLabsService.testConnection();

    res.json({
      name: "VoxWave API",
      version: "1.0.0",
      description: "AI Voice Platform Backend API",
      status: "running",
      services: {
        database: "connected",
        elevenLabs: elevenLabsStatus ? "connected" : "disconnected",
      },
      endpoints: {
        textToSpeech: "/api/tts",
        speechToSpeech: "/api/speech-to-speech",
        speechToText: "/api/stt",
        voices: "/api/voice",
        health: "/health",
      },
    });
  } catch (error) {
    res.status(500).json({
      name: "VoxWave API",
      version: "1.0.0",
      status: "error",
      error: error.message,
    });
  }
});

// API Routes
app.use("/api/tts", ttsRoutes);
app.use("/api/speech-to-speech", speechToSpeechRoutes);
// app.use('/api/voice', voiceRoutes);
// app.use('/api/stt', sttRoutes);

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
      "POST /api/speech-to-speech/convert",
      "GET /api/speech-to-speech/info",
      "POST /api/voice/create",
      "POST /api/voice/convert",
      "GET /api/voice/list",
      "POST /api/stt/transcribe",
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

  // Default error response
  res.status(error.status || 500).json({
    error: error.name || "Internal Server Error",
    message: error.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Initialize services
const initializeServices = async () => {
  try {
    console.log("🚀 Initializing VoxWave services...");

    // Test database connection
    await testConnection();

    // Initialize database tables
    await initializeDatabase();

    // Test ElevenLabs connection
    const elevenLabsStatus = await ElevenLabsService.testConnection();
    if (!elevenLabsStatus) {
      console.warn("⚠️ ElevenLabs API connection failed. Check your API key.");
    }

    console.log("✅ All services initialized successfully");
  } catch (error) {
    console.error("❌ Service initialization failed:", error.message);
    throw error;
  }
};

module.exports = { app, initializeServices };