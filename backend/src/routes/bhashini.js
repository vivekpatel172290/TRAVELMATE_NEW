/**
 * =============================================================================
 * TRAVELMATE BACKEND - BHASHINI TRANSLATION & SMART VOICE ROUTES
 * =============================================================================
 */

const express = require('express');
const router = express.Router();
const config = require('../config/env');
const { SUPPORTED_LANGUAGES, executeTranslation } = require('../services/bhashiniService');

/**
 * GET /api/bhashini/status
 * Returns health, credentials presence, and configuration status of Bhashini service.
 * With ?test=1, executes a live translation test (Hello en -> hi).
 */
router.get('/status', async (req, res) => {
  const hasEnvCredentials = Boolean(config.BHASHINI_USER_ID && config.BHASHINI_API_KEY);
  const statusData = {
    success: true,
    service: 'Digital India Bhashini (National Language Translation Mission)',
    status: 'active',
    hasEnvCredentials,
    pipelineId: config.BHASHINI_PIPELINE_ID || '64392f96daac500b55c543cd',
    supportedLanguagesCount: SUPPORTED_LANGUAGES.length,
    timestamp: new Date().toISOString()
  };

  if (req.query.test === '1' || req.query.test === 'true') {
    const startTime = Date.now();
    try {
      const testResult = await executeTranslation({
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'hi',
        computeTTS: false
      });
      statusData.test = {
        success: Boolean(testResult?.translated),
        translated: testResult.translated,
        source: testResult.source,
        isLiveBhashini: Boolean(testResult.isLiveBhashini),
        latencyMs: testResult.latencyMs || (Date.now() - startTime),
        error: null
      };
    } catch (err) {
      statusData.test = {
        success: false,
        translated: null,
        source: null,
        isLiveBhashini: false,
        latencyMs: Date.now() - startTime,
        error: err.message
      };
    }
  }

  res.json(statusData);
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
 * Translates input text or speech audio between source and target language
 * Body: { text, audioContent, sourceLang, targetLang, apiKey, userId, inferenceApiKey, computeTTS }
 */
const handleTranslationRequest = async (req, res, next) => {
  try {
    const { text, audioContent, sourceLang = 'en', targetLang = 'hi', apiKey, userId, inferenceApiKey, computeTTS = true } = req.body;

    if ((!text || typeof text !== 'string' || !text.trim()) && !audioContent) {
      return res.status(400).json({
        success: false,
        error: 'The "text" or "audioContent" field is required.'
      });
    }

    const result = await executeTranslation({
      text: (text || '').trim(),
      audioContent,
      sourceLang,
      targetLang,
      apiKey,
      userId,
      inferenceApiKey,
      computeTTS
    });

    res.json({
      success: true,
      data: result,
      sourceText: result.original,
      translatedText: result.translated,
      ttsAudio: result.ttsAudio
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Translation failed'
    });
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

  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return res.status(400).json({
      success: false,
      error: 'A valid Bhashini API Key is required.'
    });
  }

  try {
    const testResult = await executeTranslation({
      text: 'Hello, welcome to Delhi',
      sourceLang: 'en',
      targetLang: 'hi',
      apiKey: apiKey.trim(),
      userId: (userId || '').trim(),
      inferenceApiKey: (inferenceApiKey || '').trim()
    });

    res.json({
      success: true,
      verified: Boolean(testResult.isLiveBhashini),
      isCustomKey: true,
      message: testResult.isLiveBhashini
        ? '✅ Bhashini API Key connected successfully! TravelMate translation engine is live.'
        : '⚠️ Key could not connect to live Bhashini ULCA. Using reliable fallback engine.',
      sampleTranslation: testResult.translated,
      source: testResult.source || 'Digital India Bhashini Engine',
      latencyMs: testResult.latencyMs || 250
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `Verification error: ${err.message}`
    });
  }
});

module.exports = router;
