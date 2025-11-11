// ============================================
// Core Dependencies
// ============================================
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';

// ============================================
// Configuration & Utilities
// ============================================
import { ENV } from './config/env';
import { logger } from './utils/logger';

// ============================================
// Security Middleware (consolidated)
// ============================================
import {
  inputSanitizer,
  corsConfig,
  generalRateLimit,
  strictRateLimit,
  guestCreationLimit,
  paymentRateLimit,
  progressiveSlowDown,
  sessionFingerprintValidator,
  suspiciousActivityDetector,
  advancedSecurityHeaders,
  advancedHSTS,
  advancedCSP,
  requestComplexityLimiter,
  suspiciousUserAgentDetector,
  honeypotEndpoints,
} from './security';

// ============================================
// General Middleware
// ============================================
import { errorHandler, languageMiddleware } from './middleware';

// ============================================
// Routes
// ============================================
import healthRoute from './routes/health';
import travelPackRouter from './routes/travelPack.routes';
import carRouter from './routes/car.routes';
import activityRouter from './routes/activity.routes';
import packRelationRouter from './routes/packRelation.routes';
import guestRouter from './routes/guest.routes';
import bookingRouter from './routes/booking.routes';
import securityRouter from './routes/security.routes';
import adminRouter from './routes/admin.routes';

export const createApp = () => {
  const app = express();

  // Enhanced Security Headers
  if (ENV.ENABLE_SECURITY_HEADERS) {
    app.use(advancedSecurityHeaders);
    app.use(advancedHSTS);
    app.use(advancedCSP);
  }

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false, // Allow images from external sources
      contentSecurityPolicy: false, // Using our custom CSP
    })
  );

  // Enhanced CORS Configuration
  app.use(cors(corsConfig));

  // Input Sanitization (NoSQL + XSS protection)
  app.use(inputSanitizer);

  // Suspicious activity detection
  app.use(suspiciousActivityDetector);

  // Advanced security checks
  app.use(suspiciousUserAgentDetector);
  app.use(requestComplexityLimiter);

  // Request parsing with size limits
  app.use(express.json({ limit: '2mb' })); // Reduced from 10mb for security
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Enhanced logging with data scrubbing
  app.use(pinoHttp({ logger }));

  // Progressive slowdown for suspicious activity
  app.use(progressiveSlowDown);

  // General API rate limiting
  app.use('/api', generalRateLimit);

  // Session fingerprint validation
  app.use(sessionFingerprintValidator);

  // Middleware chain
  app.use(languageMiddleware);

  // Health check (no rate limiting)
  app.use('/api/health', healthRoute);

  // Public catalog endpoints (standard rate limiting)
  app.use('/api/v1/travel-packs', travelPackRouter);
  app.use('/api/v1/cars', carRouter);
  app.use('/api/v1/activities', activityRouter);
  app.use('/api/v1/pack-relations', packRelationRouter);

  // Sensitive endpoints with additional rate limiting
  app.use('/api/v1/guests', guestCreationLimit, guestRouter);
  app.use('/api/v1/bookings', strictRateLimit, bookingRouter);

  // Security monitoring endpoints (admin only)
  app.use('/api/v1/security', strictRateLimit, securityRouter);

  // Admin authentication and management (admin only)
  app.use('/api/v1/admin', strictRateLimit, adminRouter);

  // Payment endpoints get the strictest rate limiting
  app.use('/api/v1/bookings/:id/payment', paymentRateLimit);

  // Setup honeypot endpoints for attack detection
  honeypotEndpoints(app);

  // 404 handler for favicon
  app.get('/favicon.ico', (req, res) => res.status(204));

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};
