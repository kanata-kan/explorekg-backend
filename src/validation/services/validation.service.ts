// src/validation/services/validation.service.ts

/**
 * Validation Service
 * 
 * Orchestrates all validation logic:
 * - Format validation (Zod)
 * - Business rule validation (Policies)
 * - Availability validation (Services + Policies)
 * - Error aggregation
 * - Optimistic mode handling
 * - Error mapping (server codes → UI keys)
 * - Timeout protection (prevents slow queries from blocking)
 * 
 * This is the heart of the real-time validation system.
 * 
 * @module validation/services
 */

import { ErrorMappingService } from './error-mapping.service';
import { FormatValidator } from '../validators/format.validator';
import { BusinessValidator, BusinessValidationResult } from '../validators/business.validator';
import { AvailabilityValidator, AvailabilityValidationResult } from '../validators/availability.validator';

/**
 * Maximum validation timeout (2 seconds)
 * Prevents slow queries from blocking the system and causing ERR_INSUFFICIENT_RESOURCES
 */
const VALIDATION_TIMEOUT_MS = 2000; // 2 seconds max

/**
 * Validation request data
 */
import { BookingItemType } from '../../models/booking.model';

export interface ValidationRequest {
  guestId?: string;
  itemType?: BookingItemType | 'travel_pack' | 'activity' | 'car';
  itemId?: string;
  numberOfPersons?: number;
  numberOfUnits?: number;
  numberOfDays?: number;
  startDate?: string;
  endDate?: string;
  locale?: 'en' | 'fr';
  validateFields?: string[];
  includeWarnings?: boolean;
  includeSuggestions?: boolean;
}

/**
 * Validation response structure (with UI keys for frontend)
 */
export interface ValidationResponse {
  isValid: boolean;
  errors: Array<{
    field: string;
    code: string;
    uiKey: string; // UI key for frontend translation
    message: string;
    severity: 'error' | 'warning';
    details?: Record<string, any>;
  }>;
  warnings?: Array<{
    field: string;
    code: string;
    uiKey: string; // UI key for frontend translation
    message: string;
    severity: 'error' | 'warning';
    details?: Record<string, any>;
  }>;
  suggestions?: Suggestion[];
  metadata?: {
    cacheHit?: boolean;
    cacheHits?: string[];
    validatedAt: string;
    locale: 'en' | 'fr';
    validationTimeMs?: number;
  };
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
  details?: Record<string, any>;
}

/**
 * Validation warning structure
 */
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Suggestion structure (e.g., alternative dates)
 */
export interface Suggestion {
  type: 'alternative_dates' | 'similar_items' | 'quantity_adjustment';
  field: string;
  options: Array<Record<string, any>>;
}

/**
 * Detect locale from Accept-Language header or data
 * 
 * @param data - Validation request data (may contain locale)
 * @returns Detected locale (en or fr)
 */
function detectLocale(data: ValidationRequest): 'en' | 'fr' {
  // Priority: data.locale > default 'en'
  return data.locale || 'en';
}

/**
 * Validate booking data in real-time
 * 
 * Unified validation flow that combines all validators:
 * 1. Format validation
 * 2. Business validation (guest + rules)
 * 3. Availability validation (item + dates)
 * 4. Error aggregation
 * 5. Error mapping (server codes → UI keys)
 * 
 * @param data - Validation request data
 * @param locale - Optional language locale (en/fr), will be auto-detected if not provided
 * @returns Validation response with errors, warnings, and suggestions (mapped to UI keys)
 */
