// src/middleware/security.ts
import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { xss } from 'express-xss-sanitizer';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { ENV } from '../config/env';

/**
 * Input Sanitization Middleware
 * Protects against NoSQL injection and XSS attacks
 */
export const inputSanitizer = [
  // NoSQL injection protection
  mongoSanitize({
    replaceWith: '_', // Replace prohibited characters with underscore
    onSanitize: ({ req, key }) => {
      console.warn(
        `⚠️ Sanitized NoSQL injection attempt: ${key} in ${req.path}`
      );
    },
  }),

  // XSS protection
  xss({
    allowedKeys: ['_id'], // Allow MongoDB ObjectIds
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {},
  }),
];

/**
 * Enhanced CORS Configuration
 */
export const corsConfig = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (ENV.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Production whitelist
    const allowedOrigins =
      ENV.CORS_WHITELIST.length > 0
        ? ENV.CORS_WHITELIST
        : ENV.CORS_ORIGIN.split(',').map(o => o.trim());

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept-Language',
    'X-Session-ID',
  ],
  optionsSuccessStatus: 200,
};

/**
 * Progressive Rate Limiting
 */

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for sensitive endpoints
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.NODE_ENV === 'production' ? 10 : 100,
  message: {
    success: false,
    error: 'Too many requests to sensitive endpoint, please try again later.',
    retryAfter: '15 minutes',
  },
  skipSuccessfulRequests: true, // Only count failed requests
});

// Guest creation rate limiting (prevent spam)
export const guestCreationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: ENV.NODE_ENV === 'production' ? 5 : 50, // Max 5 guests per hour per IP
  message: {
    success: false,
    error:
      'Too many guest accounts created from this IP, please try again later.',
    retryAfter: '1 hour',
  },
});

// Payment endpoint rate limiting
export const paymentRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: ENV.NODE_ENV === 'production' ? 3 : 30, // Max 3 payment attempts per 5 minutes
  message: {
    success: false,
    error: 'Too many payment attempts, please try again later.',
    retryAfter: '5 minutes',
  },
});

// Slow down middleware for progressive delays
export const progressiveSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: ENV.NODE_ENV === 'production' ? 50 : 500, // Allow first 50 requests without delay
  delayMs: hits => hits * 100, // Add 100ms delay per request after threshold
  maxDelayMs: 5000, // Maximum 5 second delay
});

/**
 * Session Fingerprint Validation Middleware
 */
export const sessionFingerprintValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sessionId = req.headers['x-session-id'] as string;

  if (sessionId && req.body.fingerprint) {
    // Validate session fingerprint if provided
    // This will be implemented when we have active sessions
    console.log(`🔍 Session fingerprint validation for: ${sessionId}`);
  }

  next();
};
