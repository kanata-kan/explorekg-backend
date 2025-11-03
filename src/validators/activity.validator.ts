// src/validators/activity.validator.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Activity Validators
 * Using Zod for runtime validation with Express 5 compatibility
 */

// Metadata schema (reusable)
const metadataSchema = z.object({
  title: z
    .string()
    .min(10, 'Metadata title must be at least 10 characters')
    .max(150, 'Metadata title cannot exceed 150 characters'),
  description: z
    .string()
    .min(20, 'Metadata description must be at least 20 characters')
    .max(300, 'Metadata description cannot exceed 300 characters'),
  path: z
    .string()
    .regex(
      /^\/activities\/[\w-]+$/,
      'Path must follow format: /activities/activity-id'
    ),
  image: z.string().url('Metadata image must be a valid URL'),
  alt: z
    .string()
    .min(5, 'Alt text must be at least 5 characters')
    .max(200, 'Alt text cannot exceed 200 characters'),
});

// ==================== CREATE SCHEMA ====================

export const activityCreateSchema = z.object({
  name: z
    .string()
    .min(3, 'Activity name must be at least 3 characters')
    .max(200, 'Activity name cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  coverImage: z
    .string()
    .url('Cover image must be a valid URL')
    .regex(
      /\.(jpg|jpeg|png|webp)$/i,
      'Cover image must be jpg, jpeg, png, or webp'
    ),
  images: z
    .array(
      z
        .string()
        .url('Image must be a valid URL')
        .regex(
          /\.(jpg|jpeg|png|webp)$/i,
          'Image must be jpg, jpeg, png, or webp'
        )
    )
    .optional()
    .default([]),
  duration: z.string().min(1, 'Duration is required').trim(),
  location: z.string().min(1, 'Location is required').trim(),
  groupSize: z.string().min(1, 'Group size is required').trim(),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(100000, 'Price seems unrealistic')
    .optional()
    .default(0),
  metadata: metadataSchema,
  localeGroupId: z
    .string()
    .min(3, 'Locale group ID must be at least 3 characters')
    .max(100, 'Locale group ID cannot exceed 100 characters')
    .trim(),
  locale: z.enum(['en', 'fr']).default('en'),
  status: z
    .enum(['active', 'inactive', 'maintenance'])
    .optional()
    .default('active'),
  availabilityStatus: z
    .enum(['available', 'unavailable'])
    .optional()
    .default('available'),
  tags: z.array(z.string()).optional().default([]),
  packIds: z.array(z.string()).optional().default([]),
});

// ==================== UPDATE SCHEMA ====================

export const activityUpdateSchema = z.object({
  name: z
    .string()
    .min(3, 'Activity name must be at least 3 characters')
    .max(200, 'Activity name cannot exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim()
    .optional(),
  coverImage: z
    .string()
    .url('Cover image must be a valid URL')
    .regex(
      /\.(jpg|jpeg|png|webp)$/i,
      'Cover image must be jpg, jpeg, png, or webp'
    )
    .optional(),
  images: z
    .array(
      z
        .string()
        .url('Image must be a valid URL')
        .regex(
          /\.(jpg|jpeg|png|webp)$/i,
          'Image must be jpg, jpeg, png, or webp'
        )
    )
    .optional(),
  duration: z.string().min(1, 'Duration cannot be empty').trim().optional(),
  location: z.string().min(1, 'Location cannot be empty').trim().optional(),
  groupSize: z.string().min(1, 'Group size cannot be empty').trim().optional(),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(100000, 'Price seems unrealistic')
    .optional(),
  metadata: metadataSchema.partial().optional(),
  localeGroupId: z
    .string()
    .min(3, 'Locale group ID must be at least 3 characters')
    .max(100, 'Locale group ID cannot exceed 100 characters')
    .trim()
    .optional(),
  locale: z.enum(['en', 'fr']).optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),
  availabilityStatus: z.enum(['available', 'unavailable']).optional(),
  tags: z.array(z.string()).optional(),
  packIds: z.array(z.string()).optional(),
});

// ==================== QUERY SCHEMA ====================

export const activityQuerySchema = z.object({
  // Locale filter
  locale: z.enum(['en', 'fr']).optional(),

  // Status filter
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),

  // Availability filter
  availabilityStatus: z.enum(['available', 'unavailable']).optional(),

  // Text search
  q: z.string().optional(),

  // Price filters
  minPrice: z.coerce.number().min(0, 'Min price cannot be negative').optional(),
  maxPrice: z.coerce.number().min(0, 'Max price cannot be negative').optional(),

  // Location filter
  location: z.string().optional(),

  // Free activities filter
  isFree: z
    .string()
    .transform(val => val === 'true')
    .optional(),

  // Pagination
  page: z.coerce
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),

  // Sorting
  sort: z
    .string()
    .regex(/^-?(name|price|createdAt|updatedAt)$/, 'Invalid sort field')
    .optional()
    .default('-createdAt'),
});

// ==================== MIDDLEWARE FUNCTIONS ====================

/**
 * Validate activity creation data
 * Express 5 compatible - uses (req as any).validatedBody
 */
export const validateActivityCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = activityCreateSchema.parse(req.body);
    (req as any).validatedBody = validated;
    next();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    next(error);
  }
};

/**
 * Validate activity update data
 * Express 5 compatible - uses (req as any).validatedBody
 */
export const validateActivityUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = activityUpdateSchema.parse(req.body);
    (req as any).validatedBody = validated;
    next();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    next(error);
  }
};

/**
 * Validate query parameters
 * Express 5 compatible - uses (req as any).validatedQuery
 */
export const validateActivityQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = activityQuerySchema.parse(req.query);
    (req as any).validatedQuery = validated;
    next();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    next(error);
  }
};

// ==================== TYPE EXPORTS ====================

export type ActivityCreateInput = z.infer<typeof activityCreateSchema>;
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;

// ✅ Activity Validators ready with Express 5 compatibility and comprehensive validation rules
