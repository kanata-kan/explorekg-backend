// src/services/travelPack.service.ts
import TravelPack, { ITravelPack } from '../models/travelPack.model';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError } from '../utils/AppError';
import { ENV } from '../config/env';

type FindFilters = {
  locale?: string | null;
  localeGroupId?: string | null;
  status?: string | null;
  q?: string | null;
  availability?: boolean | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minDuration?: number | null;
  maxDuration?: number | null;
  createdBy?: string | null;
};

type SortOption =
  | 'createdAt'
  | '-createdAt'
  | 'basePrice'
  | '-basePrice'
  | 'duration'
  | '-duration'
  | 'name'
  | '-name';

/**
 * Enhanced findMany with better filtering, sorting, and performance optimizations
 */
export const findMany = async (
  filters: FindFilters = {},
  pagination: { page: number; limit: number; sort?: SortOption } = {
    page: 1,
    limit: 20,
  }
) => {
  const { page, limit, sort = '-createdAt' } = pagination;

  // Validate pagination limits
  const validatedLimit = Math.min(Math.max(limit, 1), ENV.MAX_PAGINATION_LIMIT);
  const validatedPage = Math.max(page, 1);
  const skip = (validatedPage - 1) * validatedLimit;

  // Build optimized query
  const query: any = {
    deletedAt: { $exists: false }, // Exclude soft deleted items by default
  };

  // Basic filters
  if (filters.status) query.status = filters.status;
  if (filters.locale) query.locale = filters.locale;
  if (filters.localeGroupId) query.localeGroupId = filters.localeGroupId;
  if (filters.availability !== null && filters.availability !== undefined) {
    query.availability = filters.availability;
  }
  if (filters.createdBy && Types.ObjectId.isValid(filters.createdBy)) {
    query.createdBy = new Types.ObjectId(filters.createdBy);
  }

  // Price range filtering
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    query.basePrice = {};
    if (filters.minPrice !== null) query.basePrice.$gte = filters.minPrice;
    if (filters.maxPrice !== null) query.basePrice.$lte = filters.maxPrice;
  }

  // Duration range filtering
  if (filters.minDuration !== null || filters.maxDuration !== null) {
    query.duration = {};
    if (filters.minDuration !== null) query.duration.$gte = filters.minDuration;
    if (filters.maxDuration !== null) query.duration.$lte = filters.maxDuration;
  }

  // Text search using MongoDB text index (much faster than regex)
  if (filters.q) {
    const searchQuery = filters.q.trim();
    if (searchQuery) {
      query.$text = {
        $search: searchQuery,
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
    }
  }

  // Build sort object
  const sortObj: any = {};
  if (sort.startsWith('-')) {
    sortObj[sort.substring(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  // Add score sorting for text search
  if (filters.q) {
    sortObj.score = { $meta: 'textScore' };
  }

  const [items, total] = await Promise.all([
    TravelPack.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(validatedLimit)
      .select('-__v') // Exclude version key for cleaner response
      .lean(),
    TravelPack.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
      pages: Math.ceil(total / validatedLimit),
      hasNext: validatedPage < Math.ceil(total / validatedLimit),
      hasPrev: validatedPage > 1,
    },
    filters: filters,
  };
};

/**
 * Enhanced findByIdOrSlug with better error handling and performance
 */
export const findByIdOrSlug = async (idOrSlug: string) => {
  if (!idOrSlug?.trim()) {
    throw new ValidationError('ID or slug is required');
  }

  const baseFilter = { deletedAt: { $exists: false } }; // Exclude soft deleted items

  // Try ObjectId first (faster lookup)
  if (Types.ObjectId.isValid(idOrSlug)) {
    const doc = await TravelPack.findOne({ _id: idOrSlug, ...baseFilter })
      .select('-__v')
      .lean();
    if (doc) return doc;
  }

  // Fallback to slug lookup
  const doc = await TravelPack.findOne({ slug: idOrSlug, ...baseFilter })
    .select('-__v')
    .lean();

  return doc;
};

/**
 * Enhanced createOne with validation and optimizations
 */
export const createOne = async (
  payload: Partial<ITravelPack>,
  createdBy: string | null = null
) => {
  // Validate required localized content
  if (!payload.locales || (!payload.locales.en && !payload.locales.fr)) {
    throw new ValidationError(
      'At least one localized version (en or fr) is required'
    );
  }

  const doc = new TravelPack({
    ...payload,
    createdBy:
      createdBy && Types.ObjectId.isValid(createdBy)
        ? new Types.ObjectId(createdBy)
        : null,
  });

  await doc.save();
  return doc.toObject();
};

/**
 * Enhanced updateByIdOrSlug with better error handling
 */
export const updateByIdOrSlug = async (
  idOrSlug: string,
  payload: Partial<ITravelPack>
) => {
  if (!idOrSlug?.trim()) {
    throw new ValidationError('ID or slug is required');
  }

  // Remove fields that shouldn't be updated
  const { createdAt, updatedAt, ...updatePayload } = payload;
  const baseFilter = { deletedAt: { $exists: false } }; // Exclude soft deleted items

  // Try by ObjectId first
  if (Types.ObjectId.isValid(idOrSlug)) {
    const doc = await TravelPack.findOneAndUpdate(
      { _id: idOrSlug, ...baseFilter },
      updatePayload,
      {
        new: true,
        runValidators: true,
      }
    )
      .select('-__v')
      .lean();

    if (doc) return doc;
  }

  // Fallback to slug
  const doc = await TravelPack.findOneAndUpdate(
    { slug: idOrSlug, ...baseFilter },
    updatePayload,
    { new: true, runValidators: true }
  )
    .select('-__v')
    .lean();

  return doc;
};

/**
 * Enhanced soft delete with validation
 */
export const archiveByIdOrSlug = async (idOrSlug: string): Promise<boolean> => {
  if (!idOrSlug?.trim()) {
    throw new ValidationError('ID or slug is required');
  }

  const baseFilter = { deletedAt: { $exists: false } }; // Exclude already deleted items

  const updateResult = Types.ObjectId.isValid(idOrSlug)
    ? await TravelPack.findOneAndUpdate(
        { _id: idOrSlug, ...baseFilter },
        { status: 'archived', updatedAt: new Date() },
        { new: true }
      )
    : await TravelPack.findOneAndUpdate(
        { slug: idOrSlug, ...baseFilter },
        { status: 'archived', updatedAt: new Date() },
        { new: true }
      );

  return !!updateResult;
};

/**
 * Get travel pack statistics for analytics
 */
export const getStatistics = async () => {
  const baseFilter = { deletedAt: { $exists: false } }; // Exclude soft deleted items

  const [statusStats, availabilityStats, priceStats] = await Promise.all([
    TravelPack.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    TravelPack.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$availability', count: { $sum: 1 } } },
    ]),
    TravelPack.aggregate([
      {
        $match: {
          ...baseFilter,
          basePrice: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$basePrice' },
          minPrice: { $min: '$basePrice' },
          maxPrice: { $max: '$basePrice' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    statusBreakdown: statusStats,
    availabilityBreakdown: availabilityStats,
    priceStatistics: priceStats[0] || {
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      count: 0,
    },
  };
};

/**
 * Find all translation versions by localeGroupId
 * @param localeGroupId - The locale group identifier
 * @returns Array of travel packs with the same localeGroupId
 */
export const findByLocaleGroupId = async (localeGroupId: string) => {
  if (!localeGroupId?.trim()) {
    throw new ValidationError('localeGroupId is required');
  }

  const packs = await TravelPack.find({
    localeGroupId,
    deletedAt: { $exists: false },
  })
    .select('-__v')
    .lean();

  return packs;
};
