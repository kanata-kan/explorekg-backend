// tests/unit/policies/pricing/tax.policy.test.ts
import { TaxPolicy } from '../../../../src/policies/pricing/tax.policy';
import { BookingItemType } from '../../../../src/models/booking.model';

describe('TaxPolicy', () => {
  describe('calculateTax', () => {
    it('should calculate 10% tax by default', () => {
      const subtotal = 100;
      const tax = TaxPolicy.calculateTax(subtotal);
      expect(tax).toBe(10);
    });

    it('should calculate tax with custom rate', () => {
      const subtotal = 100;
      const taxRate = 0.15; // 15%
      const tax = TaxPolicy.calculateTax(subtotal, taxRate);
      expect(tax).toBe(15);
    });

    it('should calculate tax for zero subtotal', () => {
      const subtotal = 0;
      const tax = TaxPolicy.calculateTax(subtotal);
      expect(tax).toBe(0);
    });

    it('should calculate tax for decimal subtotal', () => {
      const subtotal = 99.99;
      const tax = TaxPolicy.calculateTax(subtotal);
      expect(tax).toBeCloseTo(9.999, 2);
    });

    it('should throw error for negative subtotal', () => {
      expect(() => TaxPolicy.calculateTax(-100)).toThrow('Subtotal cannot be negative');
    });

    it('should throw error for tax rate greater than 1', () => {
      expect(() => TaxPolicy.calculateTax(100, 1.5)).toThrow('Tax rate must be between 0 and 1');
    });

    it('should throw error for negative tax rate', () => {
      expect(() => TaxPolicy.calculateTax(100, -0.1)).toThrow('Tax rate must be between 0 and 1');
    });
  });

  describe('getTaxRate', () => {
    it('should return default tax rate for any item type', () => {
      const rate = TaxPolicy.getTaxRate(BookingItemType.ACTIVITY);
      expect(rate).toBe(0.1);
    });

    it('should return same rate for all item types', () => {
      const activityRate = TaxPolicy.getTaxRate(BookingItemType.ACTIVITY);
      const carRate = TaxPolicy.getTaxRate(BookingItemType.CAR);
      const packRate = TaxPolicy.getTaxRate(BookingItemType.TRAVEL_PACK);
      expect(activityRate).toBe(carRate);
      expect(carRate).toBe(packRate);
    });

    it('should return default rate when no item type provided', () => {
      const rate = TaxPolicy.getTaxRate();
      expect(rate).toBe(0.1);
    });
  });

  describe('getTaxRateFromConfig', () => {
    it('should return default rate when env variable is not set', () => {
      const originalEnv = process.env.TAX_RATE;
      delete process.env.TAX_RATE;
      const rate = TaxPolicy.getTaxRateFromConfig();
      expect(rate).toBe(0.1);
      if (originalEnv) process.env.TAX_RATE = originalEnv;
    });

    it('should return rate from env variable when valid', () => {
      const originalEnv = process.env.TAX_RATE;
      process.env.TAX_RATE = '0.15';
      const rate = TaxPolicy.getTaxRateFromConfig();
      expect(rate).toBe(0.15);
      if (originalEnv) process.env.TAX_RATE = originalEnv;
      else delete process.env.TAX_RATE;
    });
  });
});

