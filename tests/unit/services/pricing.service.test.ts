// tests/unit/services/pricing.service.test.ts
import {
  calculateSubtotal,
  applyTax,
  applyDiscount,
  calculateTotal,
  calculateDeposit,
  calculatePrice,
  calculatePackRelationPrice,
} from '../../../src/services/pricing.service';
import { BookingItemType, BookingSnapshot } from '../../../src/models/booking.model';
import { CreateBookingData } from '../../../src/services/booking.service';

describe('PricingService', () => {
  describe('calculateSubtotal', () => {
    it('should calculate subtotal for ACTIVITY with numberOfPersons', () => {
      const snapshot: BookingSnapshot = {
        itemType: BookingItemType.ACTIVITY,
        itemId: 'activity-123',
        title: 'Test Activity',
        pricePerPerson: 50,
        currency: 'USD',
        locale: 'en',
        snapshotAt: new Date(),
      };
      const data: CreateBookingData = {
        guestId: 'guest-123',
        itemType: BookingItemType.ACTIVITY,
        itemId: 'activity-123',
        numberOfPersons: 2,
      };

      const subtotal = calculateSubtotal(snapshot, data);
      expect(subtotal).toBe(100);
    });

    it('should calculate subtotal for CAR with numberOfDays', () => {
      const snapshot: BookingSnapshot = {
        itemType: BookingItemType.CAR,
        itemId: 'car-123',
        title: 'Test Car',
        pricePerDay: 100,
        currency: 'USD',
        locale: 'en',
        snapshotAt: new Date(),
      };
      const data: CreateBookingData = {
        guestId: 'guest-123',
        itemType: BookingItemType.CAR,
        itemId: 'car-123',
        numberOfDays: 3,
      };

      const subtotal = calculateSubtotal(snapshot, data);
      expect(subtotal).toBe(300);
    });
  });

  describe('applyTax', () => {
    it('should apply default 10% tax', () => {
      const subtotal = 100;
      const tax = applyTax(subtotal);
      expect(tax).toBe(10);
    });
  });

  describe('applyDiscount', () => {
    it('should apply 10% discount correctly', () => {
      const price = 100;
      const discountPercentage = 10;
      const result = applyDiscount(price, discountPercentage);
      expect(result.discountedPrice).toBe(90);
      expect(result.discountAmount).toBe(10);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total with tax by default', () => {
      const subtotal = 100;
      const total = calculateTotal(subtotal);
      expect(total).toBe(110);
    });
  });

  describe('calculateDeposit', () => {
    it('should calculate 20% deposit by default', () => {
      const total = 100;
      const deposit = calculateDeposit(total);
      expect(deposit).toBe(20);
    });
  });

  describe('calculatePrice', () => {
    it('should calculate complete pricing for ACTIVITY', () => {
      const snapshot: BookingSnapshot = {
        itemType: BookingItemType.ACTIVITY,
        itemId: 'activity-123',
        title: 'Test Activity',
        pricePerPerson: 50,
        currency: 'USD',
        locale: 'en',
        snapshotAt: new Date(),
      };
      const data: CreateBookingData = {
        guestId: 'guest-123',
        itemType: BookingItemType.ACTIVITY,
        itemId: 'activity-123',
        numberOfPersons: 2,
      };

      const pricing = calculatePrice(snapshot, data);
      expect(pricing.subtotal).toBe(100);
      expect(pricing.tax).toBe(10);
      expect(pricing.total).toBe(110);
    });
  });

  describe('calculatePackRelationPrice', () => {
    it('should calculate pricing for pack relations', () => {
      const activitiesTotal = 200;
      const carsTotal = 300;
      const optionalActivitiesTotal = 100;

      const pricing = calculatePackRelationPrice(
        activitiesTotal,
        carsTotal,
        optionalActivitiesTotal,
        undefined,
        { includeTax: false }
      );
      expect(pricing.subtotal).toBe(500);
      expect(pricing.tax).toBe(0);
      expect(pricing.total).toBe(500);
    });
  });
});
