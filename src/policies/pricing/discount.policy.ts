// src/policies/pricing/discount.policy.ts

/**
 * Discount Policy
 * Manages discount calculation rules
 */
export class DiscountPolicy {
  /**
   * Rule: Apply discount percentage to price
   * @param price - Original price
   * @param discountPercent - Discount percentage (0-100)
   * @returns Discounted price
   */
  static applyDiscount(price: number, discountPercent: number): number {
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    const discountMultiplier = 1 - discountPercent / 100;
    return price * discountMultiplier;
  }

  /**
   * Rule: Calculate discount amount
   * @param price - Original price
   * @param discountPercent - Discount percentage (0-100)
   * @returns Discount amount
   */
  static calculateDiscountAmount(
    price: number,
    discountPercent: number
  ): number {
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    return price * (discountPercent / 100);
  }

  /**
   * Rule: Validate discount value
   * @param discount - Discount percentage to validate
   * @returns true if discount is valid, throws Error otherwise
   */
  static validateDiscount(discount: number): boolean {
    if (discount < 0) {
      throw new Error('Discount cannot be negative');
    }

    if (discount > 100) {
      throw new Error('Discount cannot exceed 100%');
    }

    return true;
  }
}

