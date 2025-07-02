const express = require('express');
const { convertSpeech, getConversionInfo } = require('../controllers/stsController');
const { uploadAudio, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// GET /api/speech-to-speech/info - Get conversion info and supported formats
router.get('/info', getConversionInfo);

// POST /api/speech-to-speech/convert - Convert speech to speech
router.post('/convert', uploadAudio.single('audio'), handleUploadError, convertSpeech);

module.exports = router;