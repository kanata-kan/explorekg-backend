// src/policies/pricing/deposit.policy.ts

/**
 * Deposit Policy
 * Manages deposit calculation rules
 */
export class DepositPolicy {
  /**
   * Default deposit rate: 20% (0.2)
   */
  private static readonly DEFAULT_DEPOSIT_RATE = 0.2;

  /**
   * Rule: Calculate deposit as percentage of total
   * @param total - Total amount
   * @param depositRate - Deposit rate (optional, defaults to 20%)
   * @returns Calculated deposit amount
   */
  static calculateDeposit(total: number, depositRate?: number): number {
    if (total < 0) {
      throw new Error('Total cannot be negative');
    }

    const rate = depositRate ?? this.DEFAULT_DEPOSIT_RATE;
    if (rate < 0 || rate > 1) {
      throw new Error('Deposit rate must be between 0 and 1');
    }

    return total * rate;
  }

  /**
   * Rule: Get deposit rate
   * @returns Deposit rate as decimal (e.g., 0.2 for 20%)
   */
  static getDepositRate(): number {
    // Check if deposit rate is configured in environment
    const envDepositRate = process.env.DEPOSIT_RATE;
    if (envDepositRate) {
      const rate = parseFloat(envDepositRate);
      if (!isNaN(rate) && rate >= 0 && rate <= 1) {
        return rate;
      }
    }

    return this.DEFAULT_DEPOSIT_RATE;
  }

  /**
   * Rule: Validate deposit rate
   * @param depositRate - Deposit rate to validate
   * @returns true if deposit rate is valid, throws Error otherwise
   */
  static validateDepositRate(depositRate: number): boolean {
    if (depositRate < 0) {
      throw new Error('Deposit rate cannot be negative');
    }

    if (depositRate > 1) {
      throw new Error('Deposit rate cannot exceed 100%');
    }

    return true;
  }
}

