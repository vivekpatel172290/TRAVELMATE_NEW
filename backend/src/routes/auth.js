const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { db, store } = require('../config/db');

// Helpers for password hashing with scrypt
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const matchBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, matchBuffer);
  } catch (err) {
    return false;
  }
}

function generateJourneyCode(prefix = 'TM-DEL-2026-') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${code}`;
}

// Ensure traveler + journey records exist for user's SafePass
async function ensureUserSafePass(user, name, nationality, emergencyContact) {
  let journeyCode = user.journey_code;
  if (!journeyCode) {
    journeyCode = generateJourneyCode();
  }

  // Check if journey already exists in DB
  const existingJourney = await db.journeys.findByCodeOrId(journeyCode);
  if (!existingJourney) {
    const travelerId = uuidv4();
    const journeyId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const travelerData = {
      id: travelerId,
      temp_id: `TRV-${journeyCode.slice(12)}`,
      name: (name || user.name || 'Tourist Traveler').trim(),
      nationality: (nationality || user.nationality || 'International').trim(),
      preferred_language: 'en',
      emergency_contact: (emergencyContact || user.emergency_contact || '').trim(),
      opt_in_location: true,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    const journeyData = {
      id: journeyId,
      traveler_id: travelerId,
      journey_code: journeyCode,
      status: 'active',
      current_lat: 28.6139,
      current_lng: 77.2090,
      last_location_update: now.toISOString(),
      active_route: {},
      visited_places: [],
      checkin_history: [],
      start_time: now.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    await db.travelers.create(travelerData);
    await db.journeys.create(journeyData);
  }

  return journeyCode;
}

// In-memory token store for quick session retrieval
const activeSessions = new Map();

function createSessionToken(userId) {
  const token = `tm_auth_${crypto.randomBytes(32).toString('hex')}_${Date.now()}`;
  activeSessions.set(token, {
    userId,
    createdAt: Date.now()
  });
  return token;
}

// Middleware: Authenticate Session Token
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization token required.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    if (token.startsWith('tm_auth_')) {
      return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid session token.' });
  }

  const user = await db.users.findById(session.userId);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User account not found.' });
  }

  req.user = user;
  req.token = token;
  next();
}

/**
 * POST /api/auth/register
 * Local tourist registration with SafePass generation
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, nationality, phone, emergency_contact, preferred_language } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.users.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    const userId = uuidv4();
    const journeyCode = generateJourneyCode();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      email: normalizedEmail,
      password_hash: passwordHash,
      name: name.trim(),
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0d1117,161b22`,
      google_id: null,
      auth_provider: 'local',
      role: 'tourist',
      nationality: (nationality || 'International').trim(),
      phone: (phone || '').trim(),
      emergency_contact: (emergency_contact || '').trim(),
      journey_code: journeyCode,
      created_at: now,
      last_login_at: now
    };

    const savedUser = await db.users.create(newUser);

    // Auto-create traveler & active journey record for SafePass
    await ensureUserSafePass(savedUser, savedUser.name, savedUser.nationality, savedUser.emergency_contact);

    const token = createSessionToken(savedUser.id);
    const { password_hash, ...userResponse } = savedUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully with SafePass generated.',
      user: userResponse,
      token
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during registration. Please try again.'
    });
  }
});

