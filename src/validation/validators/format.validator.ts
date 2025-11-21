// src/validation/validators/format.validator.ts

/**
 * Format Validator
 * 
 * Validates data format using existing Zod schemas.
 * Reuses booking.validator.ts schemas for consistency.
 * 
 * This validator is PURE - no side effects, no DB queries, no business logic.
 * Only format-level checks (types, formats, ranges).
 * 
 * @module validation/validators
 */

import { z } from 'zod';
import { bookingCreateSchema } from '../../validators/booking.validator';
import { BookingItemType } from '../../models/booking.model';
import type { ValidationRequest } from '../services/validation.service';

/**
 * Format validation result
 */
export interface FormatValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    code: string;        // ALWAYS "INVALID_FORMAT"
    message: string;     // Zod message
    severity: 'error';
  }>;
}

/**
 * Field-specific Zod schemas for individual field validation
 */
const fieldSchemas: Record<string, z.ZodSchema> = {
  guestId: z
    .string({
      message: 'Guest ID is required',
    })
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Invalid Guest ID format. Must be MongoDB ObjectId (24 hex).',
    })
    .optional(), // Make guestId optional for early booking stages

  itemType: z.enum(
    [BookingItemType.TRAVEL_PACK, BookingItemType.ACTIVITY, BookingItemType.CAR],
    {
      message: 'Invalid booking item type. Must be travel_pack, activity, or car',
    }
  ),

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
    .refine((val) => {
      // Accept both ISO date (YYYY-MM-DD) and ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
      const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
      const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return isoDatePattern.test(val) || isoDateTimePattern.test(val);
    }, {
      message: 'Start date must be a valid ISO date (YYYY-MM-DD) or ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)',
    })
    .refine((val) => {
      // Validate that it's a valid date
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'Start date must be a valid date',
    })
    .optional(),

  endDate: z
    .string({
      message: 'End date must be a string',
    })
    .refine((val) => {
      // Accept both ISO date (YYYY-MM-DD) and ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
      const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
      const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return isoDatePattern.test(val) || isoDateTimePattern.test(val);
    }, {
      message: 'End date must be a valid ISO date (YYYY-MM-DD) or ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)',
    })
    .refine((val) => {
      // Validate that it's a valid date
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'End date must be a valid date',
    })
    .optional(),

  locale: z
    .enum(['en', 'fr'], {
      message: 'Locale must be either "en" or "fr"',
    })
    .optional(),
};

/**
 * Format Validator Class
 * 
 * Provides format validation using Zod schemas.
 * Pure validation - no side effects.
 */
export class FormatValidator {
  /**
   * Convert Zod error to FormatValidationResult error
   */
  private static convertZodError(issue: z.ZodIssue): {
    field: string;
    code: string;
    message: string;
    severity: 'error';
  } {
    return {
      field: issue.path.join('.') || 'unknown',
      code: 'INVALID_FORMAT',
      message: issue.message,
      severity: 'error',
    };
  }

  /**
   * Validate full payload using bookingCreateSchema (with all fields optional)
   * 
   * @param data - Complete validation request data
   * @returns Format validation result
   */
  static validateFullPayload(
    data: Partial<ValidationRequest>
  ): FormatValidationResult {
    try {
      // Use partial version of bookingCreateSchema for validation
      // This allows validation of partial data (e.g., without guestId in early stages)
      // Note: This will also run refinements (business rules), but we only
      // care about format errors here. Refinements that fail will be caught
      // as format errors in the context of format validation.
      const partialSchema = bookingCreateSchema.partial();
      partialSchema.parse(data);

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => this.convertZodError(issue));

        return {
          isValid: false,
          errors,
        };
      }

      // Unexpected error - return generic format error
      return {
        isValid: false,
        errors: [
          {
            field: 'unknown',
            code: 'INVALID_FORMAT',
            message: 'Format validation failed',
            severity: 'error',
          },
        ],
      };
    }
  }

  /**
   * Validate a single field
   * 
   * @param field - Field name
   * @param value - Field value
   * @returns Format validation result
   */
  static validateField(
    field: string,
    value: any
  ): FormatValidationResult {
    // Get field schema
    const fieldSchema = fieldSchemas[field];

    // If no schema exists for this field, skip validation (return valid)
    if (!fieldSchema) {
      return {
        isValid: true,
        errors: [],
      };
    }

    try {
      // Validate field value
      fieldSchema.parse(value);

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => this.convertZodError(issue));

        return {
          isValid: false,
          errors,
        };
      }

      // Unexpected error
      return {
        isValid: false,
        errors: [
          {
            field,
            code: 'INVALID_FORMAT',
            message: 'Format validation failed',
            severity: 'error',
          },
        ],
      };
    }
  }
}

/**
 * Legacy function export for backward compatibility
 * 
 * @deprecated Use FormatValidator.validateFullPayload() instead
 */
export const validateFormat = async (
  data: Partial<ValidationRequest>
): Promise<FormatValidationResult> => {
  return FormatValidator.validateFullPayload(data);
};

