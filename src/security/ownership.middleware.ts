/**
 * Ownership Validation Middleware
 *
 * يوفر middleware للتحقق من ملكية الموارد في المسارات المختلطة
 * (Mixed Routes التي تدعم Guest و Admin access)
 *
 * @module security/ownership.middleware
 */

import { Request, Response, NextFunction } from 'express';
import { Booking } from '../models/booking.model';
import { Guest } from '../models/guest.model';
import { hasPermission } from './permissions.map';
import { Resource, Action } from './permissions.map';
import { logger } from '../utils/logger';

/**
 * استخراج Guest Session ID من الطلب
 * يبحث في headers و query parameters
 */
const extractGuestSessionId = (req: Request): string | undefined => {
  // البحث في headers أولاً
  const headerSession = req.headers['x-guest-session'] as string | undefined;
  if (headerSession) {
    return headerSession;
  }

  // البحث في query parameters
  const querySession = req.query.guestSessionId as string | undefined;
  if (querySession) {
    return querySession;
  }

  return undefined;
};

/**
 * التحقق من ملكية الحجز (Booking Ownership)
 *
 * يتحقق من أن:
 * 1. إذا كان المستخدم admin → يسمح بالوصول لأي حجز
 * 2. إذا كان guest → يتحقق أن guestId يطابق الحجز
 * 3. إذا لم يكن لديه صلاحية → رفض الوصول
 *
 * @param options - خيارات التحقق
 * @param options.allowAdminView - السماح للـ admin بعرض الحجز (افتراضي: true)
 * @param options.requireModifyPermission - يتطلب صلاحية تعديل للـ admin (افتراضي: false)
 */
export const validateBookingOwnership = (
  options: {
    allowAdminView?: boolean;
    requireModifyPermission?: boolean;
  } = {}
) => {
  const { allowAdminView = true, requireModifyPermission = false } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // استخراج bookingNumber من params
      const { bookingNumber } = req.params;

      if (!bookingNumber) {
        res.status(400).json({
          success: false,
          error: 'Booking number is required',
          code: 'MISSING_BOOKING_NUMBER',
        });
        return;
      }

      // البحث عن الحجز
      const booking = await Booking.findOne({ bookingNumber });

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found',
          code: 'BOOKING_NOT_FOUND',
        });
        return;
      }

      // حفظ الحجز في request للاستخدام في controller
      req.booking = booking;

      // التحقق من صلاحية Admin
      if (req.admin) {
        // إذا كان admin، التحقق من الصلاحيات
        const requiredAction = requireModifyPermission
          ? Action.UPDATE
          : Action.VIEW;

        if (!hasPermission(req.admin.role, Resource.BOOKINGS, requiredAction)) {
          logger.warn(
            {
              adminId: req.admin.adminId,
              role: req.admin.role,
              bookingNumber,
              requiredAction,
            },
            'Admin lacks permission for booking access'
          );

          res.status(403).json({
            success: false,
            error: 'Insufficient permissions to access this booking',
            code: 'INSUFFICIENT_PERMISSIONS',
          });
          return;
        }

        // Admin لديه الصلاحية → السماح بالوصول
        logger.debug(
          {
            adminId: req.admin.adminId,
            bookingNumber,
          },
          'Admin accessing booking'
        );

        next();
        return;
      }

      // التحقق من Guest ownership
      const guestSessionId = extractGuestSessionId(req);

      if (!guestSessionId) {
        logger.warn(
          {
            bookingNumber,
            ip: req.ip,
          },
          'Attempted booking access without authentication'
        );

        res.status(401).json({
          success: false,
          error:
            'Authentication required. Please provide x-guest-session header or guestSessionId parameter',
          code: 'AUTHENTICATION_REQUIRED',
        });
        return;
      }

      // Find guest by sessionId to get their ObjectId
      const guest = await Guest.findOne({ sessionId: guestSessionId });

      if (!guest) {
        logger.warn(
          {
            guestSessionId,
            ip: req.ip,
          },
          'Guest session not found'
        );

        res.status(401).json({
          success: false,
          error: 'Invalid guest session',
          code: 'INVALID_SESSION',
        });
        return;
      }

      // التحقق من الملكية - compare ObjectIds
      if (booking.guestId.toString() !== guest._id.toString()) {
        logger.warn(
          {
            bookingNumber,
            providedGuestId: guest._id.toString(),
            actualGuestId: booking.guestId.toString(),
            ip: req.ip,
          },
          'Attempted unauthorized booking access'
        );

        res.status(403).json({
          success: false,
          error: 'You do not have permission to access this booking',
          code: 'ACCESS_DENIED',
        });
        return;
      }

      // Guest يملك الحجز → السماح بالوصول
      logger.debug(
        {
          guestSessionId,
          bookingNumber,
        },
        'Guest accessing own booking'
      );

      next();
    } catch (error) {
      logger.error(
        { error, bookingNumber: req.params.bookingNumber },
        'Error validating booking ownership'
      );

      res.status(500).json({
        success: false,
        error: 'Internal server error while validating booking ownership',
        code: 'VALIDATION_ERROR',
      });
    }
  };
};

