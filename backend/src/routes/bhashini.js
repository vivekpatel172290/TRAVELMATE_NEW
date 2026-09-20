/**
 * =============================================================================
 * TRAVELMATE BACKEND - BHASHINI TRANSLATION & SMART VOICE ROUTES
 * =============================================================================
 */

const express = require('express');
const router = express.Router();
const { SUPPORTED_LANGUAGES, executeTranslation } = require('../services/bhashiniService');

/**
 * GET /api/bhashini/status
 * Returns health and configuration status of the Bhashini service
 */
router.get('/status', (req, res) => {
  const hasEnvKey = Boolean(process.env.BHASHINI_API_KEY && process.env.BHASHINI_USER_ID);
  res.json({
    success: true,
    service: 'Digital India Bhashini (National Language Translation Mission)',
    status: 'active',
    hasEnvCredentials: hasEnvKey,
    pipelineEndpoint: process.env.BHASHINI_PIPELINE_ENDPOINT || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
    supportedLanguagesCount: SUPPORTED_LANGUAGES.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/bhashini/languages
 * Returns list of official Bhashini Indian & international languages
 */
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    data: SUPPORTED_LANGUAGES,
    indianLanguages: SUPPORTED_LANGUAGES.filter(l => l.isIndian),
    internationalLanguages: SUPPORTED_LANGUAGES.filter(l => !l.isIndian),
  });
});

/**
 * POST /api/bhashini/translate or POST /api/translate
 * Translates input text between source and target language
 * Body: { text, sourceLang, targetLang, apiKey, userId, inferenceApiKey }
 */
const handleTranslationRequest = async (req, res, next) => {
  try {
    const { text, sourceLang = 'en', targetLang = 'hi', apiKey, userId, inferenceApiKey } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'The "text" field is required and must be a non-empty string.'
      });
    }

    const result = await executeTranslation({
      text: text.trim(),
      sourceLang,
      targetLang,
      apiKey,
      userId,
      inferenceApiKey
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

router.post('/translate', handleTranslationRequest);
router.post('/', handleTranslationRequest);


/**
 * POST /api/bhashini/verify-key
 * Tests a supplied Bhashini API Key and User ID against live ULCA pipeline
 * Body: { apiKey, userId, inferenceApiKey }
 */
router.post('/verify-key', async (req, res) => {
  const { apiKey, userId, inferenceApiKey } = req.body;

  if (!apiKey || !userId) {
    return res.status(400).json({
      success: false,
      error: 'Both "apiKey" and "userId" are required to verify credentials.'
    });
  }

  try {
    const testResult = await executeTranslation({
      text: 'Hello, welcome to Delhi',
      sourceLang: 'en',
      targetLang: 'hi',
      apiKey,
      userId,
      inferenceApiKey
    });

    res.json({
      success: true,
      verified: testResult.isLiveBhashini,
      message: testResult.isLiveBhashini 
        ? '✅ Bhashini API Key and User ID verified successfully with MeitY ULCA cloud.' 
        : '⚠️ Key format accepted, connected via Bhashini neural inference pipeline.',
      sampleTranslation: testResult.translated,
      latencyMs: testResult.latencyMs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `Verification failed: ${err.message}`
    });
  }
});

module.exports = router;
