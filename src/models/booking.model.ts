// src/models/booking.model.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * Booking Item Types
 * Represents what the user is booking
 */
export enum BookingItemType {
  TRAVEL_PACK = 'travel_pack',
  ACTIVITY = 'activity',
  CAR = 'car',
}

/**
 * Booking Status
 * Lifecycle of a booking
 */
export enum BookingStatus {
  PENDING = 'pending', // Waiting for confirmation/payment
  CONFIRMED = 'confirmed', // Booking confirmed (paid)
  CANCELLED = 'cancelled', // Booking cancelled
  EXPIRED = 'expired', // Booking expired (24h unpaid)
}

/**
 * Payment Status
 */
export enum PaymentStatus {
  UNPAID = 'unpaid', // No payment yet
  PAID = 'paid', // Payment completed
  REFUNDED = 'refunded', // Payment refunded
  FAILED = 'failed', // Payment failed
}

/**
 * Snapshot of booked item
 * Immutable snapshot at booking time
 */
export interface BookingSnapshot {
  itemType: BookingItemType;
  itemId: string; // Original item ID (TravelPack/Activity/Car)

  // Common fields for all types
  title: string;
  description?: string;
  pricePerPerson?: number;
  pricePerUnit?: number;
  currency: string;
  locale: string;

  // TravelPack specific
  duration?: number;
  destinations?: string[];

  // Activity specific
  activityType?: string;
  location?: string;

  // Car specific
  carModel?: string;
  carType?: string;
  pricePerDay?: number;

  // Snapshot metadata
  snapshotAt: Date;
  originalData?: any; // Full original object
}

/**
 * Booking Interface
 */
export interface IBooking extends Document {
  // Unique booking number: BKG-20251101-0001
  bookingNumber: string;

  // Guest information
  guestId: mongoose.Types.ObjectId | string;

  // Booking snapshot (immutable)
  snapshot: BookingSnapshot;

  // Booking details
  numberOfPersons?: number; // For packs/activities
  numberOfUnits?: number; // Generic units
  numberOfDays?: number; // For cars
  startDate?: Date;
  endDate?: Date;

  // Pricing (calculated at booking time)
  subtotal: number;
  tax: number;
  discount: number;
  totalPrice: number;
  currency: string;

  // Status
  status: BookingStatus;
  paymentStatus: PaymentStatus;

  // Expiration for unpaid bookings (24 hours)
  expiresAt: Date;

  // Payment details (mock for now)
  paymentMethod?: string;
  paymentTransactionId?: string;
  paidAt?: Date;

  // Cancellation
  cancelledAt?: Date;
  cancellationReason?: string;

  // Additional metadata
  metadata?: Record<string, any>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isExpired(): boolean;
  canBeCancelled(): boolean;
  calculateExpirationDate(): Date;
}

/**
 * Booking Static Methods Interface
 */
export interface IBookingModel extends Model<IBooking> {
  findByBookingNumber(bookingNumber: string): Promise<IBooking | null>;
  findByGuestId(guestId: string): Promise<IBooking[]>;
  findActiveBookings(): Promise<IBooking[]>;
  findExpiredUnpaid(): Promise<IBooking[]>;
  cleanExpired(): Promise<number>;
  getStatistics(): Promise<any>;
}

/**
 * Booking Schema
 */
const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^BKG-\d{8}-\d{4}$/, // BKG-20251101-0001
    },

    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
      index: true,
    },

    snapshot: {
      itemType: {
        type: String,
        enum: Object.values(BookingItemType),
        required: true,
      },
      itemId: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: String,
      pricePerPerson: Number,
      pricePerUnit: Number,
      currency: {
        type: String,
        required: true,
        default: 'USD',
      },
      locale: {
        type: String,
        required: true,
        enum: ['en', 'fr'],
        default: 'en',
      },
      duration: Number,
      destinations: [String],
      activityType: String,
      location: String,
      carModel: String,
      carType: String,
      pricePerDay: Number,
      snapshotAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      originalData: Schema.Types.Mixed,
    },

    numberOfPersons: {
      type: Number,
      min: 1,
    },
    numberOfUnits: {
      type: Number,
      min: 1,
    },
    numberOfDays: {
      type: Number,
      min: 1,
    },
    startDate: Date,
    endDate: Date,

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },

    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    paymentMethod: String,
    paymentTransactionId: String,
    paidAt: Date,

    cancelledAt: Date,
    cancellationReason: String,

    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Indexes
 */
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL for expired bookings
bookingSchema.index({ guestId: 1, status: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });

