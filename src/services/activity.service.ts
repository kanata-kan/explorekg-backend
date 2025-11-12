// src/services/activity.service.ts
import { Activity, IActivity } from '../models/activity.model';
import { NotFoundError, ValidationError } from '../utils/AppError';
import { ENV } from '../config/env';
import { Types } from 'mongoose';
import { excludeDeleted, markAsDeleted, isDeleted } from '../utils/softDelete.util';

/**
 * Activity Service Layer
 * Handles all business logic for activity operations
 */

interface ActivityFilters {
  locale?: 'en' | 'fr';
  localeGroupId?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  availabilityStatus?: 'available' | 'unavailable';
  q?: string; // Text search
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  isFree?: boolean;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

interface PaginatedResult {
  items: IActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: ActivityFilters;
}

export class ActivityService {
  /**
   * Find activities with advanced filtering and pagination
   */
  static async findMany(
    filters: ActivityFilters = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResult> {
    const { page = 1, limit = 20, sort = '-createdAt' } = options;

    // Validate pagination limits
    const maxLimit = ENV.MAX_PAGINATION_LIMIT || 100;
    const validLimit = Math.min(Number(limit), maxLimit);
    const validPage = Math.max(Number(page), 1);

    // Build query
    const query: any = {};

    // Filter by locale
    if (filters.locale) {
      query.locale = filters.locale;
    }

    // Filter by localeGroupId (to get all translations of the same activity)
    if (filters.localeGroupId) {
      query.localeGroupId = filters.localeGroupId;
    }

    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }

    // Filter by availability
    if (filters.availabilityStatus) {
      query.availabilityStatus = filters.availabilityStatus;
    }

    // Filter by location
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    // Filter by price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = Number(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = Number(filters.maxPrice);
      }
    }

    // Filter free activities
    if (filters.isFree !== undefined) {
      query.price = filters.isFree ? 0 : { $gt: 0 };
    }

    // Text search
    if (filters.q) {
      query.$text = { $search: filters.q };
    }

    // Execute query with pagination (exclude soft-deleted by default)
    const skip = (validPage - 1) * validLimit;
    const finalQuery = excludeDeleted(query);

    const [items, total] = await Promise.all([
      Activity.find(finalQuery).sort(sort).skip(skip).limit(validLimit).lean(),
      Activity.countDocuments(finalQuery),
    ]);

    const pages = Math.ceil(total / validLimit);

