import { BookingStatus, PaymentStatus } from '../../models/booking.model';

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
  static canPay(booking: any): boolean {
    // Cannot pay if already paid
    if (booking.paymentStatus === PaymentStatus.PAID) {
      return false;
    }

    // Cannot pay if cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      return false;
    }

    // Cannot pay if expired
    if (booking.isExpired && booking.isExpired()) {
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
    return paymentStatus === PaymentStatus.PAID;
  }

  /**
   * Rule: Validate if booking can be paid (throws error if cannot)
   * @param booking - Booking instance or booking data
   * @throws ValidationError if booking cannot be paid
   */
  static validateCanPay(booking: any): void {
    if (!this.canPay(booking)) {
      throw new Error('Booking cannot be paid');
    }
  }

  /**
   * Rule: Get payment status after cancellation
   * @param currentPaymentStatus - Current payment status
   * @returns Payment status after cancellation
   */
  static getPaymentStatusAfterCancellation(currentPaymentStatus: PaymentStatus): PaymentStatus {
    // If already paid, keep as paid (refund handled separately)
    if (currentPaymentStatus === PaymentStatus.PAID) {
      return PaymentStatus.PAID;
    }
    // Otherwise, keep current status
    return currentPaymentStatus;
  }
}

