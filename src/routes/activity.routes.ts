// src/routes/activity.routes.ts
import { Router } from 'express';
import * as activityController from '../controllers/activity.controller';
import {
  validateActivityCreate,
  validateActivityUpdate,
  validateActivityQuery,
} from '../validators/activity.validator';
import {
  authenticate,
  requirePermission,
  auditLog,
  AuditAction,
  Resource,
  Action,
} from '../security';

/**
 * Activity Routes
 * Defines all endpoints for activity operations
 */

const router = Router();

// ==================== ACTIVITY CRUD ====================

/**
 * @route   GET /api/v1/activities/statistics
 * @desc    Get activity statistics
 * @access  Admin only
 */
router.get(
  '/statistics',
  authenticate,
  requirePermission(Resource.CATALOG, Action.STATISTICS),
  auditLog(AuditAction.CREATE_ACTIVITY),
  activityController.getStatistics
);

/**
 * @route   GET /api/v1/activities/available
 * @desc    Get all available activities
 * @access  Public
 * @note    Must be before /:id route to avoid conflicts
 */
router.get('/available', activityController.getAvailableActivities);

/**
 * @route   GET /api/v1/activities
 * @desc    Get all activities with filtering and pagination
 * @access  Public
 */
router.get('/', validateActivityQuery, activityController.getActivities);

/**
 * @route   POST /api/v1/activities
 * @desc    Create a new activity
 * @access  Admin only
 */
router.post(
  '/',
  validateActivityCreate,
  authenticate,
  requirePermission(Resource.CATALOG, Action.CREATE),
  auditLog(AuditAction.CREATE_ACTIVITY),
  activityController.createActivity
);

/**
 * @route   GET /api/v1/activities/:id
 * @desc    Get activity by ID or slug
 * @access  Public
 */
router.get('/:id', activityController.getActivityById);

/**
 * @route   PATCH /api/v1/activities/:id
 * @desc    Update an activity
 * @access  Admin only
 */
router.patch(
  '/:id',
  validateActivityUpdate,
  authenticate,
  requirePermission(Resource.CATALOG, Action.UPDATE),
  auditLog(AuditAction.UPDATE_ACTIVITY),
  activityController.updateActivity
);

/**
 * @route   DELETE /api/v1/activities/:id
 * @desc    Delete (archive) an activity
 * @access  Admin only
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(Resource.CATALOG, Action.DELETE),
  auditLog(AuditAction.DELETE_ACTIVITY),
  activityController.deleteActivity
);

// ==================== ACTIVITY OPERATIONS ====================

/**
 * @route   PATCH /api/v1/activities/:id/availability
 * @desc    Update activity availability status
 * @access  Admin only
 */
router.patch(
  '/:id/availability',
  authenticate,
  requirePermission(Resource.CATALOG, Action.UPDATE),
  auditLog(AuditAction.UPDATE_ACTIVITY),
  activityController.updateAvailability
);

/**
 * @route   POST /api/v1/activities/:id/packs
 * @desc    Associate activity with travel packs
 * @access  Admin only
 */
router.post(
  '/:id/packs',
  authenticate,
  requirePermission(Resource.CATALOG, Action.UPDATE),
  auditLog(AuditAction.UPDATE_ACTIVITY),
  activityController.associateWithPacks
);

export default router;

/**
 * ✅ Activity Routes configured with:
 * - Validation middleware
 * - Proper endpoint ordering
 * - ✅ RBAC protection for admin operations
 * - ✅ Audit logging for all modifications
 * - Public access for: GET /available, GET /, GET /:id
 * - Admin access for: GET /statistics, POST /, PATCH /:id, DELETE /:id, PATCH /:id/availability, POST /:id/packs
 */
