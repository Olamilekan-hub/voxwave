const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await pool.query(`
      -- Create voices table for voice clones
      CREATE TABLE IF NOT EXISTS voices (
        id SERIAL PRIMARY KEY,
        voice_id VARCHAR(255) UNIQUE NOT NULL,
        elevenlabs_voice_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        original_file_path VARCHAR(500) NOT NULL,
        file_size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      -- Create audio_files table for generated audio
      CREATE TABLE IF NOT EXISTS audio_files (
        id SERIAL PRIMARY KEY,
        file_id VARCHAR(255) UNIQUE NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INTEGER,
        voice_used VARCHAR(255),
        original_text TEXT,
        processing_type VARCHAR(50) NOT NULL, -- 'text-to-speech', 'speech-to-speech', 'speech-to-text'
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
      );
    `);

    await pool.query(`
      -- Create usage_stats table for tracking API usage
      CREATE TABLE IF NOT EXISTS usage_stats (
        id SERIAL PRIMARY KEY,
        date DATE DEFAULT CURRENT_DATE,
        characters_processed INTEGER DEFAULT 0,
        audio_files_generated INTEGER DEFAULT 0,
        voices_created INTEGER DEFAULT 0,
        api_calls_made INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      -- Create transcriptions table for speech-to-text results
      CREATE TABLE IF NOT EXISTS transcriptions (
        id SERIAL PRIMARY KEY,
        transcription_id VARCHAR(255) UNIQUE NOT NULL,
        original_file_path VARCHAR(500) NOT NULL,
        transcribed_text TEXT NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        confidence_score DECIMAL(3,2),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
      );
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

// Database query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Update usage stats
const updateUsageStats = async (type, count = 1) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if stats exist for today
    const existingStats = await query(
      'SELECT * FROM usage_stats WHERE date = $1',
      [today]
    );

    if (existingStats.rows.length === 0) {
      // Create new stats entry
      await query(
        `INSERT INTO usage_stats (date, ${type}) VALUES ($1, $2)`,
        [today, count]
      );
    } else {
      // Update existing stats
      await query(
        `UPDATE usage_stats SET ${type} = ${type} + $1 WHERE date = $2`,
        [count, today]
      );
    }
  } catch (error) {
    console.error('Failed to update usage stats:', error.message);
  }
};

module.exports = {
  pool,
  query,
  testConnection,
  initializeDatabase,
  updateUsageStats
};