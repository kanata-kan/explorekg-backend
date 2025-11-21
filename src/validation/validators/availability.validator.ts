// src/validation/validators/availability.validator.ts

/**
 * Availability Validator
 * 
 * Validates availability in three areas:
 * A) Item-level availability (NOT dates)
 * B) Date format + range basics
 * C) Optimistic date availability check
 * 
 * This is the most sensitive part of real-time validation.
 * 
 * @module validation/validators
 */

import { AvailabilityService } from '../../services/availability.service';
import { AvailabilityPolicy } from '../../policies/catalog/availability.policy';
import { DateValidationService } from '../../services/dateValidation.service';
import { BookingItemType } from '../../models/booking.model';
import TravelPack from '../../models/travelPack.model';
import { Activity } from '../../models/activity.model';
import { Car } from '../../models/car.model';
import { excludeDeleted, isDeleted } from '../../utils/softDelete.util';
import { CacheService, CacheKeys } from '../services/cache.service';
import type { ValidationRequest } from '../services/validation.service';
import mongoose from 'mongoose';

/**
 * Availability validation result
 */
export interface AvailabilityValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning';
    details?: Record<string, any>;
  }>;
  warnings?: Array<{
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning';
    details?: Record<string, any>;
  }>;
  suggestions?: Array<{
    type: string;
    field: string;
    options: Array<Record<string, any>>;
  }>;
  cacheHits?: string[]; // Track which validations used cache
}

/**
 * Timeout for date availability check (150ms)
 */
const DATE_AVAILABILITY_TIMEOUT_MS = 150;

/**
 * Fetch item by type and ID (read-only, no side effects)
 * Supports both MongoDB ObjectId and localeGroupId (slug) for travel packs
 * 
 * @param itemType - Type of item
 * @param itemId - Item ID (can be MongoDB ObjectId or localeGroupId for travel packs)
 * @param locale - Optional locale for travel pack lookup (defaults to 'en')
 * @returns Item object or null if not found
 */
async function fetchItem(
  itemType: BookingItemType | string,
  itemId: string,
  locale: 'en' | 'fr' = 'en'
): Promise<any> {
  switch (itemType) {
    case BookingItemType.TRAVEL_PACK:
    case 'travel_pack':
      // Check if itemId is MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(itemId)) {
        // Try ObjectId lookup first (faster)
        const docById = await TravelPack.findOne(excludeDeleted({ _id: itemId }));
        if (docById) return docById;
      }
      
      // Fallback to localeGroupId lookup (slug)
      // Find travel pack by localeGroupId and locale
      const docByLocaleGroupId = await TravelPack.findOne(
        excludeDeleted({
          localeGroupId: itemId,
          locale: locale, // Use provided locale or default to 'en'
        })
      );
      
      // If not found with locale, try to find any locale version
      if (!docByLocaleGroupId) {
        const docAnyLocale = await TravelPack.findOne(
          excludeDeleted({ localeGroupId: itemId })
        );
        return docAnyLocale;
      }
      
      return docByLocaleGroupId;

    case BookingItemType.ACTIVITY:
    case 'activity':
      // Check if itemId is MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(itemId)) {
        return await Activity.findOne(excludeDeleted({ _id: itemId }));
      }
      
      // Fallback to localeGroupId lookup for activities
      const activityByLocaleGroupId = await Activity.findOne(
        excludeDeleted({ localeGroupId: itemId })
      );
      return activityByLocaleGroupId;

    case BookingItemType.CAR:
    case 'car':
      // Check if itemId is MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(itemId)) {
        return await Car.findOne(excludeDeleted({ _id: itemId }));
      }
      
      // Fallback to localeGroupId lookup for cars
      const carByLocaleGroupId = await Car.findOne(
        excludeDeleted({ localeGroupId: itemId })
      );
      return carByLocaleGroupId;

    default:
      return null;
  }
}

/**
 * Promise with timeout wrapper
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Availability Validator Class
 * 
 * Provides availability validation with optimistic mode fallback.
 */
