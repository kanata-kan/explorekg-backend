import { BookingSnapshot, BookingItemType } from '../models/booking.model';
import { TaxPolicy, DiscountPolicy, DepositPolicy } from '../policies';

/**
 * Calculate subtotal based on item type and quantity
 */
export const calculateSubtotal = (snapshot: BookingSnapshot, data: any): number => {
  let subtotal = 0;

  switch (snapshot.itemType) {
    case BookingItemType.TRAVEL_PACK:
    case BookingItemType.ACTIVITY:
      const persons = data.numberOfPersons || data.numberOfUnits || 1;
      subtotal = (snapshot.pricePerPerson || 0) * persons;
      break;

    case BookingItemType.CAR:
      const days = data.numberOfDays || 1;
      subtotal = (snapshot.pricePerDay || 0) * days;
      break;

    default:
      subtotal = snapshot.pricePerUnit || 0;
  }

  return Math.round(subtotal * 100) / 100; // Round to 2 decimal places
};

/**
 * Apply tax to subtotal
 */
export const applyTax = (subtotal: number, taxRate?: number): number => {
  return TaxPolicy.calculateTax(subtotal, taxRate);
};

/**
 * Apply discount to price
 */
export const applyDiscount = (price: number, discountPercentage: number) => {
  const discountAmount = DiscountPolicy.calculateDiscountAmount(price, discountPercentage);
  const discountedPrice = DiscountPolicy.applyDiscount(price, discountPercentage);
  return {
    discountedPrice: Math.round(discountedPrice * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
  };
};

/**
 * Calculate total price
 */
export const calculateTotal = (subtotal: number, options: any = {}): number => {
  let total = subtotal;

  // Apply discount if provided
  if (options.discountPercentage !== undefined) {
    const { discountedPrice } = applyDiscount(subtotal, options.discountPercentage);
    total = discountedPrice;
  }

  // Apply tax if included
  if (options.includeTax !== false) {
    const tax = applyTax(total, options.taxRate);
    total = total + tax;
  }

  return Math.round(total * 100) / 100;
};

/**
 * Calculate deposit
 */
export const calculateDeposit = (total: number, depositRate?: number): number => {
  return DepositPolicy.calculateDeposit(total, depositRate);
};

/**
 * Calculate complete pricing breakdown
 * This is the main unified pricing calculation method
 */
export const calculatePrice = (
  snapshot: BookingSnapshot,
  data: any,
  options: any = {}
): {
  subtotal: number;
  tax: number;
  discount: number;
  discountAmount: number;
  total: number;
  deposit?: number;
} => {
  // Calculate subtotal
  const subtotal = calculateSubtotal(snapshot, data);

  // Apply discount if provided
  let discountAmount = 0;
  let discountedSubtotal = subtotal;
  if (options.discountPercentage !== undefined && options.discountPercentage > 0) {
    const discountResult = applyDiscount(subtotal, options.discountPercentage);
    discountedSubtotal = discountResult.discountedPrice;
    discountAmount = discountResult.discountAmount;
  }

  // Calculate tax (on discounted subtotal if discount applied)
  // For regular bookings, tax is included by default (unless explicitly set to false)
  const tax =
    options.includeTax === false
      ? 0
      : applyTax(discountedSubtotal, options.taxRate);

  // Calculate total
  const total = discountedSubtotal + tax;

  // Calculate deposit if requested
  let deposit: number | undefined;
  if (options.includeDeposit === true) {
    deposit = calculateDeposit(total, options.depositRate);
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    discount: options.discountPercentage || 0,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    deposit: deposit !== undefined ? Math.round(deposit * 100) / 100 : undefined,
  };
};

/**
 * Calculate pricing for pack relations (sum strategy)
 * This handles the complex pricing logic for travel packs
 */
export const calculatePackRelationPrice = (
  activitiesTotal: number,
  carsTotal: number,
  optionalActivitiesTotal: number,
  globalDiscountPercentage: number,
  options: any = {}
): {
  subtotal: number;
  tax: number;
  discount: number;
  discountAmount: number;
  total: number;
  deposit?: number;
} => {
  // Subtotal = required activities + cars (optional activities not included)
  const subtotal = activitiesTotal + carsTotal;

  // Apply global discount if provided
  let discountAmount = 0;
  let discountedSubtotal = subtotal;
  if (globalDiscountPercentage !== undefined && globalDiscountPercentage > 0) {
    const discountResult = applyDiscount(subtotal, globalDiscountPercentage);
    discountedSubtotal = discountResult.discountedPrice;
    discountAmount = discountResult.discountAmount;
  }

  // Calculate tax (on discounted subtotal if discount applied)
  // For pack relations, tax is not included by default (unlike regular bookings)
  const tax =
    options.includeTax === true
      ? applyTax(discountedSubtotal, options.taxRate)
      : 0;

  // Calculate total
  const total = discountedSubtotal + tax;

  // Calculate deposit if requested
  let deposit: number | undefined;
  if (options.includeDeposit === true) {
    deposit = calculateDeposit(total, options.depositRate);
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    discount: globalDiscountPercentage || 0,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    deposit: deposit !== undefined ? Math.round(deposit * 100) / 100 : undefined,
  };
};