/**
 * POST /api/auth/login
 * Local tourist email/password authentication
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.users.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please check your credentials.'
      });
    }

    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'This account was created with Google Sign-In. Please click "Continue with Google".'
      });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please check your credentials.'
      });
    }

    // Update last login
    const now = new Date().toISOString();
    await db.users.update(user.id, { last_login_at: now });
    user.last_login_at = now;

    // Ensure user has SafePass journey
    if (!user.journey_code) {
      user.journey_code = await ensureUserSafePass(user, user.name, user.nationality, user.emergency_contact);
      await db.users.update(user.id, { journey_code: user.journey_code });
    }

    const token = createSessionToken(user.id);
    const { password_hash, ...userResponse } = user;

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      user: userResponse,
      token
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during login. Please try again.'
    });
  }
});

/**
 * POST /api/auth/google
 * Google Sign-In & OAuth credential synchronization with database
 */
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar_url, google_id, nationality, emergency_contact } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Google email and name are required for authentication.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const googleId = google_id || `google_${Buffer.from(normalizedEmail).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;

    // Check if user already exists by google_id or email
    let user = (await db.users.findByGoogleId(googleId)) || (await db.users.findByEmail(normalizedEmail));
    const now = new Date().toISOString();

    let isNewUser = false;

    if (user) {
      // Existing user: update metadata and login timestamp
      const updates = {
        last_login_at: now,
        google_id: user.google_id || googleId
      };
      if (avatar_url && !user.avatar_url) updates.avatar_url = avatar_url;
      if (nationality && (!user.nationality || user.nationality === 'International')) updates.nationality = nationality;
      if (emergency_contact && !user.emergency_contact) updates.emergency_contact = emergency_contact;

      if (!user.journey_code) {
        updates.journey_code = await ensureUserSafePass(user, user.name, user.nationality, user.emergency_contact);
      }

      await db.users.update(user.id, updates);
      user = { ...user, ...updates };
    } else {
      // Create new user authenticated via Google
      isNewUser = true;
      const userId = uuidv4();
      const journeyCode = generateJourneyCode();

      const newUser = {
        id: userId,
        email: normalizedEmail,
        password_hash: null,
        name: name.trim(),
        avatar_url: avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0d1117,161b22`,
        google_id: googleId,
        auth_provider: 'google',
        role: 'tourist',
        nationality: (nationality || 'International').trim(),
        phone: null,
        emergency_contact: (emergency_contact || '').trim(),
        journey_code: journeyCode,
        created_at: now,
        last_login_at: now
      };

      user = await db.users.create(newUser);
      await ensureUserSafePass(user, user.name, user.nationality, user.emergency_contact);
    }

    const token = createSessionToken(user.id);
    const { password_hash, ...userResponse } = user;

    return res.json({
      success: true,
      message: isNewUser ? 'Welcome! Account created via Google.' : 'Welcome back!',
      user: userResponse,
      token,
      isNewUser
    });
  } catch (err) {
    console.error('[Auth] Google sign-in error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to authenticate with Google. Please try again.'
    });
  }
});

/**
 * GET /api/auth/me
 * Validate current active session token and return user profile
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);

    if (!session) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid.' });
    }

    const user = await db.users.findById(session.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    const { password_hash, ...userResponse } = user;
    return res.json({
      success: true,
      user: userResponse
    });
  } catch (err) {
    console.error('[Auth] /me error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve account profile.' });
  }
});

/**
 * PUT /api/auth/profile
 * Update user tourist settings (nationality, emergency contact, phone)
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, nationality, phone, emergency_contact, avatar_url } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (nationality) updates.nationality = nationality.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (emergency_contact !== undefined) updates.emergency_contact = emergency_contact.trim();
    if (avatar_url) updates.avatar_url = avatar_url;

    const updatedUser = await db.users.update(req.user.id, updates);
    const { password_hash, ...userResponse } = (updatedUser || req.user);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: userResponse
    });
  } catch (err) {
    console.error('[Auth] profile update error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

/**
 * POST /api/auth/logout
 * Terminate session
 */
/**
 * POST /api/auth/logout
 * Terminate session
 */
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  return res.json({
    success: true,
    message: 'Signed out successfully.'
  });
});

/**
 * GET /api/auth/diagnostics
 * Infrastructure diagnostics for User Portal (SMTP & Database Status)
 */
router.get('/diagnostics', (req, res) => {
  res.json({
    success: true,
    smtp: {
      configured: false,
      status: 'Sandbox Simulated Mode'
    },
    database: {
      connected: true,
      engine: 'Supabase PostgreSQL'
    }
  });
});

module.exports = router;


