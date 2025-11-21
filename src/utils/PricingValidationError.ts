/**
 * Pricing Validation Error
 * Specialized error for pricing calculation validation failures
 */
import { ValidationError } from './AppError';

export class PricingValidationError extends ValidationError {
  public readonly pricingField?: string;
  public readonly expectedValue?: number;
  public readonly actualValue?: number;

  constructor(
    message: string,
    pricingField?: string,
    expectedValue?: number,
    actualValue?: number
  ) {
    super(message, pricingField, 'PRICING_VALIDATION_ERROR');
    this.pricingField = pricingField;
    this.expectedValue = expectedValue;
    this.actualValue = actualValue;
  }
}

