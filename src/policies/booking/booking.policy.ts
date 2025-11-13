import { BookingItemType } from '../../models/booking.model';

/**
 * Booking Policy
 * Contains business rules for booking operations
 */
export class BookingPolicy {
  /**
   * Rule: Guest must be active (not expired) to create booking
   * @param guest - Guest object to check
   * @returns true if guest can create booking, false otherwise
   */
  static canCreateBooking(guest: any): boolean {
    return !guest.isExpired();
  }

  /**
   * Rule: Calculate booking expiration date (24 hours from now)
   * @returns Date object representing expiration date
   */
  static calculateExpirationDate(): Date {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24); // 24 hours
    return expirationDate;
  }

  /**
   * Rule: Validate booking data
   * @param data - Booking creation data
   * @returns true if data is valid, throws ValidationError otherwise
   */
  static validateBookingData(data: any): boolean {
    // Validate guestId is provided
    if (!data.guestId || data.guestId.trim() === '') {
      throw new Error('Guest ID is required');
    }

    // Validate itemType is provided
    if (!data.itemType) {
      throw new Error('Item type is required');
    }

    // Validate itemId is provided
    if (!data.itemId || data.itemId.trim() === '') {
      throw new Error('Item ID is required');
    }

    // Validate dates if provided
    if (data.startDate && data.endDate) {
      if (data.startDate >= data.endDate) {
        throw new Error('Start date must be before end date');
      }
    }

    // Validate quantity based on item type
    if (data.itemType === BookingItemType.CAR) {
      // Check if numberOfDays is provided and is less than 1
      if (data.numberOfDays !== undefined && data.numberOfDays < 1) {
        throw new Error('Number of days must be at least 1');
      }
    } else if (
      data.itemType === BookingItemType.ACTIVITY ||
      data.itemType === BookingItemType.TRAVEL_PACK
    ) {
      // Check if numberOfPersons is provided and is less than 1
      if (data.numberOfPersons !== undefined && data.numberOfPersons < 1) {
        throw new Error('Number of persons must be at least 1');
      }
      // Also check numberOfUnits for activities/packs
      if (data.numberOfUnits !== undefined && data.numberOfUnits < 1) {
        throw new Error('Number of units must be at least 1');
      }
    }

    return true;
  }
}

