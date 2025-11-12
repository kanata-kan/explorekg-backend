// tests/unit/policies/catalog/availability.policy.test.ts
import { AvailabilityPolicy, AvailabilityStatus } from '../../../../src/policies/catalog/availability.policy';
import { BookingItemType } from '../../../../src/models/booking.model';
import { ITravelPack } from '../../../../src/models/travelPack.model';
import { IActivity } from '../../../../src/models/activity.model';
import { ICar } from '../../../../src/models/car.model';

describe('AvailabilityPolicy', () => {
  describe('isItemAvailable', () => {
    describe('TravelPack', () => {
      it('should return true for published pack with availability true', () => {
        const pack: ITravelPack = {
          status: 'published',
          availability: true,
        } as ITravelPack;

        const result = AvailabilityPolicy.isItemAvailable(pack, BookingItemType.TRAVEL_PACK);
        expect(result).toBe(true);
      });

      it('should return true for published pack with availability undefined', () => {
        const pack: ITravelPack = {
          status: 'published',
        } as ITravelPack;

        const result = AvailabilityPolicy.isItemAvailable(pack, BookingItemType.TRAVEL_PACK);
        expect(result).toBe(true);
      });

      it('should return false for published pack with availability false', () => {
        const pack: ITravelPack = {
          status: 'published',
          availability: false,
        } as ITravelPack;

        const result = AvailabilityPolicy.isItemAvailable(pack, BookingItemType.TRAVEL_PACK);
        expect(result).toBe(false);
      });

      it('should return false for draft pack', () => {
        const pack: ITravelPack = {
          status: 'draft',
          availability: true,
        } as ITravelPack;

        const result = AvailabilityPolicy.isItemAvailable(pack, BookingItemType.TRAVEL_PACK);
        expect(result).toBe(false);
      });

      it('should return false for deleted pack', () => {
        const pack: ITravelPack = {
          status: 'published',
          availability: true,
          deletedAt: new Date(),
        } as ITravelPack;

        const result = AvailabilityPolicy.isItemAvailable(pack, BookingItemType.TRAVEL_PACK);
        expect(result).toBe(false);
      });
    });

    describe('Activity', () => {
      it('should return true for active activity with available status', () => {
        const activity: IActivity = {
          status: 'active',
          availabilityStatus: 'available',
        } as IActivity;

        const result = AvailabilityPolicy.isItemAvailable(activity, BookingItemType.ACTIVITY);
        expect(result).toBe(true);
      });

      it('should return false for active activity with unavailable status', () => {
        const activity: IActivity = {
          status: 'active',
          availabilityStatus: 'unavailable',
        } as IActivity;

        const result = AvailabilityPolicy.isItemAvailable(activity, BookingItemType.ACTIVITY);
        expect(result).toBe(false);
      });

      it('should return false for inactive activity', () => {
        const activity: IActivity = {
          status: 'inactive',
          availabilityStatus: 'available',
        } as IActivity;

        const result = AvailabilityPolicy.isItemAvailable(activity, BookingItemType.ACTIVITY);
        expect(result).toBe(false);
      });

      it('should return false for deleted activity', () => {
        const activity: IActivity = {
          status: 'active',
          availabilityStatus: 'available',
          deletedAt: new Date(),
        } as IActivity;

        const result = AvailabilityPolicy.isItemAvailable(activity, BookingItemType.ACTIVITY);
        expect(result).toBe(false);
      });
    });

    describe('Car', () => {
      it('should return true for active car with available status', () => {
        const car: ICar = {
          status: 'active',
          availabilityStatus: 'available',
        } as ICar;

        const result = AvailabilityPolicy.isItemAvailable(car, BookingItemType.CAR);
        expect(result).toBe(true);
      });

      it('should return false for active car with reserved status', () => {
        const car: ICar = {
          status: 'active',
          availabilityStatus: 'reserved',
        } as ICar;

        const result = AvailabilityPolicy.isItemAvailable(car, BookingItemType.CAR);
        expect(result).toBe(false);
      });

      it('should return false for active car with unavailable status', () => {
        const car: ICar = {
          status: 'active',
          availabilityStatus: 'unavailable',
        } as ICar;

        const result = AvailabilityPolicy.isItemAvailable(car, BookingItemType.CAR);
        expect(result).toBe(false);
      });

      it('should return false for inactive car', () => {
        const car: ICar = {
          status: 'inactive',
          availabilityStatus: 'available',
        } as ICar;

        const result = AvailabilityPolicy.isItemAvailable(car, BookingItemType.CAR);
        expect(result).toBe(false);
      });

      it('should return false for deleted car', () => {
        const car: ICar = {
          status: 'active',
          availabilityStatus: 'available',
          deletedAt: new Date(),
        } as ICar;

        const result = AvailabilityPolicy.isItemAvailable(car, BookingItemType.CAR);
        expect(result).toBe(false);
      });
    });

    it('should return false for null item', () => {
      const result = AvailabilityPolicy.isItemAvailable(null, BookingItemType.ACTIVITY);
      expect(result).toBe(false);
    });

    it('should return false for undefined item', () => {
      const result = AvailabilityPolicy.isItemAvailable(undefined, BookingItemType.ACTIVITY);
      expect(result).toBe(false);
    });
  });

  describe('canBookItem', () => {
    it('should return true for available item without dates', () => {
      const activity: IActivity = {
        status: 'active',
        availabilityStatus: 'available',
      } as IActivity;

      const result = AvailabilityPolicy.canBookItem(activity, BookingItemType.ACTIVITY);
      expect(result).toBe(true);
    });

    it('should return false for unavailable item', () => {
      const activity: IActivity = {
        status: 'inactive',
        availabilityStatus: 'available',
      } as IActivity;

      const result = AvailabilityPolicy.canBookItem(activity, BookingItemType.ACTIVITY);
      expect(result).toBe(false);
    });

    it('should return true for available item with future start date', () => {
      const activity: IActivity = {
        status: 'active',
        availabilityStatus: 'available',
      } as IActivity;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const result = AvailabilityPolicy.canBookItem(activity, BookingItemType.ACTIVITY, {
        startDate: futureDate,
      });
      expect(result).toBe(true);
    });

    it('should return true for available item with today start date', () => {
      const activity: IActivity = {
        status: 'active',
        availabilityStatus: 'available',
      } as IActivity;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = AvailabilityPolicy.canBookItem(activity, BookingItemType.ACTIVITY, {
        startDate: today,
      });
      expect(result).toBe(true);
    });

    it('should return false for available item with past start date', () => {
      const activity: IActivity = {
        status: 'active',
        availabilityStatus: 'available',
      } as IActivity;

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      pastDate.setHours(0, 0, 0, 0);

      const result = AvailabilityPolicy.canBookItem(activity, BookingItemType.ACTIVITY, {
        startDate: pastDate,
      });
      expect(result).toBe(false);
    });
  });

  describe('getAvailabilityStatus', () => {
    describe('TravelPack', () => {
      it('should return available for published pack', () => {
        const pack: ITravelPack = {
          status: 'published',
          availability: true,
        } as ITravelPack;

        const result = AvailabilityPolicy.getAvailabilityStatus(pack, BookingItemType.TRAVEL_PACK);
        expect(result).toBe('available');
      });

      it('should return unavailable for draft pack', () => {
        const pack: ITravelPack = {
          status: 'draft',
          availability: true,
        } as ITravelPack;

        const result = AvailabilityPolicy.getAvailabilityStatus(pack, BookingItemType.TRAVEL_PACK);
        expect(result).toBe('unavailable');
      });

      it('should return unavailable for deleted pack', () => {
        const pack: ITravelPack = {
          status: 'published',
          availability: true,
          deletedAt: new Date(),
        } as ITravelPack;

        const result = AvailabilityPolicy.getAvailabilityStatus(pack, BookingItemType.TRAVEL_PACK);
        expect(result).toBe('unavailable');
      });
    });

    describe('Activity', () => {
      it('should return available for active activity with available status', () => {
        const activity: IActivity = {
          status: 'active',
          availabilityStatus: 'available',
        } as IActivity;

        const result = AvailabilityPolicy.getAvailabilityStatus(activity, BookingItemType.ACTIVITY);
        expect(result).toBe('available');
      });

      it('should return unavailable for active activity with unavailable status', () => {
        const activity: IActivity = {
          status: 'active',
          availabilityStatus: 'unavailable',
        } as IActivity;

        const result = AvailabilityPolicy.getAvailabilityStatus(activity, BookingItemType.ACTIVITY);
        expect(result).toBe('unavailable');
      });

      it('should return unavailable for inactive activity', () => {
        const activity: IActivity = {
          status: 'inactive',
          availabilityStatus: 'available',
        } as IActivity;

        const result = AvailabilityPolicy.getAvailabilityStatus(activity, BookingItemType.ACTIVITY);
        expect(result).toBe('unavailable');
      });
    });

    describe('Car', () => {
      it('should return available for active car with available status', () => {
        const car: ICar = {
          status: 'active',
          availabilityStatus: 'available',
        } as ICar;

        const result = AvailabilityPolicy.getAvailabilityStatus(car, BookingItemType.CAR);
        expect(result).toBe('available');
      });

      it('should return reserved for active car with reserved status', () => {
        const car: ICar = {
          status: 'active',
          availabilityStatus: 'reserved',
        } as ICar;

        const result = AvailabilityPolicy.getAvailabilityStatus(car, BookingItemType.CAR);
        expect(result).toBe('reserved');
      });

      it('should return unavailable for inactive car', () => {
        const car: ICar = {
          status: 'inactive',
          availabilityStatus: 'available',
        } as ICar;

        const result = AvailabilityPolicy.getAvailabilityStatus(car, BookingItemType.CAR);
        expect(result).toBe('unavailable');
      });
    });

    it('should return not_found for null item', () => {
      const result = AvailabilityPolicy.getAvailabilityStatus(null, BookingItemType.ACTIVITY);
      expect(result).toBe('not_found');
    });

    it('should return not_found for undefined item', () => {
      const result = AvailabilityPolicy.getAvailabilityStatus(undefined, BookingItemType.ACTIVITY);
      expect(result).toBe('not_found');
    });
  });
});

