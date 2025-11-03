// src/routes/guest.routes.ts
import { Router } from 'express';
import * as guestController from '../controllers/guest.controller';
import * as guestValidator from '../validators/guest.validator';
import {
  authenticate,
  optionalAuthenticate,
  requireAnyAdmin,
  auditLog,
  AuditAction,
  Resource,
  Action,
  requirePermission,
} from '../security';
import { validateGuestOwnership } from '../security/ownership.middleware';

const router = Router();

/**
 * Guest Routes
 * Base path: /api/v1/guests
 */

/**
 * @route   POST /api/v1/guests
 * @desc    Create a new guest
 * @access  Public
 */
router.post(
  '/',
  guestValidator.validateBody(guestValidator.guestCreateSchema),
  guestController.createGuest
);

/**
 * @route   GET /api/v1/guests/statistics
 * @desc    Get guest statistics
 * @access  Admin only
 */
router.get(
  '/statistics',
  authenticate,
  requirePermission(Resource.GUESTS, Action.STATISTICS),
  auditLog(AuditAction.VIEW_GUEST_STATISTICS),
  guestController.getStatistics
);

/**
 * @route   POST /api/v1/guests/cleanup-expired
 * @desc    Manual cleanup of expired guests
 * @access  Admin only
 */
router.post(
  '/cleanup-expired',
  authenticate,
  requirePermission(Resource.GUESTS, Action.CLEANUP),
  auditLog(AuditAction.CLEANUP_GUESTS),
  guestController.cleanupExpired
);

/**
 * @route   GET /api/v1/guests/email/:email
 * @desc    Find guest by email
 * @access  Public
 */
router.get('/email/:email', guestController.getGuestByEmail);

/**
 * @route   GET /api/v1/guests/:sessionId
 * @desc    Get guest by sessionId
 * @access  Public (with optional admin auth) + Ownership validation
 */
router.get(
  '/:sessionId',
  guestValidator.validateParams(guestValidator.sessionIdParamSchema),
  optionalAuthenticate,
  validateGuestOwnership(),
  guestController.getGuest
);

/**
 * @route   GET /api/v1/guests
 * @desc    Get all active guests
 * @access  Admin only
 */
router.get(
  '/',
  authenticate,
  requirePermission(Resource.GUESTS, Action.VIEW),
  auditLog(AuditAction.VIEW_GUEST_STATISTICS),
  guestController.getAllGuests
);

/**
 * @route   PATCH /api/v1/guests/:sessionId
 * @desc    Update guest information
 * @access  Public (with optional admin auth) + Ownership validation
 */
router.patch(
  '/:sessionId',
  guestValidator.validateParams(guestValidator.sessionIdParamSchema),
  guestValidator.validateBody(guestValidator.guestUpdateSchema),
  optionalAuthenticate,
  validateGuestOwnership({ requireModifyPermission: true }),
  auditLog(AuditAction.UPDATE_GUEST),
  guestController.updateGuest
);

/**
 * @route   PATCH /api/v1/guests/:sessionId/extend
 * @desc    Extend guest expiration date
 * @access  Public (with optional admin auth) + Ownership validation
 */
router.patch(
  '/:sessionId/extend',
  guestValidator.validateParams(guestValidator.sessionIdParamSchema),
  guestValidator.validateBody(guestValidator.extendExpirationSchema),
  optionalAuthenticate,
  validateGuestOwnership({ requireModifyPermission: true }),
  guestController.extendExpiration
);

/**
 * @route   POST /api/v1/guests/:sessionId/link-user
 * @desc    Link guest to registered user
 * @access  Public (tied to sessionId) + Ownership validation
 */
router.post(
  '/:sessionId/link-user',
  guestValidator.validateParams(guestValidator.sessionIdParamSchema),
  guestValidator.validateBody(guestValidator.linkUserSchema),
  optionalAuthenticate,
  validateGuestOwnership({ requireModifyPermission: true }),
  guestController.linkToUser
);

/**
 * @route   DELETE /api/v1/guests/:sessionId
 * @desc    Delete guest
 * @access  Admin only
 */
router.delete(
  '/:sessionId',
  guestValidator.validateParams(guestValidator.sessionIdParamSchema),
  authenticate,
  requirePermission(Resource.GUESTS, Action.DELETE),
  auditLog(AuditAction.DELETE_GUEST),
  guestController.deleteGuest
);

/**
 * ✅ Guest Routes Features - WITH RBAC PROTECTION + OWNERSHIP VALIDATION:
 * - POST /guests - Create guest (Public)
 * - GET /guests/statistics - Get statistics (Admin: STATISTICS permission)
 * - POST /guests/cleanup-expired - Cleanup expired (Admin: CLEANUP permission)
 * - GET /guests/email/:email - Find by email (Public)
 * - GET /guests/:sessionId - Get by sessionId (✅ Ownership validated)
 * - GET /guests - Get all active guests (Admin: VIEW permission)
 * - PATCH /guests/:sessionId - Update guest (✅ Ownership validated with modify permission)
 * - PATCH /guests/:sessionId/extend - Extend expiration (✅ Ownership validated with modify permission)
 * - POST /guests/:sessionId/link-user - Link to user (✅ Ownership validated with modify permission)
 * - DELETE /guests/:sessionId - Delete guest (Admin: DELETE permission)
 * - Proper route ordering to avoid collisions
 * - Zod validation middleware applied
 * - ✅ RBAC protection with audit logging for admin operations
 * - ✅ optionalAuthenticate for mixed routes (allows both guest and admin access)
 * - ✅ Ownership validation prevents unauthorized access to other users' sessions
 */

export default router;
