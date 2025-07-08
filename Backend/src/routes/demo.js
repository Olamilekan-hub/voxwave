const express = require('express');
const { DemoAudioService } = require('../services/demoAudioService');

const router = express.Router();

// GET /api/demo/audio - Get all pre-generated demo audio
router.get('/audio', async (req, res) => {
  try {
    console.log('📡 Fetching demo audio...');
    
    const demoAudios = await DemoAudioService.getAllDemoAudio();
    
    const response = {
      success: true,
      data: {
        demos: demoAudios,
        total: demoAudios.length,
        voice_used: 'Elon Musk'
      },
      message: 'Demo audio retrieved successfully'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error fetching demo audio:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demo audio',
      message: error.message
    });
  }
});

// GET /api/demo/audio/:demoId - Get specific demo audio
router.get('/audio/:demoId', async (req, res) => {
  try {
    const { demoId } = req.params;
    
    const demoAudio = await DemoAudioService.getDemoAudio(demoId);
    
    if (!demoAudio) {
      return res.status(404).json({
        success: false,
        error: 'Demo audio not found',
        message: `Demo audio with ID ${demoId} not found`
      });
    }
    
    res.json({
      success: true,
      data: demoAudio,
      message: 'Demo audio retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching demo audio:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demo audio',
      message: error.message
    });
  }
});

// POST /api/demo/generate - Generate all demo audio (admin)
router.post('/generate', async (req, res) => {
  try {
    console.log('🎙️ Starting demo audio generation...');
    
    const results = await DemoAudioService.generateAllDemoAudio();
    
    res.json({
      success: true,
      data: {
        generated: results,
        total: results.length,
        voice_used: 'Elon Musk'
      },
      message: `Successfully generated ${results.length} demo audio files`
    });
    
  } catch (error) {
    console.error('❌ Error generating demo audio:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate demo audio',
      message: error.message
    });
  }
});

// POST /api/demo/regenerate/:demoId - Regenerate specific demo audio
router.post('/regenerate/:demoId', async (req, res) => {
  try {
    const { demoId } = req.params;
    
    const result = await DemoAudioService.regenerateDemoAudio(demoId);
    
    res.json({
      success: true,
      data: result,
      message: `Demo audio ${demoId} regenerated successfully`
    });
    
  } catch (error) {
    console.error('❌ Error regenerating demo audio:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate demo audio',
      message: error.message
    });
  }
});

// GET /api/demo/validate - Validate demo audio files
router.get('/validate', async (req, res) => {
  try {
    const validation = await DemoAudioService.validateDemoAudio();
    
    res.json({
      success: true,
      data: validation,
      message: `Validation complete: ${validation.valid}/${validation.total} files valid`
    });
    
  } catch (error) {
    console.error('❌ Error validating demo audio:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to validate demo audio',
      message: error.message
    });
  }
});

// GET /api/demo/texts - Get demo texts
router.get('/texts', async (req, res) => {
  try {
    const texts = DemoAudioService.getDemoTexts();
    
    res.json({
      success: true,
      data: {
        texts: texts,
        total: texts.length
      },
      message: 'Demo texts retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching demo texts:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demo texts',
      message: error.message
    });
  }
});

module.exports = router;