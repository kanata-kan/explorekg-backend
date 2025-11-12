// src/policies/catalog/availability.policy.ts
import { BookingItemType } from '../../models/booking.model';
import { ITravelPack } from '../../models/travelPack.model';
import { IActivity } from '../../models/activity.model';
import { ICar } from '../../models/car.model';
import { isDeleted } from '../../utils/softDelete.util';

/**
 * Availability Policy
 * 
 * Business rules for item availability:
 * - Check if item is available
 * - Check if item can be booked
 * - Get availability status
 * 
 * This policy centralizes all availability logic and should be used
 * by services to avoid code duplication.
 */
export type CatalogItem = ITravelPack | IActivity | ICar;

export type AvailabilityStatus = 'available' | 'unavailable' | 'reserved' | 'not_found';

export class AvailabilityPolicy {
  /**
   * Check if item is available based on its status and soft delete state
   * 
   * @param item - Item object (TravelPack, Activity, or Car)
   * @param itemType - Type of item (using BookingItemType enum)
   * @returns true if item is available
   */
  static isItemAvailable(item: CatalogItem | null | undefined, itemType: BookingItemType): boolean {
    if (!item) {
      return false;
    }

    // First check soft delete
    if (isDeleted(item)) {
      return false;
    }

    switch (itemType) {
      case BookingItemType.TRAVEL_PACK:
        const pack = item as ITravelPack;
        // TravelPack is available if:
        // - status is 'published'
        // - availability is not explicitly false
        return pack.status === 'published' && (pack.availability !== false);

      case BookingItemType.ACTIVITY:
        const activity = item as IActivity;
        // Activity is available if:
        // - status is 'active'
        // - availabilityStatus is 'available'
        return (
          activity.status === 'active' &&
          activity.availabilityStatus === 'available'
        );

      case BookingItemType.CAR:
        const car = item as ICar;
        // Car is available if:
        // - status is 'active' (not 'available' - consistent with model)
        // - availabilityStatus is 'available'
        return (
          car.status === 'active' &&
          car.availabilityStatus === 'available'
        );

      default:
        return false;
    }
  }

  /**
   * Check if item can be booked
   * 
   * This is a higher-level check that combines availability with other business rules
   * 
   * @param item - Item object
   * @param itemType - Type of item (using BookingItemType enum)
   * @param dates - Optional dates to check (for future date validation)
   * @returns true if item can be booked
   */
  static canBookItem(
    item: CatalogItem | null | undefined,
    itemType: BookingItemType,
    dates?: { startDate?: Date; endDate?: Date }
  ): boolean {
    // First check basic availability
    if (!this.isItemAvailable(item, itemType)) {
      return false;
    }

    // Additional checks can be added here:
    // - Date validation (if dates provided)
    // - Capacity checks
    // - Seasonal availability
    // etc.

    if (dates?.startDate) {
      // Ensure start date is in the future (or today)
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const startDate = new Date(dates.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (startDate < now) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get availability status of an item
   * 
   * @param item - Item object
   * @param itemType - Type of item (using BookingItemType enum)
   * @returns Availability status string
   */
  static getAvailabilityStatus(
    item: CatalogItem | null | undefined,
    itemType: BookingItemType
  ): AvailabilityStatus {
    if (!item) {
      return 'not_found';
    }

    // Check soft delete first
    if (isDeleted(item)) {
      return 'unavailable';
    }

    switch (itemType) {
      case BookingItemType.TRAVEL_PACK:
        const pack = item as ITravelPack;
        if (pack.status !== 'published' || pack.availability === false) {
          return 'unavailable';
        }
        return 'available';

      case BookingItemType.ACTIVITY:
        const activity = item as IActivity;
        if (activity.status !== 'active') {
          return 'unavailable';
        }
        return activity.availabilityStatus as AvailabilityStatus;

      case BookingItemType.CAR:
        const car = item as ICar;
        if (car.status !== 'active') {
          return 'unavailable';
        }
        return car.availabilityStatus as AvailabilityStatus;

      default:
        return 'unavailable';
    }
  }
}

