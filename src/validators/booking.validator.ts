// src/validators/booking.validator.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import {
  BookingItemType,
  BookingStatus,
  PaymentStatus,
} from '../models/booking.model';

/**
 * Booking Item Type Schema
 */
const bookingItemTypeSchema = z.enum(
  [BookingItemType.TRAVEL_PACK, BookingItemType.ACTIVITY, BookingItemType.CAR],
  {
    message: 'Invalid booking item type. Must be travel_pack, activity, or car',
  }
);

/**
 * Booking Status Schema
 */
const bookingStatusSchema = z.enum(
  [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.CANCELLED,
    BookingStatus.EXPIRED,
  ],
  {
    message: 'Invalid booking status',
  }
);

/**
 * Payment Status Schema
 */
const paymentStatusSchema = z.enum(
  [
    PaymentStatus.UNPAID,
    PaymentStatus.PAID,
    PaymentStatus.REFUNDED,
    PaymentStatus.FAILED,
  ],
  {
    message: 'Invalid payment status',
  }
);

/**
 * Create Booking Schema
 * POST /api/v1/bookings
 */
export const bookingCreateSchema = z
  .object({
    guestId: z
      .string({
        message: 'Guest ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, {
        message: 'Invalid Guest ID format (must be MongoDB ObjectId)',
      }),

    itemType: bookingItemTypeSchema,

    itemId: z
      .string({
        message: 'Item ID is required',
      })
      .min(1, {
        message: 'Item ID cannot be empty',
      }),

    numberOfPersons: z
      .number({
        message: 'Number of persons must be a number',
      })
      .int({
        message: 'Number of persons must be an integer',
      })
      .min(1, {
        message: 'Number of persons must be at least 1',
      })
      .max(50, {
        message: 'Number of persons cannot exceed 50',
      })
      .optional(),

    numberOfUnits: z
      .number({
        message: 'Number of units must be a number',
      })
      .int({
        message: 'Number of units must be an integer',
      })
      .min(1, {
        message: 'Number of units must be at least 1',
      })
      .optional(),

    numberOfDays: z
      .number({
        message: 'Number of days must be a number',
      })
      .int({
        message: 'Number of days must be an integer',
      })
      .min(1, {
        message: 'Number of days must be at least 1',
      })
      .max(365, {
        message: 'Number of days cannot exceed 365',
      })
      .optional(),

    startDate: z
      .string({
        message: 'Start date must be a string',
      })
      .datetime({
        message: 'Start date must be a valid ISO 8601 datetime',
      })
      .optional()
      .transform(val => (val ? new Date(val) : undefined)),

    endDate: z
      .string({
        message: 'End date must be a string',
      })
      .datetime({
        message: 'End date must be a valid ISO 8601 datetime',
      })
      .optional()
      .transform(val => (val ? new Date(val) : undefined)),

    locale: z
      .enum(['en', 'fr'], {
        message: 'Locale must be either "en" or "fr"',
      })
      .optional(),

    metadata: z.record(z.string(), z.any()).optional(),
  })
  .refine(
    data => {
      // If itemType is CAR, numberOfDays is required
      if (data.itemType === BookingItemType.CAR && !data.numberOfDays) {
        return false;
      }
      return true;
    },
    {
      message: 'numberOfDays is required when booking a car',
      path: ['numberOfDays'],
    }
  )
  .refine(
    data => {
      // If startDate and endDate are provided, endDate must be after startDate
      if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

/**
 * Booking Number Parameter Schema
 * GET /api/v1/bookings/:bookingNumber
 */
export const bookingNumberParamSchema = z.object({
  bookingNumber: z
    .string({
      message: 'Booking number is required',
    })
    .regex(/^BKG-\d{8}-\d{4}$/, {
      message: 'Invalid booking number format. Expected: BKG-YYYYMMDD-####',
    }),
});

/**
 * Guest ID Parameter Schema
 * GET /api/v1/bookings/guest/:guestId
 * Supports both UUID (sessionId) and MongoDB ObjectId
 */
export const guestIdParamSchema = z.object({
  guestId: z
    .string({
      message: 'Guest ID is required',
    })
    .refine(
      val => {
        // Check if UUID v4 format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        // Check if MongoDB ObjectId format
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        return uuidRegex.test(val) || objectIdRegex.test(val);
      },
      {
        message: 'Invalid Guest ID format (must be UUID or MongoDB ObjectId)',
      }
    ),
});

/**
 * Update Booking Status Schema
 * PATCH /api/v1/bookings/:bookingNumber/status
 */
export const updateBookingStatusSchema = z.object({
  status: bookingStatusSchema,
});

/**
 * Mark as Paid Schema
 * POST /api/v1/bookings/:bookingNumber/payment
 */
export const markAsPaidSchema = z.object({
  paymentMethod: z
    .string({
      message: 'Payment method is required',
    })
    .min(3, {
      message: 'Payment method must be at least 3 characters',
    })
    .max(50, {
      message: 'Payment method cannot exceed 50 characters',
    }),

  paymentTransactionId: z
    .string({
      message: 'Payment transaction ID is required',
    })
    .min(5, {
      message: 'Payment transaction ID must be at least 5 characters',
    })
    .max(100, {
      message: 'Payment transaction ID cannot exceed 100 characters',
    }),
});

/**
 * Cancel Booking Schema
 * POST /api/v1/bookings/:bookingNumber/cancel
 */
export const cancelBookingSchema = z.object({
  reason: z
    .string({
      message: 'Cancellation reason must be a string',
    })
    .min(5, {
      message: 'Cancellation reason must be at least 5 characters',
    })
    .max(500, {
      message: 'Cancellation reason cannot exceed 500 characters',
    })
    .optional(),
});

/**
 * Validation Middleware Generator
 * Validates request body against a Zod schema
 */
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      (req as any).validatedBody = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  };
};

/**
 * Validation Middleware for URL Parameters
 * Validates request params against a Zod schema
 */
export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      (req as any).validatedParams = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL parameters',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  };
};

/**
 * Validation Middleware for Query Parameters
 * Validates request query against a Zod schema
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.query);
      (req as any).validatedQuery = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  };
};

/**
 * ✅ Booking Validator Features:
 * - bookingCreateSchema: Full validation for creating bookings
 *   * guestId (MongoDB ObjectId format)
 *   * itemType (travel_pack/activity/car)
 *   * itemId (required)
 *   * numberOfPersons/numberOfUnits/numberOfDays (optional, with limits)
 *   * startDate/endDate (ISO 8601 datetime, with validation)
 *   * locale (en/fr)
 *   * Custom refinements:
 *     - numberOfDays required for cars
 *     - endDate must be after startDate
 *
 * - bookingNumberParamSchema: BKG-YYYYMMDD-#### format validation
 * - guestIdParamSchema: MongoDB ObjectId validation
 * - updateBookingStatusSchema: Status transition validation
 * - markAsPaidSchema: Payment details validation
 * - cancelBookingSchema: Cancellation reason validation
 *
 * - Middleware functions:
 *   * validateBody() - for request body
 *   * validateParams() - for URL parameters
 *   * validateQuery() - for query strings
 *
 * - Error handling with detailed field-level messages
 * - Zod v4 compatible (using 'message' parameter)
 */
