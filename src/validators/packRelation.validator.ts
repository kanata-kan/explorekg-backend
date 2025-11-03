// src/validators/packRelation.validator.ts
import { z } from 'zod';

/**
 * Zod validation schemas for PackRelation endpoints
 */

/**
 * Activity relation entry schema
 */
const activityRelationSchema = z.object({
  localeGroupId: z
    .string()
    .min(3, 'Activity localeGroupId must be at least 3 characters')
    .max(100, 'Activity localeGroupId must not exceed 100 characters')
    .trim(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .default(1),
  optional: z.boolean().default(false),
  discount: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .default(0),
});

/**
 * Car relation entry schema
 */
const carRelationSchema = z.object({
  localeGroupId: z
    .string()
    .min(3, 'Car localeGroupId must be at least 3 characters')
    .max(100, 'Car localeGroupId must not exceed 100 characters')
    .trim(),
  durationDays: z
    .number()
    .int('Duration must be an integer')
    .min(1, 'Duration must be at least 1 day')
    .optional(),
  optional: z.boolean().default(false),
  discount: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .default(0),
});

/**
 * Pricing configuration schema
 */
const pricingSchema = z
  .object({
    strategy: z.enum(['sum', 'custom']).default('sum'),
    customPrice: z
      .number()
      .min(0, 'Custom price cannot be negative')
      .optional(),
    globalDiscount: z
      .number()
      .min(0, 'Global discount cannot be negative')
      .max(100, 'Global discount cannot exceed 100%')
      .default(0),
  })
  .refine(
    data => {
      // If strategy is 'custom', customPrice must be provided
      if (data.strategy === 'custom') {
        return data.customPrice !== undefined;
      }
      return true;
    },
    {
      message: 'customPrice is required when strategy is "custom"',
      path: ['customPrice'],
    }
  );

/**
 * Settings schema
 */
const settingsSchema = z
  .object({
    allowCustomization: z.boolean().default(false),
    minActivities: z
      .number()
      .int('Minimum activities must be an integer')
      .min(0, 'Minimum activities cannot be negative')
      .optional(),
    maxActivities: z
      .number()
      .int('Maximum activities must be an integer')
      .min(0, 'Maximum activities cannot be negative')
      .optional(),
  })
  .refine(
    data => {
      // If both min and max are set, min must be <= max
      if (
        data.minActivities !== undefined &&
        data.maxActivities !== undefined
      ) {
        return data.minActivities <= data.maxActivities;
      }
      return true;
    },
    {
      message: 'minActivities cannot be greater than maxActivities',
      path: ['minActivities'],
    }
  );

/**
 * Create PackRelation schema
 */
export const packRelationCreateSchema = z.object({
  travelPackLocaleGroupId: z
    .string()
    .min(3, 'travelPackLocaleGroupId must be at least 3 characters')
    .max(100, 'travelPackLocaleGroupId must not exceed 100 characters')
    .trim(),
  relations: z.object({
    activities: z.array(activityRelationSchema).default([]),
    cars: z.array(carRelationSchema).default([]),
  }),
  pricing: pricingSchema,
  settings: settingsSchema.default({
    allowCustomization: false,
  }),
});

/**
 * Update PackRelation schema (partial)
 */
export const packRelationUpdateSchema = packRelationCreateSchema
  .omit({ travelPackLocaleGroupId: true })
  .partial();

/**
 * Calculate price payload schema
 */
export const calculatePriceSchema = z.object({
  travelPackLocaleGroupId: z
    .string()
    .min(3, 'travelPackLocaleGroupId must be at least 3 characters')
    .max(100, 'travelPackLocaleGroupId must not exceed 100 characters')
    .trim(),
  selectedActivities: z
    .array(
      z
        .string()
        .min(3, 'Activity localeGroupId must be at least 3 characters')
        .trim()
    )
    .default([]),
  selectedCar: z
    .string()
    .min(3, 'Car localeGroupId must be at least 3 characters')
    .trim()
    .nullable()
    .optional(),
  carDurationDays: z
    .number()
    .int('Car duration must be an integer')
    .min(1, 'Car duration must be at least 1 day')
    .nullable()
    .optional(),
  locale: z.enum(['en', 'fr']).default('en'),
});

/**
 * Query parameters for GET /travel-packs/:id/detailed
 */
export const detailedPackQuerySchema = z.object({
  step: z.enum(['overview', 'activities', 'cars', 'full']).default('full'),
  locale: z.enum(['en', 'fr']).default('en'),
});