/**
 * التحقق من ملكية Guest Session
 *
 * يتحقق من أن:
 * 1. إذا كان المستخدم admin → يسمح بالوصول لأي guest
 * 2. إذا كان guest → يتحقق أن sessionId يطابق
 * 3. إذا لم يكن لديه صلاحية → رفض الوصول
 *
 * @param options - خيارات التحقق
 * @param options.requireModifyPermission - يتطلب صلاحية تعديل للـ admin (افتراضي: false)
 */
export const validateGuestOwnership = (
  options: {
    requireModifyPermission?: boolean;
  } = {}
) => {
  const { requireModifyPermission = false } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // استخراج sessionId من params
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID',
        });
        return;
      }

      // البحث عن Guest
      const guest = await Guest.findOne({ sessionId });

      if (!guest) {
        res.status(404).json({
          success: false,
          error: 'Guest session not found',
          code: 'GUEST_NOT_FOUND',
        });
        return;
      }

      // التحقق من انتهاء الجلسة
      if (guest.expiresAt && guest.expiresAt < new Date()) {
        logger.warn(
          {
            sessionId,
            expiresAt: guest.expiresAt,
          },
          'Attempted access to expired guest session'
        );

        res.status(401).json({
          success: false,
          error: 'Guest session has expired',
          code: 'SESSION_EXPIRED',
        });
        return;
      }

      // حفظ Guest في request للاستخدام في controller
      req.guest = guest;

      // التحقق من صلاحية Admin
      if (req.admin) {
        // إذا كان admin، التحقق من الصلاحيات
        const requiredAction = requireModifyPermission
          ? Action.UPDATE
          : Action.VIEW;

        if (!hasPermission(req.admin.role, Resource.GUESTS, requiredAction)) {
          logger.warn(
            {
              adminId: req.admin.adminId,
              role: req.admin.role,
              sessionId,
              requiredAction,
            },
            'Admin lacks permission for guest access'
          );

          res.status(403).json({
            success: false,
            error: 'Insufficient permissions to access this guest',
            code: 'INSUFFICIENT_PERMISSIONS',
          });
          return;
        }

        // Admin لديه الصلاحية → السماح بالوصول
        logger.debug(
          {
            adminId: req.admin.adminId,
            sessionId,
          },
          'Admin accessing guest session'
        );

        next();
        return;
      }

      // التحقق من Guest ownership
      const providedSessionId = extractGuestSessionId(req);

      if (!providedSessionId) {
        logger.warn(
          {
            sessionId,
            ip: req.ip,
          },
          'Attempted guest access without authentication'
        );

        res.status(401).json({
          success: false,
          error:
            'Authentication required. Please provide x-guest-session header or guestSessionId parameter',
          code: 'AUTHENTICATION_REQUIRED',
        });
        return;
      }

      // التحقق من الملكية
      if (guest.sessionId !== providedSessionId) {
        logger.warn(
          {
            requestedSessionId: sessionId,
            providedSessionId,
            ip: req.ip,
          },
          'Attempted unauthorized guest access'
        );

        res.status(403).json({
          success: false,
          error: 'You do not have permission to access this guest session',
          code: 'ACCESS_DENIED',
        });
        return;
      }

      // Guest يملك الجلسة → السماح بالوصول
      logger.debug(
        {
          sessionId,
        },
        'Guest accessing own session'
      );

      next();
    } catch (error) {
      logger.error(
        { error, sessionId: req.params.sessionId },
        'Error validating guest ownership'
      );

      res.status(500).json({
        success: false,
        error: 'Internal server error while validating guest ownership',
        code: 'VALIDATION_ERROR',
      });
    }
  };
};

