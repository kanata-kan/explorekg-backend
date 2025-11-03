// src/validators/guest.validator.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Guest Validation Schemas
 * Zod-based validation for guest-related requests
 */

// ==================== SCHEMAS ====================

/**
 * Metadata schema (optional tracking data)
 */
const metadataSchema = z.object({
  userAgent: z.string().max(500, 'User agent too long').optional(),
  ipAddress: z
    .string()
    .regex(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
      'Invalid IP address format (IPv4 or IPv6)'
    )
    .optional(),
  source: z.enum(['web', 'mobile', 'api']).optional(),
});

/**
 * Guest creation schema
 * POST /api/v1/guests
 */
export const guestCreateSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim()
    .max(100, 'Email cannot exceed 100 characters'),

  fullName: z
    .string({ message: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),

  phone: z
    .string({ message: 'Phone number is required' })
    .trim()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Please provide a valid phone number in E.164 format (e.g., +996700123456)'
    ),

  locale: z.enum(['en', 'fr']).optional().default('en'),

  metadata: metadataSchema.optional(),
});

/**
 * Guest update schema
 * PATCH /api/v1/guests/:sessionId
 */
export const guestUpdateSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim()
    .max(100, 'Email cannot exceed 100 characters')
    .optional(),

  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Please provide a valid phone number in E.164 format'
    )
    .optional(),

  locale: z.enum(['en', 'fr']).optional(),

  metadata: metadataSchema.optional(),
});

/**
 * SessionId parameter schema
 * For route params validation
 */
export const sessionIdParamSchema = z.object({
  sessionId: z
    .string({ message: 'Session ID is required' })
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'Invalid session ID format (must be UUID v4)'
    ),
});

/**
 * Link to user schema (future feature)
 * POST /api/v1/guests/:sessionId/link-user
 */
export const linkUserSchema = z.object({
  userId: z
    .string({ message: 'User ID is required' })
    .regex(
      /^[0-9a-fA-F]{24}$/,
      'Invalid user ID format (must be MongoDB ObjectId)'
    ),
});

/**
 * Extend expiration schema
 * PATCH /api/v1/guests/:sessionId/extend
 */
export const extendExpirationSchema = z.object({
  daysToAdd: z
    .number({ message: 'Days to add is required' })
    .int('Days must be an integer')
    .min(1, 'Must add at least 1 day')
    .max(90, 'Cannot add more than 90 days at once')
    .default(30),
});

// ==================== MIDDLEWARE ====================

/**
 * Validate request body with Zod schema
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
          statusCode: 400,
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  };
};

/**
 * Validate route parameters with Zod schema
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
          error: 'Invalid route parameters',
          statusCode: 400,
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  };
};

/**
 * Combined validation middleware for Guest Create
 */
export const validateGuestCreate = validateBody(guestCreateSchema);

/**
 * Combined validation middleware for Guest Update
 */
export const validateGuestUpdate = validateBody(guestUpdateSchema);

/**
 * Combined validation middleware for SessionId param
 */
export const validateSessionIdParam = validateParams(sessionIdParamSchema);

/**
 * Combined validation middleware for Link User
 */
export const validateLinkUser = validateBody(linkUserSchema);

/**
 * Combined validation middleware for Extend Expiration
 */
export const validateExtendExpiration = validateBody(extendExpirationSchema);

// ==================== TYPE EXPORTS ====================

export type GuestCreateInput = z.infer<typeof guestCreateSchema>;
export type GuestUpdateInput = z.infer<typeof guestUpdateSchema>;
export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;
export type LinkUserInput = z.infer<typeof linkUserSchema>;
export type ExtendExpirationInput = z.infer<typeof extendExpirationSchema>;

/**
 * ✅ Guest Validator Features:
 * - Email validation (format + lowercase)
 * - Phone validation (E.164 international format)
 * - Full name length validation
 * - Locale enum validation (en/fr)
 * - Metadata validation (userAgent, IP, source)
 * - SessionId UUID v4 validation
 * - MongoDB ObjectId validation (for userId)
 * - Expiration extension validation
 * - Consistent error response format
 * - Type-safe schemas with Zod inference
 * - Reusable validation middleware
 */
