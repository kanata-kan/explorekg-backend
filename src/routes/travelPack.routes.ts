// src/routes/travelPack.routes.ts
import express from 'express';
import * as travelPackController from '../controllers/travelPack.controller';
import {
  validateBody,
  validateQuery,
  travelPackCreateSchema,
  travelPackUpdateSchema,
  travelPackQuerySchema,
} from '../validators/travelPack.validator';
import { detailedPackQuerySchema } from '../validators/packRelation.validator';
import { asyncHandler } from '../types/middleware/asyncHandler';
import {
  authenticate,
  requirePermission,
  auditLog,
  AuditAction,
  Resource,
  Action,
} from '../security';

/**
 * Travel Pack Routes
 * Defines all endpoints for travel pack operations
 */

const router = express.Router();

// ==================== TRAVEL PACK CRUD ====================

/**
 * @route   GET /api/v1/travel-packs/statistics
 * @desc    Get travel pack statistics
 * @access  Admin only
 */
router.get(
  '/statistics',
  authenticate,
  requirePermission(Resource.CATALOG, Action.STATISTICS),
  auditLog(AuditAction.CREATE_TRAVEL_PACK),
  asyncHandler(travelPackController.getTravelPackStatistics)
);

/**
 * @route   GET /api/v1/travel-packs
 * @desc    Get all travel packs with filtering and pagination
 * @access  Public
 */
router.get(
  '/',
  validateQuery(travelPackQuerySchema),
  asyncHandler(travelPackController.listTravelPacks)
);

/**
 * @route   POST /api/v1/travel-packs
 * @desc    Create a new travel pack
 * @access  Admin only
 */
router.post(
  '/',
  validateBody(travelPackCreateSchema),
  authenticate,
  requirePermission(Resource.CATALOG, Action.CREATE),
  auditLog(AuditAction.CREATE_TRAVEL_PACK),
  asyncHandler(travelPackController.createTravelPack)
);

/**
 * @route   GET /api/v1/travel-packs/:id/detailed
 * @desc    Get detailed travel pack with activities, cars, and pricing
 * @access  Public
 * @query   step: 'overview' | 'activities' | 'cars' | 'full'
 * @query   locale: 'en' | 'fr'
 * @note    Must be before /:id route to avoid route collision
 */
router.get(
  '/:id/detailed',
  validateQuery(detailedPackQuerySchema),
  asyncHandler(travelPackController.getDetailedTravelPack)
);

/**
 * @route   GET /api/v1/travel-packs/:id
 * @desc    Get travel pack by ID or slug
 * @access  Public
 */
router.get('/:id', asyncHandler(travelPackController.getTravelPack));

/**
 * @route   PATCH /api/v1/travel-packs/:id
 * @desc    Update a travel pack
 * @access  Admin only
 */
router.patch(
  '/:id',
  validateBody(travelPackUpdateSchema),
  authenticate,
  requirePermission(Resource.CATALOG, Action.UPDATE),
  auditLog(AuditAction.UPDATE_TRAVEL_PACK),
  asyncHandler(travelPackController.updateTravelPack)
);

/**
 * @route   DELETE /api/v1/travel-packs/:id
 * @desc    Delete (archive) a travel pack
 * @access  Admin only
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(Resource.CATALOG, Action.DELETE),
  auditLog(AuditAction.DELETE_TRAVEL_PACK),
  asyncHandler(travelPackController.deleteTravelPack)
);

export default router;

/**
 * ✅ Travel Pack Routes configured with:
 * - Validation middleware
 * - Proper endpoint ordering
 * - ✅ RBAC protection for admin operations
 * - ✅ Audit logging for all modifications
 * - Public access for: GET /, GET /:id/detailed, GET /:id
 * - Admin access for: GET /statistics, POST /, PATCH /:id, DELETE /:id
 */
