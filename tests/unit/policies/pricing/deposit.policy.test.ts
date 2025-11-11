// tests/unit/policies/pricing/deposit.policy.test.ts
import { DepositPolicy } from '../../../../src/policies/pricing/deposit.policy';

describe('DepositPolicy', () => {
  describe('calculateDeposit', () => {
    it('should calculate 20% deposit by default', () => {
      const total = 100;
      const deposit = DepositPolicy.calculateDeposit(total);
      expect(deposit).toBe(20);
    });

    it('should calculate deposit with custom rate', () => {
      const total = 100;
      const depositRate = 0.3; // 30%
      const deposit = DepositPolicy.calculateDeposit(total, depositRate);
      expect(deposit).toBe(30);
    });

    it('should calculate deposit for zero total', () => {
      const total = 0;
      const deposit = DepositPolicy.calculateDeposit(total);
      expect(deposit).toBe(0);
    });

    it('should calculate deposit for decimal total', () => {
      const total = 99.99;
      const deposit = DepositPolicy.calculateDeposit(total);
      expect(deposit).toBeCloseTo(19.998, 2);
    });

    it('should throw error for negative total', () => {
      expect(() => DepositPolicy.calculateDeposit(-100)).toThrow('Total cannot be negative');
    });

    it('should throw error for deposit rate greater than 1', () => {
      expect(() => DepositPolicy.calculateDeposit(100, 1.5)).toThrow(
        'Deposit rate must be between 0 and 1'
      );
    });

    it('should throw error for negative deposit rate', () => {
      expect(() => DepositPolicy.calculateDeposit(100, -0.1)).toThrow(
        'Deposit rate must be between 0 and 1'
      );
    });
  });

  describe('getDepositRate', () => {
    it('should return default deposit rate', () => {
      const rate = DepositPolicy.getDepositRate();
      expect(rate).toBe(0.2);
    });

    it('should return rate from env variable when valid', () => {
      const originalEnv = process.env.DEPOSIT_RATE;
      process.env.DEPOSIT_RATE = '0.3';
      const rate = DepositPolicy.getDepositRate();
      expect(rate).toBe(0.3);
      if (originalEnv) process.env.DEPOSIT_RATE = originalEnv;
      else delete process.env.DEPOSIT_RATE;
    });
  });

  describe('validateDepositRate', () => {
    it('should pass validation for valid deposit rate', () => {
      expect(() => DepositPolicy.validateDepositRate(0.2)).not.toThrow();
      expect(() => DepositPolicy.validateDepositRate(0)).not.toThrow();
      expect(() => DepositPolicy.validateDepositRate(1)).not.toThrow();
    });

    it('should throw error for negative deposit rate', () => {
      expect(() => DepositPolicy.validateDepositRate(-0.1)).toThrow(
        'Deposit rate cannot be negative'
      );
    });

    it('should throw error for deposit rate greater than 1', () => {
      expect(() => DepositPolicy.validateDepositRate(1.5)).toThrow(
        'Deposit rate cannot exceed 100%'
      );
    });
  });
});