/**
 * التحقق من ملكية حجوزات Guest المحددة
 * يستخدم للمسارات مثل: GET /bookings/guest/:guestId
 *
 * @param options - خيارات التحقق
 */
export const validateGuestBookingsOwnership = (
  options: {
    allowAdminView?: boolean;
  } = {}
) => {
  const { allowAdminView = true } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // استخراج guestId من params
      const { guestId } = req.params;

      if (!guestId) {
        res.status(400).json({
          success: false,
          error: 'Guest ID is required',
          code: 'MISSING_GUEST_ID',
        });
        return;
      }

      // التحقق من صلاحية Admin
      if (req.admin) {
        if (
          allowAdminView &&
          hasPermission(req.admin.role, Resource.BOOKINGS, Action.VIEW)
        ) {
          logger.debug(
            {
              adminId: req.admin.adminId,
              guestId,
            },
            'Admin accessing guest bookings'
          );

          next();
          return;
        }

        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to access guest bookings',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
        return;
      }

      // Validate guestId param is ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(guestId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid Guest ID format. Must be MongoDB ObjectId.',
          code: 'INVALID_GUEST_ID_FORMAT',
        });
        return;
      }

      // التحقق من Guest ownership
      const providedSessionId = extractGuestSessionId(req);

      if (!providedSessionId) {
        logger.warn(
          {
            guestId,
            ip: req.ip,
          },
          'Attempted guest bookings access without authentication'
        );

        res.status(401).json({
          success: false,
          error:
            'Authentication required. Please provide x-guest-session header or guestSessionId parameter',
          code: 'AUTHENTICATION_REQUIRED',
        });
        return;
      }

      // Find guest by sessionId to get their ObjectId
      const guest = await Guest.findOne({ sessionId: providedSessionId });

      if (!guest) {
        logger.warn(
          {
            providedSessionId,
            ip: req.ip,
          },
          'Guest session not found'
        );

        res.status(401).json({
          success: false,
          error: 'Invalid guest session',
          code: 'INVALID_SESSION',
        });
        return;
      }

      // التحقق من الملكية - compare ObjectIds
      if (guest._id.toString() !== guestId) {
        logger.warn(
          {
            requestedGuestId: guestId,
            actualGuestId: guest._id.toString(),
            providedSessionId,
            ip: req.ip,
          },
          'Attempted unauthorized guest bookings access'
        );

        res.status(403).json({
          success: false,
          error: 'You do not have permission to access these bookings',
          code: 'ACCESS_DENIED',
        });
        return;
      }

      // Guest يطلب حجوزاته الخاصة → السماح بالوصول
      logger.debug(
        {
          guestId,
        },
        'Guest accessing own bookings'
      );

      next();
    } catch (error) {
      logger.error(
        { error, guestId: req.params.guestId },
        'Error validating guest bookings ownership'
      );

      res.status(500).json({
        success: false,
        error:
          'Internal server error while validating guest bookings ownership',
        code: 'VALIDATION_ERROR',
      });
    }
  };
};
