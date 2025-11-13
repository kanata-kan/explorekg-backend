import { BookingStatus } from '../../models/booking.model';
import { StateTransitionError } from '../../utils/AppError';

/**
 * Booking State Policy
 * Manages state transitions and state-related business rules
 */
export class BookingStatePolicy {
  /**
   * Valid state transitions
   * Maps from current status to array of valid next statuses
   */
  private static readonly VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.EXPIRED],
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
  static canTransition(from: BookingStatus, to: BookingStatus): boolean {
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
  static getValidNextStatuses(currentStatus: BookingStatus): BookingStatus[] {
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
   * Rule: Validate state transition and throw error if invalid
   * @param from - Current booking status
   * @param to - Target booking status
   * @throws StateTransitionError if transition is invalid
   */
  static validateTransition(from: BookingStatus, to: BookingStatus): void {
    if (!this.canTransition(from, to)) {
      throw new StateTransitionError(
        `Invalid state transition from ${from} to ${to}`,
        from,
        to,
        this.getValidNextStatuses(from)
      );
    }
  }
}

