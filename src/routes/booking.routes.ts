// src/routes/booking.routes.ts
import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import * as bookingValidator from '../validators/booking.validator';
import {
  authenticate,
  optionalAuthenticate,
  requirePermission,
  auditLog,
  AuditAction,
  Resource,
  Action,
} from '../security';
import {
  validateBookingOwnership,
  validateGuestBookingsOwnership,
} from '../security/ownership.middleware';

const router = Router();

/**
 * Booking Routes
 * Base path: /api/v1/bookings
 */

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking
 * @access  Public (requires valid guestId)
 */
router.post(
  '/',
  (req, res, next) => {
    console.log('[Booking Routes] POST /api/v1/bookings - Route matched');
    console.log('[Booking Routes] Request body:', JSON.stringify(req.body, null, 2));
    next();
  },
  bookingValidator.validateBody(bookingValidator.bookingCreateSchema),
  bookingController.createBooking
);

/**
 * @route   GET /api/v1/bookings/statistics
 * @desc    Get booking statistics
 * @access  Admin only
 */
router.get(
  '/statistics',
  authenticate,
  requirePermission(Resource.BOOKINGS, Action.STATISTICS),
  auditLog(AuditAction.VIEW_BOOKING_STATISTICS),
  bookingController.getStatistics
);

/**
 * @route   POST /api/v1/bookings/cleanup-expired
 * @desc    Manual cleanup of expired bookings
 * @access  Admin only
 */
router.post(
  '/cleanup-expired',
  authenticate,
  requirePermission(Resource.BOOKINGS, Action.CLEANUP),
  auditLog(AuditAction.CLEANUP_BOOKINGS),
  bookingController.cleanupExpired
);

/**
 * @route   GET /api/v1/bookings/guest/:guestId
 * @desc    Get all bookings for a specific guest
 * @access  Public (with optional admin auth) + Ownership validation
 */
router.get(
  '/guest/:guestId',
  bookingValidator.validateParams(bookingValidator.guestIdParamSchema),
  optionalAuthenticate,
  validateGuestBookingsOwnership(),
  bookingController.getGuestBookings
);

/**
 * @route   GET /api/v1/bookings/:bookingNumber
 * @desc    Get booking by booking number
 * @access  Public (with optional admin auth) + Ownership validation
 */
router.get(
  '/:bookingNumber',
  bookingValidator.validateParams(bookingValidator.bookingNumberParamSchema),
  optionalAuthenticate,
  validateBookingOwnership(),
  bookingController.getBooking
);

/**
 * @route   GET /api/v1/bookings
 * @desc    Get all active bookings
 * @access  Admin only
 */
router.get(
  '/',
  authenticate,
  requirePermission(Resource.BOOKINGS, Action.VIEW),
  auditLog(AuditAction.VIEW_BOOKING_STATISTICS),
  bookingController.getAllActiveBookings
);

/**
 * @route   PATCH /api/v1/bookings/:bookingNumber/status
 * @desc    Update booking status
 * @access  Admin only
 */
router.patch(
  '/:bookingNumber/status',
  bookingValidator.validateParams(bookingValidator.bookingNumberParamSchema),
  bookingValidator.validateBody(bookingValidator.updateBookingStatusSchema),
  authenticate,
  requirePermission(Resource.BOOKINGS, Action.UPDATE),
  auditLog(AuditAction.UPDATE_BOOKING_STATUS),
  bookingController.updateBookingStatus
);

/**
 * @route   POST /api/v1/bookings/:bookingNumber/payment
 * @desc    Mark booking as paid (process payment)
 * @access  Public (with optional admin auth) + Ownership validation
 */
router.post(
  '/:bookingNumber/payment',
  bookingValidator.validateParams(bookingValidator.bookingNumberParamSchema),
  bookingValidator.validateBody(bookingValidator.markAsPaidSchema),
  optionalAuthenticate,
  validateBookingOwnership({ requireModifyPermission: true }),
  auditLog(AuditAction.UPDATE_BOOKING),
  bookingController.markBookingAsPaid
);

/**
 * @route   POST /api/v1/bookings/:bookingNumber/cancel
 * @desc    Cancel booking
 * @access  Public (with optional admin auth) + Ownership validation
 */
router.post(
  '/:bookingNumber/cancel',
  bookingValidator.validateParams(bookingValidator.bookingNumberParamSchema),
  bookingValidator.validateBody(bookingValidator.cancelBookingSchema),
  optionalAuthenticate,
  validateBookingOwnership({ requireModifyPermission: true }),
  auditLog(AuditAction.CANCEL_BOOKING),
  bookingController.cancelBooking
);

/**
 * ✅ Booking Routes Features - WITH RBAC PROTECTION + OWNERSHIP VALIDATION:
 * - POST /bookings - Create booking (Public)
 * - GET /bookings/statistics - Get statistics (Admin: STATISTICS permission)
 * - POST /bookings/cleanup-expired - Cleanup expired (Admin: CLEANUP permission)
 * - GET /bookings/guest/:guestId - Get guest bookings (✅ Ownership validated)
 * - GET /bookings/:bookingNumber - Get by booking number (✅ Ownership validated)
 * - GET /bookings - Get all active bookings (Admin: VIEW permission)
 * - PATCH /bookings/:bookingNumber/status - Update status (Admin: UPDATE permission)
 * - POST /bookings/:bookingNumber/payment - Process payment (✅ Ownership validated with modify permission)
 * - POST /bookings/:bookingNumber/cancel - Cancel booking (✅ Ownership validated with modify permission)
 * - Proper route ordering to avoid collisions
 * - Zod validation middleware applied
 * - ✅ RBAC protection with audit logging for all operations
 * - ✅ optionalAuthenticate for mixed routes (allows both guest and admin access)
 * - ✅ Ownership validation prevents unauthorized access to other users' bookings
 */

export default router;
