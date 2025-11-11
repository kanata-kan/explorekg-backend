// tests/unit/policies/pricing/discount.policy.test.ts
import { DiscountPolicy } from '../../../../src/policies/pricing/discount.policy';

describe('DiscountPolicy', () => {
  describe('applyDiscount', () => {
    it('should apply 10% discount correctly', () => {
      const price = 100;
      const discountPercent = 10;
      const discountedPrice = DiscountPolicy.applyDiscount(price, discountPercent);
      expect(discountedPrice).toBe(90);
    });

    it('should apply 50% discount correctly', () => {
      const price = 100;
      const discountPercent = 50;
      const discountedPrice = DiscountPolicy.applyDiscount(price, discountPercent);
      expect(discountedPrice).toBe(50);
    });

    it('should return same price for 0% discount', () => {
      const price = 100;
      const discountPercent = 0;
      const discountedPrice = DiscountPolicy.applyDiscount(price, discountPercent);
      expect(discountedPrice).toBe(100);
    });

    it('should return 0 for 100% discount', () => {
      const price = 100;
      const discountPercent = 100;
      const discountedPrice = DiscountPolicy.applyDiscount(price, discountPercent);
      expect(discountedPrice).toBe(0);
    });

    it('should handle decimal prices', () => {
      const price = 99.99;
      const discountPercent = 10;
      const discountedPrice = DiscountPolicy.applyDiscount(price, discountPercent);
      expect(discountedPrice).toBeCloseTo(89.991, 2);
    });

    it('should throw error for negative price', () => {
      expect(() => DiscountPolicy.applyDiscount(-100, 10)).toThrow(
        'Price cannot be negative'
      );
    });

    it('should throw error for discount greater than 100%', () => {
      expect(() => DiscountPolicy.applyDiscount(100, 150)).toThrow(
        'Discount percentage must be between 0 and 100'
      );
    });

    it('should throw error for negative discount', () => {
      expect(() => DiscountPolicy.applyDiscount(100, -10)).toThrow(
        'Discount percentage must be between 0 and 100'
      );
    });
  });

  describe('calculateDiscountAmount', () => {
    it('should calculate discount amount correctly', () => {
      const price = 100;
      const discountPercent = 10;
      const discountAmount = DiscountPolicy.calculateDiscountAmount(price, discountPercent);
      expect(discountAmount).toBe(10);
    });

    it('should calculate discount amount for 50%', () => {
      const price = 100;
      const discountPercent = 50;
      const discountAmount = DiscountPolicy.calculateDiscountAmount(price, discountPercent);
      expect(discountAmount).toBe(50);
    });

    it('should return 0 for 0% discount', () => {
      const price = 100;
      const discountPercent = 0;
      const discountAmount = DiscountPolicy.calculateDiscountAmount(price, discountPercent);
      expect(discountAmount).toBe(0);
    });

    it('should throw error for negative price', () => {
      expect(() => DiscountPolicy.calculateDiscountAmount(-100, 10)).toThrow(
        'Price cannot be negative'
      );
    });
  });

  describe('validateDiscount', () => {
    it('should pass validation for valid discount', () => {
      expect(() => DiscountPolicy.validateDiscount(10)).not.toThrow();
      expect(() => DiscountPolicy.validateDiscount(0)).not.toThrow();
      expect(() => DiscountPolicy.validateDiscount(100)).not.toThrow();
    });

    it('should throw error for negative discount', () => {
      expect(() => DiscountPolicy.validateDiscount(-10)).toThrow('Discount cannot be negative');
    });

    it('should throw error for discount greater than 100%', () => {
      expect(() => DiscountPolicy.validateDiscount(150)).toThrow('Discount cannot exceed 100%');
    });
  });
});

