// src/policies/booking/snapshot.policy.ts
import { BookingSnapshot, BookingItemType } from '../../models/booking.model';

/**
 * Booking Snapshot Policy
 * Manages snapshot creation and validation rules
 */
export class BookingSnapshotPolicy {
  /**
   * Rule: Validate snapshot structure
   * @param snapshot - Snapshot to validate
   * @returns true if snapshot is valid, throws Error otherwise
   */
  static validateSnapshot(snapshot: BookingSnapshot): boolean {
    // Validate required fields
    if (!snapshot.itemType) {
      throw new Error('Snapshot itemType is required');
    }

    if (!snapshot.itemId || snapshot.itemId.trim() === '') {
      throw new Error('Snapshot itemId is required');
    }

    if (!snapshot.title || snapshot.title.trim() === '') {
      throw new Error('Snapshot title is required');
    }

    if (!snapshot.currency) {
      throw new Error('Snapshot currency is required');
    }

    if (!snapshot.locale) {
      throw new Error('Snapshot locale is required');
    }

    if (!snapshot.snapshotAt) {
      throw new Error('Snapshot snapshotAt is required');
    }

    // Validate itemType-specific fields
    if (
      snapshot.itemType === BookingItemType.TRAVEL_PACK ||
      snapshot.itemType === BookingItemType.ACTIVITY
    ) {
      if (snapshot.pricePerPerson === undefined || snapshot.pricePerPerson === null) {
        throw new Error('pricePerPerson is required for travel packs and activities');
      }
    }

    if (snapshot.itemType === BookingItemType.CAR) {
      if (snapshot.pricePerDay === undefined || snapshot.pricePerDay === null) {
        throw new Error('pricePerDay is required for cars');
      }
    }

    return true;
  }

  /**
   * Rule: Check if snapshot is complete
   * @param snapshot - Snapshot to check
   * @returns true if snapshot is complete, false otherwise
   */
  static isSnapshotComplete(snapshot: BookingSnapshot): boolean {
    try {
      this.validateSnapshot(snapshot);
      return true;
    } catch {
      return false;
    }
  }
}

