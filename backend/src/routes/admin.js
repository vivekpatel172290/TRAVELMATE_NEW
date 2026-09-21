const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// GET /api/admin/stats - Overview counts for journeys, incidents, flagged fares
router.get('/stats', adminController.getStats);

// GET /api/admin/incidents - List all incidents (filter by status)
router.get('/incidents', adminController.getAllIncidents);

// PATCH /api/admin/incidents/:id - Update status (verified_by_human, dismissed)
router.patch('/incidents/:id', adminController.updateIncidentStatus);

// GET /api/admin/places/freshness - Places verification freshness audit
router.get('/places/freshness', adminController.getPlacesFreshness);

// POST /api/admin/places/:id/reverify - Re-verify monument entry fee and timings
router.post('/places/:id/reverify', adminController.reverifyPlace);

// GET /api/admin/fares - List all logged fare overcharge disputes
router.get('/fares', adminController.getFlaggedFares);

// GET /api/admin/database - Live Database Explorer & Credentials Inspector
router.get('/database', adminController.getDatabaseRecords);

module.exports = router;

