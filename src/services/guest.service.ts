// src/services/guest.service.ts
import { Guest, IGuest } from '../models/guest.model';
import { NotFoundError, ValidationError } from '../utils/AppError';
import { v4 as uuidv4 } from 'uuid';
import {
  signSession,
  generateSessionFingerprint,
} from '../utils/sessionSecurity';

/**
 * Guest Service Layer
 * Business logic for guest management and lifecycle
 */

/**
 * Guest creation data interface
 */
export interface CreateGuestData {
  email: string;
  fullName: string;
  phone: string;
  locale?: 'en' | 'fr';
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    source?: 'web' | 'mobile' | 'api';
  };
}

/**
 * Guest update data interface
 */
export interface UpdateGuestData {
  email?: string;
  fullName?: string;
  phone?: string;
  locale?: 'en' | 'fr';
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    source?: 'web' | 'mobile' | 'api';
  };
}

/**
 * Guest statistics interface
 */
export interface GuestStatistics {
  total: number;
  active: number;
  expired: number;
  byLocale: {
    en: number;
    fr: number;
  };
  canMigrate: number;
  linked: number;
}

/**
 * Create a new guest with auto-generated sessionId
 */
export const createGuest = async (data: CreateGuestData): Promise<IGuest> => {
  try {
    // Generate unique UUID v4 for sessionId
    const sessionId = uuidv4();

    // Check if email already exists (optional: allow duplicate emails for guests)
    const existingGuest = await Guest.findByEmail(data.email);
    if (existingGuest && !existingGuest.isExpired()) {
      throw new ValidationError(
        `Guest with email ${data.email} already exists and is active`
      );
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create guest document
    const guest = new Guest({
      sessionId,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      locale: data.locale || 'en',
      metadata: {
        userAgent: data.metadata?.userAgent || '',
        ipAddress: data.metadata?.ipAddress || '',
        source: data.metadata?.source || 'web',
      },
      canMigrate: true,
      userId: null,
      expiresAt,
    });

    await guest.save();

    return guest;
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error (unlikely for UUID, but handle it)
      throw new ValidationError('Session ID conflict. Please try again.');
    }
    throw error;
  }
};

/**
 * Find guest by sessionId
 */
export const findBySessionId = async (sessionId: string): Promise<IGuest> => {
  const guest = await Guest.findBySessionId(sessionId);

  if (!guest) {
    throw new NotFoundError(`Guest with sessionId "${sessionId}" not found`);
  }

  // Check if expired
  if (guest.isExpired()) {
    throw new ValidationError(
      `Guest session "${sessionId}" has expired on ${guest.expiresAt.toISOString()}`
    );
  }

  return guest;
};

/**
 * Find guest by email
 */
export const findByEmail = async (email: string): Promise<IGuest | null> => {
  const guest = await Guest.findByEmail(email);

  if (!guest) {
    return null;
  }

  // Check if expired
  if (guest.isExpired()) {
    return null;
  }

  return guest;
};

/**
 * Update guest information
 */
export const updateGuest = async (
  sessionId: string,
  updateData: UpdateGuestData
): Promise<IGuest> => {
  // Find guest first to validate existence and expiration
  const guest = await findBySessionId(sessionId);

  // Check if guest is linked to user (prevent updates if linked)
  if (guest.userId) {
    throw new ValidationError(
      'Cannot update guest information - already linked to registered user'
    );
  }

  // Apply updates
  if (updateData.email) guest.email = updateData.email;
  if (updateData.fullName) guest.fullName = updateData.fullName;
  if (updateData.phone) guest.phone = updateData.phone;
  if (updateData.locale) guest.locale = updateData.locale;

  // Update metadata
  if (updateData.metadata) {
    guest.metadata = {
      ...guest.metadata,
      ...updateData.metadata,
    };
  }

  await guest.save();

  return guest;
};

/**
 * Extend guest expiration date (add more time)
 */
export const extendExpiration = async (
  sessionId: string,
  daysToAdd: number = 30
): Promise<IGuest> => {
  const guest = await findBySessionId(sessionId);

  const newExpiresAt = new Date(guest.expiresAt);
  newExpiresAt.setDate(newExpiresAt.getDate() + daysToAdd);

  guest.expiresAt = newExpiresAt;
  await guest.save();

  return guest;
};

/**
 * Link guest to registered user (migration path)
 */
export const linkToUser = async (
  sessionId: string,
  userId: string
): Promise<IGuest> => {
  const guest = await findBySessionId(sessionId);

  // Validate guest can be linked
  if (!guest.canBeLinkedToUser()) {
    throw new ValidationError(
      'Guest cannot be linked to user (already linked, expired, or migration disabled)'
    );
  }

  guest.userId = userId as any;
  guest.canMigrate = false; // Prevent further migrations
  await guest.save();

  return guest;
};

/**
 * Get all active guests (non-expired)
 */
export const findActiveGuests = async (): Promise<IGuest[]> => {
  return Guest.findActive();
};

/**
 * Clean expired guests manually (backup for TTL)
 */
export const cleanExpiredGuests = async (): Promise<number> => {
  return Guest.cleanExpired();
};

/**
 * Get guest statistics
 */
export const getStatistics = async (): Promise<GuestStatistics> => {
  const [total, active, expired, byLocale, canMigrate, linked] =
    await Promise.all([
      // Total guests
      Guest.countDocuments({}),

      // Active (non-expired)
      Guest.countDocuments({ expiresAt: { $gt: new Date() } }),

      // Expired
      Guest.countDocuments({ expiresAt: { $lte: new Date() } }),

      // By locale
      Guest.aggregate([
        { $match: { expiresAt: { $gt: new Date() } } },
        { $group: { _id: '$locale', count: { $sum: 1 } } },
      ]),

      // Can migrate (eligible for user linking)
      Guest.countDocuments({
        canMigrate: true,
        userId: null,
        expiresAt: { $gt: new Date() },
      }),

      // Already linked to users
      Guest.countDocuments({ userId: { $ne: null } }),
    ]);

  // Parse locale counts
  const localeMap: any = { en: 0, fr: 0 };
  byLocale.forEach((item: any) => {
    localeMap[item._id] = item.count;
  });

  return {
    total,
    active,
    expired,
    byLocale: {
      en: localeMap.en || 0,
      fr: localeMap.fr || 0,
    },
    canMigrate,
    linked,
  };
};

/**
 * Delete guest (admin operation)
 */
export const deleteGuest = async (sessionId: string): Promise<void> => {
  const guest = await Guest.findBySessionId(sessionId);

  if (!guest) {
    throw new NotFoundError(`Guest with sessionId "${sessionId}" not found`);
  }

  // Check if guest has active bookings (future: add booking check)
  // For now, allow deletion

  await guest.deleteOne();
};

/**
 * Check if sessionId is valid UUID v4
 */
export const isValidSessionId = (sessionId: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
};

// Export service object
export const GuestService = {
  createGuest,
  findBySessionId,
  findByEmail,
  updateGuest,
  extendExpiration,
  linkToUser,
  findActiveGuests,
  cleanExpiredGuests,
  getStatistics,
  deleteGuest,
  isValidSessionId,
};

export default GuestService;

/**
 * ✅ Guest Service Features:
 * - Auto UUID v4 generation for sessionId
 * - Email validation and duplicate checking
 * - 30-day expiration management
 * - Guest-to-User migration path (linkToUser)
 * - Expiration extension capability
 * - Active/expired filtering
 * - Statistics aggregation
 * - Manual cleanup for expired guests
 * - Validation helpers (isValidSessionId)
 */
