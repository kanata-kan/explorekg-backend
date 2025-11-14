// Environment variables configuration

import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Utility function to validate required environment variables
function required(key: string, fallback?: string, minLength?: number): string {
  const value = process.env[key] || fallback;
  if (!value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error(`   Please check your .env file or environment configuration.`);
    process.exit(1);
  }
  if (minLength && value.length < minLength) {
    console.error(`❌ Environment variable ${key} is too short (minimum ${minLength} characters)`);
    process.exit(1);
  }
  return value;
}

// Validate session secret strength
function validateSessionSecret(secret: string): string {
  if (secret.length < 32) {
    console.error('❌ SESSION_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  // Check if secret contains variety of characters
  const hasLower = /[a-z]/.test(secret);
  const hasUpper = /[A-Z]/.test(secret);
  const hasNumber = /\d/.test(secret);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret);

  if (!(hasLower && hasUpper && hasNumber && hasSpecial)) {
    console.warn(
      '⚠️ SESSION_SECRET should contain lowercase, uppercase, numbers, and special characters'
    );
  }

  return secret;
}

// Centralized environment configuration object
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  PORT: Number(process.env.PORT) || 4000,

  // Database Configuration
  MONGO_URI: required('MONGO_URI'),

  // Security Configuration
  SESSION_SECRET: validateSessionSecret(required('SESSION_SECRET')),
  ENCRYPTION_KEY:
    required('ENCRYPTION_KEY', undefined) || required('SESSION_SECRET'), // Fallback to SESSION_SECRET
  JWT_SECRET: required('JWT_SECRET', undefined) || required('SESSION_SECRET'), // Fallback to SESSION_SECRET

  // Security Features Toggle
  ENABLE_ENCRYPTION_AT_REST: process.env.ENABLE_ENCRYPTION_AT_REST === 'true',
  ENABLE_ADVANCED_LOGGING: process.env.ENABLE_ADVANCED_LOGGING !== 'false', // Default enabled
  ENABLE_SECURITY_HEADERS: process.env.ENABLE_SECURITY_HEADERS !== 'false', // Default enabled

  // Application Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : '*'),
  CORS_WHITELIST: process.env.CORS_WHITELIST
    ? process.env.CORS_WHITELIST.split(',').map(origin => origin.trim())
    : [],
  SUPPORTED_LANGUAGES: (process.env.SUPPORTED_LANGUAGES || 'en,fr')
    .split(',')
    .map(lang => lang.trim()),

  DEFAULT_LANG: process.env.DEFAULT_LANG || 'en',

  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Data Layer Configuration
  SEED_DATA_ON_START: process.env.SEED_DATA_ON_START === 'true',
  DEFAULT_PAGINATION_LIMIT: Number(process.env.DEFAULT_PAGINATION_LIMIT) || 20,
  MAX_PAGINATION_LIMIT: Number(process.env.MAX_PAGINATION_LIMIT) || 100,

  // File Upload Configuration (for tourism images)
  MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: (
    process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,webp,pdf'
  )
    .split(',')
    .map(t => t.trim()),

  // Validation Rules
  MIN_PASSWORD_LENGTH: Number(process.env.MIN_PASSWORD_LENGTH) || 8,
  MAX_DESCRIPTION_LENGTH: Number(process.env.MAX_DESCRIPTION_LENGTH) || 2000,
  MAX_NAME_LENGTH: Number(process.env.MAX_NAME_LENGTH) || 100,

  // Geographic Configuration (for Kyrgyzstan)
  DEFAULT_COUNTRY: process.env.DEFAULT_COUNTRY || 'Kyrgyzstan',
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE || 'Asia/Bishkek',
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'KGS',

  // Search Configuration
  SEARCH_RESULTS_LIMIT: Number(process.env.SEARCH_RESULTS_LIMIT) || 50,
  AUTOCOMPLETE_LIMIT: Number(process.env.AUTOCOMPLETE_LIMIT) || 10,
};
