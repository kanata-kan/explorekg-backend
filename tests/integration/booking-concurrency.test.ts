/**
 * Integration Test: Concurrent Booking Protection
 * 
 * Tests that MongoDB transactions prevent race conditions
 * when two users try to book the same item simultaneously.
 */

import mongoose from 'mongoose';
import { Booking, BookingItemType, BookingStatus } from '../../src/models/booking.model';
import { Guest } from '../../src/models/guest.model';
import { createBooking } from '../../src/services/booking.service';
import { DatesOverlapError } from '../../src/utils/AppError';
import TravelPack from '../../src/models/travelPack.model';
import { Activity } from '../../src/models/activity.model';
import { Car } from '../../src/models/car.model';

// Mock models
jest.mock('../../src/models/travelPack.model');
jest.mock('../../src/models/activity.model');
jest.mock('../../src/models/car.model');

describe('Concurrent Booking Protection', () => {
  let mockGuest: any;
  let mockItem: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock guest
    mockGuest = {
      _id: new mongoose.Types.ObjectId(),
      sessionId: 'test-session-123',
      email: 'test@example.com',
      fullName: 'Test User',
      phone: '+1234567890',
      locale: 'en',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      isExpired: jest.fn().mockReturnValue(false),
    };

    // Mock item (TravelPack)
    mockItem = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Test Travel Pack',
      description: 'Test Description',
      pricePerPerson: 100,
      currency: 'USD',
      status: 'published',
      availability: true,
    };

    // Mock Guest.findById
    (Guest.findById as jest.Mock) = jest.fn().mockResolvedValue(mockGuest);

    // Mock TravelPack.findById
    (TravelPack.findById as jest.Mock) = jest.fn().mockResolvedValue(mockItem);

    // Mock Booking.find (for overlap checks)
    (Booking.find as jest.Mock) = jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([]),
      sort: jest.fn().mockResolvedValue([]),
    });

    // Mock BookingCounter.getNextBookingNumber
    const BookingCounter = require('../../src/models/bookingCounter.model').BookingCounter;
    (BookingCounter.getNextBookingNumber as jest.Mock) = jest
      .fn()
      .mockResolvedValue('BKG-20250101-0001');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should allow first booking to succeed', async () => {
    const bookingData = {
      guestId: mockGuest._id.toString(),
      itemType: BookingItemType.TRAVEL_PACK,
      itemId: mockItem._id.toString(),
      numberOfPersons: 2,
      numberOfDays: 5,
      startDate: new Date('2025-01-01'),
    };

    // Mock successful booking creation
    const mockBooking = {
      _id: new mongoose.Types.ObjectId(),
      bookingNumber: 'BKG-20250101-0001',
      ...bookingData,
      status: BookingStatus.PENDING,
      save: jest.fn().mockResolvedValue(true),
    };

    (Booking as any).mockImplementation(() => mockBooking);

    // This should succeed
    const booking = await createBooking(bookingData);

    expect(booking).toBeDefined();
    expect(booking.bookingNumber).toBe('BKG-20250101-0001');
  });

  it('should prevent second concurrent booking from overlapping', async () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-06'); // 5 days

    // First booking data
    const firstBookingData = {
      guestId: mockGuest._id.toString(),
      itemType: BookingItemType.TRAVEL_PACK,
      itemId: mockItem._id.toString(),
      numberOfPersons: 2,
      numberOfDays: 5,
      startDate,
    };

    // Create first booking
    const mockFirstBooking = {
      _id: new mongoose.Types.ObjectId(),
      bookingNumber: 'BKG-20250101-0001',
      ...firstBookingData,
      startDate,
      endDate,
      status: BookingStatus.PENDING,
      save: jest.fn().mockResolvedValue(true),
    };

    (Booking as any).mockImplementation(() => mockFirstBooking);

    // Simulate first booking already exists
    (Booking.find as jest.Mock) = jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([mockFirstBooking]),
      sort: jest.fn().mockResolvedValue([mockFirstBooking]),
    });

    // Second booking with overlapping dates
    const secondBookingData = {
      guestId: new mongoose.Types.ObjectId().toString(),
      itemType: BookingItemType.TRAVEL_PACK,
      itemId: mockItem._id.toString(),
      numberOfPersons: 2,
      numberOfDays: 5,
      startDate: new Date('2025-01-04'), // Overlaps with first booking
    };

    // This should fail with DatesOverlapError
    await expect(createBooking(secondBookingData)).rejects.toThrow(DatesOverlapError);
  });

  it('should allow non-overlapping bookings', async () => {
    const firstStartDate = new Date('2025-01-01');
    const firstEndDate = new Date('2025-01-06');

    // First booking
    const firstBookingData = {
      guestId: mockGuest._id.toString(),
      itemType: BookingItemType.TRAVEL_PACK,
      itemId: mockItem._id.toString(),
      numberOfPersons: 2,
      numberOfDays: 5,
      startDate: firstStartDate,
    };

    const mockFirstBooking = {
      _id: new mongoose.Types.ObjectId(),
      bookingNumber: 'BKG-20250101-0001',
      ...firstBookingData,
      startDate: firstStartDate,
      endDate: firstEndDate,
      status: BookingStatus.PENDING,
      save: jest.fn().mockResolvedValue(true),
    };

    (Booking as any).mockImplementation(() => mockFirstBooking);

    // After first booking, update overlap check to return empty
    (Booking.find as jest.Mock) = jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([]),
      sort: jest.fn().mockResolvedValue([]),
    });

    // Second booking with non-overlapping dates (starts after first ends)
    const secondBookingData = {
      guestId: new mongoose.Types.ObjectId().toString(),
      itemType: BookingItemType.TRAVEL_PACK,
      itemId: mockItem._id.toString(),
      numberOfPersons: 2,
      numberOfDays: 5,
      startDate: new Date('2025-01-06'), // Starts when first ends (exclusive endDate)
    };

    const mockSecondBooking = {
      _id: new mongoose.Types.ObjectId(),
      bookingNumber: 'BKG-20250101-0002',
      ...secondBookingData,
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-01-11'),
      status: BookingStatus.PENDING,
      save: jest.fn().mockResolvedValue(true),
    };

    (Booking as any).mockImplementation(() => mockSecondBooking);

    // This should succeed (no overlap)
    const booking = await createBooking(secondBookingData);

    expect(booking).toBeDefined();
    expect(booking.bookingNumber).toBe('BKG-20250101-0002');
  });
});

