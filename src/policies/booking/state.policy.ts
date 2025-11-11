// src/policies/booking/state.policy.ts
import { BookingStatus, PaymentStatus } from '../../models/booking.model';

/**
 * Booking State Policy
 * Manages state transitions and state-related business rules
 */
export class BookingStatePolicy {
  /**
   * Valid state transitions map
   * Defines which status transitions are allowed
   */
  private static readonly VALID_TRANSITIONS: Record<
    BookingStatus,
    BookingStatus[]
  > = {
    [BookingStatus.PENDING]: [
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.EXPIRED,
    ],
    [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.EXPIRED]: [],
  };

  /**
   * Rule: Check if state transition is valid
   * @param from - Current booking status
   * @param to - Target booking status
   * @returns true if transition is valid, false otherwise
   */
  static canTransition(
    from: BookingStatus,
    to: BookingStatus
  ): boolean {
    // Same status is always valid (no-op)
    if (from === to) {
      return true;
    }

    const validTransitions = this.VALID_TRANSITIONS[from];
    return validTransitions?.includes(to) ?? false;
  }

  /**
   * Rule: Get valid next statuses for current status
   * @param currentStatus - Current booking status
   * @returns Array of valid next statuses
   */
  static getValidNextStatuses(
    currentStatus: BookingStatus
  ): BookingStatus[] {
    return this.VALID_TRANSITIONS[currentStatus] ?? [];
  }

  /**
   * Rule: Check if booking can be modified
   * @param status - Current booking status
   * @returns true if booking can be modified, false otherwise
   */
  static canModify(status: BookingStatus): boolean {
    return (
      status !== BookingStatus.CANCELLED &&
      status !== BookingStatus.EXPIRED
    );
  }

  /**
   * Rule: Check if booking can be cancelled
   * @param status - Current booking status
   * @returns true if booking can be cancelled, false otherwise
   */
  static canCancel(status: BookingStatus): boolean {
    return (
      status === BookingStatus.PENDING ||
      status === BookingStatus.CONFIRMED
    );
  }

  /**
   * Rule: Check if booking can be paid
   * @param status - Current booking status
   * @param paymentStatus - Current payment status
   * @param isExpired - Whether booking is expired
   * @returns true if booking can be paid, false otherwise
   */
  static canPay(
    status: BookingStatus,
    paymentStatus: PaymentStatus,
    isExpired: boolean
  ): boolean {
    // Cannot pay if already paid
    if (paymentStatus === PaymentStatus.PAID) {
      return false;
    }

    // Cannot pay if cancelled
    if (status === BookingStatus.CANCELLED) {
      return false;
    }

    // Cannot pay if expired
    if (isExpired) {
      return false;
    }

    return true;
  }

  /**
   * Rule: Validate state transition with detailed error message
   * @param from - Current booking status
   * @param to - Target booking status
   * @throws Error if transition is invalid
   */
  static validateTransition(
    from: BookingStatus,
    to: BookingStatus
  ): void {
    if (!this.canTransition(from, to)) {
      const validTransitions = this.getValidNextStatuses(from);
      throw new Error(
        `Invalid state transition from "${from}" to "${to}". ` +
          `Valid transitions from "${from}" are: ${validTransitions.join(', ')}`
      );
    }
  }
}

