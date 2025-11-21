// src/validation/routes/validation.routes.ts
import { Router } from 'express';
import * as validationController from '../controllers/validation.controller';
import { validationRateLimit } from '../../security';

const router = Router();

/**
 * Validation Routes
 * Base path: /api/v1/validation
 * 
 * These routes provide real-time validation for booking data.
 * They run in parallel to the existing booking flow and do not modify it.
 * 
 * Note: Uses validationRateLimit (more lenient) instead of generalRateLimit
 * to handle auto-fill scenarios and debouncing without hitting rate limits.
 */

/**
 * @route   POST /api/v1/validation/booking
 * @desc    Validate complete booking data in real-time
 * @access  Public (rate-limited)
 * 
 * Rate Limit: 2000 req/min in development, 200 req/min in production
 * - More lenient than generalRateLimit to handle auto-fill and debouncing
 * - skipFailedRequests: true (aborted requests don't count)
 */
router.post(
  '/booking',
  validationRateLimit, // Real-time validation rate limit (more lenient)
  validationController.validateBooking
);

/**
 * @route   POST /api/v1/validation/booking/field
 * @desc    Validate a single field in real-time
 * @access  Public (rate-limited)
 * 
 * Rate Limit: 2000 req/min in development, 200 req/min in production
 * - More lenient than generalRateLimit to handle auto-fill and debouncing
 * - skipFailedRequests: true (aborted requests don't count)
 */
router.post(
  '/booking/field',
  validationRateLimit, // Real-time validation rate limit (more lenient)
  validationController.validateFieldEndpoint
);

export default router;

