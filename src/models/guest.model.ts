// src/models/guest.model.ts
import mongoose, { Schema, Document } from 'mongoose';

/**
 * Guest Interface
 * Represents a temporary visitor identity before registration
 */
export interface IGuest extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: string; // UUID - unique identifier for guest session
  email: string;
  fullName: string;
  phone: string;
  locale: 'en' | 'fr';

  // Metadata for tracking
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    source?: string; // 'web' | 'mobile' | 'api'
  };

  // Security enhancements
  security: {
    fingerprint?: string;
    signature?: string;
    lastRotation?: Date;
    loginAttempts?: number;
    isLocked?: boolean;
    lockExpires?: Date;
  };

  // Migration path to registered user (future)
  canMigrate: boolean;
  userId?: mongoose.Types.ObjectId; // ref: 'User' (when migrated)

  // Lifecycle
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // Auto-expire after 30 days

  // Methods
  isExpired(): boolean;
  canBeLinkedToUser(): boolean;
}

/**
 * Guest Schema
 */
const GuestSchema = new Schema<IGuest>(
  {
    // Unique session identifier (UUID v4)
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      unique: true,
      index: true,
      trim: true,
      match: [
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        'Invalid UUID format for sessionId',
      ],
    },

    // Contact information
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^\+?[1-9]\d{1,14}$/,
        'Please provide a valid phone number (E.164 format)',
      ],
    },

    // Language preference
    locale: {
      type: String,
      enum: {
        values: ['en', 'fr'],
        message: '{VALUE} is not a supported locale',
      },
      default: 'en',
      index: true,
    },

    // Tracking metadata
    metadata: {
      userAgent: {
        type: String,
        trim: true,
        maxlength: [500, 'User agent too long'],
      },
      ipAddress: {
        type: String,
        trim: true,
        match: [
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
          'Invalid IP address format',
        ],
      },
      source: {
        type: String,
        enum: ['web', 'mobile', 'api'],
        default: 'web',
      },
    },

    // Security enhancements
    security: {
      fingerprint: {
        type: String,
        trim: true,
        maxlength: [64, 'Fingerprint too long'],
      },
      signature: {
        type: String,
        trim: true,
        maxlength: [128, 'Signature too long'],
      },
      lastRotation: {
        type: Date,
        default: Date.now,
      },
      loginAttempts: {
        type: Number,
        default: 0,
        max: [10, 'Too many login attempts'],
      },
      isLocked: {
        type: Boolean,
        default: false,
      },
      lockExpires: Date,
    },

    // Migration to registered user (future feature)
    canMigrate: {
      type: Boolean,
      default: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // Expiration (auto-cleanup after 30 days)
    expiresAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 30); // 30 days from now
        return date;
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'guests',
  }
);

// ==================== INDEXES ====================

// Compound index for common queries
GuestSchema.index({ email: 1, locale: 1 });
GuestSchema.index({ createdAt: -1 });

// TTL index for automatic document expiration
// MongoDB will automatically delete expired documents
GuestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ==================== INSTANCE METHODS ====================

/**
 * Check if guest session has expired
 */
GuestSchema.methods.isExpired = function (): boolean {
  return new Date() > this.expiresAt;
};

/**
 * Check if guest can be linked to a registered user
 */
GuestSchema.methods.canBeLinkedToUser = function (): boolean {
  return this.canMigrate && !this.userId && !this.isExpired();
};

// ==================== STATIC METHODS ====================

/**
 * Find guest by sessionId
 */
GuestSchema.statics.findBySessionId = async function (
  sessionId: string
): Promise<IGuest | null> {
  console.log('[Guest Model] findBySessionId called with:', sessionId);
  const guest = await this.findOne({ sessionId }).exec();
  console.log('[Guest Model] findBySessionId result:', guest ? {
    _id: guest._id,
    sessionId: guest.sessionId,
    email: guest.email,
  } : 'NOT FOUND');
  return guest;
};

/**
 * Find guest by email
 */
GuestSchema.statics.findByEmail = async function (
  email: string
): Promise<IGuest | null> {
  return this.findOne({ email: email.toLowerCase() }).exec();
};

/**
 * Find all non-expired guests
 */
GuestSchema.statics.findActive = async function (): Promise<IGuest[]> {
  return this.find({ expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .exec();
};

/**
 * Clean expired guests manually (backup for TTL index)
 */
GuestSchema.statics.cleanExpired = async function (): Promise<number> {
  const result = await this.deleteMany({ expiresAt: { $lt: new Date() } });
  return result.deletedCount || 0;
};

// ==================== PRE-SAVE HOOKS ====================

/**
 * Pre-save hook: Ensure email is lowercase
 */
GuestSchema.pre('save', function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

/**
 * Pre-save hook: Validate expiresAt is in the future
 */
GuestSchema.pre('save', function (next) {
  if (this.expiresAt && this.expiresAt <= new Date()) {
    return next(new Error('expiresAt must be a future date'));
  }
  next();
});

// ==================== MODEL EXPORT ====================

// Type exports for static methods
export interface IGuestModel extends mongoose.Model<IGuest> {
  findBySessionId(sessionId: string): Promise<IGuest | null>;
  findByEmail(email: string): Promise<IGuest | null>;
  findActive(): Promise<IGuest[]>;
  cleanExpired(): Promise<number>;
}

export const Guest = mongoose.model<IGuest, IGuestModel>('Guest', GuestSchema);

export default Guest;

/**
 * ✅ Guest Model Features:
 * - UUID-based sessionId for stateless tracking
 * - Email + phone contact validation
 * - Multi-language support (en/fr)
 * - Metadata tracking (userAgent, IP, source)
 * - Migration path to registered User (canMigrate, userId)
 * - Auto-expiration after 30 days (TTL index)
 * - Pre-save hooks for data normalization
 * - Instance methods (isExpired, canBeLinkedToUser)
 * - Static methods (findBySessionId, findByEmail, cleanExpired)
 * - Compound indexes for performance
 */
