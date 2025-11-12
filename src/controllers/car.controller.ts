// src/controllers/car.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CarService } from '../services/car.service';
import { successResponse, errorResponse } from '../utils/responseHelpers';

/**
 * Car Controllers
 * Handle HTTP requests for car operations
 */

/**
 * GET /api/v1/cars
 * Get all cars with filtering and pagination
 */
export const getCars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Use validated query from middleware
    const query = (req as any).validatedQuery || {};

    const { page, limit, sort, ...filters } = query;

    const result = await CarService.findMany(filters, {
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
 * GET /api/v1/cars/:id
 * Get a single car by ID or slug
 */
export const getCarById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const car = await CarService.findById(id);

    res.json(successResponse(car));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/cars
 * Create a new car
 */
export const createCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Use validated body from middleware
    const carData = (req as any).validatedBody || req.body;

    const car = await CarService.create(carData);

    res.status(201).json(successResponse(car));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/cars/:id
 * Update an existing car
 */
export const updateCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    // Use validated body from middleware
    const updateData = (req as any).validatedBody || req.body;

    const car = await CarService.update(id, updateData);

    res.json(successResponse(car));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/cars/:id
 * Soft delete a car (set deletedAt)
 */
export const deleteCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await CarService.remove(id);

    res.json(
      successResponse({
        message: 'Car archived successfully',
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/cars/statistics
 * Get car statistics
 */
export const getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await CarService.getStatistics();

    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/cars/available
 * Get all available cars
 */
export const getAvailableCars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locale } = req.query as { locale?: 'en' | 'fr' };

    const cars = await CarService.findAvailable(locale);

    res.json(successResponse(cars));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/cars/:id/availability
 * Update car availability status
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
      !['available', 'reserved', 'unavailable'].includes(availabilityStatus)
    ) {
      return res.status(400).json(errorResponse('Invalid availability status'));
    }

    const car = await CarService.updateAvailability(id, availabilityStatus);

    res.json(successResponse(car));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/cars/:id/packs
 * Associate car with travel packs
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

    const car = await CarService.associateWithPacks(id, packIds);

    res.json(successResponse(car));
  } catch (error) {
    next(error);
  }
};
