// src/controllers/guest.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ValidatedRequest } from '../types/common';
import * as guestService from '../services/guest.service';
import { dataAccessAuditor } from '../security';

/**
 * Guest Controllers
 * HTTP request handlers for guest operations
 */

/**
 * POST /api/v1/guests
 * Create a new guest
 */
export const createGuest = async (
  req: ValidatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const guestData = req.validatedBody || req.body;

    const guest = await guestService.createGuest(guestData);

    // Security audit logging
    dataAccessAuditor('CREATE', 'Guest', req as Request, guest._id.toString());

    res.status(201).json({
      success: true,
      data: {
        _id: guest._id.toString(), // MongoDB ObjectId - required for booking creation
        sessionId: guest.sessionId,
        email: guest.email,
        fullName: guest.fullName,
        phone: guest.phone,
        locale: guest.locale,
        expiresAt: guest.expiresAt,
        createdAt: guest.createdAt,
        updatedAt: guest.updatedAt,
      },
      message: 'Guest created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/guests/:sessionId
 * Get guest by sessionId
 */
export const getGuest = async (
  req: ValidatedRequest<any, { sessionId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;

    const guest = await guestService.findBySessionId(sessionId);

    res.status(200).json({
      success: true,
      data: {
        _id: guest._id.toString(), // MongoDB ObjectId - required for booking creation
        sessionId: guest.sessionId,
        email: guest.email,
        fullName: guest.fullName,
        phone: guest.phone,
        locale: guest.locale,
        metadata: guest.metadata,
        canMigrate: guest.canMigrate,
        userId: guest.userId,
        expiresAt: guest.expiresAt,
        createdAt: guest.createdAt,
        updatedAt: guest.updatedAt,
        isExpired: guest.isExpired(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/guests/email/:email
 * Find guest by email
 */
export const getGuestByEmail = async (
  req: ValidatedRequest<any, { email: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.params;

    const guest = await guestService.findByEmail(email);

    if (!guest) {
      return res.status(404).json({
        success: false,
        error: `Guest with email "${email}" not found or expired`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: guest._id.toString(), // MongoDB ObjectId - required for booking creation
        sessionId: guest.sessionId,
        email: guest.email,
        fullName: guest.fullName,
        locale: guest.locale,
        expiresAt: guest.expiresAt,
        createdAt: guest.createdAt,
        updatedAt: guest.updatedAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/guests/:sessionId
 * Update guest information
 */
export const updateGuest = async (
  req: ValidatedRequest<any, { sessionId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const updateData = req.validatedBody || req.body;

    const guest = await guestService.updateGuest(sessionId, updateData);

    res.status(200).json({
      success: true,
      data: {
        _id: guest._id.toString(), // MongoDB ObjectId - required for booking creation
        sessionId: guest.sessionId,
        email: guest.email,
        fullName: guest.fullName,
        phone: guest.phone,
        locale: guest.locale,
        metadata: guest.metadata,
        updatedAt: guest.updatedAt,
      },
      message: 'Guest updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/guests/:sessionId/extend
 * Extend guest expiration date
 */
export const extendExpiration = async (
  req: ValidatedRequest<{ daysToAdd?: number }, { sessionId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const { daysToAdd } = req.validatedBody || req.body;

    const guest = await guestService.extendExpiration(
      sessionId,
      daysToAdd || 30
    );

    res.status(200).json({
      success: true,
      data: {
        sessionId: guest.sessionId,
        expiresAt: guest.expiresAt,
        daysAdded: daysToAdd || 30,
      },
      message: `Expiration extended by ${daysToAdd || 30} days`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/guests/:sessionId/link-user
 * Link guest to registered user (future feature)
 */
export const linkToUser = async (
  req: ValidatedRequest<{ userId: string }, { sessionId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.validatedBody || req.body;

    const guest = await guestService.linkToUser(sessionId, userId);

    res.status(200).json({
      success: true,
      data: {
        sessionId: guest.sessionId,
        userId: guest.userId,
        canMigrate: guest.canMigrate,
      },
      message: 'Guest linked to user successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/guests/:sessionId
 * Delete guest (admin only)
 */
export const deleteGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;

    await guestService.deleteGuest(sessionId);

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        deleted: true,
      },
      message: 'Guest deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/guests/statistics
 * Get guest statistics (admin only)
 */
export const getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await guestService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/guests
 * Get all active guests (admin only)
 */
export const getAllGuests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const guests = await guestService.findActiveGuests();

    res.status(200).json({
      success: true,
      data: {
        guests: guests.map(g => ({
          sessionId: g.sessionId,
          email: g.email,
          fullName: g.fullName,
          locale: g.locale,
          canMigrate: g.canMigrate,
          userId: g.userId,
          expiresAt: g.expiresAt,
          createdAt: g.createdAt,
        })),
        count: guests.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/guests/cleanup-expired
 * Manual cleanup of expired guests (admin only)
 */
export const cleanupExpired = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedCount = await guestService.cleanExpiredGuests();

    res.status(200).json({
      success: true,
      data: {
        deletedCount,
        message: `Cleaned up ${deletedCount} expired guests`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Guest Controller Features:
 * - Create guest (POST /guests)
 * - Get guest by sessionId (GET /guests/:sessionId)
 * - Get guest by email (GET /guests/email/:email)
 * - Update guest (PATCH /guests/:sessionId)
 * - Extend expiration (PATCH /guests/:sessionId/extend)
 * - Link to user (POST /guests/:sessionId/link-user)
 * - Delete guest (DELETE /guests/:sessionId)
 * - Get statistics (GET /guests/statistics)
 * - Get all active guests (GET /guests)
 * - Cleanup expired (POST /guests/cleanup-expired)
 * - Consistent response format (success, data, message, timestamp)
 * - Error handling via next(error)
 */