/**
 * Instance Methods
 */

/**
 * Check if booking is expired
 */
bookingSchema.methods.isExpired = function (): boolean {
  return (
    this.status === BookingStatus.PENDING &&
    this.paymentStatus === PaymentStatus.UNPAID &&
    new Date() > this.expiresAt
  );
};

/**
 * Check if booking can be cancelled
 */
bookingSchema.methods.canBeCancelled = function (): boolean {
  return (
    this.status === BookingStatus.PENDING ||
    this.status === BookingStatus.CONFIRMED
  );
};

/**
 * Calculate expiration date (24 hours from creation)
 */
bookingSchema.methods.calculateExpirationDate = function (): Date {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24); // 24 hours
  return expirationDate;
};

/**
 * Static Methods
 */

/**
 * Find booking by booking number
 */
bookingSchema.statics.findByBookingNumber = async function (
  bookingNumber: string
): Promise<IBooking | null> {
  return this.findOne({ bookingNumber }).populate('guestId');
};

/**
 * Find all bookings for a guest
 */
bookingSchema.statics.findByGuestId = async function (
  guestId: string
): Promise<IBooking[]> {
  return this.find({ guestId }).sort({ createdAt: -1 });
};

/**
 * Find active bookings (not cancelled, not expired)
 */
bookingSchema.statics.findActiveBookings = async function (): Promise<
  IBooking[]
> {
  return this.find({
    status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

/**
 * Find expired unpaid bookings
 */
bookingSchema.statics.findExpiredUnpaid = async function (): Promise<
  IBooking[]
> {
  return this.find({
    status: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    expiresAt: { $lte: new Date() },
  });
};

/**
 * Clean expired bookings (mark as expired)
 */
bookingSchema.statics.cleanExpired = async function (): Promise<number> {
  const result = await this.updateMany(
    {
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      expiresAt: { $lte: new Date() },
    },
    {
      $set: { status: BookingStatus.EXPIRED },
    }
  );
  return result.modifiedCount;
};

/**
 * Get booking statistics
 */
bookingSchema.statics.getStatistics = async function (): Promise<any> {
  const [total, byStatus, byPaymentStatus, revenue] = await Promise.all([
    this.countDocuments({}),
    this.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
    this.aggregate([
      {
        $match: {
          paymentStatus: PaymentStatus.PAID,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          averageBookingValue: { $avg: '$totalPrice' },
        },
      },
    ]),
  ]);

  return {
    total,
    byStatus: byStatus.reduce(
      (acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      },
      {
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        expired: 0,
      }
    ),
    byPaymentStatus: byPaymentStatus.reduce(
      (acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      },
      {
        unpaid: 0,
        paid: 0,
        refunded: 0,
        failed: 0,
      }
    ),
    revenue: revenue[0] || { totalRevenue: 0, averageBookingValue: 0 },
  };
};

/**
 * Pre-save hook: Auto-calculate expiration if not set
 */
bookingSchema.pre('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = this.calculateExpirationDate();
  }
  next();
});

/**
 * Export Booking Model
 */
export const Booking = mongoose.model<IBooking, IBookingModel>(
  'Booking',
  bookingSchema
);

/**
 * ✅ Booking Model Features:
 * - bookingNumber: BKG-YYYYMMDD-#### format
 * - guestId: Link to Guest
 * - snapshot: Immutable snapshot of booked item
 * - status: pending/confirmed/cancelled/expired
 * - paymentStatus: unpaid/paid/refunded/failed
 * - expiresAt: 24 hours for unpaid bookings
 * - Pricing: subtotal, tax, discount, totalPrice
 * - Instance methods: isExpired(), canBeCancelled()
 * - Static methods: findByBookingNumber(), findByGuestId(), cleanExpired(), etc.
 * - TTL index for auto-deletion of expired bookings
 * - Pre-save hook for auto-expiration calculation
 */
