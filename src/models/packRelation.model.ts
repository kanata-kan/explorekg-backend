// src/models/packRelation.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * PackRelation Model
 *
 * Links TravelPacks with Activities and Cars using localeGroupId references.
 * Supports dynamic pricing, customization settings, and discount strategies.
 *
 * Key Design Decisions:
 * - Uses localeGroupId (string) instead of ObjectId to handle multi-locale references
 * - Stores relation metadata (quantity, optional, discount) separate from canonical data
 * - Pricing can be 'sum' (calculated from items) or 'custom' (fixed price)
 * - Settings control user customization (min/max activities)
 */

/**
 * Single activity relation entry
 */
interface IActivityRelation {
  /** localeGroupId of the Activity (e.g., "hiking-1") */
  localeGroupId: string;
  /** How many times this activity is included (default: 1) */
  quantity: number;
  /** Can user remove this activity? */
  optional: boolean;
  /** Item-level discount percentage (0-100) */
  discount: number;
}

/**
 * Single car relation entry
 */
interface ICarRelation {
  /** localeGroupId of the Car (e.g., "car-1") */
  localeGroupId: string;
  /** Number of rental days (optional if car is just listed as option) */
  durationDays?: number;
  /** Can user remove this car? */
  optional: boolean;
  /** Item-level discount percentage (0-100) */
  discount: number;
}

/**
 * Relations object containing activities and cars arrays
 */
interface IRelations {
  /** List of included activities with metadata */
  activities: IActivityRelation[];
  /** List of included cars with metadata */
  cars: ICarRelation[];
}

/**
 * Pricing configuration
 */
interface IPricing {
  /**
   * Pricing strategy:
   * - 'sum': Calculate from item prices + discounts
   * - 'custom': Use customPrice and ignore item prices
   */
  strategy: 'sum' | 'custom';
  /** Custom fixed price (used when strategy is 'custom') */
  customPrice?: number;
  /** Global discount percentage applied to subtotal (0-100) */
  globalDiscount?: number;
}

/**
 * Settings for customization behavior
 */
interface ISettings {
  /** Allow users to customize this pack (add/remove optional items)? */
  allowCustomization: boolean;
  /** Minimum number of activities user must select (enforced in calculate-price) */
  minActivities?: number;
  /** Maximum number of activities user can select */
  maxActivities?: number;
}

/**
 * Main PackRelation document interface
 */
export interface IPackRelation extends Document {
  /**
   * Reference to TravelPack by its localeGroupId (e.g., "pack-1")
   * Must be unique - one PackRelation per TravelPack
   */
  travelPackLocaleGroupId: string;

  /** Relations to activities and cars */
  relations: IRelations;

  /** Pricing strategy and discount configuration */
  pricing: IPricing;

  /** Customization settings */
  settings: ISettings;

  /** Auto-generated timestamps */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema definition
 */
const PackRelationSchema = new Schema<IPackRelation>(
  {
    travelPackLocaleGroupId: {
      type: String,
      required: [true, 'travelPackLocaleGroupId is required'],
      trim: true,
      minlength: [3, 'travelPackLocaleGroupId must be at least 3 characters'],
      maxlength: [
        100,
        'travelPackLocaleGroupId must not exceed 100 characters',
      ],
      index: true,
    },

    relations: {
      activities: [
        {
          localeGroupId: {
            type: String,
            required: true,
            trim: true,
          },
          quantity: {
            type: Number,
            default: 1,
            min: [1, 'Quantity must be at least 1'],
          },
          optional: {
            type: Boolean,
            default: false,
          },
          discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
            max: [100, 'Discount cannot exceed 100%'],
          },
        },
      ],
      cars: [
        {
          localeGroupId: {
            type: String,
            required: true,
            trim: true,
          },
          durationDays: {
            type: Number,
            min: [1, 'Duration must be at least 1 day'],
          },
          optional: {
            type: Boolean,
            default: false,
          },
          discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
            max: [100, 'Discount cannot exceed 100%'],
          },
        },
      ],
    },

    pricing: {
      strategy: {
        type: String,
        enum: {
          values: ['sum', 'custom'],
          message: 'Strategy must be either "sum" or "custom"',
        },
        default: 'sum',
      },
      customPrice: {
        type: Number,
        min: [0, 'Custom price cannot be negative'],
      },
      globalDiscount: {
        type: Number,
        default: 0,
        min: [0, 'Global discount cannot be negative'],
        max: [100, 'Global discount cannot exceed 100%'],
      },
    },

    settings: {
      allowCustomization: {
        type: Boolean,
        default: false,
      },
      minActivities: {
        type: Number,
        min: [0, 'Minimum activities cannot be negative'],
      },
      maxActivities: {
        type: Number,
        min: [0, 'Maximum activities cannot be negative'],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Indexes for performance
 */

// Unique index on travelPackLocaleGroupId (one relation per pack)
PackRelationSchema.index({ travelPackLocaleGroupId: 1 }, { unique: true });

// Index for querying by activity localeGroupId (future: find packs containing specific activity)
PackRelationSchema.index({ 'relations.activities.localeGroupId': 1 });

// Index for querying by car localeGroupId (future: find packs containing specific car)
PackRelationSchema.index({ 'relations.cars.localeGroupId': 1 });

/**
 * Validation: if strategy is 'custom', customPrice must be provided
 */
PackRelationSchema.pre<IPackRelation>('validate', function (next) {
  if (this.pricing.strategy === 'custom' && !this.pricing.customPrice) {
    return next(
      new Error('customPrice is required when pricing strategy is "custom"')
    );
  }
  next();
});

/**
 * Validation: if allowCustomization is true and minActivities/maxActivities are set,
 * ensure minActivities <= maxActivities
 */
PackRelationSchema.pre<IPackRelation>('validate', function (next) {
  const { minActivities, maxActivities } = this.settings;

  if (
    minActivities !== undefined &&
    maxActivities !== undefined &&
    minActivities > maxActivities
  ) {
    return next(
      new Error('minActivities cannot be greater than maxActivities')
    );
  }
  next();
});

/**
 * Model export
 */
const PackRelation: Model<IPackRelation> =
  (mongoose.models && (mongoose.models as any).PackRelation) ||
  mongoose.model<IPackRelation>('PackRelation', PackRelationSchema);

export default PackRelation;
