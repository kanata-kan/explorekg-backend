// tests/unit/policies/booking/booking.policy.test.ts
import { BookingPolicy } from '../../../../src/policies/booking/booking.policy';
import { IGuest } from '../../../../src/models/guest.model';
import { CreateBookingData } from '../../../../src/services/booking.service';
import { BookingItemType } from '../../../../src/models/booking.model';

describe('BookingPolicy', () => {
  describe('canCreateBooking', () => {
    it('should return true for active (non-expired) guest', () => {
      const guest = {
        isExpired: jest.fn().mockReturnValue(false),
      } as unknown as IGuest;

      expect(BookingPolicy.canCreateBooking(guest)).toBe(true);
      expect(guest.isExpired).toHaveBeenCalled();
    });

    it('should return false for expired guest', () => {
      const guest = {
        isExpired: jest.fn().mockReturnValue(true),
      } as unknown as IGuest;

      expect(BookingPolicy.canCreateBooking(guest)).toBe(false);
      expect(guest.isExpired).toHaveBeenCalled();
    });
  });

  describe('calculateExpirationDate', () => {
    it('should return date 24 hours from now', () => {
      const now = new Date();
      const expirationDate = BookingPolicy.calculateExpirationDate();
      const hoursDiff = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      expect(hoursDiff).toBeCloseTo(24, 0); // Close to 24 hours (within 1 hour tolerance)
    });

    it('should return a future date', () => {
      const expirationDate = BookingPolicy.calculateExpirationDate();
      expect(expirationDate.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('validateBookingData', () => {
    it('should pass validation for valid booking data', () => {
      const data: CreateBookingData = {
        guestId: '507f1f77bcf86cd799439011',
        itemType: BookingItemType.ACTIVITY,
        itemId: '507f1f77bcf86cd799439012',
        numberOfPersons: 2,
      };

      expect(() => BookingPolicy.validateBookingData(data)).not.toThrow();
    });

    it('should throw error if guestId is missing', () => {
      const data: any = {
        itemType: BookingItemType.ACTIVITY,
        itemId: '507f1f77bcf86cd799439012',
      };

      expect(() => BookingPolicy.validateBookingData(data)).toThrow('Guest ID is required');
    });

    it('should throw error if itemType is missing', () => {
      const data: any = {
        guestId: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439012',
      };

      expect(() => BookingPolicy.validateBookingData(data)).toThrow('Item type is required');
    });

    it('should throw error if itemId is missing', () => {
      const data: any = {
        guestId: '507f1f77bcf86cd799439011',
        itemType: BookingItemType.ACTIVITY,
      };

      expect(() => BookingPolicy.validateBookingData(data)).toThrow('Item ID is required');
    });

    it('should throw error if startDate is after endDate', () => {
      const data: CreateBookingData = {
        guestId: '507f1f77bcf86cd799439011',
        itemType: BookingItemType.CAR,
        itemId: '507f1f77bcf86cd799439012',
        startDate: new Date('2025-02-10'),
        endDate: new Date('2025-02-05'),
      };

      expect(() => BookingPolicy.validateBookingData(data)).toThrow(
        'Start date must be before end date'
      );
    });

    it('should throw error if numberOfDays is less than 1 for car', () => {
      const data: CreateBookingData = {
        guestId: '507f1f77bcf86cd799439011',
        itemType: BookingItemType.CAR,
        itemId: '507f1f77bcf86cd799439012',
        numberOfDays: 0,
      };

      // Verify that numberOfDays is 0 and itemType is CAR
      expect(data.itemType).toBe(BookingItemType.CAR);
      expect(data.numberOfDays).toBe(0);
      expect(data.numberOfDays !== undefined).toBe(true);
      expect(data.numberOfDays! < 1).toBe(true);

      expect(() => BookingPolicy.validateBookingData(data)).toThrow(
        'Number of days must be at least 1'
      );
    });

    it('should throw error if numberOfPersons is less than 1 for activity', () => {
      const data: CreateBookingData = {
        guestId: '507f1f77bcf86cd799439011',
        itemType: BookingItemType.ACTIVITY,
        itemId: '507f1f77bcf86cd799439012',
        numberOfPersons: 0,
      };

      // Verify that numberOfPersons is 0 and itemType is ACTIVITY
      expect(data.itemType).toBe(BookingItemType.ACTIVITY);
      expect(data.numberOfPersons).toBe(0);
      expect(data.numberOfPersons !== undefined).toBe(true);
      expect(data.numberOfPersons! < 1).toBe(true);

      expect(() => BookingPolicy.validateBookingData(data)).toThrow(
        'Number of persons must be at least 1'
      );
    });

    it('should not throw error if numberOfDays is undefined for car', () => {
      const data: CreateBookingData = {
        guestId: '507f1f77bcf86cd799439011',
        itemType: BookingItemType.CAR,
        itemId: '507f1f77bcf86cd799439012',
        // numberOfDays is undefined
      };

      expect(() => BookingPolicy.validateBookingData(data)).not.toThrow();
    });

    it('should not throw error if numberOfPersons is undefined for activity', () => {
      const data: CreateBookingData = {
        guestId: '507f1f77bcf86cd799439011',
        itemType: BookingItemType.ACTIVITY,
        itemId: '507f1f77bcf86cd799439012',
        // numberOfPersons is undefined
      };

      expect(() => BookingPolicy.validateBookingData(data)).not.toThrow();
    });
  });
});

