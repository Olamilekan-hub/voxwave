const { app, initializeServices } = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Graceful shutdown function
const gracefulShutdown = (signal) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server close:', err.message);
      process.exit(1);
    }
    
    console.log('✅ HTTP server closed');
    console.log('👋 VoxWave API server shutdown complete');
    process.exit(0);
  });
};

// Start server
const startServer = async () => {
  try {
    // Initialize all services
    await initializeServices();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('\n🎉 VoxWave API Server Started!');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API info: http://localhost:${PORT}/api/info`);
      console.log('\n📋 Available endpoints:');
      console.log('   POST /api/tts/generate - Text to Speech');
      console.log('   POST /api/voice/create - Create Voice Clone');
      console.log('   POST /api/voice/convert - Speech to Speech');
      console.log('   GET  /api/voice/list - List Voices');
      console.log('   POST /api/stt/transcribe - Speech to Text');
      console.log('\n🎵 Ready to transform voices! 🎵\n');
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Promise Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Export server for testing
let server;
if (require.main === module) {
  // Only start server if this file is run directly
  startServer().then((srv) => {
    server = srv;
  });
} else {
  // Export for testing
  module.exports = { startServer };
}