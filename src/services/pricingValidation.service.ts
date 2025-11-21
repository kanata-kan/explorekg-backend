/**
 * Pricing Validation Service
 * Defensive validation layer for pricing calculations
 * 
 * This service acts as a "guardrail" to ensure pricing logic consistency
 * without changing any existing calculation results.
 */

import { PricingValidationError } from '../utils/PricingValidationError';
import { logger } from '../utils/logger';

/**
 * Pricing breakdown structure for validation
 */
export interface PricingBreakdownForValidation {
  subtotal: number;
  globalDiscount: number;
  discountAmount: number;
  finalTotal: number;
  deposit?: number;
  tax?: number;
}

/**
 * Validation rules configuration
 */
export interface ValidationConfig {
  /**
   * If true, throws error on validation failure
   * If false, only logs warning
   */
  strictMode?: boolean;
  
  /**
   * Tolerance for floating point comparison (default: 0.01)
   */
  tolerance?: number;
}

/**
 * Validate pricing breakdown consistency
 * 
 * Rules:
 * 1. IF discountAmount > 0 THEN globalDiscount > 0
 * 2. finalTotal = subtotal - discountAmount (+ tax if applicable)
 * 3. deposit = finalTotal × depositRate (if deposit exists)
 * 4. All values must be >= 0
 * 5. globalDiscount must be between 0 and 100
 * 
 * @param breakdown - Pricing breakdown to validate
 * @param config - Validation configuration
 * @throws PricingValidationError if validation fails and strictMode is true
 */
