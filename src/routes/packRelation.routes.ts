// src/routes/packRelation.routes.ts
import { Router } from 'express';
import * as packRelationController from '../controllers/packRelation.controller';
import {
  packRelationCreateSchema,
  packRelationUpdateSchema,
  calculatePriceSchema,
} from '../validators/packRelation.validator';
import { validateBody } from '../validators/travelPack.validator';
import {
  authenticate,
  requirePermission,
  auditLog,
  AuditAction,
  Resource,
  Action,
} from '../security';

const router = Router();

/**
 * @route   POST /api/v1/pack-relations
 * @desc    Create a new PackRelation
 * @access  Admin only
 */
router.post(
  '/',
  validateBody(packRelationCreateSchema),
  authenticate,
  requirePermission(Resource.CATALOG, Action.CREATE),
  auditLog(AuditAction.CREATE_PACK_RELATION),
  packRelationController.createPackRelation
);

/**
 * @route   POST /api/v1/pack-relations/calculate-price
 * @desc    Calculate price for custom selection
 * @access  Public
 * @note    Must be before /:packId to avoid route collision
 */
router.post(
  '/calculate-price',
  validateBody(calculatePriceSchema),
  packRelationController.calculatePrice
);

/**
 * @route   GET /api/v1/pack-relations
 * @desc    Get all PackRelations
 * @access  Admin only
 */
router.get(
  '/',
  authenticate,
  requirePermission(Resource.CATALOG, Action.VIEW),
  packRelationController.getAllPackRelations
);

/**
 * @route   GET /api/v1/pack-relations/:packId
 * @desc    Get PackRelation by travelPackLocaleGroupId
 * @access  Public
 */
router.get('/:packId', packRelationController.getPackRelation);

/**
 * @route   PUT /api/v1/pack-relations/:packId
 * @desc    Update PackRelation
 * @access  Admin only
 */
router.put(
  '/:packId',
  validateBody(packRelationUpdateSchema),
  authenticate,
  requirePermission(Resource.CATALOG, Action.UPDATE),
  auditLog(AuditAction.UPDATE_PACK_RELATION),
  packRelationController.updatePackRelation
);

/**
 * @route   DELETE /api/v1/pack-relations/:packId
 * @desc    Delete PackRelation
 * @access  Admin only
 */
router.delete(
  '/:packId',
  authenticate,
  requirePermission(Resource.CATALOG, Action.DELETE),
  auditLog(AuditAction.DELETE_PACK_RELATION),
  packRelationController.deletePackRelation
);

export default router;
