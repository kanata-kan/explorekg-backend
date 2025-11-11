// src/policies/guest/guest.policy.ts
import { IGuest } from '../../models/guest.model';

/**
 * Guest Policy
 * Contains business rules for guest operations
 */
export class GuestPolicy {
  /**
   * Default expiration days: 30 days
   */
  private static readonly DEFAULT_EXPIRATION_DAYS = 30;

  /**
   * Rule: Check if guest can be created (email uniqueness check)
   * Note: This is a policy check, actual database check should be done in service
   * @param email - Email to check
   * @returns true if email format is valid (actual uniqueness check in service)
   */
  static canCreateGuest(email: string): boolean {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    return true;
  }

  /**
   * Rule: Check if guest can be updated
   * @param guest - Guest object to check
   * @returns true if guest can be updated, false otherwise
   */
  static canUpdateGuest(guest: IGuest): boolean {
    // Cannot update if linked to user
    if (guest.userId) {
      return false;
    }

    // Cannot update if expired
    if (guest.isExpired()) {
      return false;
    }

    return true;
  }

  /**
   * Rule: Check if guest can be linked to user
   * @param guest - Guest object to check
   * @returns true if guest can be linked, false otherwise
   */
  static canLinkToUser(guest: IGuest): boolean {
    return guest.canBeLinkedToUser();
  }

  /**
   * Rule: Calculate guest expiration date
   * @param days - Number of days until expiration (optional, defaults to 30)
   * @returns Date object representing expiration date
   */
  static calculateExpirationDate(days: number = this.DEFAULT_EXPIRATION_DAYS): Date {
    if (days < 1) {
      throw new Error('Expiration days must be at least 1');
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate;
  }

  /**
   * Rule: Check if guest session is valid
   * @param guest - Guest object to check
   * @returns true if guest session is valid, false otherwise
   */
  static isGuestSessionValid(guest: IGuest): boolean {
    return !guest.isExpired();
  }
}

