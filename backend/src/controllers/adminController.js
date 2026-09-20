const { db, store } = require('../config/db');

// 1. Admin Summary Stats from PostgreSQL
exports.getStats = async (req, res, next) => {
  try {
    const stats = await db.admin.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// 2. Incident Review List with Linked Evidence from PostgreSQL
exports.getAllIncidents = async (req, res, next) => {
  try {
    const { status } = req.query;
    const list = await db.incidents.getAll(status);

    // Enrich each incident with full linked evidence details from RideSafe Vault
    const enriched = await Promise.all(
      list.map(async (inc) => {
        let linkedEvidence = [];
        if (inc.journey_code) {
          linkedEvidence = await db.evidence.findByJourney(inc.journey_code);
        }
        return {
          ...inc,
          linked_evidence: linkedEvidence || []
        };
      })
    );

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

// 3. Human Admin Incident Resolution/Verification in PostgreSQL
exports.updateIncidentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['pending_review', 'verified_by_human', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be 'pending_review', 'verified_by_human', or 'dismissed'."
      });
    }

    const updated = await db.incidents.updateStatus(id, status, admin_notes || '');
    if (!updated) {
      return res.status(404).json({ success: false, error: "Incident not found." });
    }

    res.json({
      success: true,
      message: `Incident status updated to '${status}'.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// 4. Place Data Freshness Audit
exports.getPlacesFreshness = async (req, res, next) => {
  try {
    const places = await db.places.getAll({});
    const today = new Date();
    const audit = places.map(p => {
      const verifiedDate = new Date(p.last_verified);
      const diffDays = Math.round((today - verifiedDate) / (1000 * 60 * 60 * 24));
      return {
        id: p.id,
        name: p.name,
        last_verified: p.last_verified,
        days_since_audit: diffDays,
        status: p.verification_status,
        needs_reverification: diffDays > 30
      };
    });

    res.json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
};

// 5. Get Flagged Fare Disputes Logged by Tourists
exports.getFlaggedFares = async (req, res, next) => {
  try {
    const flagged = await db.fares.getFlagged();
    res.json({
      success: true,
      count: flagged ? flagged.length : 0,
      data: flagged || []
    });
  } catch (error) {
    next(error);
  }
};

// 6. Human Admin Reverification of Monument Details
exports.reverifyPlace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const place = await db.places.findByKey(id);

    if (!place) {
      return res.status(404).json({ success: false, error: 'Verified place not found.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    place.last_verified = todayStr;
    place.verification_status = 'Official';
    if (place.fee) {
      place.fee.last_verified = todayStr;
      place.fee.verification_status = 'Official';
    }

    // Update in-memory and PostgreSQL if pool connected
    const pool = db.getPool();
    if (db.isPostgresConnected() && pool) {
      try {
        await pool.query(
          `UPDATE places SET last_verified = $1, verification_status = 'Official' WHERE id = $2 OR place_key = $2;`,
          [todayStr, id]
        );
      } catch (err) {
        console.warn('[DB DAL] reverifyPlace postgres update warning:', err.message);
      }
    }

    res.json({
      success: true,
      message: `Place '${place.name}' officially marked re-verified for current date.`,
      data: place
    });
  } catch (error) {
    next(error);
  }
};
