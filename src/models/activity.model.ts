// src/models/activity.model.ts
import { Schema, model, Document } from 'mongoose';

/**
 * Activity Interface
 * Represents an activity or experience that can be associated with travel packs
 */
export interface IActivity extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  description: string;
  coverImage: string;
  images: string[];
  duration: string;
  location: string;
  groupSize: string;
  price: number;
  metadata: {
    title: string;
    description: string;
    path: string;
    image: string;
    alt: string;
  };
  // localeGroupId → Logical identifier linking all language versions of the same activity (manually assigned)
  localeGroupId: string;
  locale: 'en' | 'fr';
  status: 'active' | 'inactive' | 'maintenance';
  availabilityStatus: 'available' | 'unavailable';
  tags: string[];
  packIds: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateAvailability(status: 'available' | 'unavailable'): Promise<IActivity>;
}

/**
 * Activity Schema
 * Defines the structure and validation rules for activities
 */
const ActivitySchema = new Schema<IActivity>(
  {
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      minlength: [3, 'Activity name must be at least 3 characters'],
      maxlength: [200, 'Activity name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          // Accept both file extensions and Unsplash URLs
          return (
            /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(v) ||
            /images\.unsplash\.com/.test(v)
          );
        },
        message: 'Cover image must be a valid image URL (jpg, jpeg, png, webp)',
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr: string[]) {
          return arr.every(
            url =>
              /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(url) ||
              /images\.unsplash\.com/.test(url)
          );
        },
        message: 'All images must be valid URLs (jpg, jpeg, png, webp)',
      },
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    groupSize: {
      type: String,
      required: [true, 'Group size is required'],
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
      max: [100000, 'Price seems unrealistic'],
    },
    metadata: {
      title: {
        type: String,
        required: [true, 'Metadata title is required'],
        trim: true,
        minlength: [10, 'Metadata title must be at least 10 characters'],
        maxlength: [150, 'Metadata title cannot exceed 150 characters'],
      },
      description: {
        type: String,
        required: [true, 'Metadata description is required'],
        trim: true,
        minlength: [20, 'Metadata description must be at least 20 characters'],
        maxlength: [300, 'Metadata description cannot exceed 300 characters'],
      },
      path: {
        type: String,
        required: [true, 'Metadata path is required'],
        trim: true,
        validate: {
          validator: function (v: string) {
            return /^\/activities\/[\w-]+$/.test(v);
          },
          message: 'Path must follow format: /activities/activity-id',
        },
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
        minlength: [5, 'Alt text must be at least 5 characters'],
        maxlength: [200, 'Alt text cannot exceed 200 characters'],
      },
    },
    // localeGroupId → Logical identifier linking all language versions of the same activity (manually assigned)
    localeGroupId: {
      type: String,
      required: [true, 'Locale group ID is required'],
      trim: true,
      index: true,
      minlength: [3, 'Locale group ID must be at least 3 characters'],
      maxlength: [100, 'Locale group ID cannot exceed 100 characters'],
    },
    locale: {
      type: String,
      enum: {
        values: ['en', 'fr'],
        message: 'Locale must be either "en" or "fr"',
      },
      required: [true, 'Locale is required'],
      default: 'en',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'maintenance'],
        message: 'Status must be active, inactive, or maintenance',
      },
      default: 'active',
    },
    availabilityStatus: {
      type: String,
      enum: {
        values: ['available', 'unavailable'],
        message: 'Availability status must be available or unavailable',
      },
      default: 'available',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    packIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TravelPack',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'activities',
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// ==================== INDEXES ====================

// Index for status queries
ActivitySchema.index({ status: 1 });

// Index for locale filtering
ActivitySchema.index({ locale: 1 });

// Index for price range queries
ActivitySchema.index({ price: 1 });

// Compound index for common queries (active activities by locale)
ActivitySchema.index({ status: 1, locale: 1 });

// Index for availability queries
ActivitySchema.index({ availabilityStatus: 1 });

// Text index for search functionality
ActivitySchema.index({ name: 'text', description: 'text', location: 'text' });

// ==================== VIRTUALS ====================

/**
 * Virtual: isFree
 * Returns true if the activity is free (price = 0)
 */
ActivitySchema.virtual('isFree').get(function (this: IActivity) {
  return this.price === 0;
});

/**
 * Virtual: displayName
 * Returns formatted display name with location
 */
ActivitySchema.virtual('displayName').get(function (this: IActivity) {
  return `${this.name} (${this.location})`;
});

/**
 * Virtual: isAvailableForBooking
 * Checks if activity is both active and available
 */
ActivitySchema.virtual('isAvailableForBooking').get(function (this: IActivity) {
  return this.status === 'active' && this.availabilityStatus === 'available';
});

// ==================== MIDDLEWARE ====================

/**
 * Pre-save hook to auto-generate tags from name and description
 */
ActivitySchema.pre('save', function (next) {
  if (
    this.isModified('name') ||
    this.isModified('description') ||
    this.tags.length === 0
  ) {
    const text = `${this.name} ${this.description}`.toLowerCase();

    // Extract meaningful words (3+ characters, excluding common words)
    const stopWords = [
      'the',
      'and',
      'with',
      'for',
      'from',
      'that',
      'this',
      'are',
      'was',
      'will',
    ];
    const words = text.match(/\b[a-z]{3,}\b/g) || [];

    const uniqueWords = [...new Set(words)]
      .filter(word => !stopWords.includes(word))
      .slice(0, 10); // Keep top 10 tags

    this.tags = uniqueWords;
  }
  next();
});

// ==================== STATIC METHODS ====================

/**
 * Find all available activities
 */
ActivitySchema.statics.findAvailable = function (locale?: 'en' | 'fr') {
  const query: any = {
    status: 'active',
    availabilityStatus: 'available',
  };

  if (locale) {
    query.locale = locale;
  }

  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Find activities by locale
 */
ActivitySchema.statics.findByLocale = function (locale: 'en' | 'fr') {
  return this.find({ locale, status: 'active' }).sort({ createdAt: -1 });
};

// ==================== INSTANCE METHODS ====================

/**
 * Update activity availability status
 */
ActivitySchema.methods.updateAvailability = async function (
  status: 'available' | 'unavailable'
): Promise<IActivity> {
  this.availabilityStatus = status;
  return await this.save();
};

// ==================== MODEL EXPORT ====================

export const Activity = model<IActivity>('Activity', ActivitySchema);

// ✅ Activity Model ready for seeding and future PackRelation integration (by Kanata & Copilot)
