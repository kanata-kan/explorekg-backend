import { Schema, model, Document } from 'mongoose';

/**
 * ICar Interface
 * Defines the TypeScript type for Car documents in MongoDB
 */
export interface ICar extends Document {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  pricing: {
    amount: number;
    currency: string;
    unit: string;
  };
  specs: {
    seats: string;
    transmission: string;
    drive: string;
    luggage: string;
    fuel: string;
  };
  metadata: {
    title: string;
    description: string;
    path: string;
    image: string;
    alt: string;
  };
  images: string[];
  tags?: string[];
  localeGroupId: string; // Logical identifier linking all language versions of the same car
  locale: 'en' | 'fr';
  status: 'active' | 'inactive' | 'maintenance';
  availabilityStatus: 'available' | 'reserved' | 'unavailable';
  packIds?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Car Schema
 * Mongoose schema definition for the Car model with optimized indexes
 */
const carSchema = new Schema<ICar>(
  {
    // Basic information
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true,
      minlength: [3, 'Car name must be at least 3 characters'],
      maxlength: [200, 'Car name must not exceed 200 characters'],
    },

    description: {
      type: String,
      required: [true, 'Car description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },

    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
      trim: true,
    },

    // Pricing information
    pricing: {
      amount: {
        type: Number,
        required: [true, 'Price amount is required'],
        min: [0, 'Price must be a positive number'],
      },
      currency: {
        type: String,
        required: [true, 'Currency is required'],
        uppercase: true,
        enum: {
          values: ['USD', 'EUR', 'KGS'],
          message: '{VALUE} is not a valid currency',
        },
        default: 'USD',
      },
      unit: {
        type: String,
        required: [true, 'Price unit is required'],
        enum: {
          values: ['day', 'jour', 'hour', 'heure', 'week', 'semaine'],
          message: '{VALUE} is not a valid price unit',
        },
        default: 'day',
      },
    },

    // Vehicle specifications
    specs: {
      seats: {
        type: String,
        required: [true, 'Number of seats is required'],
      },
      transmission: {
        type: String,
        required: [true, 'Transmission type is required'],
        enum: {
          values: ['Automatic', 'Manual', 'Automatique', 'Manuelle'],
          message: '{VALUE} is not a valid transmission type',
        },
      },
      drive: {
        type: String,
        required: [true, 'Drive type is required'],
      },
      luggage: {
        type: String,
        required: [true, 'Luggage capacity is required'],
      },
      fuel: {
        type: String,
        required: [true, 'Fuel type is required'],
        enum: {
          values: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Essence'],
          message: '{VALUE} is not a valid fuel type',
        },
      },
    },

    // SEO metadata
    metadata: {
      title: {
        type: String,
        required: [true, 'Metadata title is required'],
        trim: true,
      },
      description: {
        type: String,
        required: [true, 'Metadata description is required'],
        trim: true,
      },
      path: {
        type: String,
        required: [true, 'Metadata path is required'],
        trim: true,
      },
      image: {
        type: String,
        required: [true, 'Metadata image is required'],
        trim: true,
      },
      alt: {
        type: String,
        required: [true, 'Metadata alt text is required'],
        trim: true,
      },
    },

    // Additional images
    images: {
      type: [String],
      default: [],
    },

    // Tags for categorization and search
    tags: {
      type: [String],
      default: [],
    },

    // Locale group identifier for linking translations
    localeGroupId: {
      type: String,
      required: [true, 'Locale group ID is required'],
      trim: true,
      index: true,
      minlength: [3, 'Locale group ID must be at least 3 characters'],
      maxlength: [100, 'Locale group ID cannot exceed 100 characters'],
    },

    // Localization
    locale: {
      type: String,
      required: [true, 'Locale is required'],
      enum: {
        values: ['en', 'fr'],
        message: '{VALUE} is not a valid locale',
      },
    },

    // Car status
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'maintenance'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      index: true,
    },

    // Booking availability status
    availabilityStatus: {
      type: String,
      enum: {
        values: ['available', 'reserved', 'unavailable'],
        message: '{VALUE} is not a valid availability status',
      },
      default: 'available',
      index: true,
    },

    // Related travel packs (for booking integration)
    packIds: {
      type: [Schema.Types.ObjectId],
      ref: 'TravelPack',
      default: [],
    },
  },
  {
    // Schema options
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false, // Disable __v field
    collection: 'cars', // Explicit collection name

    // Transform output when converting to JSON or Object
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

/**
 * Indexes for optimized queries
 * These indexes improve performance for common query patterns
 */

// Compound index for filtering by status, locale, and availability
carSchema.index({ status: 1, locale: 1, availabilityStatus: 1 });

// Index for price range queries
carSchema.index({ 'pricing.amount': 1, status: 1 });

// Text index for full-text search on name and description
carSchema.index({ name: 'text', description: 'text' });

// Index for efficient sorting by creation date
carSchema.index({ createdAt: -1 });

// Sparse index for cars with associated packs
carSchema.index({ packIds: 1 }, { sparse: true });

/**
 * Pre-save middleware
 * Automatically generates tags from car name if not provided
 */
carSchema.pre('save', function (next) {
  if (!this.tags || this.tags.length === 0) {
    // Extract meaningful words from name for tags
    const words = this.name
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 2);
    this.tags = [...new Set(words)]; // Remove duplicates
  }
  next();
});

/**
 * Virtual property: isAvailableForBooking
 * Returns true if the car is active and available for booking
 */
carSchema.virtual('isAvailableForBooking').get(function () {
  return this.status === 'active' && this.availabilityStatus === 'available';
});

/**
 * Virtual property: dailyRate
 * Converts pricing to daily rate for easier comparison
 */
carSchema.virtual('dailyRate').get(function () {
  const { amount, unit } = this.pricing;

  // Convert different units to daily rate
  const unitMap: Record<string, number> = {
    day: 1,
    jour: 1,
    hour: 24,
    heure: 24,
    week: 1 / 7,
    semaine: 1 / 7,
  };

  const multiplier = unitMap[unit] || 1;
  return amount * multiplier;
});

/**
 * Static method: findAvailable
 * Returns all cars that are available for booking
 */
carSchema.statics.findAvailable = function () {
  return this.find({
    status: 'active',
    availabilityStatus: 'available',
  });
};

/**
 * Static method: findByLocale
 * Returns cars filtered by locale
 */
carSchema.statics.findByLocale = function (locale: 'en' | 'fr') {
  return this.find({ locale, status: 'active' });
};

/**
 * Instance method: markAsReserved
 * Updates the availability status to reserved
 */
carSchema.methods.markAsReserved = function () {
  this.availabilityStatus = 'reserved';
  return this.save();
};

/**
 * Instance method: markAsAvailable
 * Updates the availability status to available
 */
carSchema.methods.markAsAvailable = function () {
  this.availabilityStatus = 'available';
  return this.save();
};

/**
 * Car Model
 * Exported Mongoose model for Cars
 */
export const Car = model<ICar>('Car', carSchema);

// ✅ Model ready for seeding and booking integration (by Kanata & Copilot)
