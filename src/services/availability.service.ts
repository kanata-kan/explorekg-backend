// src/services/availability.service.ts
import { Booking, BookingItemType, BookingStatus } from '../models/booking.model';
import TravelPack from '../models/travelPack.model';
import { Activity } from '../models/activity.model';
import { Car } from '../models/car.model';
import { NotFoundError, ValidationError } from '../utils/AppError';
import { DateValidationService } from './dateValidation.service';
import { excludeDeleted, isDeleted } from '../utils/softDelete.util';

/**
 * Availability Service
 * 
 * Handles availability checks for booking items:
 * - Check if item is available
 * - Check date availability
 * - Check for overlapping bookings (using EXCLUSIVE endDate logic)
 * - Suggest alternative dates
 */
export class AvailabilityService {
  /**
   * Check if item is available (not deleted, active status)
   * 
   * @param itemType - Type of item (TravelPack, Activity, Car)
   * @param itemId - ID of the item
   * @returns true if item is available, false otherwise
   */
  static async checkItemAvailability(
    itemType: BookingItemType,
    itemId: string
  ): Promise<boolean> {
    let item: any;

    switch (itemType) {
      case BookingItemType.TRAVEL_PACK:
        item = await TravelPack.findOne(
          excludeDeleted({ _id: itemId })
        );
        if (!item || isDeleted(item)) {
          throw new NotFoundError(`TravelPack with id "${itemId}" not found`);
        }
        // Check if pack is published and available
        return item.status === 'published' && (item.availability !== false);

      case BookingItemType.ACTIVITY:
        item = await Activity.findOne(
          excludeDeleted({ _id: itemId })
        );
        if (!item || isDeleted(item)) {
          throw new NotFoundError(`Activity with id "${itemId}" not found`);
        }
        // Check if activity is active (not deleted)
        return item.status === 'active';

      case BookingItemType.CAR:
        item = await Car.findOne(
          excludeDeleted({ _id: itemId })
        );
        if (!item || isDeleted(item)) {
          throw new NotFoundError(`Car with id "${itemId}" not found`);
        }
        // Check if car is available
        return item.status === 'available';

      default:
        throw new ValidationError(`Invalid item type: ${itemType}`);
    }
  }

  /**
   * Check if dates are available (no overlapping bookings)
   * 
   * @param itemType - Type of item
   * @param itemId - ID of the item
   * @param startDate - Start date (inclusive)
   * @param endDate - End date (exclusive)
   * @param excludeBookingNumber - Optional booking number to exclude from check (for updates)
   * @param session - Optional MongoDB session for transactions
   * @returns true if dates are available, false if there are overlapping bookings
   */
  static async checkDateAvailability(
    itemType: BookingItemType,
    itemId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingNumber?: string,
    session?: any
  ): Promise<boolean> {
    // Validate dates first
    DateValidationService.validateDateRange(startDate, endDate);

    // Check for overlapping bookings
    const hasOverlap = await this.checkOverlappingBookings(
      itemType,
      itemId,
      startDate,
      endDate,
      excludeBookingNumber,
      session
    );

    return !hasOverlap;
  }

  /**
   * Check for overlapping bookings
   * 
   * Uses EXCLUSIVE endDate logic:
   * - startDate is INCLUSIVE
   * - endDate is EXCLUSIVE
   * 
   * Two ranges overlap if: start1 < end2 AND start2 < end1
   * 
   * @param itemType - Type of item
   * @param itemId - ID of the item
   * @param startDate - Start date (inclusive)
   * @param endDate - End date (exclusive)
   * @param excludeBookingNumber - Optional booking number to exclude from check
   * @param session - Optional MongoDB session for transactions
   * @returns true if there are overlapping bookings, false otherwise
   */
  static async checkOverlappingBookings(
    itemType: BookingItemType,
    itemId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingNumber?: string,
    session?: any
  ): Promise<boolean> {
    // Build query for overlapping bookings
    // Using EXCLUSIVE endDate logic:
    // - startDate is INCLUSIVE
    // - endDate is EXCLUSIVE
    // Two ranges overlap if: start1 < end2 AND start2 < end1
    const query: any = {
      'snapshot.itemType': itemType,
      'snapshot.itemId': itemId,
      status: {
        $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED], // Only check active bookings
      },
      // Check for date overlap with exclusive endDate:
      // Booking overlaps if: booking.startDate < endDate AND booking.endDate > startDate
      startDate: { $lt: endDate }, // Existing booking starts before our end date (exclusive)
      endDate: { $gt: startDate }, // Existing booking ends after our start date (inclusive)
    };

    // Exclude current booking if updating
    if (excludeBookingNumber) {
      query.bookingNumber = { $ne: excludeBookingNumber };
    }

    let queryBuilder = Booking.find(query).limit(1);
    if (session) {
      queryBuilder = queryBuilder.session(session);
    }

    const overlappingBookings = await queryBuilder;

