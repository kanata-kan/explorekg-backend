// src/controllers/travelPack.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ValidatedRequest } from '../types/common';
import * as travelPackService from '../services/travelPack.service';
import * as packRelationService from '../services/packRelation.service';
import { Types } from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Controller layer: thin functions that call service layer and return HTTP responses.
 * - Uses consistent response shape: { success, data?, error?, statusCode?, timestamp?, path? }
 * - All handlers wrapped by asyncHandler (assumed to be available in src/middleware/asyncHandler.ts).
 */

/**
 * GET /api/v1/travel-packs
 * Enhanced query params:
 *  - locale (en|fr)
 *  - status (published|draft|archived)
 *  - q (search query on name/description)
 *  - availability (true|false)
 *  - minPrice, maxPrice (number)
 *  - minDuration, maxDuration (number in days)
 *  - sort (createdAt|-createdAt|basePrice|-basePrice|duration|-duration|name|-name)
 *  - page, limit
 */
export const listTravelPacks = asyncHandler(
  async (req: ValidatedRequest, res: Response) => {
    const {
      locale,
      status,
      q,
      availability,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      createdBy,
      page = '1',
      limit = '20',
      sort = '-createdAt',
    } = req.query as any;

    // Parse and validate pagination
    const pagination = {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: Math.max(parseInt(limit, 10) || 20, 1),
      sort: sort as any,
    };

    // Parse and validate filters
    const filters = {
      locale: locale || null,
      status: status || null,
      q: q || null,
      availability: availability !== undefined ? availability === 'true' : null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      minDuration: minDuration ? parseInt(minDuration, 10) : null,
      maxDuration: maxDuration ? parseInt(maxDuration, 10) : null,
      createdBy: createdBy || null,
    };

    const result = await travelPackService.findMany(filters, pagination);

    return res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  }
);

/**
 * GET /api/v1/travel-packs/:id
 * - id may be ObjectId or slug
 */
export const getTravelPack = asyncHandler(
  async (req: ValidatedRequest<any, { id: string }>, res: Response) => {
    const { id } = req.params;
    const doc = await travelPackService.findByIdOrSlug(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'TravelPack not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
    return res.json({ success: true, data: doc });
  }
);

/**
 * GET /api/v1/travel-packs/:id/detailed
 * - Get detailed pack with activities, cars, and pricing
 * - Query params: step ('overview' | 'activities' | 'cars' | 'full'), locale ('en' | 'fr')
 * - Calls packRelationService.getDetailedPack() and formats response based on step
 */
export const getDetailedTravelPack = asyncHandler(
  async (req: ValidatedRequest<any, { id: string }, { step?: string; locale?: 'en' | 'fr' }>, res: Response) => {
    const { id } = req.params;
    const { step = 'full', locale = 'en' } = req.query as {
      step?: string;
      locale?: 'en' | 'fr';
    };

    // Validate locale
    const validLocale: 'en' | 'fr' = locale === 'fr' ? 'fr' : 'en';

    // Get detailed pack with relations
    const detailedPack = await packRelationService.getDetailedPack(
      id,
      validLocale
    );

    if (!detailedPack) {
      return res.status(404).json({
        success: false,
        error: 'Travel pack or pack relation not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    // Format response based on step
    let responseData: any;

    switch (step) {
      case 'overview':
        // Only pack basic info and pricing summary
        responseData = {
          pack: detailedPack.pack,
          pricing: detailedPack.pricing,
          settings: detailedPack.settings,
        };
        break;

      case 'activities':
        // Pack info + activities only
        responseData = {
          pack: detailedPack.pack,
          activities: detailedPack.relations.activities,
          pricing: {
            activitiesTotal: detailedPack.pricing.activitiesTotal,
          },
          settings: detailedPack.settings,
        };
        break;

      case 'cars':
        // Pack info + cars only
        responseData = {
          pack: detailedPack.pack,
          cars: detailedPack.relations.cars,
          pricing: {
            carsTotal: detailedPack.pricing.carsTotal,
          },
          settings: detailedPack.settings,
        };
        break;

      case 'full':
      default:
        // Full detailed pack with everything
        responseData = detailedPack;
        break;
    }

    return res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    });
  }
);

/**
 * POST /api/v1/travel-packs
 * - body validated by Zod middleware before reaching controller
 * - Enhanced with better user handling and validation
 */
export const createTravelPack = asyncHandler(
  async (req: ValidatedRequest, res: Response) => {
    const payload = req.validatedBody || req.body;

    // Extract user ID from request (if authentication middleware is used)
    const userId = req.user?._id || null;

    const created = await travelPackService.createOne(payload, userId);

    return res.status(201).json({
      success: true,
      data: created,
      message: 'Travel pack created successfully',
      timestamp: new Date().toISOString(),
    });
  }
);

/**
 * PATCH /api/v1/travel-packs/:id
 * - partial update, validated by Zod partial schema
 */
export const updateTravelPack = asyncHandler(
  async (req: ValidatedRequest<any, { id: string }>, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const updated = await travelPackService.updateByIdOrSlug(id, payload);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'TravelPack not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
    return res.json({ success: true, data: updated });
  }
);

/**
 * DELETE /api/v1/travel-packs/:id
 * - Soft-delete: set status = archived (recommended)
 */
export const deleteTravelPack = asyncHandler(
  async (req: ValidatedRequest<any, { id: string }>, res: Response) => {
    const { id } = req.params;
    const result = await travelPackService.archiveByIdOrSlug(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'TravelPack not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
    return res.json({
      success: true,
      data: { message: 'TravelPack archived successfully' },
      timestamp: new Date().toISOString(),
    });
  }
);

/**
 * GET /api/v1/travel-packs/statistics
 * - Get analytics and statistics about travel packs
 */
export const getTravelPackStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    const statistics = await travelPackService.getStatistics();

    return res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString(),
    });
  }
);
