import { getTaxRate, DEFAULT_TAX_RATE } from '../../config/pricing.config';

/**
 * Tax Policy
 * Manages tax calculation rules
 */
export class TaxPolicy {
  /**
   * Default tax rate: 10% (0.1)
   * Can be overridden via environment variable TAX_RATE
   */
  static DEFAULT_TAX_RATE_VALUE = DEFAULT_TAX_RATE;

  /**
   * Rule: Calculate tax as percentage of subtotal
   * @param subtotal - Subtotal amount
   * @param taxRate - Tax rate (optional, defaults to 10%)
   * @returns Calculated tax amount
   */
  static calculateTax(subtotal: number, taxRate?: number): number {
    if (subtotal < 0) {
      throw new Error('Subtotal cannot be negative');
    }
    const rate = taxRate ?? this.DEFAULT_TAX_RATE_VALUE;
    if (rate < 0 || rate > 1) {
      throw new Error('Tax rate must be between 0 and 1');
    }
    return subtotal * rate;
  }

  /**
   * Rule: Get tax rate for specific item type
   * Currently all items use the same tax rate, but this allows for future customization
   * @param itemType - Item type (optional)
   * @returns Tax rate as decimal (e.g., 0.1 for 10%)
   */
  static getTaxRate(itemType?: string): number {
    // Future: Could have different tax rates per item type
    // For now, all items use the same rate from configuration
    return getTaxRate();
  }

  /**
   * Rule: Get tax rate from environment or use default
   * @returns Tax rate as decimal
   */
  static getTaxRateFromConfig(): number {
    // Use centralized pricing configuration
    return getTaxRate();
  }
}

