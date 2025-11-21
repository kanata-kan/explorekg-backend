// src/validation/validators/business.validator.ts

/**
 * Business Validator
 * 
 * Validates business rules using existing Policies.
 * 
 * Safe Policy methods used:
 * - BookingPolicy.validateBookingData()
 * - BookingPolicy.canCreateBooking()
 * - AvailabilityPolicy.isItemAvailable()
 * - AvailabilityPolicy.getAvailabilityStatus()
 * 
 * This validator is PURE - no side effects, no caching, no date availability checks.
 * Only business rule validation.
 * 
 * @module validation/validators
 */

import { BookingPolicy } from '../../policies/booking/booking.policy';
import { AvailabilityPolicy } from '../../policies/catalog/availability.policy';
import { Guest } from '../../models/guest.model';
import TravelPack from '../../models/travelPack.model';
import { Activity } from '../../models/activity.model';
import { Car } from '../../models/car.model';
import { BookingItemType } from '../../models/booking.model';
import { excludeDeleted, isDeleted } from '../../utils/softDelete.util';
import { CacheService, CacheKeys } from '../services/cache.service';
import type { ValidationRequest } from '../services/validation.service';
import mongoose from 'mongoose';

/**
 * Business validation result
 */
export interface BusinessValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    code: string;
    message: string;
    severity: 'error';
  }>;
  cacheHits?: string[]; // Track which validations used cache
}

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
 * Business Validator Class
 * 
 * Provides business rule validation using Policies.
 * Uses caching for guest and item data to improve performance.
 */
export class BusinessValidator {
  /**
   * Validate guest existence and expiration
   * 
   * Checks:
   * - Guest exists (cached, TTL: 1 min)
   * - Guest not expired (cached, TTL: 1 min)
   * - canCreateBooking = true
   * 
   * @param data - Validation request data (must include guestId)
   * @returns Business validation result with cache hit tracking
   */
  static async validateGuest(
    data: Partial<ValidationRequest>
  ): Promise<BusinessValidationResult> {
    const errors: Array<{
      field: string;
      code: string;
      message: string;
      severity: 'error';
    }> = [];
    const cacheHits: string[] = [];

    // Check if guestId is provided
    if (!data.guestId) {
      return {
        isValid: true, // Skip validation if guestId not provided
        errors: [],
        cacheHits: [],
      };
    }

    try {
      // Check cache for guest existence (TTL: 1 min)
      const guestExistsKey = CacheKeys.guestExists(data.guestId);
      let guestExists = CacheService.get<boolean>(guestExistsKey);
      let cacheHit = false;

      if (guestExists !== null) {
        cacheHit = true;
        cacheHits.push('guest.exists');
        
        // If cached as not exists, return error immediately
        if (guestExists === false) {
          errors.push({
            field: 'guestId',
            code: 'GUEST_NOT_FOUND',
            message: `Guest with ID "${data.guestId}" not found`,
            severity: 'error',
          });

          return {
            isValid: false,
            errors,
            cacheHits,
          };
        }
      }

      // Check cache for guest expiration (TTL: 1 min)
      const guestExpiresKey = CacheKeys.guestExpires(data.guestId);
      let guestExpired = CacheService.get<boolean>(guestExpiresKey);

      if (guestExpired !== null) {
        cacheHit = true;
        cacheHits.push('guest.expires');
        
        // If cached as expired, return error immediately
        if (guestExpired === true) {
          errors.push({
            field: 'guestId',
            code: 'GUEST_EXPIRED',
            message: 'Guest session has expired',
            severity: 'error',
          });

          return {
            isValid: false,
            errors,
            cacheHits,
          };
        }
      }

      // Cache miss - fetch guest from DB
      if (!cacheHit) {
        const guest = await Guest.findById(data.guestId);

        // Check guest existence
        if (!guest) {
          // Cache negative result (TTL: 1 min)
          CacheService.set(guestExistsKey, false, 60);
          
          errors.push({
            field: 'guestId',
            code: 'GUEST_NOT_FOUND',
            message: `Guest with ID "${data.guestId}" not found`,
            severity: 'error',
          });

          return {
            isValid: false,
            errors,
            cacheHits,
          };
        }

        // Cache positive result (TTL: 1 min)
        CacheService.set(guestExistsKey, true, 60);

        // Check guest expiration using Policy
        const isExpired = guest.isExpired();
        
        // Cache expiration status (TTL: 1 min)
        CacheService.set(guestExpiresKey, isExpired, 60);

        if (isExpired || !BookingPolicy.canCreateBooking(guest)) {
          errors.push({
            field: 'guestId',
            code: 'GUEST_EXPIRED',
            message: 'Guest session has expired',
            severity: 'error',
          });

          return {
            isValid: false,
            errors,
            cacheHits,
          };
        }
      }

      // Guest is valid
      return {
        isValid: true,
        errors: [],
        cacheHits,
      };
    } catch (error: any) {
      // Handle database errors
      if (error.name === 'CastError') {
        errors.push({
          field: 'guestId',
          code: 'GUEST_NOT_FOUND',
          message: `Invalid Guest ID format: "${data.guestId}"`,
          severity: 'error',
        });
      } else {
        errors.push({
          field: 'guestId',
          code: 'GUEST_NOT_FOUND',
          message: `Error checking guest: ${error.message}`,
          severity: 'error',
        });
      }

      return {
        isValid: false,
        errors,
        cacheHits,
      };
    }
  }

