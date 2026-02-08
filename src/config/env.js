const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  CORS_ORIGIN: Joi.string().default('*'),
  
  // Supabase
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  DATABASE_URL: Joi.string().uri().optional(), // Optional - only needed for psql migrations
  
  // Firebase
  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().email().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),
  
  // Admin
  ADMIN_EMAILS: Joi.string().required(),
  
  // Security
  API_RATE_LIMIT: Joi.number().default(100),

  // Card-reader endpoint (unauthenticated) needs a separate, higher ceiling
  ACCESS_VERIFY_RATE_LIMIT: Joi.number().default(3000),
  ACCESS_VERIFY_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info')
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = envVars;
