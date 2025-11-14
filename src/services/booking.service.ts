// src/services/booking.service.ts
import {
  Booking,
  IBooking,
  BookingSnapshot,
  BookingItemType,
  BookingStatus,
  PaymentStatus,
} from '../models/booking.model';
import { BookingCounter } from '../models/bookingCounter.model';
import { Guest } from '../models/guest.model';
import TravelPack from '../models/travelPack.model';
import { Activity } from '../models/activity.model';
import { Car } from '../models/car.model';
import { NotFoundError, ValidationError, StateTransitionError, DatesOverlapError } from '../utils/AppError';
import { excludeDeleted, isDeleted } from '../utils/softDelete.util';
import mongoose from 'mongoose';
// Business Policy Layer imports
import {
  BookingPolicy,
  BookingStatePolicy,
  BookingSnapshotPolicy,
  TaxPolicy,
  PaymentPolicy,
} from '../policies';
// Pricing Service imports
import { calculatePrice } from './pricing.service';
// Availability & Validation imports
import { DateValidationService } from './dateValidation.service';
import { AvailabilityService } from './availability.service';
// Notification imports
import { NotificationService } from './notification.service';
import { NotificationType } from '../types/notification.types';

/**
 * Create Booking Data Interface
 */
export interface CreateBookingData {
  guestId: string;
  itemType: BookingItemType;
  itemId: string;
  numberOfPersons?: number;
  numberOfUnits?: number;
  numberOfDays?: number;
  startDate?: Date;
  endDate?: Date;
  locale?: string;
  metadata?: Record<string, any>;
}

/**
 * Booking Statistics Interface
 */
export interface BookingStatistics {
  total: number;
  byStatus: {
    pending: number;
    confirmed: number;
    cancelled: number;
    expired: number;
  };
  byPaymentStatus: {
    unpaid: number;
    paid: number;
    refunded: number;
    failed: number;
  };
  revenue: {
    totalRevenue: number;
    averageBookingValue: number;
  };
}

/**
 * Create a snapshot of TravelPack
 */
const createTravelPackSnapshot = async (
  packId: string,
  locale: string = 'en'
): Promise<BookingSnapshot> => {
  const pack = await TravelPack.findOne(
    excludeDeleted({ _id: packId })
  );

  if (!pack || isDeleted(pack)) {
    throw new NotFoundError(`TravelPack with id "${packId}" not found`);
  }

  // Get localized data
  const localizedData = pack.locales[locale as 'en' | 'fr'] || pack.locales.en;

  return {
    itemType: BookingItemType.TRAVEL_PACK,
    itemId: packId,
    title: localizedData?.name || 'Untitled Pack',
    description: localizedData?.description || undefined,
    pricePerPerson: pack.basePrice || 0,
    currency: pack.currency || 'USD',
    locale,
    duration: pack.duration || undefined,
    destinations: [], // TravelPack doesn't have destinations field
    snapshotAt: new Date(),
    originalData: pack.toObject(),
  };
};

/**
 * Create a snapshot of Activity
 */
const createActivitySnapshot = async (
  activityId: string,
  locale: string = 'en'
): Promise<BookingSnapshot> => {
  const activity = await Activity.findOne(
    excludeDeleted({ _id: activityId })
  );

  if (!activity || isDeleted(activity)) {
    throw new NotFoundError(`Activity with id "${activityId}" not found`);
  }

  return {
    itemType: BookingItemType.ACTIVITY,
    itemId: activityId,
    title: activity.name || 'Untitled Activity',
    description: activity.description,
    pricePerPerson: activity.price || 0,
    currency: 'USD',
    locale,
    activityType: activity.metadata?.title || 'activity',
    location: activity.location,
    snapshotAt: new Date(),
    originalData: activity.toObject(),
  };
};

/**
 * Create a snapshot of Car
 */
const createCarSnapshot = async (
  carId: string,
  locale: string = 'en'
): Promise<BookingSnapshot> => {
  const car = await Car.findOne(
    excludeDeleted({ _id: carId })
  );

  if (!car || isDeleted(car)) {
    throw new NotFoundError(`Car with id "${carId}" not found`);
  }

  return {
    itemType: BookingItemType.CAR,
    itemId: carId,
    title: car.name || 'Untitled Car',
    description: car.description,
    pricePerDay: car.pricing?.amount || 0,
    currency: car.pricing?.currency || 'USD',
    locale,
    carModel: car.name,
    carType: car.specs?.transmission || 'N/A',
    snapshotAt: new Date(),
    originalData: car.toObject(),
  };
};