export const validateBookingData = async (
  data: ValidationRequest,
  locale?: 'en' | 'fr'
): Promise<ValidationResponse> => {
  // Start performance timer
  const startTime = Date.now();

  // Detect locale
  const detectedLocale = locale || detectLocale(data);

  // Create timeout promise with cleanup to prevent unhandled rejections
  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('VALIDATION_TIMEOUT'));
    }, VALIDATION_TIMEOUT_MS);
  });

  // Helper function to safely race with timeout
  const raceWithTimeout = async <T>(promise: Promise<T>): Promise<T> => {
    try {
      const result = await Promise.race([
        promise,
        timeoutPromise,
      ]);
      
      // Clear timeout if promise completed successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      return result as T;
    } catch (error: any) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Re-throw error to be caught by outer try-catch
      throw error;
    }
  };

  try {
    // Step 1: Format Validation (synchronous, no timeout needed)
    const formatResult = FormatValidator.validateFullPayload(data);

    // Step 2-6: Run async validations with timeout protection
    const validationPromise = Promise.all([
      BusinessValidator.validateGuest(data),
      BusinessValidator.validateBusinessRules(data),
      AvailabilityValidator.validateItemAvailability(data),
      Promise.resolve(AvailabilityValidator.validateDateBasics(data)), // Synchronous
      AvailabilityValidator.validateDateAvailability(data),
    ]);

    // Race between validation and timeout with proper cleanup
    const [
      businessGuestResult,
      businessRulesResult,
      itemAvailabilityResult,
      dateBasicsResult,
      dateAvailabilityResult,
    ] = await raceWithTimeout(validationPromise) as [
      BusinessValidationResult,
      BusinessValidationResult,
      AvailabilityValidationResult,
      AvailabilityValidationResult,
      AvailabilityValidationResult,
    ];

    // Stop performance timer
    const validationTimeMs = Date.now() - startTime;

    // Aggregate all errors (before deduplication)
  const allErrorsRaw = [
    ...formatResult.errors,
    ...businessGuestResult.errors,
    ...businessRulesResult.errors,
    ...itemAvailabilityResult.errors,
    ...dateBasicsResult.errors,
    ...dateAvailabilityResult.errors,
  ];

  // Remove duplicate errors (same field + code combination)
  // This prevents duplicate errors from multiple validators checking the same condition
  const errorMap = new Map<string, typeof allErrorsRaw[0]>();
  for (const error of allErrorsRaw) {
    const key = `${error.field}:${error.code}`;
    if (!errorMap.has(key)) {
      errorMap.set(key, error);
    }
  }
  const allErrors = Array.from(errorMap.values());

  // Aggregate all warnings
  const allWarnings = [
    ...(itemAvailabilityResult.warnings || []),
    ...(dateBasicsResult.warnings || []),
    ...(dateAvailabilityResult.warnings || []),
  ];

  // Extract suggestions ONLY from dateAvailability
  const allSuggestions = dateAvailabilityResult.suggestions || [];

  // Aggregate cache hits from all validators
  const allCacheHits = [
    ...(businessGuestResult.cacheHits || []),
    ...(businessRulesResult.cacheHits || []),
    ...(itemAvailabilityResult.cacheHits || []),
    ...(dateBasicsResult.cacheHits || []),
    ...(dateAvailabilityResult.cacheHits || []),
  ];

  // Build raw response (before error mapping)
  const rawResponse = {
    isValid: allErrors.length === 0,
    errors: allErrors.map(error => ({
      field: error.field,
      code: error.code,
      message: error.message,
      severity: error.severity,
      details: 'details' in error ? error.details : undefined,
    })),
    warnings: allWarnings.length > 0 ? allWarnings.map(warning => ({
      field: warning.field,
      code: warning.code,
      message: warning.message,
      severity: warning.severity || 'warning',
      details: 'details' in warning ? warning.details : undefined,
    })) : undefined,
    suggestions: allSuggestions.length > 0 ? allSuggestions.map(s => ({
      type: s.type as Suggestion['type'],
      field: s.field,
      options: s.options,
    })) : undefined,
  };

  // Transform to frontend format using ErrorMappingService
  const mappedResponse = ErrorMappingService.transformForFrontEnd(rawResponse);

  // Build final response with metadata
  const response: ValidationResponse = {
    isValid: mappedResponse.isValid,
    errors: mappedResponse.errors,
    warnings: mappedResponse.warnings,
    suggestions: mappedResponse.suggestions as Suggestion[] | undefined,
    metadata: {
      validatedAt: new Date().toISOString(),
      locale: detectedLocale,
      cacheHit: allCacheHits.length > 0,
      cacheHits: allCacheHits,
      validationTimeMs,
    },
  };

    return response;
  } catch (error: any) {
    // Handle timeout error
    if (error.message === 'VALIDATION_TIMEOUT') {
      const validationTimeMs = Date.now() - startTime;
      
      // Return partial validation result with timeout warning
      // Include format validation results (synchronous, always available)
      const formatResult = FormatValidator.validateFullPayload(data);
      
      // Transform format errors to frontend format
      const formatErrorsMapped = ErrorMappingService.transformForFrontEnd({
        isValid: formatResult.errors.length === 0,
        errors: formatResult.errors.map(error => ({
          field: error.field,
          code: error.code,
          message: error.message,
          severity: error.severity,
          details: ('details' in error && error.details) ? (error.details as Record<string, any>) : undefined,
        })),
      });
      
      return {
        isValid: false,
        errors: [
          ...formatErrorsMapped.errors,
          {
            field: 'system',
            code: 'VALIDATION_TIMEOUT',
            uiKey: 'validation.timeout',
            message: 'Validation is taking longer than expected. Some checks may be incomplete. Please try again.',
            severity: 'warning' as const,
            details: {
              timeoutMs: VALIDATION_TIMEOUT_MS,
              actualTimeMs: validationTimeMs,
            },
          },
        ],
        warnings: [
          {
            field: 'system',
            code: 'VALIDATION_TIMEOUT',
            uiKey: 'validation.timeout',
            message: 'Validation timeout occurred. Some availability checks may be incomplete.',
            severity: 'warning' as const,
          },
        ],
        metadata: {
          validatedAt: new Date().toISOString(),
          locale: detectedLocale,
          cacheHit: false,
          cacheHits: [],
          validationTimeMs,
        },
      };
    }
    
    // Re-throw other errors
    throw error;
  }
};

