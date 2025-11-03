// src/controllers/booking.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';

/**
 * Booking Controllers
 * HTTP request handlers for booking operations
 */

/**
 * POST /api/v1/bookings
 * Create a new booking
 */
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingData = (req as any).validatedBody || req.body;

    const booking = await bookingService.createBooking(bookingData);

    res.status(201).json({
      success: true,
      data: {
        bookingNumber: booking.bookingNumber,
        guestId: booking.guestId,
        snapshot: {
          itemType: booking.snapshot.itemType,
          title: booking.snapshot.title,
          description: booking.snapshot.description,
        },
        numberOfPersons: booking.numberOfPersons,
        numberOfUnits: booking.numberOfUnits,
        numberOfDays: booking.numberOfDays,
        startDate: booking.startDate,
        endDate: booking.endDate,
        subtotal: booking.subtotal,
        tax: booking.tax,
        discount: booking.discount,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        expiresAt: booking.expiresAt,
        createdAt: booking.createdAt,
      },
      message: 'Booking created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/:bookingNumber
 * Get booking by booking number
 */
export const getBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingNumber } = req.params;

    const booking = await bookingService.findByBookingNumber(bookingNumber);

    res.status(200).json({
      success: true,
      data: {
        bookingNumber: booking.bookingNumber,
        guestId: booking.guestId,
        snapshot: booking.snapshot,
        numberOfPersons: booking.numberOfPersons,
        numberOfUnits: booking.numberOfUnits,
        numberOfDays: booking.numberOfDays,
        startDate: booking.startDate,
        endDate: booking.endDate,
        subtotal: booking.subtotal,
        tax: booking.tax,
        discount: booking.discount,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        expiresAt: booking.expiresAt,
        paymentMethod: booking.paymentMethod,
        paymentTransactionId: booking.paymentTransactionId,
        paidAt: booking.paidAt,
        cancelledAt: booking.cancelledAt,
        cancellationReason: booking.cancellationReason,
        metadata: booking.metadata,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        isExpired: booking.isExpired(),
        canBeCancelled: booking.canBeCancelled(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/guest/:guestId
 * Get all bookings for a guest
 */
export const getGuestBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { guestId } = req.params;

    const bookings = await bookingService.findByGuestId(guestId);

    res.status(200).json({
      success: true,
      data: {
        bookings: bookings.map(booking => ({
          bookingNumber: booking.bookingNumber,
          snapshot: {
            itemType: booking.snapshot.itemType,
            title: booking.snapshot.title,
          },
          totalPrice: booking.totalPrice,
          currency: booking.currency,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          expiresAt: booking.expiresAt,
          createdAt: booking.createdAt,
        })),
        count: bookings.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/bookings/:bookingNumber/status
 * Update booking status
 */
export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingNumber } = req.params;
    const { status } = (req as any).validatedBody || req.body;

    const booking = await bookingService.updateBookingStatus(
      bookingNumber,
      status
    );

    res.status(200).json({
      success: true,
      data: {
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        updatedAt: booking.updatedAt,
      },
      message: `Booking status updated to ${status}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/bookings/:bookingNumber/payment
 * Mark booking as paid
 */
export const markBookingAsPaid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingNumber } = req.params;
    const paymentData = (req as any).validatedBody || req.body;

    const booking = await bookingService.markAsPaid(bookingNumber, paymentData);

    res.status(200).json({
      success: true,
      data: {
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        paymentTransactionId: booking.paymentTransactionId,
        paidAt: booking.paidAt,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
      },
      message: 'Payment processed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/bookings/:bookingNumber/cancel
 * Cancel booking
 */
export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingNumber } = req.params;
    const { reason } = (req as any).validatedBody || req.body;

    const booking = await bookingService.cancelBooking(bookingNumber, reason);

    res.status(200).json({
      success: true,
      data: {
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        cancelledAt: booking.cancelledAt,
        cancellationReason: booking.cancellationReason,
      },
      message: 'Booking cancelled successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings
 * Get all active bookings (admin only)
 */
export const getAllActiveBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await bookingService.findActiveBookings();

    res.status(200).json({
      success: true,
      data: {
        bookings: bookings.map(booking => ({
          bookingNumber: booking.bookingNumber,
          guestId: booking.guestId,
          snapshot: {
            itemType: booking.snapshot.itemType,
            title: booking.snapshot.title,
          },
          totalPrice: booking.totalPrice,
          currency: booking.currency,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          expiresAt: booking.expiresAt,
          createdAt: booking.createdAt,
        })),
        count: bookings.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/statistics
 * Get booking statistics (admin only)
 */
export const getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await bookingService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/bookings/cleanup-expired
 * Clean expired bookings (admin only)
 */
export const cleanupExpired = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cleanedCount = await bookingService.cleanExpiredBookings();

    res.status(200).json({
      success: true,
      data: {
        cleanedCount,
        message: `Marked ${cleanedCount} expired bookings`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Booking Controller Features:
 * - Create booking (POST /bookings)
 * - Get booking by number (GET /bookings/:bookingNumber)
 * - Get guest bookings (GET /bookings/guest/:guestId)
 * - Update status (PATCH /bookings/:bookingNumber/status)
 * - Mark as paid (POST /bookings/:bookingNumber/payment)
 * - Cancel booking (POST /bookings/:bookingNumber/cancel)
 * - Get all active bookings (GET /bookings)
 * - Get statistics (GET /bookings/statistics)
 * - Cleanup expired (POST /bookings/cleanup-expired)
 * - Consistent response format (success, data, message, timestamp)
 * - Error handling via next(error)
 * - Includes helper methods (isExpired, canBeCancelled) in responses
 */