export class AvailabilityValidator {
  /**
   * A) Validate item-level availability (NOT dates)
   * 
   * Uses:
   * - AvailabilityPolicy.isItemAvailable() (cached, TTL: 2 min)
   * - AvailabilityPolicy.getAvailabilityStatus()
   * 
   * Note: Item availability status is cached, but NOT date availability.
   * 
   * @param data - Validation request data
   * @returns Validation result for item availability
   */
  static async validateItemAvailability(
    data: Partial<ValidationRequest>
  ): Promise<AvailabilityValidationResult> {
    const errors: Array<{
      field: string;
      code: string;
      message: string;
      severity: 'error' | 'warning';
      details?: Record<string, any>;
    }> = [];
    const cacheHits: string[] = [];

    // Skip if itemType or itemId not provided
    if (!data.itemType || !data.itemId) {
      return {
        isValid: true,
        errors: [],
        cacheHits: [],
      };
    }

    try {
      // Check cache for item availability status (TTL: 2 min)
      const itemAvailableKey = CacheKeys.itemAvailable(data.itemType, data.itemId);
      let itemAvailable = CacheService.get<boolean>(itemAvailableKey);
      let cacheHit = false;

      if (itemAvailable !== null) {
        cacheHit = true;
        cacheHits.push('item.available');
        
        // If cached as unavailable, return error immediately
        if (itemAvailable === false) {
          errors.push({
            field: 'itemId',
            code: 'ITEM_UNAVAILABLE',
            message: `This ${data.itemType} is not available for booking`,
            severity: 'error',
          });

          return {
            isValid: false,
            errors,
            cacheHits,
          };
        }
      }

      // Cache miss - fetch item from DB
      if (!cacheHit) {
        // Use locale from data or default to 'en'
        const locale = data.locale || 'en';
        const item = await fetchItem(data.itemType, data.itemId, locale);

        // Check item existence
        if (!item) {
          errors.push({
            field: 'itemId',
            code: 'ITEM_NOT_FOUND',
            message: `${data.itemType} with ID "${data.itemId}" not found`,
            severity: 'error',
          });

          return {
            isValid: false,
            errors,
            cacheHits,
          };
        }

        // Check if item is deleted
        if (isDeleted(item)) {
          // Cache as not available (TTL: 2 min)
          CacheService.set(itemAvailableKey, false, 120);
          
          errors.push({
            field: 'itemId',
            code: 'ITEM_NOT_FOUND',
            message: `${data.itemType} with ID "${data.itemId}" not found`,
            severity: 'error',
          });

          return {
            isValid: false,
            errors,
            cacheHits,
          };
        }

        // Check item availability using AvailabilityPolicy
        const itemTypeEnum = data.itemType as BookingItemType;
        const isAvailable = AvailabilityPolicy.isItemAvailable(item, itemTypeEnum);

        // Cache availability status (TTL: 2 min)
        CacheService.set(itemAvailableKey, isAvailable, 120);

        if (!isAvailable) {
          const itemTypeEnum = data.itemType as BookingItemType;
          const status = AvailabilityPolicy.getAvailabilityStatus(item, itemTypeEnum);
          errors.push({
            field: 'itemId',
            code: 'ITEM_UNAVAILABLE',
            message: `This ${data.itemType} is not available for booking (status: ${status})`,
            severity: 'error',
            details: { status },
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        cacheHits,
      };
    } catch (error: any) {
      errors.push({
        field: 'itemId',
        code: 'ITEM_NOT_FOUND',
        message: `Error checking ${data.itemType}: ${error.message}`,
        severity: 'error',
      });

      return {
        isValid: false,
        errors,
        cacheHits,
      };
    }
  }

  /**
   * B) Validate date format + range basics
   * 
   * Only handles NEW rules specific to availability context:
   * - startDate < endDate
   * - startDate >= today
   * 
   * Note: Full date format validation is handled in Phase 2 (Format Validator)
   * Note: Full business date rules are handled in Phase 3 (Business Validator)
   * 
   * Note: This validation does NOT use cache (pure date calculations).
   * 
   * @param data - Validation request data
   * @returns Validation result for date basics
   */
  static validateDateBasics(
    data: Partial<ValidationRequest>
  ): AvailabilityValidationResult {
    const errors: Array<{
      field: string;
      code: string;
      message: string;
      severity: 'error' | 'warning';
      details?: Record<string, any>;
    }> = [];

    // Skip if dates not provided
    if (!data.startDate || !data.endDate) {
      return {
        isValid: true,
        errors: [],
        cacheHits: [], // No cache used for date calculations
      };
    }

    try {
      // Parse dates (they come as strings from API)
      const startDate = typeof data.startDate === 'string' 
        ? new Date(data.startDate) 
        : data.startDate;
      const endDate = typeof data.endDate === 'string' 
        ? new Date(data.endDate) 
        : data.endDate;

      // Check: startDate < endDate
      if (startDate >= endDate) {
        errors.push({
          field: 'dates',
          code: 'INVALID_DATE_RANGE',
          message: 'Start date must be before end date',
          severity: 'error',
        });
      }

      // Check: startDate >= today (allow today)
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const startDateNormalized = new Date(startDate);
      startDateNormalized.setHours(0, 0, 0, 0);

      if (startDateNormalized < now) {
        errors.push({
          field: 'dates',
          code: 'PAST_DATE',
          message: 'Start date must be today or in the future',
          severity: 'error',
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        cacheHits: [], // No cache used for date calculations
      };
    } catch (error: any) {
      errors.push({
        field: 'dates',
        code: 'INVALID_DATE_RANGE',
        message: `Invalid date format: ${error.message}`,
        severity: 'error',
      });

      return {
        isValid: false,
        errors,
        cacheHits: [], // No cache used for date calculations
      };
    }
  }

  /**
   * C) Optimistic Date Availability Check
   * 
   * Real-time validation must:
   * 1) Try real availability check (with timeout)
   * 2) If slow (> 150ms), fallback to OPTIMISTIC_AVAILABILITY
   * 3) If overlaps found → return DATES_OVERLAP error
   * 4) NEVER cache date availability (volatile and unsafe)
   * 
   * IMPORTANT: This method does NOT cache date availability checks.
   * Date availability is too volatile and must be checked fresh each time.
   * 
   * @param data - Validation request data
   * @returns Validation result for date availability
   */
  static async validateDateAvailability(
    data: Partial<ValidationRequest>
  ): Promise<AvailabilityValidationResult> {
    const errors: Array<{
      field: string;
      code: string;
      message: string;
      severity: 'error' | 'warning';
      details?: Record<string, any>;
    }> = [];
    const warnings: Array<{
      field: string;
      code: string;
      message: string;
      severity: 'error' | 'warning';
      details?: Record<string, any>;
    }> = [];
    const suggestions: Array<{
      type: string;
      field: string;
      options: Array<Record<string, any>>;
    }> = [];

    // Skip if dates or item info not provided
    if (!data.startDate || !data.endDate || !data.itemType || !data.itemId) {
      return {
        isValid: true,
        errors: [],
        cacheHits: [], // No cache used for date availability
      };
    }

    try {
      // Parse dates
      const startDate = typeof data.startDate === 'string' 
        ? new Date(data.startDate) 
        : data.startDate;
      const endDate = typeof data.endDate === 'string' 
        ? new Date(data.endDate) 
        : data.endDate;

      // Try real availability check with timeout
      const checkStartTime = Date.now();
      
      try {
        // Wrap check in timeout (150ms)
        const itemTypeEnum = data.itemType as BookingItemType;
        const hasOverlap = await withTimeout(
          AvailabilityService.checkOverlappingBookings(
            itemTypeEnum,
            data.itemId,
            startDate,
            endDate
            // NO session parameter - no transactions in real-time validation
          ),
          DATE_AVAILABILITY_TIMEOUT_MS
        );

        const checkDuration = Date.now() - checkStartTime;

        // If query was slow but completed, still return optimistic warning
        if (checkDuration > DATE_AVAILABILITY_TIMEOUT_MS) {
          warnings.push({
            field: 'dates',
            code: 'OPTIMISTIC_AVAILABILITY',
            message: 'Availability check took longer than expected. Final confirmation required at booking time.',
            severity: 'warning',
          });
        }

        // If overlaps found, return error
        if (hasOverlap) {
          // Try to get conflicting bookings details (non-blocking)
          try {
            const itemTypeEnum = data.itemType as BookingItemType;
            const conflictingBookings = await AvailabilityService.getOverlappingBookings(
              itemTypeEnum,
              data.itemId,
              startDate,
              endDate
            );

            const conflictingDetails = await Promise.all(
              conflictingBookings.slice(0, 3).map(async (booking) => ({
                bookingNumber: booking.bookingNumber,
                startDate: booking.startDate,
                endDate: booking.endDate,
              }))
            );

            errors.push({
              field: 'dates',
              code: 'DATES_OVERLAP',
              message: 'Selected dates overlap with existing bookings',
              severity: 'error',
              details: {
                conflictingBookings: conflictingDetails,
              },
            });

            // Try to get alternative dates (if performance allows)
            if (data.numberOfDays) {
              try {
                const itemTypeEnum = data.itemType as BookingItemType;
                const alternativeDates = await AvailabilityService.suggestAlternativeDates(
                  itemTypeEnum,
                  data.itemId,
                  startDate,
                  data.numberOfDays,
                  30 // Look ahead 30 days
                );

                if (alternativeDates.length > 0) {
                  suggestions.push({
                    type: 'alternative_dates',
                    field: 'dates',
                    options: alternativeDates.map(alt => ({
                      startDate: alt.startDate.toISOString(),
                      endDate: alt.endDate.toISOString(),
                      gapSizeDays: alt.gapSizeDays,
                    })),
                  });
                }
              } catch (suggestionError) {
                // Silently fail - alternative dates are optional
              }
            }
          } catch (detailError) {
            // If getting details fails, still return the overlap error
            errors.push({
              field: 'dates',
              code: 'DATES_OVERLAP',
              message: 'Selected dates overlap with existing bookings',
              severity: 'error',
            });
          }
        }
      } catch (timeoutError) {
        // Timeout or slow query - fallback to optimistic mode
        warnings.push({
          field: 'dates',
          code: 'OPTIMISTIC_AVAILABILITY',
          message: 'Dates appear available. Final confirmation required at booking time.',
          severity: 'warning',
        });
      }
    } catch (error: any) {
      // Any other error - fallback to optimistic mode
      warnings.push({
        field: 'dates',
        code: 'OPTIMISTIC_AVAILABILITY',
        message: 'Availability check failed. Final confirmation required at booking time.',
        severity: 'warning',
        details: {
          error: error.message,
        },
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      cacheHits: [], // Date availability is NEVER cached
    };
  }

  /**
   * Validate all availability aspects
   * 
   * Combines:
   * - Item-level availability
   * - Date basics
   * - Date availability (optimistic)
   * 
   * @param data - Validation request data
   * @returns Complete availability validation result
   */
  static async validate(
    data: Partial<ValidationRequest>
  ): Promise<AvailabilityValidationResult> {
    // A) Item-level availability
    const itemResult = await this.validateItemAvailability(data);

    // B) Date basics
    const dateBasicsResult = this.validateDateBasics(data);

    // C) Date availability (optimistic)
    const dateAvailabilityResult = await this.validateDateAvailability(data);

    // Combine all results
    const allErrors = [
      ...itemResult.errors,
      ...dateBasicsResult.errors,
      ...dateAvailabilityResult.errors,
    ];

    const allWarnings = [
      ...(dateAvailabilityResult.warnings || []),
    ];

    const allSuggestions = [
      ...(dateAvailabilityResult.suggestions || []),
    ];

    // Combine cache hits from all validations
    const allCacheHits = [
      ...(itemResult.cacheHits || []),
      ...(dateAvailabilityResult.cacheHits || []),
    ];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
      suggestions: allSuggestions.length > 0 ? allSuggestions : undefined,
      cacheHits: allCacheHits.length > 0 ? allCacheHits : undefined,
    };
  }
}

/**
 * Legacy function export for backward compatibility
 * 
 * @deprecated Use AvailabilityValidator.validate() instead
 */
export const validateAvailability = async (
  data: Partial<ValidationRequest>,
  useOptimistic: boolean = false
): Promise<AvailabilityValidationResult> => {
  return AvailabilityValidator.validate(data);
};

