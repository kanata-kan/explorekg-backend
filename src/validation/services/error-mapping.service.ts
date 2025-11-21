// src/validation/services/error-mapping.service.ts

/**
 * Error Mapping Service
 * 
 * Maps server error codes to stable UI keys for frontend consumption.
 * 
 * Features:
 * - Immutable error codes
 * - Versioned UI keys
 * - Legacy support (2 release cycles)
 * - Multilingual support (EN/FR)
 * 
 * @module validation/services
 */

import errorMappings from '../mappings/error-mapping.json';

/**
 * UI Error structure for frontend
 * 
 * Contains both original error code and UI key for translation.
 */
export interface UIError {
  field: string;
  code: string; // Original server error code (preserved)
  uiKey: string; // UI key for frontend translation
  message: string;
  severity: 'error' | 'warning';
  details?: Record<string, any>;
}

/**
 * Frontend validation response structure
 */
export interface FrontEndValidationResponse {
  isValid: boolean;
  errors: UIError[];
  warnings?: UIError[];
  suggestions?: Array<{
    type: string;
    field: string;
    options: Array<Record<string, any>>;
  }>;
  metadata?: {
    cacheHit?: boolean;
    cacheHits?: string[];
    validatedAt: string;
    locale: 'en' | 'fr';
    validationTimeMs?: number;
  };
}

/**
 * Error mapping configuration structure
 */
interface ErrorMappingConfig {
  uiKey: string;
  uiKeyLegacy?: string;
  severity: 'error' | 'warning';
  fieldMapping?: Record<string, string>;
  deprecated?: boolean;
}

/**
 * Error Mapping Service
 */
export class ErrorMappingService {
  /**
   * Map server error code to UI error key
   * 
   * Transforms:
   * {
   *   field,
   *   code,
   *   message,
   *   severity,
   *   details
   * }
   * 
   * Into UI-friendly structure:
   * {
   *   field: mappedField,
   *   code,              // Original code preserved
   *   uiKey,             // UI key for translation
   *   message,
   *   severity,
   *   details
   * }
   * 
   * @param errorCode - Server error code (e.g., "INVALID_FORMAT")
   * @param field - Field name (e.g., "numberOfPersons")
   * @param message - Server error message
   * @param severity - Error severity
   * @param details - Optional error details
   * @returns UI error structure with both code and uiKey
   */
  static mapToUI(
    errorCode: string,
    field: string,
    message: string,
    severity: 'error' | 'warning' = 'error',
    details?: Record<string, any>
  ): UIError {
    const mapping = (errorMappings as any).errorMappings?.[errorCode] as ErrorMappingConfig | undefined;

    // Map field name if fieldMapping exists
    const mappedField = mapping?.fieldMapping?.[field] || field;

    // Get UI key from mapping or fallback
    let uiKey: string;
    if (!mapping) {
      // Fallback: use error code as UI key
      uiKey = 'validation.unknown_error';
    } else {
      // Use legacy key if deprecated and legacy exists
      uiKey = mapping.deprecated && mapping.uiKeyLegacy
        ? mapping.uiKeyLegacy
        : mapping.uiKey;
    }

    // Use severity from mapping if provided, otherwise use passed severity
    const finalSeverity = mapping?.severity || severity;

    return {
      field: mappedField,
      code: errorCode, // Preserve original error code
      uiKey,
      message,
      severity: finalSeverity as 'error' | 'warning',
      details
    };
  }

  /**
   * Transform validation response for frontend consumption
   * 
   * Takes ValidationResponse and converts:
   * - Each error → UIError (with uiKey)
   * - Each warning → UIError (with uiKey)
   * - Suggestions → unchanged
   * - Metadata → preserved
   * 
   * This method does NOT mutate the original response.
   * It creates a new transformed response.
   * 
   * @param validationResponse - Server validation response
   * @returns Frontend-ready validation response with UI keys
   */
  static transformForFrontEnd(
    validationResponse: {
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
        severity?: 'error' | 'warning';
        details?: Record<string, any>;
      }>;
      suggestions?: Array<{
        type: string;
        field: string;
        options: Array<Record<string, any>>;
      }>;
      metadata?: {
        cacheHit?: boolean;
        cacheHits?: string[];
        validatedAt: string;
        locale: 'en' | 'fr';
        validationTimeMs?: number;
      };
    }
  ): FrontEndValidationResponse {
    // Transform errors
    const mappedErrors = validationResponse.errors.map(error =>
      this.mapToUI(
        error.code,
        error.field,
        error.message,
        error.severity,
        error.details
      )
    );

    // Transform warnings (if any)
    const mappedWarnings = validationResponse.warnings?.map(warning =>
      this.mapToUI(
        warning.code,
        warning.field,
        warning.message,
        warning.severity || 'warning',
        warning.details
      )
    ) || [];

    // Keep suggestions unchanged
    const suggestions = validationResponse.suggestions || [];

    return {
      isValid: validationResponse.isValid,
      errors: mappedErrors,
      warnings: mappedWarnings.length > 0 ? mappedWarnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      metadata: validationResponse.metadata // Preserve metadata from validation service
    };
  }
}

