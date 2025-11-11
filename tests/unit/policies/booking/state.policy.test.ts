// tests/unit/policies/booking/state.policy.test.ts
import { BookingStatePolicy } from '../../../../src/policies/booking/state.policy';
import { BookingStatus, PaymentStatus } from '../../../../src/models/booking.model';

describe('BookingStatePolicy', () => {
  describe('canTransition', () => {
    it('should allow PENDING → CONFIRMED', () => {
      expect(
        BookingStatePolicy.canTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED)
      ).toBe(true);
    });

    it('should allow PENDING → CANCELLED', () => {
      expect(
        BookingStatePolicy.canTransition(BookingStatus.PENDING, BookingStatus.CANCELLED)
      ).toBe(true);
    });

    it('should allow PENDING → EXPIRED', () => {
      expect(
        BookingStatePolicy.canTransition(BookingStatus.PENDING, BookingStatus.EXPIRED)
      ).toBe(true);
    });

    it('should allow CONFIRMED → CANCELLED', () => {
      expect(
        BookingStatePolicy.canTransition(BookingStatus.CONFIRMED, BookingStatus.CANCELLED)
      ).toBe(true);
    });

    it('should reject CONFIRMED → PENDING', () => {
      expect(
        BookingStatePolicy.canTransition(BookingStatus.CONFIRMED, BookingStatus.PENDING)
      ).toBe(false);
    });

    it('should reject CANCELLED → CONFIRMED', () => {
      expect(
        BookingStatePolicy.canTransition(BookingStatus.CANCELLED, BookingStatus.CONFIRMED)
      ).toBe(false);
    });

    it('should reject EXPIRED → CONFIRMED', () => {
      expect(
        BookingStatePolicy.canTransition(BookingStatus.EXPIRED, BookingStatus.CONFIRMED)
      ).toBe(false);
    });

    it('should allow same status (no-op)', () => {
      expect(
        BookingStatePolicy.canTransition(BookingStatus.PENDING, BookingStatus.PENDING)
      ).toBe(true);
    });
  });

  describe('getValidNextStatuses', () => {
    it('should return valid next statuses for PENDING', () => {
      const validStatuses = BookingStatePolicy.getValidNextStatuses(BookingStatus.PENDING);
      expect(validStatuses).toContain(BookingStatus.CONFIRMED);
      expect(validStatuses).toContain(BookingStatus.CANCELLED);
      expect(validStatuses).toContain(BookingStatus.EXPIRED);
    });

    it('should return valid next statuses for CONFIRMED', () => {
      const validStatuses = BookingStatePolicy.getValidNextStatuses(BookingStatus.CONFIRMED);
      expect(validStatuses).toContain(BookingStatus.CANCELLED);
      expect(validStatuses).not.toContain(BookingStatus.PENDING);
    });

    it('should return empty array for CANCELLED', () => {
      const validStatuses = BookingStatePolicy.getValidNextStatuses(BookingStatus.CANCELLED);
      expect(validStatuses).toEqual([]);
    });

    it('should return empty array for EXPIRED', () => {
      const validStatuses = BookingStatePolicy.getValidNextStatuses(BookingStatus.EXPIRED);
      expect(validStatuses).toEqual([]);
    });
  });

  describe('canModify', () => {
    it('should return true for PENDING', () => {
      expect(BookingStatePolicy.canModify(BookingStatus.PENDING)).toBe(true);
    });

    it('should return true for CONFIRMED', () => {
      expect(BookingStatePolicy.canModify(BookingStatus.CONFIRMED)).toBe(true);
    });

    it('should return false for CANCELLED', () => {
      expect(BookingStatePolicy.canModify(BookingStatus.CANCELLED)).toBe(false);
    });

    it('should return false for EXPIRED', () => {
      expect(BookingStatePolicy.canModify(BookingStatus.EXPIRED)).toBe(false);
    });
  });

  describe('canCancel', () => {
    it('should return true for PENDING', () => {
      expect(BookingStatePolicy.canCancel(BookingStatus.PENDING)).toBe(true);
    });

    it('should return true for CONFIRMED', () => {
      expect(BookingStatePolicy.canCancel(BookingStatus.CONFIRMED)).toBe(true);
    });

    it('should return false for CANCELLED', () => {
      expect(BookingStatePolicy.canCancel(BookingStatus.CANCELLED)).toBe(false);
    });

    it('should return false for EXPIRED', () => {
      expect(BookingStatePolicy.canCancel(BookingStatus.EXPIRED)).toBe(false);
    });
  });

  describe('canPay', () => {
    it('should return true for PENDING with UNPAID and not expired', () => {
      expect(
        BookingStatePolicy.canPay(BookingStatus.PENDING, PaymentStatus.UNPAID, false)
      ).toBe(true);
    });

    it('should return false for PENDING with PAID', () => {
      expect(
        BookingStatePolicy.canPay(BookingStatus.PENDING, PaymentStatus.PAID, false)
      ).toBe(false);
    });

    it('should return false for CANCELLED', () => {
      expect(
        BookingStatePolicy.canPay(BookingStatus.CANCELLED, PaymentStatus.UNPAID, false)
      ).toBe(false);
    });

    it('should return false for expired booking', () => {
      expect(
        BookingStatePolicy.canPay(BookingStatus.PENDING, PaymentStatus.UNPAID, true)
      ).toBe(false);
    });
  });

  describe('validateTransition', () => {
    it('should not throw for valid transition', () => {
      expect(() => {
        BookingStatePolicy.validateTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED);
      }).not.toThrow();
    });

    it('should throw for invalid transition', () => {
      expect(() => {
        BookingStatePolicy.validateTransition(BookingStatus.CANCELLED, BookingStatus.CONFIRMED);
      }).toThrow('Invalid state transition');
    });

    it('should include valid transitions in error message', () => {
      try {
        BookingStatePolicy.validateTransition(BookingStatus.CANCELLED, BookingStatus.CONFIRMED);
      } catch (error: any) {
        expect(error.message).toContain('Valid transitions');
      }
    });
  });
});

