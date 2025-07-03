const express = require('express');
const { transcribeAudio, getTranscriptionHistory, getTranscriptionInfo } = require('../controllers/sttController');
const { uploadAudio, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// GET /api/stt/info - Get transcription info and supported languages
router.get('/info', getTranscriptionInfo);

// POST /api/stt/transcribe - Transcribe audio to text
router.post('/transcribe', uploadAudio.single('audio'), handleUploadError, transcribeAudio);

// GET /api/stt/history - Get transcription history
router.get('/history', getTranscriptionHistory);

module.exports = router;