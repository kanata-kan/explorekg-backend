// src/services/car.service.ts
import { Car, ICar } from '../models/car.model';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError } from '../utils/AppError';
import { ENV } from '../config/env';
import { excludeDeleted, markAsDeleted, isDeleted } from '../utils/softDelete.util';

type FindFilters = {
  locale?: string | null;
  localeGroupId?: string | null;
  status?: string | null;
  availabilityStatus?: string | null;
  q?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  transmission?: string | null;
  fuel?: string | null;
  drive?: string | null;
  seats?: string | null;
};

type SortOption =
  | 'createdAt'
  | '-createdAt'
  | 'pricing.amount'
  | '-pricing.amount'
  | 'name'
  | '-name';

/**
 * Car Service Layer
 * Business logic for car operations with optimized queries
 */

/**
 * Find many cars with filtering, sorting, and pagination
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
  const query: any = {};

  // Basic filters
  if (filters.status) query.status = filters.status;
  if (filters.locale) query.locale = filters.locale;
  if (filters.localeGroupId) query.localeGroupId = filters.localeGroupId;
  if (filters.availabilityStatus)
    query.availabilityStatus = filters.availabilityStatus;

  // Specs filters
  if (filters.transmission) query['specs.transmission'] = filters.transmission;
  if (filters.fuel) query['specs.fuel'] = filters.fuel;
  if (filters.drive) query['specs.drive'] = filters.drive;
  if (filters.seats) query['specs.seats'] = filters.seats;

  // Price range filtering
  if (filters.minPrice !== undefined && filters.minPrice !== null) {
    if (!query['pricing.amount']) query['pricing.amount'] = {};
    query['pricing.amount'].$gte = filters.minPrice;
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    if (!query['pricing.amount']) query['pricing.amount'] = {};
    query['pricing.amount'].$lte = filters.maxPrice;
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

  // Exclude soft-deleted cars by default
  const finalQuery = excludeDeleted(query);

  const [items, total] = await Promise.all([
    Car.find(finalQuery)
      .sort(sortObj)
      .skip(skip)
      .limit(validatedLimit)
      .lean()
      .exec(),
    Car.countDocuments(finalQuery).exec(),
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
    filters: {
      ...filters,
      sort,
    },
  };
};

/**
 * Find car by ID or slug (excluding soft-deleted)
 */
export const findById = async (id: string): Promise<ICar> => {
  // Check if ID is a valid MongoDB ObjectId
  const isValidObjectId = Types.ObjectId.isValid(id);

  let car: ICar | null = null;

  if (isValidObjectId) {
    // Try to find by ObjectId (exclude soft-deleted)
    car = await Car.findOne(
      excludeDeleted({ _id: id })
    ).exec();
  }

  // If not found by ObjectId, try to find by slug (metadata.path)
  if (!car) {
    const pathQuery = `/cars/${id}`;
    car = await Car.findOne(
      excludeDeleted({ 'metadata.path': pathQuery })
    ).exec();
  }

  if (!car || isDeleted(car)) {
    throw new NotFoundError('Car not found');
  }

  return car;
};

/**
 * Find all language versions of a car by localeGroupId
 * Returns all translations (EN, FR) for the same car (excluding soft-deleted)
 */
export const findByLocaleGroupId = async (
  localeGroupId: string
): Promise<ICar[]> => {
  const cars = await Car.find(
    excludeDeleted({
      localeGroupId,
      status: 'active',
    })
  )
    .sort({ locale: 1 })
    .exec();

  return cars;
};

/**
 * Create a new car
 */
export const create = async (carData: Partial<ICar>): Promise<ICar> => {
  // Validate required fields
  if (!carData.name || !carData.description) {
    throw new ValidationError('Name and description are required');
  }

  if (!carData.pricing || !carData.pricing.amount) {
    throw new ValidationError('Pricing information is required');
  }

  if (!carData.locale) {
    throw new ValidationError('Locale is required');
  }

  // Create new car document
  const car = new Car(carData);
  await car.save();

  return car;
};

/**
 * Update an existing car
 */
