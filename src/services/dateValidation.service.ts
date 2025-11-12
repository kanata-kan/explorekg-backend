// src/services/dateValidation.service.ts
import { ValidationError } from '../utils/AppError';

/**
 * Date Validation Service
 * 
 * Handles all date-related validations for bookings:
 * - Auto-calculate endDate from startDate + numberOfDays
 * - Validate date ranges
 * - Validate future dates
 * - Validate minimum/maximum duration
 */
export class DateValidationService {
  /**
   * Calculate endDate from startDate + numberOfDays
   * 
   * Uses EXCLUSIVE endDate logic:
   * - startDate is INCLUSIVE (booking starts on this day)
   * - endDate is EXCLUSIVE (booking ends before this day starts)
   * 
   * @param startDate - Start date (inclusive)
   * @param numberOfDays - Number of days to add
   * @returns Calculated endDate (exclusive)
   * 
   * @example
   * // Input: startDate = 2025-01-01, numberOfDays = 5
   * // Output: 2025-01-06 (exclusive)
   * // Meaning: Booking is from Jan 1 (inclusive) to Jan 6 (exclusive) = 5 days
   */
  static calculateEndDate(startDate: Date, numberOfDays: number): Date {
    if (!startDate) {
      throw new ValidationError('Start date is required to calculate end date');
    }

    if (!numberOfDays || numberOfDays < 1) {
      throw new ValidationError('Number of days must be at least 1');
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + numberOfDays);
    
    // Reset time to start of day (00:00:00)
    // This makes endDate exclusive (booking ends before this day starts)
    endDate.setHours(0, 0, 0, 0);
    
    return endDate;
  }

  /**
   * Auto-calculate endDate if not provided
   * 
   * @param startDate - Start date (optional)
   * @param endDate - End date (optional)
   * @param numberOfDays - Number of days (optional)
   * @returns Object with startDate and endDate (both guaranteed to be set if startDate is provided)
   * 
   * @example
   * // Input: startDate = 2025-01-01, numberOfDays = 5, endDate = undefined
   * // Output: { startDate: 2025-01-01, endDate: 2025-01-06 }
   */
  static autoCalculateDates(
    startDate?: Date,
    endDate?: Date,
    numberOfDays?: number
  ): { startDate?: Date; endDate?: Date } {
    // If startDate is not provided, return as is
    if (!startDate) {
      return { startDate, endDate };
    }

    // If endDate is already provided, use it
    if (endDate) {
      return { startDate, endDate };
    }

    // If numberOfDays is provided, calculate endDate
    if (numberOfDays && numberOfDays >= 1) {
      const calculatedEndDate = this.calculateEndDate(startDate, numberOfDays);
      return { startDate, endDate: calculatedEndDate };
    }

    // If neither endDate nor numberOfDays is provided, return startDate only
    return { startDate, endDate };
  }

  /**
   * Validate date range
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @throws ValidationError if dates are invalid
   */
  static validateDateRange(startDate: Date, endDate: Date): void {
    if (!startDate) {
      throw new ValidationError('Start date is required');
    }

    if (!endDate) {
      throw new ValidationError('End date is required');
    }

    if (startDate >= endDate) {
      throw new ValidationError('Start date must be before end date');
    }
  }

  /**
   * Validate that date is in the future
   * 
   * @param date - Date to validate
   * @param allowToday - Allow today's date (default: true)
   * @throws ValidationError if date is in the past
   */
  static validateFutureDate(date: Date, allowToday: boolean = true): void {
    if (!date) {
      throw new ValidationError('Date is required');
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0); // Reset to start of day

    if (allowToday) {
      if (dateToCheck < now) {
        throw new ValidationError('Date must be today or in the future');
      }
    } else {
      if (dateToCheck <= now) {
        throw new ValidationError('Date must be in the future');
      }
    }
  }

  /**
   * Validate minimum duration
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @param minDays - Minimum number of days (default: 1)
   * @throws ValidationError if duration is less than minimum
   */
  static validateMinimumDuration(
    startDate: Date,
    endDate: Date,
    minDays: number = 1
  ): void {
    if (!startDate || !endDate) {
      return; // Skip validation if dates are not provided
    }

    const duration = this.calculateDurationInDays(startDate, endDate);

    if (duration < minDays) {
      throw new ValidationError(
        `Minimum duration is ${minDays} day(s), but got ${duration} day(s)`
      );
    }
  }

  /**
   * Validate maximum duration
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @param maxDays - Maximum number of days
   * @throws ValidationError if duration exceeds maximum
   */
  static validateMaximumDuration(
    startDate: Date,
    endDate: Date,
    maxDays: number
  ): void {
    if (!startDate || !endDate) {
      return; // Skip validation if dates are not provided
    }

    const duration = this.calculateDurationInDays(startDate, endDate);

    if (duration > maxDays) {
      throw new ValidationError(
        `Maximum duration is ${maxDays} day(s), but got ${duration} day(s)`
      );
    }
  }

  /**
   * Calculate duration in days between two dates
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Number of days
   */
  static calculateDurationInDays(startDate: Date, endDate: Date): number {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Check if two date ranges overlap
   * 
   * Uses EXCLUSIVE endDate logic:
   * - startDate is INCLUSIVE
   * - endDate is EXCLUSIVE
   * 
   * Two ranges overlap if:
   * - start1 < end2 AND start2 < end1
   * 
   * @param start1 - Start date of first range (inclusive)
   * @param end1 - End date of first range (exclusive)
   * @param start2 - Start date of second range (inclusive)
   * @param end2 - End date of second range (exclusive)
   * @returns true if ranges overlap
   * 
   * @example
   * // Range 1: Jan 1 (inclusive) to Jan 6 (exclusive)
   * // Range 2: Jan 4 (inclusive) to Jan 8 (exclusive)
   * // Overlap: true (Jan 4 and Jan 5 are in both ranges)
   */
  static doRangesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    // Two ranges overlap if:
    // start1 < end2 AND start2 < end1
    // Using < instead of <= because endDate is exclusive
    return start1 < end2 && start2 < end1;
  }
}

/**
 * Export service object
 */
export const dateValidationService = DateValidationService;