    return {
      items: items as any[],
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        pages,
        hasNext: validPage < pages,
        hasPrev: validPage > 1,
      },
      filters,
    };
  }

  /**
   * Find activity by ID or slug (from metadata.path)
   * Excludes soft-deleted activities by default
   */
  static async findById(id: string): Promise<IActivity> {
    let activity: IActivity | null = null;

    // Try to find by MongoDB ObjectId (exclude soft-deleted)
    if (Types.ObjectId.isValid(id)) {
      activity = await Activity.findOne(
        excludeDeleted({ _id: id })
      );
    }

    // If not found, try to find by slug (metadata.path)
    if (!activity) {
      const slug = id.startsWith('/activities/') ? id : `/activities/${id}`;
      activity = await Activity.findOne(
        excludeDeleted({ 'metadata.path': slug })
      );
    }

    if (!activity || isDeleted(activity)) {
      throw new NotFoundError(`Activity not found with id: ${id}`);
    }

    return activity;
  }

  /**
   * Find all language versions of an activity by localeGroupId
   * Returns all translations (EN, FR) for the same activity (excluding soft-deleted)
   */
  static async findByLocaleGroupId(
    localeGroupId: string
  ): Promise<IActivity[]> {
    const activities = await Activity.find(
      excludeDeleted({
        localeGroupId,
        status: 'active',
      })
    ).sort({ locale: 1 }); // Sort by locale (en first, then fr)

    return activities;
  }

  /**
   * Create a new activity
   */
  static async create(data: Partial<IActivity>): Promise<IActivity> {
    try {
      const activity = new Activity(data);
      await activity.save();
      return activity;
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        throw new ValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update an existing activity
   */
  static async update(
    id: string,
    data: Partial<IActivity>
  ): Promise<IActivity> {
    const activity = await this.findById(id);

    // Update fields
    Object.assign(activity, data);

    try {
      await activity.save();
      return activity;
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        throw new ValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Soft delete an activity (set deletedAt to current date)
   */
  static async remove(id: string): Promise<void> {
    const activity = await this.findById(id);
    
    // Check if already deleted
    if (isDeleted(activity)) {
      throw new ValidationError('Activity is already deleted');
    }

    // Mark as deleted
    Object.assign(activity, markAsDeleted());
    await activity.save();
  }

  /**
   * Get activity statistics (excluding soft-deleted)
   */
  static async getStatistics() {
    const softDeleteFilter = { deletedAt: { $exists: false } };
    
    const [total, byStatus, byAvailability, pricing] = await Promise.all([
      // Total count (excluding soft-deleted)
      Activity.countDocuments(softDeleteFilter),

      // Count by status (excluding soft-deleted)
      Activity.aggregate([
        { $match: softDeleteFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Count by availability (excluding soft-deleted)
      Activity.aggregate([
        { $match: softDeleteFilter },
        {
          $group: {
            _id: '$availabilityStatus',
            count: { $sum: 1 },
          },
        },
      ]),

      // Price statistics (excluding soft-deleted)
      Activity.aggregate([
        { $match: softDeleteFilter },
        {
          $group: {
            _id: null,
            averagePrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            freeActivitiesCount: {
              $sum: { $cond: [{ $eq: ['$price', 0] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    // Format status counts
    const statusCounts: Record<string, number> = {};
    byStatus.forEach((item: any) => {
      statusCounts[item._id] = item.count;
    });

    // Format availability counts
    const availabilityCounts: Record<string, number> = {};
    byAvailability.forEach((item: any) => {
      availabilityCounts[item._id] = item.count;
    });

    return {
      total,
      byStatus: statusCounts,
      byAvailability: availabilityCounts,
      pricing: pricing[0] || {
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        freeActivitiesCount: 0,
      },
    };
  }

  /**
   * Update activity availability status
   */
  static async updateAvailability(
    id: string,
    availabilityStatus: 'available' | 'unavailable'
  ): Promise<IActivity> {
    const activity = await this.findById(id);
    return await activity.updateAvailability(availabilityStatus);
  }

  /**
   * Find all available activities (optionally filtered by locale)
   */
  static async findAvailable(locale?: 'en' | 'fr'): Promise<IActivity[]> {
    return await (Activity as any).findAvailable(locale);
  }

  /**
   * Associate activity with travel packs
   */
  static async associateWithPacks(
    id: string,
    packIds: string[]
  ): Promise<IActivity> {
    const activity = await this.findById(id);

    // Validate pack IDs
    const validPackIds = packIds.filter(packId =>
      Types.ObjectId.isValid(packId)
    );

    if (validPackIds.length !== packIds.length) {
      throw new ValidationError('Some pack IDs are invalid');
    }

    // Update pack associations
    activity.packIds = validPackIds.map(id => new Types.ObjectId(id)) as any;
    await activity.save();

    return activity;
  }

  /**
   * Find activity by slug (excluding soft-deleted)
   */
  static async findBySlug(slug: string): Promise<IActivity | null> {
    const path = slug.startsWith('/activities/') ? slug : `/activities/${slug}`;
    return await Activity.findOne(
      excludeDeleted({ 'metadata.path': path })
    );
  }

  /**
   * Find activities by location (excluding soft-deleted)
   */
  static async findByLocation(location: string): Promise<IActivity[]> {
    return await Activity.find(
      excludeDeleted({
        location: { $regex: location, $options: 'i' },
        status: 'active',
      })
    ).sort({ createdAt: -1 });
  }

  /**
   * Find free activities (excluding soft-deleted)
   */
  static async findFreeActivities(locale?: 'en' | 'fr'): Promise<IActivity[]> {
    const query: any = {
      price: 0,
      status: 'active',
      availabilityStatus: 'available',
    };

    if (locale) {
      query.locale = locale;
    }

    return await Activity.find(excludeDeleted(query)).sort({ createdAt: -1 });
  }
}

// ✅ Activity Service Layer ready with comprehensive business logic
