// src/controllers/activity.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { successResponse, errorResponse } from '../utils/responseHelpers';

/**
 * Activity Controllers
 * Handle HTTP requests for activity operations
 */

/**
 * GET /api/v1/activities
 * Get all activities with filtering and pagination
 */
export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Use validated query from middleware
    const query = (req as any).validatedQuery || {};

    const { page, limit, sort, ...filters } = query;

    const result = await ActivityService.findMany(filters, {
      page,
      limit,
      sort,
    });

    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/activities/:id
 * Get a single activity by ID or slug
 */
export const getActivityById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const activity = await ActivityService.findById(id);

    res.json(successResponse(activity));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/activities
 * Create a new activity
 */
export const createActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Use validated body from middleware
    const activityData = (req as any).validatedBody || req.body;

    const activity = await ActivityService.create(activityData);

    res.status(201).json(successResponse(activity));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/activities/:id
 * Update an existing activity
 */
export const updateActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    // Use validated body from middleware
    const updateData = (req as any).validatedBody || req.body;

    const activity = await ActivityService.update(id, updateData);

    res.json(successResponse(activity));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/activities/:id
 * Soft delete an activity (set deletedAt)
 */
export const deleteActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await ActivityService.remove(id);

    res.json(
      successResponse({
        message: 'Activity archived successfully',
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/activities/statistics
 * Get activity statistics
 */
export const getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await ActivityService.getStatistics();

    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/activities/available
 * Get all available activities
 */
export const getAvailableActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locale } = req.query as { locale?: 'en' | 'fr' };

    const activities = await ActivityService.findAvailable(locale);

    res.json(successResponse(activities));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/activities/:id/availability
 * Update activity availability status
 */
export const updateAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { availabilityStatus } = req.body;

    if (
      !availabilityStatus ||
      !['available', 'unavailable'].includes(availabilityStatus)
    ) {
      return res.status(400).json(errorResponse('Invalid availability status'));
    }

    const activity = await ActivityService.updateAvailability(
      id,
      availabilityStatus
    );

    res.json(successResponse(activity));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/activities/:id/packs
 * Associate activity with travel packs
 */
export const associateWithPacks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { packIds } = req.body;

    if (!packIds || !Array.isArray(packIds)) {
      return res
        .status(400)
        .json(errorResponse('packIds must be an array of ObjectIds'));
    }

    const activity = await ActivityService.associateWithPacks(id, packIds);

    res.json(successResponse(activity));
  } catch (error) {
    next(error);
  }
};

// ✅ Activity Controllers ready with comprehensive error handling and validation