    return overlappingBookings.length > 0;
  }

  /**
   * Get overlapping bookings with details
   * 
   * @param itemType - Type of item
   * @param itemId - ID of the item
   * @param startDate - Start date (inclusive)
   * @param endDate - End date (exclusive)
   * @param excludeBookingNumber - Optional booking number to exclude
   * @param session - Optional MongoDB session for transactions
   * @returns Array of overlapping bookings
   */
  static async getOverlappingBookings(
    itemType: BookingItemType,
    itemId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingNumber?: string,
    session?: any
  ) {
    const query: any = {
      'snapshot.itemType': itemType,
      'snapshot.itemId': itemId,
      status: {
        $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
      // Using EXCLUSIVE endDate logic: start1 < end2 AND start2 < end1
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    };

    if (excludeBookingNumber) {
      query.bookingNumber = { $ne: excludeBookingNumber };
    }

    let queryBuilder = Booking.find(query).sort({ startDate: 1 });
    if (session) {
      queryBuilder = queryBuilder.session(session);
    }

    return queryBuilder;
  }

  /**
   * Suggest alternative dates when there's an overlap
   * 
   * Improved algorithm:
   * 1. Sort existing bookings by startDate
   * 2. Detect gaps where gapDuration >= requestedDuration
   * 3. Suggest the closest 5 available periods
   * 
   * @param itemType - Type of item
   * @param itemId - ID of the item
   * @param requestedStartDate - Requested start date (inclusive)
   * @param numberOfDays - Number of days for the booking
   * @param lookAheadDays - How many days ahead to look for alternatives (default: 30)
   * @returns Array of suggested alternative dates with gapSizeDays
   */
  static async suggestAlternativeDates(
    itemType: BookingItemType,
    itemId: string,
    requestedStartDate: Date,
    numberOfDays: number,
    lookAheadDays: number = 30
  ): Promise<Array<{ startDate: Date; endDate: Date; gapSizeDays: number }>> {
    const suggestions: Array<{ startDate: Date; endDate: Date; gapSizeDays: number }> = [];
    const requestedEndDate = DateValidationService.calculateEndDate(requestedStartDate, numberOfDays);

    // Get all bookings in the next N days (sorted by startDate)
    const maxDate = new Date(requestedStartDate);
    maxDate.setDate(maxDate.getDate() + lookAheadDays);

    const existingBookings = await Booking.find({
      'snapshot.itemType': itemType,
      'snapshot.itemId': itemId,
      status: {
        $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
      // Get bookings that might affect our search window
      $or: [
        { startDate: { $gte: requestedStartDate, $lte: maxDate } },
        { endDate: { $gte: requestedStartDate, $lte: maxDate } },
        { startDate: { $lte: requestedStartDate }, endDate: { $gte: maxDate } },
      ],
    })
      .sort({ startDate: 1 })
      .select('startDate endDate')
      .lean();

    // If no bookings found, suggest the requested date
    if (existingBookings.length === 0) {
      const gapSize = DateValidationService.calculateDurationInDays(requestedStartDate, requestedEndDate);
      suggestions.push({
        startDate: new Date(requestedStartDate),
        endDate: new Date(requestedEndDate),
        gapSizeDays: gapSize,
      });
      return suggestions;
    }

    // Find gaps between bookings
    let currentDate = new Date(requestedStartDate);
    currentDate.setHours(0, 0, 0, 0);

    for (const booking of existingBookings) {
      if (!booking.startDate || !booking.endDate) continue;

      const bookingStart = new Date(booking.startDate);
      bookingStart.setHours(0, 0, 0, 0);

      const bookingEnd = new Date(booking.endDate);
      bookingEnd.setHours(0, 0, 0, 0);

      // Check if there's a gap before this booking
      if (currentDate < bookingStart) {
        const gapStart = new Date(currentDate);
        const gapEnd = new Date(bookingStart);
        const gapDuration = DateValidationService.calculateDurationInDays(gapStart, gapEnd);

        if (gapDuration >= numberOfDays) {
          // Found a gap that fits
          const suggestedEndDate = DateValidationService.calculateEndDate(gapStart, numberOfDays);
          suggestions.push({
            startDate: new Date(gapStart),
            endDate: suggestedEndDate,
            gapSizeDays: gapDuration,
          });
        }
      }

      // Move current date to after this booking (endDate is exclusive, so we can start on the same day)
      currentDate = new Date(bookingEnd);
      currentDate.setHours(0, 0, 0, 0);
    }

    // Check if there's space after the last booking
    const lastBooking = existingBookings[existingBookings.length - 1];
    if (lastBooking && lastBooking.endDate) {
      const afterLastBooking = new Date(lastBooking.endDate);
      afterLastBooking.setHours(0, 0, 0, 0);

      const maxCheckDate = new Date(requestedStartDate);
      maxCheckDate.setDate(maxCheckDate.getDate() + lookAheadDays);
      maxCheckDate.setHours(0, 0, 0, 0);

      if (afterLastBooking < maxCheckDate) {
        const gapDuration = DateValidationService.calculateDurationInDays(afterLastBooking, maxCheckDate);
        if (gapDuration >= numberOfDays) {
          const suggestedEndDate = DateValidationService.calculateEndDate(afterLastBooking, numberOfDays);
          if (suggestedEndDate <= maxCheckDate) {
            suggestions.push({
              startDate: afterLastBooking,
              endDate: suggestedEndDate,
              gapSizeDays: gapDuration,
            });
          }
        }
      }
    }

    // If no suggestions found, suggest dates after the look-ahead period
    if (suggestions.length === 0) {
      const futureStart = new Date(requestedStartDate);
      futureStart.setDate(futureStart.getDate() + lookAheadDays);
      futureStart.setHours(0, 0, 0, 0);

      const futureEnd = DateValidationService.calculateEndDate(futureStart, numberOfDays);
      const gapSize = DateValidationService.calculateDurationInDays(futureStart, futureEnd);
      suggestions.push({
        startDate: futureStart,
        endDate: futureEnd,
        gapSizeDays: gapSize,
      });
    }

    // Sort by startDate (closest first) and return max 5 suggestions
    return suggestions
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5);
  }
}

/**
 * Export service object
 */
export const availabilityService = AvailabilityService;
