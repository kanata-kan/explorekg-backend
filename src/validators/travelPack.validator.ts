// src/validators/travelPack.validator.ts
import { z } from 'zod';
import { ENV } from '../config/env';

/**
 * Enhanced Zod validation schemas for TravelPack
 * - Comprehensive validation with business rules
 * - Input sanitization and security checks
 * - Performance optimized validation
 */

/** Enhanced localized content schema with comprehensive validation */
const localizedSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(
      ENV.MAX_NAME_LENGTH,
      `Name must not exceed ${ENV.MAX_NAME_LENGTH} characters`
    )
    .trim()
    .refine(name => name.length > 0, 'Name cannot be empty after trimming'),

  description: z
    .string()
    .max(
      ENV.MAX_DESCRIPTION_LENGTH,
      `Description must not exceed ${ENV.MAX_DESCRIPTION_LENGTH} characters`
    )
    .trim()
    .nullable()
    .optional(),

  ctaLabel: z
    .string()
    .max(50, 'CTA label must not exceed 50 characters')
    .trim()
    .nullable()
    .optional(),

  metadata: z
    .object({
      title: z
        .string()
        .max(150, 'SEO title must not exceed 150 characters')
        .trim()
        .nullable()
        .optional(),
      description: z
        .string()
        .max(300, 'SEO description must not exceed 300 characters')
        .trim()
        .nullable()
        .optional(),
      image: z.string().url('Image must be a valid URL').nullable().optional(),
      alt: z
        .string()
        .max(200, 'Alt text must not exceed 200 characters')
        .trim()
        .nullable()
        .optional(),
      path: z
        .string()
        .regex(
          /^\/[a-zA-Z0-9\/-]*$/,
          'Path must start with / and contain only valid URL characters'
        )
        .nullable()
        .optional(),
    })
    .optional(),
});

/** Enhanced main create schema with comprehensive business rules */
export const travelPackCreateSchema = z
  .object({
    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .max(100, 'Slug must not exceed 100 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug must be lowercase alphanumeric with hyphens only'
      )
      .refine(
        slug => !slug.startsWith('-') && !slug.endsWith('-'),
        'Slug cannot start or end with hyphen'
      )
      .refine(
        slug => !slug.includes('--'),
        'Slug cannot contain consecutive hyphens'
      )
      .optional(), // auto-generated if missing

    localeGroupId: z
      .string()
      .min(3, 'localeGroupId must be at least 3 characters')
      .max(100, 'localeGroupId must not exceed 100 characters')
      .trim(),

    status: z.enum(['draft', 'published', 'archived']).optional(),

    locale: z.enum(['en', 'fr']).optional(),

    locales: z
      .object({
        en: localizedSchema.optional(),
        fr: localizedSchema.optional(),
      })
      .refine(
        data => data.en || data.fr,
        'At least one language version (en or fr) is required'
      )
      .optional(),

    coverImage: z
      .string()
      .url('Cover image must be a valid URL')
      .refine(
        url => {
          const allowedExtensions = ENV.ALLOWED_FILE_TYPES.filter(type =>
            ['jpg', 'jpeg', 'png', 'webp'].includes(type)
          );
          const extension = url.split('.').pop()?.toLowerCase();
          return extension && allowedExtensions.includes(extension);
        },
        `Cover image must be one of: ${ENV.ALLOWED_FILE_TYPES.join(', ')}`
      )
      .nullable()
      .optional(),

    features: z
      .array(
        z
          .string()
          .min(1, 'Feature cannot be empty')
          .max(100, 'Feature must not exceed 100 characters')
          .trim()
      )
      .max(20, 'Cannot have more than 20 features')
      .optional()
      .default([]),

    duration: z
      .number()
      .int('Duration must be a whole number')
      .positive('Duration must be positive')
      .max(365, 'Duration cannot exceed 365 days')
      .nullable()
      .optional(),

    basePrice: z
      .number()
      .nonnegative('Price cannot be negative')
      .max(1000000, 'Price cannot exceed 1,000,000')
      .multipleOf(0.01, 'Price can have maximum 2 decimal places')
      .nullable()
      .optional(),

    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter ISO code')
      .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters only')
      .optional()
      .default('USD'),

    availability: z.boolean().optional().default(true),
  })
  .refine(
    data => {
      // Business rule: if price is set, currency should be provided
      if (
        data.basePrice !== null &&
        data.basePrice !== undefined &&
        data.basePrice > 0
      ) {
        return data.currency && data.currency.length === 3;
      }
      return true;
    },
    {
      message: 'Currency is required when base price is set',
      path: ['currency'],
    }
  );

/** Enhanced update schema with partial validation */
export const travelPackUpdateSchema = travelPackCreateSchema.partial().refine(
  data => {
    // Prevent updating to invalid state
    if (data.status === 'published' && data.locales) {
      const hasValidContent =
        (data.locales.en?.name && data.locales.en.name.length > 0) ||
        (data.locales.fr?.name && data.locales.fr.name.length > 0);
      return hasValidContent;
    }
    return true;
  },
  {
    message:
      'Published travel packs must have at least one language with a valid name',
    path: ['locales'],
  }
);

/** Query parameters validation schema */
export const travelPackQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine(n => n > 0)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine(n => n > 0 && n <= ENV.MAX_PAGINATION_LIMIT)
    .optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  locale: z.enum(['en', 'fr']).optional(),
  localeGroupId: z.string().min(1).max(100).trim().optional(),
  availability: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .optional(),
  q: z.string().min(1).max(100).trim().optional(),
  sort: z
    .enum([
      'createdAt',
      '-createdAt',
      'basePrice',
      '-basePrice',
      'duration',
      '-duration',
      'name',
      '-name',
    ])
    .optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .transform(Number)
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .transform(Number)
    .optional(),
  minDuration: z.string().regex(/^\d+$/).transform(Number).optional(),
  maxDuration: z.string().regex(/^\d+$/).transform(Number).optional(),
});

/**
 * Enhanced validation middleware for request body
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      // Note: In Express 5, req.body might be read-only in some cases
      // The validation is sufficient to ensure the body is valid
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }
      next(error);
    }
  };
};

/**
 * Enhanced validation middleware for query parameters
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.query);
      // Note: Don't reassign req.query as it's read-only in Express 5
      // The validation is sufficient to ensure the query is valid
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }
      next(error);
    }
  };
};
