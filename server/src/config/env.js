const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill_to_job',
  JWT_SECRET: process.env.JWT_SECRET || 'skill_to_job_super_secret_jwt_key_2026_dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  NODE_ENV: process.env.NODE_ENV || 'development',
  USE_MEMORY_DB: process.env.USE_MEMORY_DB === 'true'
};

module.exports = config;
