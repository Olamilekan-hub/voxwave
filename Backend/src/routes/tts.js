const express = require('express');
const { generateSpeech, getVoices } = require('../controllers/ttsController');

const router = express.Router();

// GET /api/tts/voices - Get available voices
router.get('/voices', getVoices);

// POST /api/tts/generate - Generate speech from text
router.post('/generate', generateSpeech);

module.exports = router;