  /**
   * Validate business rules
   * 
   * Checks:
   * - Required fields (itemType, itemId) - guestId is optional for early stages
   * - Guest validation (only if guestId is provided)
   * - Item exists (cached, TTL: 5 min)
   * - Item availability status (cached, TTL: 2 min)
   * - Item not deleted
   * 
   * Note: guestId is optional in early booking stages (pack selection, activities, car selection)
   *       but required in later stages (review, payment)
   * 
   * @param data - Validation request data
   * @returns Business validation result with cache hit tracking
   */
  static async validateBusinessRules(
    data: Partial<ValidationRequest>
  ): Promise<BusinessValidationResult> {
    const errors: Array<{
      field: string;
      code: string;
      message: string;
      severity: 'error';
    }> = [];
    const cacheHits: string[] = [];

    // 1. Validate required fields (itemType, itemId) - guestId is optional
    // Validate itemType
    if (!data.itemType) {
      errors.push({
        field: 'itemType',
        code: 'BUSINESS_RULE',
        message: 'Item type is required',
        severity: 'error',
      });
    }

    // Validate itemId
    if (!data.itemId || (typeof data.itemId === 'string' && data.itemId.trim() === '')) {
      errors.push({
        field: 'itemId',
        code: 'BUSINESS_RULE',
        message: 'Item ID is required',
        severity: 'error',
      });
    }

    // 2. Validate guestId ONLY if provided (optional for early stages)
    // If guestId is provided, validate it using Policy
    if (data.guestId) {
      try {
        // Create a copy of data with guestId for Policy validation
        const dataWithGuest = { ...data };
        // Use Policy to validate guestId format and other rules
        // Note: Policy will throw if guestId is invalid format
        if (typeof data.guestId !== 'string' || data.guestId.trim() === '') {
          errors.push({
            field: 'guestId',
            code: 'BUSINESS_RULE',
            message: 'Guest ID is required',
            severity: 'error',
          });
        } else {
          // Validate other booking rules using Policy (dates, quantities, etc.)
          // But skip guestId requirement since we're handling it separately
          const dataForPolicy = { ...data };
          // Policy will validate dates, quantities, etc. if provided
          try {
            // Only validate non-guestId fields using Policy
            if (dataForPolicy.startDate && dataForPolicy.endDate) {
              if (dataForPolicy.startDate >= dataForPolicy.endDate) {
                errors.push({
                  field: 'dates',
                  code: 'BUSINESS_RULE',
                  message: 'Start date must be before end date',
                  severity: 'error',
                });
              }
            }

            // Validate quantity based on item type
            if (dataForPolicy.itemType === BookingItemType.CAR) {
              if (dataForPolicy.numberOfDays !== undefined && dataForPolicy.numberOfDays < 1) {
                errors.push({
                  field: 'numberOfDays',
                  code: 'BUSINESS_RULE',
                  message: 'Number of days must be at least 1',
                  severity: 'error',
                });
              }
            } else if (
              dataForPolicy.itemType === BookingItemType.ACTIVITY ||
              dataForPolicy.itemType === BookingItemType.TRAVEL_PACK
            ) {
              if (dataForPolicy.numberOfPersons !== undefined && dataForPolicy.numberOfPersons < 1) {
                errors.push({
                  field: 'numberOfPersons',
                  code: 'BUSINESS_RULE',
                  message: 'Number of persons must be at least 1',
                  severity: 'error',
                });
              }
              if (dataForPolicy.numberOfUnits !== undefined && dataForPolicy.numberOfUnits < 1) {
                errors.push({
                  field: 'numberOfUnits',
                  code: 'BUSINESS_RULE',
                  message: 'Number of units must be at least 1',
                  severity: 'error',
                });
              }
            }
          } catch (error: any) {
            // Convert Policy error to validation error
            const field = this.mapPolicyErrorToField(error.message, data);
            errors.push({
              field,
              code: 'BUSINESS_RULE',
              message: error.message,
              severity: 'error',
            });
          }
        }
      } catch (error: any) {
        // Handle any unexpected errors
        const field = this.mapPolicyErrorToField(error.message, data);
        errors.push({
          field,
          code: 'BUSINESS_RULE',
          message: error.message,
          severity: 'error',
        });
      }
    }
    // If guestId is not provided, skip guest validation (allowed in early stages)

    // 2. Check item existence and availability (if itemType and itemId provided)
    if (data.itemType && data.itemId) {
      try {
        // Check cache for item existence (TTL: 5 min)
        const itemExistsKey = CacheKeys.itemExists(data.itemType, data.itemId);
        let itemExists = CacheService.get<boolean>(itemExistsKey);
        let itemCacheHit = false;

        if (itemExists !== null) {
          itemCacheHit = true;
          cacheHits.push('item.exists');
          
          // If cached as not exists, return error immediately
          if (itemExists === false) {
            errors.push({
              field: 'itemId',
              code: 'ITEM_NOT_FOUND',
              message: `${data.itemType} with ID "${data.itemId}" not found`,
              severity: 'error',
            });

            return {
              isValid: errors.length === 0,
              errors,
              cacheHits,
            };
          }
        }

        // Check cache for item availability status (TTL: 2 min)
        const itemAvailableKey = CacheKeys.itemAvailable(data.itemType, data.itemId);
        let itemAvailable = CacheService.get<boolean>(itemAvailableKey);

        if (itemAvailable !== null) {
          itemCacheHit = true;
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
              isValid: errors.length === 0,
              errors,
              cacheHits,
            };
          }
        }

        // Cache miss - fetch item from DB
        if (!itemCacheHit) {
          // Use locale from data or default to 'en'
          const locale = data.locale || 'en';
          const item = await fetchItem(data.itemType, data.itemId, locale);

          // Check item existence
          if (!item) {
            // Cache negative result (TTL: 5 min)
            CacheService.set(itemExistsKey, false, 300);
            
            errors.push({
              field: 'itemId',
              code: 'ITEM_NOT_FOUND',
              message: `${data.itemType} with ID "${data.itemId}" not found`,
              severity: 'error',
            });

            return {
              isValid: errors.length === 0,
              errors,
              cacheHits,
            };
          }

          // Cache positive result (TTL: 5 min)
          CacheService.set(itemExistsKey, true, 300);

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
              isValid: errors.length === 0,
              errors,
              cacheHits,
            };
          }