export const validatePricingBreakdown = (
  breakdown: PricingBreakdownForValidation,
  config: ValidationConfig = {}
): void => {
  const { strictMode = true, tolerance = 0.01 } = config;
  
  const {
    subtotal,
    globalDiscount,
    discountAmount,
    finalTotal,
    deposit,
    tax = 0,
  } = breakdown;

  // Rule 1: IF discountAmount > 0 THEN globalDiscount > 0
  if (discountAmount > tolerance && globalDiscount <= 0) {
    const message = `Invalid pricing state: discountAmount (${discountAmount}) > 0 but globalDiscount (${globalDiscount}) <= 0`;
    
    if (strictMode) {
      throw new PricingValidationError(
        message,
        'globalDiscount',
        0,
        globalDiscount
      );
    } else {
      logger.warn(
        {
          discountAmount,
          globalDiscount,
          subtotal,
          finalTotal,
        },
        `[PRICING WARNING] ${message}`
      );
    }
  }

  // Rule 2: Validate finalTotal calculation
  const expectedFinalTotal = subtotal - discountAmount + tax;
  const finalTotalDifference = Math.abs(finalTotal - expectedFinalTotal);
  
  if (finalTotalDifference > tolerance) {
    const message = `Invalid pricing state: finalTotal mismatch. Expected: ${expectedFinalTotal}, Got: ${finalTotal}, Difference: ${finalTotalDifference}`;
    
    if (strictMode) {
      throw new PricingValidationError(
        message,
        'finalTotal',
        expectedFinalTotal,
        finalTotal
      );
    } else {
      logger.warn(
        {
          expectedFinalTotal,
          actualFinalTotal: finalTotal,
          difference: finalTotalDifference,
          subtotal,
          discountAmount,
          tax,
        },
        `[PRICING WARNING] ${message}`
      );
    }
  }

  // Rule 3: Validate deposit calculation (if deposit exists)
  if (deposit !== undefined && deposit !== null) {
    const expectedDeposit = finalTotal * 0.2; // Default deposit rate
    const depositDifference = Math.abs(deposit - expectedDeposit);
    
    // Allow small rounding differences
    if (depositDifference > tolerance) {
      const message = `Invalid pricing state: deposit mismatch. Expected: ${expectedDeposit}, Got: ${deposit}, Difference: ${depositDifference}`;
      
      if (strictMode) {
        throw new PricingValidationError(
          message,
          'deposit',
          expectedDeposit,
          deposit
        );
      } else {
        logger.warn(
          {
            expectedDeposit,
            actualDeposit: deposit,
            difference: depositDifference,
            finalTotal,
          },
          `[PRICING WARNING] ${message}`
        );
      }
    }
  }

  // Rule 4: All values must be >= 0
  const negativeValues: string[] = [];
  if (subtotal < 0) negativeValues.push(`subtotal: ${subtotal}`);
  if (globalDiscount < 0) negativeValues.push(`globalDiscount: ${globalDiscount}`);
  if (discountAmount < 0) negativeValues.push(`discountAmount: ${discountAmount}`);
  if (finalTotal < 0) negativeValues.push(`finalTotal: ${finalTotal}`);
  if (tax < 0) negativeValues.push(`tax: ${tax}`);
  if (deposit !== undefined && deposit < 0) negativeValues.push(`deposit: ${deposit}`);

  if (negativeValues.length > 0) {
    const message = `Invalid pricing state: Negative values detected: ${negativeValues.join(', ')}`;
    
    if (strictMode) {
      throw new PricingValidationError(
        message,
        'negative_values',
        undefined,
        undefined
      );
    } else {
      logger.warn(
        {
          negativeValues,
          breakdown,
        },
        `[PRICING WARNING] ${message}`
      );
    }
  }

  // Rule 5: globalDiscount must be between 0 and 100
  if (globalDiscount < 0 || globalDiscount > 100) {
    const message = `Invalid pricing state: globalDiscount (${globalDiscount}) must be between 0 and 100`;
    
    if (strictMode) {
      throw new PricingValidationError(
        message,
        'globalDiscount',
        100,
        globalDiscount
      );
    } else {
      logger.warn(
        {
          globalDiscount,
          subtotal,
          discountAmount,
        },
        `[PRICING WARNING] ${message}`
      );
    }
  }

  // Rule 6: discountAmount should not exceed subtotal
  if (discountAmount > subtotal + tolerance) {
    const message = `Invalid pricing state: discountAmount (${discountAmount}) exceeds subtotal (${subtotal})`;
    
    if (strictMode) {
      throw new PricingValidationError(
        message,
        'discountAmount',
        subtotal,
        discountAmount
      );
    } else {
      logger.warn(
        {
          discountAmount,
          subtotal,
          globalDiscount,
        },
        `[PRICING WARNING] ${message}`
      );
    }
  }

  // Rule 7: If globalDiscount > 0, discountAmount should be approximately correct
  if (globalDiscount > 0 && subtotal > 0) {
    const expectedDiscountAmount = subtotal * (globalDiscount / 100);
    const discountAmountDifference = Math.abs(discountAmount - expectedDiscountAmount);
    
    if (discountAmountDifference > tolerance) {
      const message = `Invalid pricing state: discountAmount (${discountAmount}) does not match globalDiscount (${globalDiscount}%). Expected: ${expectedDiscountAmount}, Difference: ${discountAmountDifference}`;
      
      if (strictMode) {
        throw new PricingValidationError(
          message,
          'discountAmount',
          expectedDiscountAmount,
          discountAmount
        );
      } else {
        logger.warn(
          {
            discountAmount,
            expectedDiscountAmount,
            globalDiscount,
            subtotal,
            difference: discountAmountDifference,
          },
          `[PRICING WARNING] ${message}`
        );
      }
    }
  }
};

/**
 * Validate pricing breakdown with detailed error reporting
 * 
 * @param breakdown - Pricing breakdown to validate
 * @param config - Validation configuration
 * @returns Validation result with details
 */
export const validatePricingBreakdownDetailed = (
  breakdown: PricingBreakdownForValidation,
  config: ValidationConfig = {}
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Try strict validation first
    validatePricingBreakdown(breakdown, { ...config, strictMode: true });
    return { isValid: true, errors: [], warnings: [] };
  } catch (error) {
    if (error instanceof PricingValidationError) {
      errors.push(error.message);
    } else {
      errors.push(String(error));
    }

    // Also collect warnings in non-strict mode
    try {
      validatePricingBreakdown(breakdown, { ...config, strictMode: false });
    } catch (warningError) {
      if (warningError instanceof PricingValidationError) {
        warnings.push(warningError.message);
      }
    }

    return { isValid: false, errors, warnings };
  }
};