/**
 * Create booking snapshot based on item type
 */
const createBookingSnapshot = async (
  itemType: BookingItemType,
  itemId: string,
  locale: string = 'en'
): Promise<BookingSnapshot> => {
  switch (itemType) {
    case BookingItemType.TRAVEL_PACK:
      return createTravelPackSnapshot(itemId, locale);

    case BookingItemType.ACTIVITY:
      return createActivitySnapshot(itemId, locale);

    case BookingItemType.CAR:
      return createCarSnapshot(itemId, locale);

    default:
      throw new ValidationError(`Invalid item type: ${itemType}`);
  }
};

/**
 * Calculate booking price
 * Uses unified PricingService for consistent pricing calculations
 */
const calculateBookingPrice = (
  snapshot: BookingSnapshot,
  data: CreateBookingData
): { subtotal: number; tax: number; discount: number; totalPrice: number } => {
  // Use unified PricingService
  const pricing = calculatePrice(snapshot, data, {
    includeTax: true,
    includeDeposit: false,
  });

  return {
    subtotal: pricing.subtotal,
    tax: pricing.tax,
    discount: pricing.discount,
    totalPrice: pricing.total,
  };
};

/**
 * Create a new booking
 */
export const createBooking = async (
  data: CreateBookingData
): Promise<IBooking> => {
  try {
    // Validate booking data using policy
    BookingPolicy.validateBookingData(data);

    // Validate guest exists and is not expired
    // Validate guestId is ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(data.guestId)) {
      throw new ValidationError('Invalid Guest ID format. Must be MongoDB ObjectId (24 hex characters).');
    }

    // Find guest by ObjectId only
    const guest = await Guest.findById(data.guestId);

    if (!guest) {
      // Try to find all guests with similar sessionId for debugging
      const allGuests = await Guest.find({}).limit(5).exec();
      console.log('[Booking Service] Sample guests in DB:', allGuests.map(g => ({
        _id: g._id,
        sessionId: g.sessionId,
        email: g.email,
      })));
      
      throw new NotFoundError(`Guest with id "${data.guestId}" not found`);
    }

    // Use policy to check if guest can create booking
    if (!BookingPolicy.canCreateBooking(guest)) {
      throw new ValidationError('Guest session has expired');
    }

    // Check item availability
    const isAvailable = await AvailabilityService.checkItemAvailability(
      data.itemType,
      data.itemId
    );

    if (!isAvailable) {
      throw new ValidationError('Item is not available for booking');
    }

    // Auto-calculate endDate from startDate + numberOfDays if needed
    // This implements the requirement: "العميل يختار باقة ديال 5 أيام مثلاً، ويحدد تاريخ البداية.
    // النظام أوتوماتيكياً كيحسب تاريخ النهاية"
    let { startDate, endDate } = DateValidationService.autoCalculateDates(
      data.startDate,
      data.endDate,
      data.numberOfDays
    );

    // Validate dates if provided
    if (startDate && endDate) {
      // Validate date range
      DateValidationService.validateDateRange(startDate, endDate);

      // Validate that start date is in the future (allow today)
      DateValidationService.validateFutureDate(startDate, true);
    }

    // Create booking snapshot (before transaction)
    const snapshot = await createBookingSnapshot(
      data.itemType,
      data.itemId,
      data.locale || 'en'
    );

    // Validate snapshot using policy
    BookingSnapshotPolicy.validateSnapshot(snapshot);

    // Calculate pricing
    const pricing = calculateBookingPrice(snapshot, data);

    // Calculate expiration date using policy
    const expiresAt = BookingPolicy.calculateExpirationDate();

    // Start MongoDB transaction for atomic booking creation
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check for overlapping bookings INSIDE transaction (atomic check)
      if (startDate && endDate) {
        const hasOverlap = await AvailabilityService.checkOverlappingBookings(
          data.itemType,
          data.itemId,
          startDate,
          endDate,
          undefined,
          session
        );

        if (hasOverlap) {
          // Get overlapping bookings for error message
          const overlappingBookings = await AvailabilityService.getOverlappingBookings(
            data.itemType,
            data.itemId,
            startDate,
            endDate,
            undefined,
            session
          );

          // Suggest alternative dates
          let alternativeDates: Array<{ startDate: Date; endDate: Date; gapSizeDays: number }> = [];
          if (data.numberOfDays) {
            alternativeDates = await AvailabilityService.suggestAlternativeDates(
              data.itemType,
              data.itemId,
              startDate,
              data.numberOfDays,
              30 // Look ahead 30 days
            );
          }

          // Build structured error response
          const conflictingBookings = overlappingBookings.map((b) => ({
            bookingNumber: b.bookingNumber,
            startDate: b.startDate!,
            endDate: b.endDate!,
          }));

          throw new DatesOverlapError(
            'The selected dates overlap with an existing booking.',
            conflictingBookings,
            alternativeDates
          );
        }
      }

      // Generate unique booking number (inside transaction)
      const bookingNumber = await BookingCounter.getNextBookingNumber(new Date());

      // Create booking (inside transaction)
      // Use the actual MongoDB _id from guest (not the UUID sessionId)
      const booking = new Booking({
      bookingNumber,
      guestId: guest._id, // Use ObjectId from guest, not the UUID sessionId
      snapshot,
      numberOfPersons: data.numberOfPersons,
      numberOfUnits: data.numberOfUnits,
      numberOfDays: data.numberOfDays,
      startDate: startDate || data.startDate, // Use calculated dates
      endDate: endDate || data.endDate,
      ...pricing,
      currency: snapshot.currency,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      expiresAt, // Explicitly set expiration
      metadata: data.metadata,
    });

      // expiresAt is now explicitly set
      await booking.save({ session });

      // Commit transaction
      await session.commitTransaction();

      // Send booking confirmation notification
      await NotificationService.sendEvent({
        type: NotificationType.BOOKING_CONFIRMATION,
        recipient: {
          email: guest.email,
          name: guest.fullName,
          locale: guest.locale,
        },
        data: {
          bookingNumber: booking.bookingNumber,
          itemName: snapshot.title,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalAmount: booking.totalPrice,
          currency: booking.currency,
          expiresAt: booking.expiresAt,
        },
        metadata: {
          source: 'booking.service.createBooking',
          correlationId: booking.bookingNumber,
        },
      });

      return booking;
    } catch (error: any) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw new ValidationError('Invalid ID format');
    }
    throw error;
  }
};

