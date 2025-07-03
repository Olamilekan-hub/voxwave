const express = require("express");
const {
  createVoice,
  listVoices,
  getVoice,
  deleteVoice,
  convertSpeech,
  getVoiceQuota,
} = require("../controllers/voiceController");
const {
  uploadVoice,
  uploadAudio,
  handleUploadError,
} = require("../middleware/upload");

const router = express.Router();

// GET /api/voice/list - List all available voices (ElevenLabs + custom)
router.get("/list", listVoices);

// GET /api/voice/quota - Get voice cloning quota and limits
router.get("/quota", getVoiceQuota);

// GET /api/voice/:voiceId - Get specific voice details
router.get("/:voiceId", getVoice);

// POST /api/voice/create - Create a custom voice clone
// Accepts multiple audio files for better voice quality
router.post(
  "/create",
  uploadVoice.array("audioFiles", 5), // Up to 5 files for voice cloning
  handleUploadError,
  createVoice
);

// POST /api/voice/convert - Convert speech to speech using custom or ElevenLabs voice
router.post(
  "/convert",
  uploadAudio.single("audio"),
  handleUploadError,
  convertSpeech
);

// DELETE /api/voice/:voiceId - Delete a custom voice
router.delete("/:voiceId", deleteVoice);

module.exports = router;
