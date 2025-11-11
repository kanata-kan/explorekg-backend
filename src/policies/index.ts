// src/policies/index.ts
/**
 * Business Policy Layer - Barrel Export
 * Central export point for all business policies
 */

// Booking Policies
export * from './booking/booking.policy';
export * from './booking/state.policy';
export * from './booking/snapshot.policy';

// Pricing Policies
export * from './pricing/tax.policy';
export * from './pricing/discount.policy';
export * from './pricing/deposit.policy';

// Guest Policies
export * from './guest/guest.policy';

