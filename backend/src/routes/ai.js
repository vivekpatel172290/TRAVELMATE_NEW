const express = require('express');
const router = express.Router();
const { generateTravelMateResponse } = require('../services/geminiService');
const { store } = require('../config/db');

/**
 * POST /api/ai/chat
 * TravelMate AI Tourist Assistant powered by Google Gemini with Grounded RAG
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { query, traveler_context } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query string is required'
      });
    }

    const cleanQuery = query.trim();

    // Check for emergency distress keywords
    const distressKeywords = ["help", "scared", "attack", "danger", "trapped", "harass", "threat", "emergency", "hurt", "sos", "unsafe", "stalking", "follow me"];
    const isDistress = distressKeywords.some(kw => cleanQuery.toLowerCase().includes(kw));

    if (isDistress) {
      // Auto-log high priority incident in store
      const autoIncident = {
        id: `inc-${Date.now()}`,
        journey_code: traveler_context?.temp_id || traveler_context?.journey_code || 'TM-DEL-2026-X89K',
        trigger_type: 'ai_distress_detection',
        lat: traveler_context?.lat || 28.6139,
        lng: traveler_context?.lng || 77.2090,
        message: `Distress keyword detected in TravelMate AI query: "${cleanQuery}"`,
        status: 'pending',
        priority: 'CRITICAL',
        dispatched_to: 'Delhi Police Control Room 112',
        created_at: new Date().toISOString()
      };
      store.incidents.unshift(autoIncident);

      return res.json({
        success: true,
        data: {
          response: `⚠️ **EMERGENCY DISTRESS DETECTED**\nYour message indicates an urgent safety or security concern. Your GPS coordinates have been flagged for priority Delhi Police (112 ERSS) dispatch.\n\n• **Dial 112 immediately** for Delhi Police & Emergency Services.\n• **Dial 1363** for Ministry of Tourism 24x7 Multi-lingual Tourist Infoline.\n• Head immediately to the nearest illuminated area, DMRC metro station, or police beat kiosk.`,
          grounded: true,
          source_label: "Emergency Response Support System (112) & Delhi Tourist Police",
          confidence: "Critical Alert (Priority Escalated)",
          is_distress: true,
          incident_id: autoIncident.id
        }
      });
    }

    // Generate response using Gemini / Grounded Heritage RAG
    const aiResult = await generateTravelMateResponse({
      query: cleanQuery,
      travelerContext: traveler_context
    });

    res.json({
      success: true,
      data: aiResult
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/ai/health
 * Verify AI Service readiness and active model
 */
router.get('/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'healthy',
    engine: 'TravelMate AI',
    backend: hasGeminiKey ? 'Google Gemini 1.5 Flash' : 'Official Delhi Heritage RAG Guardrail',
    gemini_key_configured: hasGeminiKey
  });
});

module.exports = router;