/**
 * Find booking by booking number
 */
export const findByBookingNumber = async (
  bookingNumber: string
): Promise<IBooking> => {
  const booking = await Booking.findByBookingNumber(bookingNumber);

  if (!booking) {
    throw new NotFoundError(`Booking with number "${bookingNumber}" not found`);
  }

  // Check if expired and update status
  if (booking.isExpired() && booking.status === BookingStatus.PENDING) {
    booking.status = BookingStatus.EXPIRED;
    await booking.save();
  }

  return booking;
};

/**
 * Find all bookings for a guest
 * Requires MongoDB ObjectId format
 */
export const findByGuestId = async (guestId: string): Promise<IBooking[]> => {
  // Validate guestId is ObjectId format
  if (!/^[0-9a-fA-F]{24}$/.test(guestId)) {
    throw new ValidationError('Invalid Guest ID format. Must be MongoDB ObjectId (24 hex characters).');
  }

  // Find guest by ObjectId only
  const guest = await Guest.findById(guestId);

  if (!guest) {
    throw new NotFoundError(`Guest with id "${guestId}" not found`);
  }

  // Use the actual _id for booking lookup
  return Booking.findByGuestId(guest._id.toString());
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingNumber: string,
  status: BookingStatus
): Promise<IBooking> => {
  const booking = await findByBookingNumber(bookingNumber);

  // Validate status transition using policy
  // StateTransitionError will be thrown if invalid
  BookingStatePolicy.validateTransition(booking.status, status);

  booking.status = status;
  await booking.save();

  return booking;
};

/**
 * Mark booking as paid
 */
