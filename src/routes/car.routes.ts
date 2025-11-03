// src/routes/car.routes.ts
import { Router } from 'express';
import * as carController from '../controllers/car.controller';
import {
  validateCarCreate,
  validateCarUpdate,
  validateCarQuery,
} from '../validators/car.validator';
import {
  authenticate,
  requirePermission,
  auditLog,
  AuditAction,
  Resource,
  Action,
} from '../security';

/**
 * Car Routes
 * Defines all endpoints for car operations
 */

const router = Router();

// ==================== CAR CRUD ====================

/**
 * @route   GET /api/v1/cars/statistics
 * @desc    Get car statistics
 * @access  Admin only
 */
router.get(
  '/statistics',
  authenticate,
  requirePermission(Resource.CATALOG, Action.STATISTICS),
  auditLog(AuditAction.CREATE_CAR),
  carController.getStatistics
);

/**
 * @route   GET /api/v1/cars/available
 * @desc    Get all available cars
 * @access  Public
 * @note    Must be before /:id route to avoid conflicts
 */
router.get('/available', carController.getAvailableCars);

/**
 * @route   GET /api/v1/cars
 * @desc    Get all cars with filtering and pagination
 * @access  Public
 */
router.get('/', validateCarQuery, carController.getCars);

/**
 * @route   POST /api/v1/cars
 * @desc    Create a new car
 * @access  Admin only
 */
router.post(
  '/',
  validateCarCreate,
  authenticate,
  requirePermission(Resource.CATALOG, Action.CREATE),
  auditLog(AuditAction.CREATE_CAR),
  carController.createCar
);

/**
 * @route   GET /api/v1/cars/:id
 * @desc    Get car by ID or slug
 * @access  Public
 */
router.get('/:id', carController.getCarById);

/**
 * @route   PATCH /api/v1/cars/:id
 * @desc    Update a car
 * @access  Admin only
 */
router.patch(
  '/:id',
  validateCarUpdate,
  authenticate,
  requirePermission(Resource.CATALOG, Action.UPDATE),
  auditLog(AuditAction.UPDATE_CAR),
  carController.updateCar
);

/**
 * @route   DELETE /api/v1/cars/:id
 * @desc    Delete (archive) a car
 * @access  Admin only
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(Resource.CATALOG, Action.DELETE),
  auditLog(AuditAction.DELETE_CAR),
  carController.deleteCar
);

// ==================== CAR OPERATIONS ====================

/**
 * @route   PATCH /api/v1/cars/:id/availability
 * @desc    Update car availability status
 * @access  Admin only
 */
router.patch(
  '/:id/availability',
  authenticate,
  requirePermission(Resource.CATALOG, Action.UPDATE),
  auditLog(AuditAction.UPDATE_CAR),
  carController.updateAvailability
);

/**
 * @route   POST /api/v1/cars/:id/packs
 * @desc    Associate car with travel packs
 * @access  Admin only
 */
router.post(
  '/:id/packs',
  authenticate,
  requirePermission(Resource.CATALOG, Action.UPDATE),
  auditLog(AuditAction.UPDATE_CAR),
  carController.associateWithPacks
);

export default router;

/**
 * ✅ Car Routes configured with:
 * - Validation middleware
 * - Proper endpoint ordering
 * - ✅ RBAC protection for admin operations
 * - ✅ Audit logging for all modifications
 * - Public access for: GET /available, GET /, GET /:id
 * - Admin access for: GET /statistics, POST /, PATCH /:id, DELETE /:id, PATCH /:id/availability, POST /:id/packs
 */
