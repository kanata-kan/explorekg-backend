// src/policies/catalog/availability.policy.ts
import { BookingItemType } from '../../models/booking.model';
import { ITravelPack } from '../../models/travelPack.model';
import { IActivity } from '../../models/activity.model';
import { ICar } from '../../models/car.model';

/**
 * Availability Policy
 * Contains business rules for checking item availability
 */

export type CatalogItem = ITravelPack | IActivity | ICar;

export type AvailabilityStatus = 'available' | 'unavailable' | 'reserved';

/**
 * Availability Policy Class
 */
export class AvailabilityPolicy {
  /**
   * Check if item is available based on its status and availability flags
   * @param item - The catalog item (TravelPack, Activity, or Car)
   * @param itemType - Type of the item
   * @returns true if item is available, false otherwise
   */
  static isItemAvailable(item: CatalogItem, itemType: BookingItemType): boolean {
    if (!item) {
      return false;
    }

    switch (itemType) {
      case BookingItemType.TRAVEL_PACK:
        const pack = item as ITravelPack;
        return pack.status === 'published' && (pack.availability !== false);

      case BookingItemType.ACTIVITY:
        const activity = item as IActivity;
        return (
          activity.status === 'active' &&
          activity.availabilityStatus === 'available'
        );

      case BookingItemType.CAR:
        const car = item as ICar;
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
   * This is a higher-level check that combines availability with other business rules
   * @param item - The catalog item
   * @param itemType - Type of the item
   * @param dates - Optional dates to check (for future date validation)
   * @returns true if item can be booked, false otherwise
   */
  static canBookItem(
    item: CatalogItem,
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
   * @param item - The catalog item
   * @param itemType - Type of the item
   * @returns Availability status string
   */
  static getAvailabilityStatus(
    item: CatalogItem,
    itemType: BookingItemType
  ): AvailabilityStatus {
    if (!item) {
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

