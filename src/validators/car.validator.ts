// src/validators/car.validator.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';

/**
 * Zod validation schemas for Car API
 * Compatible with Express 5 read-only req.query/req.body
 */

/** Pricing schema */
const pricingSchema = z.object({
  amount: z
    .number()
    .nonnegative('Price cannot be negative')
    .max(10000, 'Price cannot exceed 10,000 per unit')
    .multipleOf(0.01, 'Price can have maximum 2 decimal places'),
  currency: z.enum(['USD', 'EUR', 'KGS']).default('USD'),
  unit: z
    .enum(['day', 'jour', 'hour', 'heure', 'week', 'semaine'])
    .default('day'),
});

/** Vehicle specifications schema */
const specsSchema = z.object({
  seats: z.string().min(1, 'Seats information is required'),
  transmission: z.enum(['Automatic', 'Manual', 'Automatique', 'Manuelle']),
  drive: z.string().min(1, 'Drive type is required'),
  luggage: z.string().min(1, 'Luggage capacity is required'),
  fuel: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Essence']),
});

/** SEO metadata schema */
const metadataSchema = z.object({
  title: z
    .string()
    .min(10, 'Metadata title must be at least 10 characters')
    .max(150, 'Metadata title must not exceed 150 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Metadata description must be at least 20 characters')
    .max(300, 'Metadata description must not exceed 300 characters')
    .trim(),
  path: z
    .string()
    .regex(/^\/cars\/[a-zA-Z0-9-]+$/, 'Path must follow format /cars/car-id'),
  image: z.string().url('Metadata image must be a valid URL'),
  alt: z
    .string()
    .min(5, 'Alt text must be at least 5 characters')
    .max(200, 'Alt text must not exceed 200 characters')
    .trim(),
});

/** Create car schema */
export const carCreateSchema = z.object({
  name: z
    .string()
    .min(3, 'Car name must be at least 3 characters')
    .max(200, 'Car name must not exceed 200 characters')
    .trim(),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),

  coverImage: z
    .string()
    .url('Cover image must be a valid URL')
    .refine(url => {
      const extension = url.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
    }, 'Cover image must be jpg, jpeg, png, or webp'),

  pricing: pricingSchema,

  specs: specsSchema,

  metadata: metadataSchema,

  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .optional()
    .default([]),

  tags: z
    .array(
      z
        .string()
        .min(2, 'Tag must be at least 2 characters')
        .max(50, 'Tag must not exceed 50 characters')
    )
    .max(20, 'Cannot have more than 20 tags')
    .optional()
    .default([]),

  localeGroupId: z
    .string()
    .min(3, 'Locale group ID must be at least 3 characters')
    .max(100, 'Locale group ID cannot exceed 100 characters')
    .trim(),

  locale: z.enum(['en', 'fr']),

  status: z
    .enum(['active', 'inactive', 'maintenance'])
    .optional()
    .default('active'),

  availabilityStatus: z
    .enum(['available', 'reserved', 'unavailable'])
    .optional()
    .default('available'),

  packIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'))
    .optional()
    .default([]),
});

/** Update car schema (all fields optional) */
export const carUpdateSchema = z.object({
  name: z
    .string()
    .min(3, 'Car name must be at least 3 characters')
    .max(200, 'Car name must not exceed 200 characters')
    .trim()
    .optional(),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional(),

  coverImage: z
    .string()
    .url('Cover image must be a valid URL')
    .refine(url => {
      const extension = url.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
    }, 'Cover image must be jpg, jpeg, png, or webp')
    .optional(),

  pricing: pricingSchema.partial().optional(),

  specs: specsSchema.partial().optional(),

  metadata: metadataSchema.partial().optional(),

  images: z.array(z.string().url('Each image must be a valid URL')).optional(),

  tags: z
    .array(
      z
        .string()
        .min(2, 'Tag must be at least 2 characters')
        .max(50, 'Tag must not exceed 50 characters')
    )
    .max(20, 'Cannot have more than 20 tags')
    .optional(),

  localeGroupId: z
    .string()
    .min(3, 'Locale group ID must be at least 3 characters')
    .max(100, 'Locale group ID cannot exceed 100 characters')
    .trim()
    .optional(),

  locale: z.enum(['en', 'fr']).optional(),

  status: z.enum(['active', 'inactive', 'maintenance']).optional(),

  availabilityStatus: z
    .enum(['available', 'reserved', 'unavailable'])
    .optional(),

  packIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'))
    .optional(),
});

/** Query parameters schema for filtering */
export const carQuerySchema = z.object({
  locale: z.enum(['en', 'fr']).optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),
  availabilityStatus: z
    .enum(['available', 'reserved', 'unavailable'])
    .optional(),
  q: z.string().max(200, 'Search query too long').trim().optional(),
  minPrice: z.coerce
    .number()
    .nonnegative('Min price must be non-negative')
    .optional(),
  maxPrice: z.coerce
    .number()
    .nonnegative('Max price must be non-negative')
    .optional(),
  transmission: z
    .enum(['Automatic', 'Manual', 'Automatique', 'Manuelle'])
    .optional(),
  fuel: z
    .enum(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Essence'])
    .optional(),
  drive: z.string().optional(),
  seats: z.string().optional(),
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .positive('Page must be positive')
    .max(1000, 'Page number too large')
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(
      ENV.MAX_PAGINATION_LIMIT,
      `Limit cannot exceed ${ENV.MAX_PAGINATION_LIMIT}`
    )
    .optional()
    .default(20),
  sort: z
    .enum([
      'createdAt',
      '-createdAt',
      'pricing.amount',
      '-pricing.amount',
      'name',
      '-name',
    ])
    .optional()
    .default('-createdAt'),
});

/**
 * Middleware: Validate car creation data
 * Express 5 compatible - does not modify read-only req.body
 */
export const validateCarCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse and validate body
    const validatedBody = carCreateSchema.parse(req.body);

    // Store validated data in a new property
    (req as any).validatedBody = validatedBody;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        statusCode: 400,
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
        timestamp: new Date().toISOString(),
      });
    }
    next(error);
  }
};

/**
 * Middleware: Validate car update data
 * Express 5 compatible
 */
export const validateCarUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse and validate body
    const validatedBody = carUpdateSchema.parse(req.body);

    // Store validated data
    (req as any).validatedBody = validatedBody;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        statusCode: 400,
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
        timestamp: new Date().toISOString(),
      });
    }
    next(error);
  }
};

/**
 * Middleware: Validate query parameters
 * Express 5 compatible - does not modify read-only req.query
 */
export const validateCarQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse and validate query
    const validatedQuery = carQuerySchema.parse(req.query);

    // Store validated data
    (req as any).validatedQuery = validatedQuery;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        statusCode: 400,
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
        timestamp: new Date().toISOString(),
      });
    }
    next(error);
  }
};