          // Check item availability using AvailabilityPolicy
          const itemTypeEnum = data.itemType as BookingItemType;
          const isAvailable = AvailabilityPolicy.isItemAvailable(
            item,
            itemTypeEnum
          );

          // Cache availability status (TTL: 2 min)
          CacheService.set(itemAvailableKey, isAvailable, 120);

          if (!isAvailable) {
            errors.push({
              field: 'itemId',
              code: 'ITEM_UNAVAILABLE',
              message: `This ${data.itemType} is not available for booking`,
              severity: 'error',
            });
          }
        }
      } catch (error: any) {
        // Handle database errors
        if (error.name === 'CastError') {
          errors.push({
            field: 'itemId',
            code: 'ITEM_NOT_FOUND',
            message: `Invalid ${data.itemType} ID format: "${data.itemId}"`,
            severity: 'error',
          });
        } else {
          errors.push({
            field: 'itemId',
            code: 'ITEM_NOT_FOUND',
            message: `Error checking ${data.itemType}: ${error.message}`,
            severity: 'error',
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      cacheHits,
    };
  }

  /**
   * Map Policy error message to field name
   * 
   * @param errorMessage - Error message from Policy
   * @param data - Validation request data
   * @returns Field name
   */
  private static mapPolicyErrorToField(
    errorMessage: string,
    data: Partial<ValidationRequest>
  ): string {
    if (errorMessage.includes('Guest ID')) return 'guestId';
    if (errorMessage.includes('Item type')) return 'itemType';
    if (errorMessage.includes('Item ID')) return 'itemId';
    if (errorMessage.includes('Number of persons')) return 'numberOfPersons';
    if (errorMessage.includes('Number of units')) return 'numberOfUnits';
    if (errorMessage.includes('Number of days')) return 'numberOfDays';
    if (errorMessage.includes('Start date') || errorMessage.includes('End date')) {
      return 'dates';
    }
    return 'unknown';
  }
}

/**
 * Legacy function export for backward compatibility
 * 
 * @deprecated Use BusinessValidator.validateBusinessRules() instead
 */
export const validateBusinessRules = async (
  data: Partial<ValidationRequest>
): Promise<BusinessValidationResult> => {
  return BusinessValidator.validateBusinessRules(data);
};

