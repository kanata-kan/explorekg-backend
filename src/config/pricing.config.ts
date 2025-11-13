/**
 * Pricing Configuration
 * Centralized configuration for pricing rules
 */

/**
 * Default tax rate: 10% (0.1)
 */
export const DEFAULT_TAX_RATE = 0.1;

/**
 * Default deposit rate: 20% (0.2)
 */
export const DEFAULT_DEPOSIT_RATE = 0.2;

/**
 * Get tax rate from environment or use default
 */
export const getTaxRate = (): number => {
  const envTaxRate = process.env.TAX_RATE;
  if (envTaxRate) {
    const rate = parseFloat(envTaxRate);
    if (!isNaN(rate) && rate >= 0 && rate <= 1) {
      return rate;
    }
  }
  return DEFAULT_TAX_RATE;
};

/**
 * Get deposit rate from environment or use default
 */
export const getDepositRate = (): number => {
  const envDepositRate = process.env.DEPOSIT_RATE;
  if (envDepositRate) {
    const rate = parseFloat(envDepositRate);
    if (!isNaN(rate) && rate >= 0 && rate <= 1) {
      return rate;
    }
  }
  return DEFAULT_DEPOSIT_RATE;
};

/**
 * Pricing configuration object
 */
export const PricingConfig = {
  taxRate: getTaxRate(),
  depositRate: getDepositRate(),
  defaultTaxRate: DEFAULT_TAX_RATE,
  defaultDepositRate: DEFAULT_DEPOSIT_RATE,
};