/**
 * Determine if field needs business validation
 * 
 * @param field - Field name
 * @returns true if field needs business validation
 */
function needsBusinessValidation(field: string): boolean {
  const businessFields = ['guestId', 'itemType', 'itemId', 'numberOfPersons', 'numberOfUnits', 'numberOfDays'];
  return businessFields.includes(field);
}

/**
 * Determine if field needs availability validation
 * 
 * @param field - Field name
 * @returns true if field needs availability validation
 */
function needsAvailabilityValidation(field: string): boolean {
  const availabilityFields = ['itemId', 'itemType', 'startDate', 'endDate', 'numberOfDays'];
  return availabilityFields.includes(field);
}

/**
 * Validate a single field in real-time
 * 
 * Field-specific validation flow:
 * 1. Format validation for the field
 * 2. Business validation (if field requires it)
 * 3. Availability validation (if field requires it)
 * 4. Error aggregation
 * 5. Error mapping (server codes → UI keys)
 * 
 * @param field - Field name
 * @param value - Field value
 * @param context - Optional context (other field values)
 * @param locale - Optional language locale (en/fr), will be auto-detected if not provided
 * @returns Validation response for the specific field (mapped to UI keys)
 */
export const validateField = async (
  field: string,
  value: any,
  context?: Partial<ValidationRequest>,
  locale?: 'en' | 'fr'
): Promise<ValidationResponse> => {
  // Start performance timer
  const startTime = Date.now();

  // Build data object with field value and context
  const data: ValidationRequest = {
    ...context,
    [field]: value,
  } as ValidationRequest;

  // Detect locale
  const detectedLocale = locale || detectLocale(data);

  // Helper function to create timeout promise with cleanup
  const createTimeoutPromise = (): { promise: Promise<never>; clear: () => void } => {
    let timeoutId: NodeJS.Timeout | null = null;
    const promise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('VALIDATION_TIMEOUT'));
      }, VALIDATION_TIMEOUT_MS);
    });
    
    return {
      promise,
      clear: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      },
    };
  };

  // Helper function to safely race with timeout
  const raceWithTimeout = async <T>(
    promise: Promise<T>,
    timeoutWrapper: { promise: Promise<never>; clear: () => void }
  ): Promise<T> => {
    try {
      const result = await Promise.race([
        promise,
        timeoutWrapper.promise,
      ]);
      
      // Clear timeout if promise completed successfully
      timeoutWrapper.clear();
      
      return result as T;
    } catch (error: any) {
      // Clear timeout on error
      timeoutWrapper.clear();
      
      // Re-throw error to be caught by outer try-catch
      throw error;
    }
  };

  try {
    // Step 1: Format Validation - Field only (synchronous, no timeout needed)
    const formatResult = FormatValidator.validateField(field, value);

    // Step 2: Business Validation - Field-specific checks only
    let businessGuestResult: BusinessValidationResult = { isValid: true, errors: [], cacheHits: [] };
    let businessRulesResult: BusinessValidationResult = { isValid: true, errors: [], cacheHits: [] };

    if (needsBusinessValidation(field)) {
      // Run business validation with timeout protection
      const businessValidationPromise = (async () => {
        if (field === 'guestId') {
          return await BusinessValidator.validateGuest(data);
        } else if (['itemType', 'itemId', 'numberOfPersons', 'numberOfUnits', 'numberOfDays'].includes(field)) {
          return await BusinessValidator.validateBusinessRules(data);
        }
        return { isValid: true, errors: [], cacheHits: [] } as BusinessValidationResult;
      })();

      const timeoutWrapper = createTimeoutPromise();
      const businessResult = await raceWithTimeout(businessValidationPromise, timeoutWrapper) as BusinessValidationResult;

      if (field === 'guestId') {
        businessGuestResult = businessResult;
      } else {
        businessRulesResult = businessResult;
      }
    }

    // Step 3: Availability Validation - Field-specific checks only
    let itemAvailabilityResult: AvailabilityValidationResult = { isValid: true, errors: [], cacheHits: [] };
    let dateBasicsResult: AvailabilityValidationResult = { isValid: true, errors: [], cacheHits: [] };
    let dateAvailabilityResult: AvailabilityValidationResult = { isValid: true, errors: [], cacheHits: [] };

    if (needsAvailabilityValidation(field)) {
      // Run availability validation with timeout protection
      if (['itemId', 'itemType'].includes(field)) {
        const availabilityValidationPromise = AvailabilityValidator.validateItemAvailability(data);
        const timeoutWrapper = createTimeoutPromise();
        itemAvailabilityResult = await raceWithTimeout(availabilityValidationPromise, timeoutWrapper) as AvailabilityValidationResult;
      }
      
      if (['startDate', 'endDate', 'numberOfDays'].includes(field)) {
        // Date basics is synchronous, no timeout needed
        dateBasicsResult = AvailabilityValidator.validateDateBasics(data);
        
        // Only check date availability if we have complete date info
        if (data.startDate && data.endDate && data.itemType && data.itemId) {
          const dateAvailabilityPromise = AvailabilityValidator.validateDateAvailability(data);
          const timeoutWrapper = createTimeoutPromise();
          dateAvailabilityResult = await raceWithTimeout(dateAvailabilityPromise, timeoutWrapper) as AvailabilityValidationResult;
        }
      }
    }

    // Stop performance timer
    const validationTimeMs = Date.now() - startTime;

    // Aggregate all errors (before deduplication)
    const allErrorsRaw = [
      ...formatResult.errors,
      ...businessGuestResult.errors,
      ...businessRulesResult.errors,
      ...itemAvailabilityResult.errors,
      ...dateBasicsResult.errors,
      ...dateAvailabilityResult.errors,
    ];

    // Remove duplicate errors (same field + code combination)
    // This prevents duplicate errors from multiple validators checking the same condition
    const errorMap = new Map<string, typeof allErrorsRaw[0]>();
    for (const error of allErrorsRaw) {
      const key = `${error.field}:${error.code}`;
      if (!errorMap.has(key)) {
        errorMap.set(key, error);
      }
    }
    const allErrors = Array.from(errorMap.values());

    // Aggregate all warnings
    const allWarnings = [
      ...(itemAvailabilityResult.warnings || []),
      ...(dateBasicsResult.warnings || []),
      ...(dateAvailabilityResult.warnings || []),
    ];

    // Extract suggestions ONLY from dateAvailability
    const allSuggestions = dateAvailabilityResult.suggestions || [];

    // Aggregate cache hits from all validators
    const allCacheHits = [
      ...(businessGuestResult.cacheHits || []),
      ...(businessRulesResult.cacheHits || []),
      ...(itemAvailabilityResult.cacheHits || []),
      ...(dateBasicsResult.cacheHits || []),
      ...(dateAvailabilityResult.cacheHits || []),
    ];

    // Build raw response (before error mapping)
    const rawResponse = {
      isValid: allErrors.length === 0,
      errors: allErrors.map(error => ({
        field: error.field,
        code: error.code,
        message: error.message,
        severity: error.severity,
        details: 'details' in error ? error.details : undefined,
      })),
      warnings: allWarnings.length > 0 ? allWarnings.map(warning => ({
        field: warning.field,
        code: warning.code,
        message: warning.message,
        severity: warning.severity || 'warning',
        details: 'details' in warning ? warning.details : undefined,
      })) : undefined,
      suggestions: allSuggestions.length > 0 ? allSuggestions.map(s => ({
        type: s.type as Suggestion['type'],
        field: s.field,
        options: s.options,
      })) : undefined,
    };

    // Transform to frontend format using ErrorMappingService
    const mappedResponse = ErrorMappingService.transformForFrontEnd(rawResponse);

    // Build final response with metadata
    const response: ValidationResponse = {
      isValid: mappedResponse.isValid,
      errors: mappedResponse.errors,
      warnings: mappedResponse.warnings,
      suggestions: mappedResponse.suggestions as Suggestion[] | undefined,
      metadata: {
        validatedAt: new Date().toISOString(),
        locale: detectedLocale,
        cacheHit: allCacheHits.length > 0,
        cacheHits: allCacheHits,
        validationTimeMs,
      },
    };

    return response;
  } catch (error: any) {
    // Handle timeout error
    if (error.message === 'VALIDATION_TIMEOUT') {
      const validationTimeMs = Date.now() - startTime;
      
      // Return partial validation result with timeout warning
      // Include format validation results (synchronous, always available)
      const formatResult = FormatValidator.validateField(field, value);
      
      // Transform format errors to frontend format
      const formatErrorsMapped = ErrorMappingService.transformForFrontEnd({
        isValid: formatResult.errors.length === 0,
        errors: formatResult.errors.map(error => ({
          field: error.field,
          code: error.code,
          message: error.message,
          severity: error.severity,
          details: ('details' in error && error.details) ? (error.details as Record<string, any>) : undefined,
        })),
      });
      
      return {
        isValid: false,
        errors: [
          ...formatErrorsMapped.errors,
          {
            field: 'system',
            code: 'VALIDATION_TIMEOUT',
            uiKey: 'validation.timeout',
            message: 'Validation is taking longer than expected. Some checks may be incomplete. Please try again.',
            severity: 'warning' as const,
            details: {
              timeoutMs: VALIDATION_TIMEOUT_MS,
              actualTimeMs: validationTimeMs,
            },
          },
        ],
        warnings: [
          {
            field: 'system',
            code: 'VALIDATION_TIMEOUT',
            uiKey: 'validation.timeout',
            message: 'Validation timeout occurred. Some availability checks may be incomplete.',
            severity: 'warning' as const,
          },
        ],
        metadata: {
          validatedAt: new Date().toISOString(),
          locale: detectedLocale,
          cacheHit: false,
          cacheHits: [],
          validationTimeMs,
        },
      };
    }
    
    // Re-throw other errors
    throw error;
  }
};

