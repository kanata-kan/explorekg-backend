// src/policies/booking/payment.policy.ts
import { BookingStatus, PaymentStatus, IBooking } from '../../models/booking.model';
import { ValidationError } from '../../utils/AppError';

/**
 * Payment Policy
 * Manages payment-related business rules and state transitions
 */
export class PaymentPolicy {
  /**
   * Rule: Check if booking can be paid
   * @param booking - Booking instance or booking data
   * @returns true if booking can be paid, false otherwise
   */
  static canPay(booking: IBooking | {
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    isExpired: () => boolean;
  }): boolean {
    // Cannot pay if already paid
    if (booking.paymentStatus === PaymentStatus.PAID) {
      return false;
    }

    // Cannot pay if cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      return false;
    }

    // Cannot pay if expired
    if (booking.isExpired()) {
      return false;
    }

    return true;
  }

  /**
   * Rule: Get payment status after successful payment
   * @returns PaymentStatus.PAID
   */
  static getPaymentStatusAfterPayment(): PaymentStatus {
    return PaymentStatus.PAID;
  }

  /**
   * Rule: Get booking status after successful payment
   * @returns BookingStatus.CONFIRMED
   */
  static getBookingStatusAfterPayment(): BookingStatus {
    return BookingStatus.CONFIRMED;
  }

  /**
   * Rule: Check if payment can be refunded
   * @param paymentStatus - Current payment status
   * @returns true if payment can be refunded, false otherwise
   */
  static canRefund(paymentStatus: PaymentStatus): boolean {
    // Can only refund if already paid
    return paymentStatus === PaymentStatus.PAID;
  }

  /**
   * Rule: Get payment status after cancellation
   * @param paymentStatus - Current payment status
   * @returns PaymentStatus after cancellation (REFUNDED if paid, otherwise unchanged)
   */
  static getPaymentStatusAfterCancellation(
    paymentStatus: PaymentStatus
  ): PaymentStatus {
    // If paid, mark for refund
    if (paymentStatus === PaymentStatus.PAID) {
      return PaymentStatus.REFUNDED;
    }

    // Otherwise, keep current status
    return paymentStatus;
  }

  /**
   * Rule: Validate if booking can be paid (throws error if not)
   * @param booking - Booking instance or booking data
   * @throws ValidationError if booking cannot be paid
   */
  static validateCanPay(booking: IBooking | {
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    isExpired: () => boolean;
  }): void {
    if (!this.canPay(booking)) {
      if (booking.paymentStatus === PaymentStatus.PAID) {
        throw new ValidationError('Booking already paid');
      }
      if (booking.status === BookingStatus.CANCELLED) {
        throw new ValidationError('Cannot pay for cancelled booking');
      }
      if (booking.isExpired()) {
        throw new ValidationError('Cannot pay for expired booking');
      }
      throw new ValidationError('Booking cannot be paid');
    }
  }
}

