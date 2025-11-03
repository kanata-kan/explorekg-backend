// src/controllers/packRelation.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as packRelationService from '../services/packRelation.service';

/**
 * PackRelation Controllers
 * Handle HTTP requests for pack relations management
 */

/**
 * Create a new PackRelation
 * POST /api/v1/pack-relations
 */
export const createPackRelation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const relation = await packRelationService.createPackRelation(req.body);

    res.status(201).json({
      success: true,
      data: relation,
      message: 'PackRelation created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all PackRelations
 * GET /api/v1/pack-relations
 */
export const getAllPackRelations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const relations = await packRelationService.getAllPackRelations();

    res.status(200).json({
      success: true,
      data: {
        items: relations,
        count: relations.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get PackRelation by travelPackLocaleGroupId
 * GET /api/v1/pack-relations/:packId
 */
export const getPackRelation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { packId } = req.params;

    const relation =
      await packRelationService.getPackRelationByPackLocaleId(packId);

    if (!relation) {
      return res.status(404).json({
        success: false,
        error: `PackRelation for pack "${packId}" not found`,
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: relation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update PackRelation
 * PUT /api/v1/pack-relations/:packId
 */
export const updatePackRelation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { packId } = req.params;

    const relation = await packRelationService.updatePackRelation(
      packId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: relation,
      message: 'PackRelation updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete PackRelation
 * DELETE /api/v1/pack-relations/:packId
 */
export const deletePackRelation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { packId } = req.params;

    const deleted = await packRelationService.deletePackRelation(packId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `PackRelation for pack "${packId}" not found`,
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: 'PackRelation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate custom price
 * POST /api/v1/pack-relations/calculate-price
 */
export const calculatePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      travelPackLocaleGroupId,
      selectedActivities,
      selectedCar,
      carDurationDays,
      locale,
    } = req.body;

    const result = await packRelationService.calculateCustomPrice(
      travelPackLocaleGroupId,
      selectedActivities || [],
      selectedCar || null,
      carDurationDays || null,
      locale
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
