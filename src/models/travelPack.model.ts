// src/models/travelPack.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * TravelPack document interface
 * - This describes the TypeScript shape of TravelPack documents.
 */
export interface ITravelPackLocalized {
  name: string;
  description?: string | null;
  ctaLabel?: string | null;
  metadata?: {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    alt?: string | null;
    path?: string | null;
  };
}

export interface ITravelPack extends Document {
  slug: string;
  localeGroupId: string; // Logical identifier linking all language versions
  status: 'draft' | 'published' | 'archived';
  locale?: string; // primary locale, e.g. "en" or "fr"
  locales: {
    en?: ITravelPackLocalized;
    fr?: ITravelPackLocalized;
    // future locales can be added here
  };
  coverImage?: string | null;
  features: string[]; // simple array of feature strings (presentation)
  duration?: number | null; // days or null
  basePrice?: number | null; // base price (may be null if price determined by pack_relations)
  currency?: string; // ISO currency code, e.g. "USD"
  availability?: boolean; // general availability flag
  createdBy?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Helper: small slugify util to generate a URL-friendly slug from a string.
 * keep it simple and deterministic.
 */
function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\_]+/g, '-') // spaces/underscores -> dash
    .replace(/[^a-z0-9-]/g, '') // remove invalid chars (keep ascii letters+numbers+dash)
    .replace(/-+/g, '-') // collapse multiple dashes
    .replace(/^-|-$/g, ''); // trim leading/trailing dash
}

/**
 * TravelPack Mongoose schema
 * - Keep content, metadata and business fields separated inside the document.
 * - Add indexes for slug (unique) and status for efficient queries.
 */
const TravelPackLocalizedSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: null },
    ctaLabel: { type: String, default: null },
    metadata: {
      title: { type: String, default: null },
      description: { type: String, default: null },
      image: { type: String, default: null },
      alt: { type: String, default: null },
      path: { type: String, default: null },
    },
  },
  { _id: false }
);

const TravelPackSchema = new Schema<ITravelPack>(
  {
    slug: { type: String, required: true, unique: true },
    localeGroupId: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      index: true, // indexed for efficient translation queries
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    locale: { type: String, default: 'en' }, // primary locale
    locales: {
      en: { type: TravelPackLocalizedSchema, default: undefined },
      fr: { type: TravelPackLocalizedSchema, default: undefined },
    },
    coverImage: { type: String, default: null },
    features: { type: [String], default: [] },
    duration: { type: Number, default: null }, // number of days (optional)
    basePrice: { type: Number, default: null }, // may be null if pricing is delegated to pack_relations
    currency: { type: String, default: 'USD' },
    availability: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Enhanced Index strategy for optimal performance:
 * - Unique slug for fast lookups by URL path
 * - localeGroupId for linking translation versions
 * - Compound indexes for common query patterns
 * - Text index for search functionality
 * - Sparse indexes for optional fields
 */

// Basic indexes
TravelPackSchema.index({ slug: 1 }, { unique: true });
TravelPackSchema.index({ localeGroupId: 1 }); // Find all translations of same pack
TravelPackSchema.index({ status: 1 });
TravelPackSchema.index({ locale: 1 });

// Compound indexes for common query patterns
TravelPackSchema.index({ status: 1, locale: 1 }); // Filter by status and locale
TravelPackSchema.index({ status: 1, createdAt: -1 }); // Latest published packs
TravelPackSchema.index({ availability: 1, status: 1 }); // Available published packs
TravelPackSchema.index({ createdBy: 1, status: 1 }); // User's packs by status

// Text index for search functionality (improved performance over regex)
TravelPackSchema.index(
  {
    'locales.en.name': 'text',
    'locales.fr.name': 'text',
    'locales.en.description': 'text',
    'locales.fr.description': 'text',
    features: 'text',
  },
  {
    weights: {
      'locales.en.name': 10,
      'locales.fr.name': 10,
      'locales.en.description': 5,
      'locales.fr.description': 5,
      features: 3,
    },
    name: 'travel_pack_text_search',
  }
);

// Sparse indexes for optional fields with business value
TravelPackSchema.index({ basePrice: 1 }, { sparse: true }); // Price filtering
TravelPackSchema.index({ duration: 1 }, { sparse: true }); // Duration filtering

/**
 * Pre-save hook:
 * - If slug is missing, generate from locales.en.name or locales.fr.name.
 * - Ensure slug uniqueness is handled at DB level (unique index) — pre-save generation reduces collisions.
 */
TravelPackSchema.pre<ITravelPack>('validate', function (next) {
  if (!this.slug || this.slug.trim() === '') {
    const sourceName =
      (this.locales && this.locales.en && this.locales.en.name) ||
      (this.locales && this.locales.fr && this.locales.fr.name) ||
      `pack-${new mongoose.Types.ObjectId().toHexString().slice(-6)}`;
    this.slug = slugify(sourceName);
  }
  next();
});

/**
 * Virtuals / helpers (example):
 * - You can add helper virtual fields for frontend convenience, e.g., title for current locale.
 */
TravelPackSchema.virtual('title').get(function (this: ITravelPack) {
  const loc = this.locale || 'en';
  return (
    (this.locales &&
      (this.locales as any)[loc] &&
      (this.locales as any)[loc].name) ||
    (this.locales && this.locales.en && this.locales.en.name) ||
    ''
  );
});

/**
 * Model export
 */
const TravelPack: Model<ITravelPack> =
  (mongoose.models && (mongoose.models as any).TravelPack) ||
  mongoose.model<ITravelPack>('TravelPack', TravelPackSchema);

export default TravelPack;
