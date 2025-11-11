// tests/unit/policies/guest/guest.policy.test.ts
import { GuestPolicy } from '../../../../src/policies/guest/guest.policy';
import { IGuest } from '../../../../src/models/guest.model';

describe('GuestPolicy', () => {
  describe('canCreateGuest', () => {
    it('should pass validation for valid email', () => {
      expect(() => GuestPolicy.canCreateGuest('test@example.com')).not.toThrow();
    });

    it('should throw error for invalid email format', () => {
      expect(() => GuestPolicy.canCreateGuest('invalid-email')).toThrow('Invalid email format');
    });

    it('should throw error for email without @', () => {
      expect(() => GuestPolicy.canCreateGuest('testexample.com')).toThrow('Invalid email format');
    });

    it('should throw error for email without domain', () => {
      expect(() => GuestPolicy.canCreateGuest('test@')).toThrow('Invalid email format');
    });
  });

  describe('canUpdateGuest', () => {
    it('should return true for guest without userId and not expired', () => {
      const guest = {
        userId: null,
        isExpired: jest.fn().mockReturnValue(false),
      } as unknown as IGuest;

      expect(GuestPolicy.canUpdateGuest(guest)).toBe(true);
    });

    it('should return false for guest with userId', () => {
      const guest = {
        userId: '507f1f77bcf86cd799439011',
        isExpired: jest.fn().mockReturnValue(false),
      } as unknown as IGuest;

      expect(GuestPolicy.canUpdateGuest(guest)).toBe(false);
    });

    it('should return false for expired guest', () => {
      const guest = {
        userId: null,
        isExpired: jest.fn().mockReturnValue(true),
      } as unknown as IGuest;

      expect(GuestPolicy.canUpdateGuest(guest)).toBe(false);
    });
  });

  describe('canLinkToUser', () => {
    it('should return true for guest that can be linked', () => {
      const guest = {
        canBeLinkedToUser: jest.fn().mockReturnValue(true),
      } as unknown as IGuest;

      expect(GuestPolicy.canLinkToUser(guest)).toBe(true);
      expect(guest.canBeLinkedToUser).toHaveBeenCalled();
    });

    it('should return false for guest that cannot be linked', () => {
      const guest = {
        canBeLinkedToUser: jest.fn().mockReturnValue(false),
      } as unknown as IGuest;

      expect(GuestPolicy.canLinkToUser(guest)).toBe(false);
      expect(guest.canBeLinkedToUser).toHaveBeenCalled();
    });
  });

  describe('calculateExpirationDate', () => {
    it('should return date 30 days from now by default', () => {
      const now = new Date();
      const expirationDate = GuestPolicy.calculateExpirationDate();
      const daysDiff = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeCloseTo(30, 0); // Close to 30 days (within 1 day tolerance)
    });

    it('should return date with custom days', () => {
      const now = new Date();
      const expirationDate = GuestPolicy.calculateExpirationDate(60);
      const daysDiff = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeCloseTo(60, 0);
    });

    it('should return a future date', () => {
      const expirationDate = GuestPolicy.calculateExpirationDate();
      expect(expirationDate.getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw error for days less than 1', () => {
      expect(() => GuestPolicy.calculateExpirationDate(0)).toThrow(
        'Expiration days must be at least 1'
      );
      expect(() => GuestPolicy.calculateExpirationDate(-1)).toThrow(
        'Expiration days must be at least 1'
      );
    });
  });

  describe('isGuestSessionValid', () => {
    it('should return true for non-expired guest', () => {
      const guest = {
        isExpired: jest.fn().mockReturnValue(false),
      } as unknown as IGuest;

      expect(GuestPolicy.isGuestSessionValid(guest)).toBe(true);
      expect(guest.isExpired).toHaveBeenCalled();
    });

    it('should return false for expired guest', () => {
      const guest = {
        isExpired: jest.fn().mockReturnValue(true),
      } as unknown as IGuest;

      expect(GuestPolicy.isGuestSessionValid(guest)).toBe(false);
      expect(guest.isExpired).toHaveBeenCalled();
    });
  });
});

