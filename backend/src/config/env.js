require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  BHASHINI_USER_ID: process.env.BHASHINI_USER_ID || '',
  BHASHINI_API_KEY: process.env.BHASHINI_API_KEY || '',
  BHASHINI_PIPELINE_ID: process.env.BHASHINI_PIPELINE_ID || '64392f96daac500b55c543cd',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
