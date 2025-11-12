// @ts-ignore
import { AvailabilityService } from '../../../src/services/availability.service';
import { Booking, BookingItemType, BookingStatus } from '../../../src/models/booking.model';
import TravelPack from '../../../src/models/travelPack.model';
import { Activity } from '../../../src/models/activity.model';
import { Car } from '../../../src/models/car.model';
import { NotFoundError, ValidationError } from '../../../src/utils/AppError';

jest.mock('../../../src/models/booking.model');
jest.mock('../../../src/models/travelPack.model');
jest.mock('../../../src/models/activity.model');
jest.mock('../../../src/models/car.model');
jest.mock('../../../src/services/dateValidation.service', () => ({
  DateValidationService: {
    validateDateRange: jest.fn(),
    calculateEndDate: jest.fn((startDate: Date, days: number) => {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      return endDate;
    }),
    calculateDurationInDays: jest.fn((start: Date, end: Date) => {
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }),
  },
}));

describe('AvailabilityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkItemAvailability', () => {
    it('should return true for available TravelPack', async () => {
      const mockPack = {
        _id: 'pack-123',
        status: 'published',
        availability: true,
      };

      (TravelPack.findById as jest.Mock).mockResolvedValue(mockPack);

      const result = await AvailabilityService.checkItemAvailability(
        BookingItemType.TRAVEL_PACK,
        'pack-123'
      );

      expect(result).toBe(true);
      expect(TravelPack.findById).toHaveBeenCalledWith('pack-123');
    });

    it('should return false for unpublished TravelPack', async () => {
      const mockPack = {
        _id: 'pack-123',
        status: 'draft',
        availability: true,
      };

      (TravelPack.findById as jest.Mock).mockResolvedValue(mockPack);

      const result = await AvailabilityService.checkItemAvailability(
        BookingItemType.TRAVEL_PACK,
        'pack-123'
      );

      expect(result).toBe(false);
    });

    it('should return false for TravelPack with availability = false', async () => {
      const mockPack = {
        _id: 'pack-123',
        status: 'published',
        availability: false,
      };

      (TravelPack.findById as jest.Mock).mockResolvedValue(mockPack);

      const result = await AvailabilityService.checkItemAvailability(
        BookingItemType.TRAVEL_PACK,
        'pack-123'
      );

      expect(result).toBe(false);
    });

    it('should return true for available Activity', async () => {
      const mockActivity = {
        _id: 'activity-123',
        status: 'active',
      };

      (Activity.findById as jest.Mock).mockResolvedValue(mockActivity);

      const result = await AvailabilityService.checkItemAvailability(
        BookingItemType.ACTIVITY,
        'activity-123'
      );

      expect(result).toBe(true);
    });

    it('should return false for inactive Activity', async () => {
      const mockActivity = {
        _id: 'activity-123',
        status: 'inactive',
      };

      (Activity.findById as jest.Mock).mockResolvedValue(mockActivity);

      const result = await AvailabilityService.checkItemAvailability(
        BookingItemType.ACTIVITY,
        'activity-123'
      );

      expect(result).toBe(false);
    });

    it('should return true for available Car', async () => {
      const mockCar = {
        _id: 'car-123',
        status: 'available',
      };

      (Car.findById as jest.Mock).mockResolvedValue(mockCar);

      const result = await AvailabilityService.checkItemAvailability(
        BookingItemType.CAR,
        'car-123'
      );

      expect(result).toBe(true);
    });

    it('should return false for unavailable Car', async () => {
      const mockCar = {
        _id: 'car-123',
        status: 'unavailable',
      };

      (Car.findById as jest.Mock).mockResolvedValue(mockCar);

      const result = await AvailabilityService.checkItemAvailability(
        BookingItemType.CAR,
        'car-123'
      );

      expect(result).toBe(false);
    });

    it('should throw NotFoundError if item not found', async () => {
      (TravelPack.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        AvailabilityService.checkItemAvailability(BookingItemType.TRAVEL_PACK, 'pack-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid item type', async () => {
      await expect(
        AvailabilityService.checkItemAvailability('invalid' as any, 'item-123')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('checkDateAvailability', () => {
    it('should return true if dates are available', async () => {
      (Booking.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });

      const result = await AvailabilityService.checkDateAvailability(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        new Date('2025-01-06')
      );

      expect(result).toBe(true);
    });

    it('should return false if dates overlap', async () => {
      const mockBooking = {
        bookingNumber: 'BKG-123',
        startDate: new Date('2025-01-04'),
        endDate: new Date('2025-01-08'),
      };

      (Booking.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue([mockBooking]),
      });

      const result = await AvailabilityService.checkDateAvailability(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        new Date('2025-01-06')
      );

      expect(result).toBe(false);
    });
  });

  describe('checkOverlappingBookings', () => {
    it('should return true if there are overlapping bookings (exclusive endDate logic)', async () => {
      // Existing booking: Jan 4 (inclusive) to Jan 8 (exclusive)
      // New booking: Jan 1 (inclusive) to Jan 6 (exclusive)
      // Overlap: true (Jan 4 and Jan 5 are in both ranges)
      const mockBooking = {
        bookingNumber: 'BKG-123',
        startDate: new Date('2025-01-04'),
        endDate: new Date('2025-01-08'),
      };

      (Booking.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue([mockBooking]),
      });

      const result = await AvailabilityService.checkOverlappingBookings(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        new Date('2025-01-06')
      );

      expect(result).toBe(true);
    });

    it('should return false if there are no overlapping bookings', async () => {
      (Booking.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });

      const result = await AvailabilityService.checkOverlappingBookings(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        new Date('2025-01-06')
      );

      expect(result).toBe(false);
    });

    it('should return false if ranges do not overlap (exclusive endDate)', async () => {
      // Existing booking: Jan 1 (inclusive) to Jan 6 (exclusive)
      // New booking: Jan 6 (inclusive) to Jan 10 (exclusive)
      // No overlap: end1 is exclusive, so ranges don't touch
      (Booking.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });

      const result = await AvailabilityService.checkOverlappingBookings(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-06'),
        new Date('2025-01-10')
      );

      expect(result).toBe(false);
    });

    it('should exclude booking when excludeBookingNumber is provided', async () => {
      (Booking.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });

      await AvailabilityService.checkOverlappingBookings(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        new Date('2025-01-06'),
        'BKG-123'
      );

      expect(Booking.find).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingNumber: { $ne: 'BKG-123' },
        })
      );
    });

    it('should use MongoDB session when provided', async () => {
      const mockSession = { sessionId: 'test-session' };
      const mockQueryBuilder = {
        limit: jest.fn().mockResolvedValue([]),
        session: jest.fn().mockReturnThis(),
      };

      (Booking.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      await AvailabilityService.checkOverlappingBookings(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        new Date('2025-01-06'),
        undefined,
        mockSession
      );

      expect(mockQueryBuilder.session).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('getOverlappingBookings', () => {
    it('should return overlapping bookings sorted by startDate', async () => {
      const mockBookings = [
        {
          bookingNumber: 'BKG-001',
          startDate: new Date('2025-01-04'),
          endDate: new Date('2025-01-08'),
        },
        {
          bookingNumber: 'BKG-002',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-15'),
        },
      ];

      const mockQueryBuilder = {
        sort: jest.fn().mockResolvedValue(mockBookings),
        session: jest.fn().mockReturnThis(),
      };

      (Booking.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await AvailabilityService.getOverlappingBookings(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        new Date('2025-01-20')
      );

      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ startDate: 1 });
      expect(result).toEqual(mockBookings);
    });
  });

  describe('suggestAlternativeDates', () => {
    it('should suggest dates when no bookings exist', async () => {
      (Booking.find as jest.Mock).mockResolvedValue([]);

      const result = await AvailabilityService.suggestAlternativeDates(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        5,
        30
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('startDate');
      expect(result[0]).toHaveProperty('endDate');
      expect(result[0]).toHaveProperty('gapSizeDays');
    });

    it('should suggest dates in gaps between bookings', async () => {
      const mockBookings = [
        {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-06'), // Jan 1-6 (exclusive)
        },
        {
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-15'), // Jan 10-15 (exclusive)
        },
      ];

      (Booking.find as jest.Mock).mockResolvedValue(mockBookings);

      const result = await AvailabilityService.suggestAlternativeDates(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        3, // 3 days
        30
      );

      expect(result.length).toBeGreaterThan(0);
      // Should suggest dates in the gap between Jan 6 and Jan 10
      expect(result[0].startDate.getTime()).toBeGreaterThanOrEqual(
        new Date('2025-01-06').getTime()
      );
    });

    it('should return max 5 suggestions', async () => {
      const mockBookings = Array.from({ length: 10 }, (_, i) => ({
        startDate: new Date(`2025-01-${String(i * 2 + 1).padStart(2, '0')}`),
        endDate: new Date(`2025-01-${String(i * 2 + 3).padStart(2, '0')}`),
      }));

      (Booking.find as jest.Mock).mockResolvedValue(mockBookings);

      const result = await AvailabilityService.suggestAlternativeDates(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        1,
        30
      );

      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should sort suggestions by startDate (closest first)', async () => {
      const mockBookings = [
        {
          startDate: new Date('2025-01-05'),
          endDate: new Date('2025-01-10'),
        },
      ];

      (Booking.find as jest.Mock).mockResolvedValue(mockBookings);

      const result = await AvailabilityService.suggestAlternativeDates(
        BookingItemType.TRAVEL_PACK,
        'pack-123',
        new Date('2025-01-01'),
        2,
        30
      );

      if (result.length > 1) {
        for (let i = 1; i < result.length; i++) {
          expect(result[i].startDate.getTime()).toBeGreaterThanOrEqual(
            result[i - 1].startDate.getTime()
          );
        }
      }
    });
  });
});
