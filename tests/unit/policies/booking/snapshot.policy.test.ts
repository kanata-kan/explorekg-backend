// tests/unit/policies/booking/snapshot.policy.test.ts
import { BookingSnapshotPolicy } from '../../../../src/policies/booking/snapshot.policy';
import { BookingSnapshot, BookingItemType } from '../../../../src/models/booking.model';

describe('BookingSnapshotPolicy', () => {
  const createValidSnapshot = (itemType: BookingItemType): BookingSnapshot => {
    const base = {
      itemId: '507f1f77bcf86cd799439012',
      title: 'Test Item',
      currency: 'USD',
      locale: 'en',
      snapshotAt: new Date(),
    };

    if (itemType === BookingItemType.CAR) {
      return {
        ...base,
        itemType: BookingItemType.CAR,
        pricePerDay: 50,
      } as BookingSnapshot;
    } else {
      return {
        ...base,
        itemType: itemType,
        pricePerPerson: 100,
      } as BookingSnapshot;
    }
  };

  describe('validateSnapshot', () => {
    it('should pass validation for valid TRAVEL_PACK snapshot', () => {
      const snapshot = createValidSnapshot(BookingItemType.TRAVEL_PACK);
      expect(() => BookingSnapshotPolicy.validateSnapshot(snapshot)).not.toThrow();
    });

    it('should pass validation for valid ACTIVITY snapshot', () => {
      const snapshot = createValidSnapshot(BookingItemType.ACTIVITY);
      expect(() => BookingSnapshotPolicy.validateSnapshot(snapshot)).not.toThrow();
    });

    it('should pass validation for valid CAR snapshot', () => {
      const snapshot = createValidSnapshot(BookingItemType.CAR);
      expect(() => BookingSnapshotPolicy.validateSnapshot(snapshot)).not.toThrow();
    });

    it('should throw error if itemType is missing', () => {
      const snapshot: any = {
        itemId: '507f1f77bcf86cd799439012',
        title: 'Test Item',
      };
      expect(() => BookingSnapshotPolicy.validateSnapshot(snapshot)).toThrow(
        'Snapshot itemType is required'
      );
    });

    it('should throw error if itemId is missing', () => {
      const snapshot: any = {
        itemType: BookingItemType.ACTIVITY,
        title: 'Test Item',
      };
      expect(() => BookingSnapshotPolicy.validateSnapshot(snapshot)).toThrow(
        'Snapshot itemId is required'
      );
    });

    it('should throw error if title is missing', () => {
      const snapshot: any = {
        itemType: BookingItemType.ACTIVITY,
        itemId: '507f1f77bcf86cd799439012',
      };
      expect(() => BookingSnapshotPolicy.validateSnapshot(snapshot)).toThrow(
        'Snapshot title is required'
      );
    });

    it('should throw error if currency is missing', () => {
      const snapshot: any = {
        itemType: BookingItemType.ACTIVITY,
        itemId: '507f1f77bcf86cd799439012',
        title: 'Test Item',
      };
      expect(() => BookingSnapshotPolicy.validateSnapshot(snapshot)).toThrow(
        'Snapshot currency is required'
      );
    });

    it('should throw error if pricePerPerson is missing for ACTIVITY', () => {
      const snapshot: any = {
        itemType: BookingItemType.ACTIVITY,
        itemId: '507f1f77bcf86cd799439012',
        title: 'Test Item',
        currency: 'USD',
        locale: 'en',
        snapshotAt: new Date(),
      };
      expect(() => BookingSnapshotPolicy.validateSnapshot(snapshot)).toThrow(
        'pricePerPerson is required'
      );
    });

    it('should throw error if pricePerDay is missing for CAR', () => {
      const snapshot: any = {
        itemType: BookingItemType.CAR,
        itemId: '507f1f77bcf86cd799439012',
        title: 'Test Item',
        currency: 'USD',
        locale: 'en',
        snapshotAt: new Date(),
      };
      expect(() => BookingSnapshotPolicy.validateSnapshot(snapshot)).toThrow(
        'pricePerDay is required'
      );
    });
  });

  describe('isSnapshotComplete', () => {
    it('should return true for valid snapshot', () => {
      const snapshot = createValidSnapshot(BookingItemType.ACTIVITY);
      expect(BookingSnapshotPolicy.isSnapshotComplete(snapshot)).toBe(true);
    });

    it('should return false for invalid snapshot', () => {
      const snapshot: any = {
        itemType: BookingItemType.ACTIVITY,
        // Missing required fields
      };
      expect(BookingSnapshotPolicy.isSnapshotComplete(snapshot)).toBe(false);
    });
  });
});

