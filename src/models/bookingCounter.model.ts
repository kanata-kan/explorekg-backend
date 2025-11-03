// src/models/bookingCounter.model.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * Booking Counter Interface
 * Tracks daily booking number sequence
 * Example: For date "20251101", counter starts at 1, 2, 3...
 */
export interface IBookingCounter extends Document {
  date: string; // Format: YYYYMMDD (e.g., "20251101")
  counter: number; // Daily increment (0001, 0002, ...)
  lastBookingNumber: string; // Last generated booking number (BKG-20251101-0001)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking Counter Static Methods
 */
export interface IBookingCounterModel extends Model<IBookingCounter> {
  getNextBookingNumber(date?: Date): Promise<string>;
  resetDailyCounter(date: string): Promise<void>;
}

/**
 * Booking Counter Schema
 */
const bookingCounterSchema = new Schema<IBookingCounter>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\d{8}$/, // YYYYMMDD format
    },
    counter: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastBookingNumber: {
      type: String,
      required: true,
      match: /^BKG-\d{8}-\d{4}$/, // BKG-20251101-0001
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Static Method: Get Next Booking Number
 * Atomically increments counter and returns formatted booking number
 */
bookingCounterSchema.statics.getNextBookingNumber = async function (
  date: Date = new Date()
): Promise<string> {
  // Format date as YYYYMMDD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;

  // Use findOneAndUpdate with upsert for atomic increment
  const result = await this.findOneAndUpdate(
    { date: dateString },
    {
      $inc: { counter: 1 },
      $setOnInsert: { date: dateString },
    },
    {
      new: true, // Return updated document
      upsert: true, // Create if doesn't exist
    }
  );

  // Format counter as 4 digits (0001, 0002, ...)
  const counterString = String(result.counter).padStart(4, '0');

  // Generate booking number: BKG-YYYYMMDD-####
  const bookingNumber = `BKG-${dateString}-${counterString}`;

  // Update lastBookingNumber
  result.lastBookingNumber = bookingNumber;
  await result.save();

  return bookingNumber;
};

/**
 * Static Method: Reset Daily Counter (Admin operation)
 */
bookingCounterSchema.statics.resetDailyCounter = async function (
  date: string
): Promise<void> {
  await this.findOneAndUpdate(
    { date },
    { counter: 0, lastBookingNumber: `BKG-${date}-0000` },
    { upsert: true }
  );
};

/**
 * Index for date lookup
 */
bookingCounterSchema.index({ date: 1 });

/**
 * Export Booking Counter Model
 */
export const BookingCounter = mongoose.model<
  IBookingCounter,
  IBookingCounterModel
>('BookingCounter', bookingCounterSchema);

/**
 * ✅ Booking Counter Features:
 * - Daily counter tracking (resets each day)
 * - Format: BKG-YYYYMMDD-#### (e.g., BKG-20251101-0001)
 * - Atomic increment using findOneAndUpdate
 * - Auto-creates counter document if not exists (upsert)
 * - Thread-safe for concurrent bookings
 * - Tracks lastBookingNumber for audit trail
 * - Admin reset functionality
 */