export const update = async (
  id: string,
  updateData: Partial<ICar>
): Promise<ICar> => {
  // Check if ID is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid car ID format');
  }

  // Find car first to ensure it exists and is not deleted
  const existingCar = await findById(id);
  
  // Find and update car
  const car = await Car.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).exec();

  if (!car) {
    throw new NotFoundError('Car not found');
  }

  return car;
};

/**
 * Delete a car (soft delete by setting deletedAt to current date)
 */
export const remove = async (id: string): Promise<void> => {
  // Find car first to check if it exists and is not already deleted
  const car = await findById(id);
  
  // Check if already deleted
  if (isDeleted(car)) {
    throw new ValidationError('Car is already deleted');
  }

  // Mark as deleted
  await Car.findByIdAndUpdate(
    id,
    markAsDeleted(),
    { new: true }
  ).exec();
};

/**
 * Get available cars for booking (excluding soft-deleted)
 */
export const findAvailable = async (locale?: 'en' | 'fr') => {
  const query: any = {
    status: 'active',
    availabilityStatus: 'available',
  };

  if (locale) {
    query.locale = locale;
  }

  return await Car.find(excludeDeleted(query)).lean().exec();
};

/**
 * Get cars by locale (excluding soft-deleted)
 */
export const findByLocale = async (locale: 'en' | 'fr') => {
  return await Car.find(
    excludeDeleted({
      locale,
      status: 'active',
    })
  )
    .lean()
    .exec();
};

/**
 * Get statistics about cars (excluding soft-deleted)
 */
export const getStatistics = async () => {
  const softDeleteFilter = { deletedAt: { $exists: false } };
  
  const [
    total,
    active,
    inactive,
    maintenance,
    available,
    reserved,
    unavailable,
    priceStats,
  ] = await Promise.all([
    Car.countDocuments(softDeleteFilter),
    Car.countDocuments({ ...softDeleteFilter, status: 'active' }),
    Car.countDocuments({ ...softDeleteFilter, status: 'inactive' }),
    Car.countDocuments({ ...softDeleteFilter, status: 'maintenance' }),
    Car.countDocuments({ ...softDeleteFilter, availabilityStatus: 'available' }),
    Car.countDocuments({ ...softDeleteFilter, availabilityStatus: 'reserved' }),
    Car.countDocuments({ ...softDeleteFilter, availabilityStatus: 'unavailable' }),
    Car.aggregate([
      { $match: softDeleteFilter },
      {
        $group: {
          _id: null,
          averagePrice: { $avg: '$pricing.amount' },
          minPrice: { $min: '$pricing.amount' },
          maxPrice: { $max: '$pricing.amount' },
        },
      },
    ]),
  ]);

  return {
    total,
    byStatus: {
      active,
      inactive,
      maintenance,
    },
    byAvailability: {
      available,
      reserved,
      unavailable,
    },
    pricing: priceStats[0] || {
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
    },
  };
};

/**
 * Update car availability status
 */
export const updateAvailability = async (
  id: string,
  availabilityStatus: 'available' | 'reserved' | 'unavailable'
): Promise<ICar> => {
  // Find car first to ensure it exists and is not deleted
  await findById(id);

  const car = await Car.findByIdAndUpdate(
    id,
    { availabilityStatus },
    { new: true, runValidators: true }
  ).exec();

  if (!car) {
    throw new NotFoundError('Car not found');
  }

  return car;
};

/**
 * Associate car with travel packs
 */
export const associateWithPacks = async (
  carId: string,
  packIds: string[]
): Promise<ICar> => {
  // Find car first to ensure it exists and is not deleted
  await findById(carId);

  // Validate all pack IDs
  const validPackIds = packIds.filter(id => Types.ObjectId.isValid(id));
  if (validPackIds.length !== packIds.length) {
    throw new ValidationError('One or more pack IDs are invalid');
  }

  const car = await Car.findByIdAndUpdate(
    carId,
    {
      $addToSet: {
        packIds: { $each: validPackIds.map(id => new Types.ObjectId(id)) },
      },
    },
    { new: true }
  ).exec();

  if (!car) {
    throw new NotFoundError('Car not found');
  }

  return car;
};

// Export all service functions
export const CarService = {
  findMany,
  findById,
  create,
  update,
  remove,
  findAvailable,
  findByLocale,
  getStatistics,
  updateAvailability,
  associateWithPacks,
};