export const markAsPaid = async (
  bookingNumber: string,
  paymentData: {
    paymentMethod: string;
    paymentTransactionId: string;
  }
): Promise<IBooking> => {
  const booking = await findByBookingNumber(bookingNumber);

  // Use PaymentPolicy to validate if booking can be paid
  PaymentPolicy.validateCanPay(booking);

  // Use PaymentPolicy to get correct statuses after payment
  booking.paymentStatus = PaymentPolicy.getPaymentStatusAfterPayment();
  booking.status = PaymentPolicy.getBookingStatusAfterPayment();
  booking.paymentMethod = paymentData.paymentMethod;
  booking.paymentTransactionId = paymentData.paymentTransactionId;
  booking.paidAt = new Date();

  await booking.save();

  // Send payment confirmation notification
  const guest = await Guest.findById(booking.guestId);
  if (guest) {
    await NotificationService.sendEvent({
      type: NotificationType.PAYMENT_CONFIRMATION,
        recipient: {
          email: guest.email,
          name: guest.fullName,
          locale: guest.locale,
        },
        data: {
          bookingNumber: booking.bookingNumber,
          amountPaid: booking.totalPrice,
          currency: booking.currency,
        paymentDate: new Date(),
        paymentTransactionId: paymentData.paymentTransactionId,
      },
      metadata: {
        source: 'booking.service.markAsPaid',
        correlationId: booking.bookingNumber,
      },
    });
  }

  return booking;
};

/**
 * Cancel booking
 */
export const cancelBooking = async (
  bookingNumber: string,
  reason?: string
): Promise<IBooking> => {
  const booking = await findByBookingNumber(bookingNumber);

  // Use policy to check if booking can be cancelled
  if (!BookingStatePolicy.canCancel(booking.status)) {
    throw new ValidationError(
      'Booking cannot be cancelled (already cancelled or expired)'
    );
  }

  // Validate state transition
  BookingStatePolicy.validateTransition(booking.status, BookingStatus.CANCELLED);

  booking.status = BookingStatus.CANCELLED;
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason || 'User requested cancellation';

  // Use PaymentPolicy to get correct payment status after cancellation
  booking.paymentStatus = PaymentPolicy.getPaymentStatusAfterCancellation(
    booking.paymentStatus
  );

  await booking.save();

  // Send cancellation notification
  const guest = await Guest.findById(booking.guestId);
  if (guest) {
    await NotificationService.sendEvent({
      type: NotificationType.BOOKING_CANCELLATION,
      recipient: {
        email: guest.email,
        name: guest.fullName,
        locale: guest.locale,
      },
      data: {
        bookingNumber: booking.bookingNumber,
        cancellationReason: reason || 'User requested',
        cancellationDate: new Date(),
        refundAmount: booking.paymentStatus === PaymentStatus.PAID ? booking.totalPrice : undefined,
        currency: booking.currency,
      },
      metadata: {
        source: 'booking.service.cancelBooking',
        correlationId: booking.bookingNumber,
      },
    });
  }

  return booking;
};

/**
 * Get all active bookings
 */
export const findActiveBookings = async (): Promise<IBooking[]> => {
  return Booking.findActiveBookings();
};

/**
 * Clean expired bookings (mark as expired)
 */
export const cleanExpiredBookings = async (): Promise<number> => {
  const expiredBookings = await Booking.findExpiredUnpaid();

  // Send expiration notifications
  for (const booking of expiredBookings) {
    const guest = await Guest.findById(booking.guestId);
    if (guest) {
      await NotificationService.sendEvent({
        type: NotificationType.BOOKING_EXPIRATION,
        recipient: {
          email: guest.email,
          name: guest.fullName,
          locale: guest.locale,
        },
        data: {
          bookingNumber: booking.bookingNumber,
          expirationDate: new Date(),
          expirationReason: 'Payment not received within 24 hours',
        },
        metadata: {
          source: 'booking.service.cleanExpiredBookings',
          correlationId: booking.bookingNumber,
        },
      });
    }
  }

  return Booking.cleanExpired();
};

/**
 * Get booking statistics
 */
export const getStatistics = async (): Promise<BookingStatistics> => {
  return Booking.getStatistics();
};

/**
 * Export service object
 */
export const BookingService = {
  createBooking,
  findByBookingNumber,
  findByGuestId,
  updateBookingStatus,
  markAsPaid,
  cancelBooking,
  findActiveBookings,
  cleanExpiredBookings,
  getStatistics,
};

/**
 * ✅ Booking Service Features:
 * - createBooking: Generate bookingNumber, create snapshot, calculate price
 * - Snapshot logic: Immutable copy of TravelPack/Activity/Car at booking time
 * - BookingNumber generation: BKG-YYYYMMDD-#### via BookingCounter
 * - Price calculation: Based on item type (persons/days)
 * - Payment flow: markAsPaid with transaction tracking
 * - Cancellation: With refund support
 * - Expiration: 24-hour auto-expiry for unpaid bookings
 * - Mock email notifications: Console logs for all events
 * - Statistics: Revenue, status breakdown
 */
