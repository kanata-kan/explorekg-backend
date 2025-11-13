// src/services/packRelation.service.ts
import PackRelation, { IPackRelation } from '../models/packRelation.model';
import TravelPack from '../models/travelPack.model';
import { Activity } from '../models/activity.model';
import { Car } from '../models/car.model';
import { NotFoundError, ValidationError } from '../utils/AppError';
import { excludeDeleted } from '../utils/softDelete.util';
// Pricing Service imports
import { calculatePackRelationPrice, calculateDeposit } from './pricing.service';
import { DepositPolicy } from '../policies';
// Availability & Validation imports
import { AvailabilityService } from './availability.service';
import { BookingItemType } from '../models/booking.model';

/**
 * PackRelation Service
 *
 * Handles business logic for pack relations, pricing calculations,
 * and detailed pack aggregation with activities/cars.
 */

/**
 * Detailed activity with relation metadata and computed prices
 */
export interface DetailedActivity {
  _id?: string;
  localeGroupId: string;
  locale: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  duration: number;
  price: number;
  // Relation metadata
  quantity: number;
  optional: boolean;
  discount: number;
  finalPrice: number;
  // Flag if activity is missing from DB
  missing?: boolean;
}

/**
 * Detailed car with relation metadata and computed prices
 */
export interface DetailedCar {
  _id?: string;
  localeGroupId: string;
  locale: string;
  slug: string;
  name: string;
  description?: string;
  type?: string;
  brand?: string;
  seats?: number;
  transmission?: string;
  pricePerDay: number;
  // Relation metadata
  durationDays: number;
  optional: boolean;
  discount: number;
  totalPrice: number;
  // Flag if car is missing from DB
  missing?: boolean;
}

/**
 * Pricing breakdown result
 */
export interface PricingBreakdown {
  activitiesTotal: number;
  optionalActivitiesTotal: number;
  carsTotal: number;
  subtotal: number;
  globalDiscount: number;
  discountAmount: number;
  finalTotal: number;
  deposit: number;
}

/**
 * Detailed pack response
 */
export interface DetailedPackResponse {
  pack: any;
  relations: {
    activities: DetailedActivity[];
    cars: DetailedCar[];
  };
  pricing: PricingBreakdown;
  settings: {
    allowCustomization: boolean;
    minActivities?: number;
    maxActivities?: number;
  };
}

/**
 * Get PackRelation by travelPackLocaleGroupId
 */
export const getPackRelationByPackLocaleId = async (
  travelPackLocaleGroupId: string
): Promise<IPackRelation | null> => {
  const relation = await PackRelation.findOne({
    travelPackLocaleGroupId,
  }).lean();
  return relation as any;
};

/**
 * Get detailed pack with all activities, cars, and pricing
 *
 * @param travelPackLocaleGroupId - The localeGroupId of the travel pack
 * @param locale - Requested locale ('en' or 'fr')
 * @returns Detailed pack with merged activities/cars and pricing breakdown
 */
export const getDetailedPack = async (
  travelPackLocaleGroupId: string,
  locale: 'en' | 'fr'
): Promise<DetailedPackResponse> => {
  // 1. Fetch TravelPack with requested locale (excluding soft-deleted)
  const pack = await TravelPack.findOne(
    excludeDeleted({
      localeGroupId: travelPackLocaleGroupId,
      locale, // Filter by locale
    })
  ).lean();

  if (!pack) {
    throw new NotFoundError(
      `TravelPack with localeGroupId "${travelPackLocaleGroupId}" and locale "${locale}" not found`
    );
  }

  // 2. Fetch PackRelation
  const relation = await PackRelation.findOne({
    travelPackLocaleGroupId,
  }).lean();

  // If no relations, return pack with empty relations
  if (!relation) {
    return {
      pack,
      relations: {
        activities: [],
        cars: [],
      },
      pricing: {
        activitiesTotal: 0,
        optionalActivitiesTotal: 0,
        carsTotal: 0,
        subtotal: 0,
        globalDiscount: 0,
        discountAmount: 0,
        finalTotal: 0,
        deposit: 0,
      },
      settings: {
        allowCustomization: false,
      },
    };
  }

  // 3. Fetch Activities by localeGroupIds and locale
  const activityLocaleGroupIds = relation.relations.activities.map(
    a => a.localeGroupId
  );

  let activities: any[] = [];
  if (activityLocaleGroupIds.length > 0) {
    activities = await Activity.find(
      excludeDeleted({
        localeGroupId: { $in: activityLocaleGroupIds },
        locale,
      })
    )
      .select('-__v')
      .lean();
  }

  // 4. Fetch Cars by localeGroupIds and locale
  const carLocaleGroupIds = relation.relations.cars.map(c => c.localeGroupId);

  let cars: any[] = [];
  if (carLocaleGroupIds.length > 0) {
    cars = await Car.find(
      excludeDeleted({
        localeGroupId: { $in: carLocaleGroupIds },
        locale,
      })
    )
      .select('-__v')
      .lean();
  }

  // 5. Merge activities with relation metadata
  const detailedActivities: DetailedActivity[] =
    relation.relations.activities.map(activityRelation => {
      const activity = activities.find(
        a => a.localeGroupId === activityRelation.localeGroupId
      );

      // Handle missing activity
      if (!activity) {
        return {
          localeGroupId: activityRelation.localeGroupId,
          locale,
          slug: '',
          name: 'Missing Activity',
          duration: 0,
          price: 0,
          quantity: activityRelation.quantity,
          optional: activityRelation.optional,
          discount: activityRelation.discount,
          finalPrice: 0,
          missing: true,
        };
      }

      // Calculate finalPrice with item-level discount
      const basePrice = activity.price * activityRelation.quantity;
      const discountMultiplier = 1 - activityRelation.discount / 100;
      const finalPrice = basePrice * discountMultiplier;

      return {
        _id: activity._id,
        localeGroupId: activity.localeGroupId,
        locale: activity.locale,
        slug: activity.slug,
        name: activity.name,
        description: activity.description,
        category: activity.category,
        difficulty: activity.difficulty,
        duration: activity.duration,
        price: activity.price,
        quantity: activityRelation.quantity,
        optional: activityRelation.optional,
        discount: activityRelation.discount,
        finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimals
        missing: false,
      };
    });

  // 6. Merge cars with relation metadata
  const detailedCars: DetailedCar[] = relation.relations.cars.map(
    carRelation => {
      const car = cars.find(c => c.localeGroupId === carRelation.localeGroupId);

      // Handle missing car
      if (!car) {
        return {
          localeGroupId: carRelation.localeGroupId,
          locale,
          slug: '',
          name: 'Missing Car',
          pricePerDay: 0,
          durationDays: carRelation.durationDays || 1,
          optional: carRelation.optional,
          discount: carRelation.discount,
          totalPrice: 0,
          missing: true,
        };
      }

      // Calculate totalPrice with item-level discount
      const durationDays = carRelation.durationDays || 1;
      const pricePerDay = car.pricing?.amount || 0; // Get price from pricing.amount
      const basePrice = pricePerDay * durationDays;
      const discountMultiplier = 1 - carRelation.discount / 100;
      const totalPrice = basePrice * discountMultiplier;

      return {
        _id: car._id,
        localeGroupId: car.localeGroupId,
        locale: car.locale,
        slug: car.slug,
        name: car.name,
        description: car.description,
        type: car.type,
        brand: car.brand,
        seats: car.specs?.seats || car.seats,
        transmission: car.specs?.transmission || car.transmission,
        pricePerDay,
        durationDays,
        optional: carRelation.optional,
        discount: carRelation.discount,
        totalPrice: Math.round(totalPrice * 100) / 100,
        missing: false,
      };
    }
  );

  // 7. Calculate pricing breakdown
  const pricing = calculateTotalPrice(
    detailedActivities,
    detailedCars,
    relation.pricing
  );

  return {
    pack,
    relations: {
      activities: detailedActivities,
      cars: detailedCars,
    },
    pricing,
    settings: relation.settings,
  };
};

/**
 * Calculate total price based on activities, cars, and pricing config
 *
 * @param activities - List of detailed activities with finalPrice computed
 * @param cars - List of detailed cars with totalPrice computed
 * @param pricingConfig - Pricing strategy and discount settings
 * @returns Pricing breakdown with deposit (20% of finalTotal)
 */
export const calculateTotalPrice = (
  activities: DetailedActivity[],
  cars: DetailedCar[],
  pricingConfig: {
    strategy: 'sum' | 'custom';
    customPrice?: number;
    globalDiscount?: number;
  }
): PricingBreakdown => {
  // If custom strategy, use customPrice and ignore item calculations
  if (pricingConfig.strategy === 'custom' && pricingConfig.customPrice) {
    const finalTotal = pricingConfig.customPrice;
    // Use DepositPolicy for consistent deposit calculation
    const deposit = DepositPolicy.calculateDeposit(finalTotal);
    return {
      activitiesTotal: 0,
      optionalActivitiesTotal: 0,
      carsTotal: 0,
      subtotal: pricingConfig.customPrice,
      globalDiscount: 0,
      discountAmount: 0,
      finalTotal,
      deposit: Math.round(deposit * 100) / 100,
    };
  }

  // Sum strategy: calculate from items
  const requiredActivities = activities.filter(a => !a.optional && !a.missing);
  const optionalActivities = activities.filter(a => a.optional && !a.missing);
  const validCars = cars.filter(c => !c.missing);

  const activitiesTotal = requiredActivities.reduce(
    (sum, a) => sum + a.finalPrice,
    0
  );

  const optionalActivitiesTotal = optionalActivities.reduce(
    (sum, a) => sum + a.finalPrice,
    0
  );

  const carsTotal = validCars.reduce((sum, c) => sum + c.totalPrice, 0);

  // Use unified PricingService for consistent pricing calculations
  // Note: Pack relations don't include tax in finalTotal (tax is calculated separately if needed)
  const pricing = calculatePackRelationPrice(
    activitiesTotal,
    carsTotal,
    optionalActivitiesTotal,
    pricingConfig.globalDiscount ?? 0,
    {
      includeTax: false, // Pack relations don't include tax in finalTotal
      includeDeposit: true, // Include deposit calculation
    }
  );

  // Extract values from pricing result
  // Note: Pack relations don't include tax in finalTotal, so we use subtotal - discount
  const subtotal = pricing.subtotal;
  const globalDiscount = pricing.discount;
  const discountAmount = pricing.discountAmount;
  // finalTotal = subtotal - discount (no tax for pack relations)
  const finalTotal = subtotal - discountAmount;
  const deposit = pricing.deposit || DepositPolicy.calculateDeposit(finalTotal);

  return {
    activitiesTotal: Math.round(activitiesTotal * 100) / 100,
    optionalActivitiesTotal: Math.round(optionalActivitiesTotal * 100) / 100,
    carsTotal: Math.round(carsTotal * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    globalDiscount,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalTotal: Math.round(finalTotal * 100) / 100,
    deposit: Math.round(deposit * 100) / 100,
  };
};

/**
 * Calculate price for custom selection (user customization)
 *
 * @param travelPackLocaleGroupId - Pack ID
 * @param selectedActivityIds - Array of selected activity localeGroupIds
 * @param selectedCarId - Selected car localeGroupId (optional)
 * @param carDurationDays - Custom duration for car rental
 * @param locale - Requested locale
 * @returns Pricing breakdown for custom selection
 */
export const calculateCustomPrice = async (
  travelPackLocaleGroupId: string,
  selectedActivityIds: string[],
  selectedCarId: string | null,
  carDurationDays: number | null,
  locale: 'en' | 'fr'
): Promise<{
  breakdown: PricingBreakdown;
  selectedItems: {
    activities: DetailedActivity[];
    car: DetailedCar | null;
  };
}> => {
  // Get relation to access settings and discounts
  const relation = await PackRelation.findOne({
    travelPackLocaleGroupId,
  }).lean();

  if (!relation) {
    throw new NotFoundError(
      `PackRelation for pack "${travelPackLocaleGroupId}" not found`
    );
  }

  // Validate customization settings
  if (!relation.settings.allowCustomization) {
    throw new ValidationError('This pack does not allow customization');
  }

  // Enforce minActivities/maxActivities
  const { minActivities, maxActivities } = relation.settings;

  if (
    minActivities !== undefined &&
    selectedActivityIds.length < minActivities
  ) {
    throw new ValidationError(
      `Minimum ${minActivities} activities required, but ${selectedActivityIds.length} selected`
    );
  }

  if (
    maxActivities !== undefined &&
    selectedActivityIds.length > maxActivities
  ) {
    throw new ValidationError(
      `Maximum ${maxActivities} activities allowed, but ${selectedActivityIds.length} selected`
    );
  }

  // Fetch selected activities
  const activities = (await Activity.find({
    localeGroupId: { $in: selectedActivityIds },
    locale,
  }).lean()) as any[];

  // Build detailed activities with discounts from relation
  const detailedActivities: DetailedActivity[] = selectedActivityIds.map(
    localeGroupId => {
      const activity = activities.find(a => a.localeGroupId === localeGroupId);
      const activityRelation = relation.relations.activities.find(
        r => r.localeGroupId === localeGroupId
      );

      if (!activity || !activityRelation) {
        return {
          localeGroupId,
          locale,
          slug: '',
          name: 'Missing Activity',
          duration: 0,
          price: 0,
          quantity: 1,
          optional: false,
          discount: 0,
          finalPrice: 0,
          missing: true,
        };
      }

      const discount = activityRelation.discount || 0;
      const finalPrice = activity.price * (1 - discount / 100);

      return {
        _id: activity._id,
        localeGroupId: activity.localeGroupId,
        locale: activity.locale,
        slug: activity.slug,
        name: activity.name,
        description: activity.description,
        category: activity.category,
        difficulty: activity.difficulty,
        duration: activity.duration,
        price: activity.price,
        quantity: activityRelation.quantity || 1,
        optional: activityRelation.optional,
        discount,
        finalPrice: Math.round(finalPrice * 100) / 100,
        missing: false,
      };
    }
  );

  // Fetch selected car if provided
  let detailedCar: DetailedCar | null = null;

  if (selectedCarId) {
    const car = (await Car.findOne(
      excludeDeleted({
        localeGroupId: selectedCarId,
        locale,
      })
    ).lean()) as any;

    const carRelation = relation.relations.cars.find(
      r => r.localeGroupId === selectedCarId
    );

    if (car && carRelation) {
      const durationDays = carDurationDays || carRelation.durationDays || 1;
      const discount = carRelation.discount || 0;
      const pricePerDay = car.pricing?.amount || 0;
      const totalPrice = pricePerDay * durationDays * (1 - discount / 100);

      detailedCar = {
        _id: car._id,
        localeGroupId: car.localeGroupId,
        locale: car.locale,
        slug: car.slug,
        name: car.name,
        description: car.description,
        type: car.type,
        brand: car.brand,
        seats: car.specs?.seats || car.seats,
        transmission: car.specs?.transmission || car.transmission,
        pricePerDay,
        durationDays,
        optional: carRelation.optional,
        discount,
        totalPrice: Math.round(totalPrice * 100) / 100,
        missing: false,
      };
    }
  }

  // Calculate pricing
  const breakdown = calculateTotalPrice(
    detailedActivities,
    detailedCar ? [detailedCar] : [],
    relation.pricing
  );

  return {
    breakdown,
    selectedItems: {
      activities: detailedActivities,
      car: detailedCar,
    },
  };
};

/**
 * Create a new PackRelation
 */
export const createPackRelation = async (
  data: Partial<IPackRelation>
): Promise<IPackRelation> => {
  // Verify travel pack exists (excluding soft-deleted)
  const packExists = await TravelPack.findOne(
    excludeDeleted({
      localeGroupId: data.travelPackLocaleGroupId,
    })
  );

  if (!packExists) {
    throw new NotFoundError(
      `TravelPack with localeGroupId "${data.travelPackLocaleGroupId}" not found`
    );
  }

  // Check availability of all activities in the relation
  if (data.relations?.activities && data.relations.activities.length > 0) {
    for (const activityRelation of data.relations.activities) {
      // Find activity by localeGroupId to get its _id
      const activity = await Activity.findOne(
        excludeDeleted({ localeGroupId: activityRelation.localeGroupId })
      ).lean();

      if (!activity) {
        throw new NotFoundError(
          `Activity with localeGroupId "${activityRelation.localeGroupId}" not found`
        );
      }

      // Check if activity is available using AvailabilityService
      const isAvailable = await AvailabilityService.checkItemAvailability(
        BookingItemType.ACTIVITY,
        activity._id.toString()
      );

      if (!isAvailable) {
        throw new ValidationError(
          `Activity "${activityRelation.localeGroupId}" is not available for booking`
        );
      }
    }
  }

  // Check availability of all cars in the relation
  if (data.relations?.cars && data.relations.cars.length > 0) {
    for (const carRelation of data.relations.cars) {
      // Find car by localeGroupId to get its _id
      const car = await Car.findOne(
        excludeDeleted({ localeGroupId: carRelation.localeGroupId })
      ).lean();

      if (!car) {
        throw new NotFoundError(
          `Car with localeGroupId "${carRelation.localeGroupId}" not found`
        );
      }

      // Check if car is available using AvailabilityService
      const isAvailable = await AvailabilityService.checkItemAvailability(
        BookingItemType.CAR,
        car._id.toString()
      );

      if (!isAvailable) {
        throw new ValidationError(
          `Car "${carRelation.localeGroupId}" is not available for booking`
        );
      }
    }
  }

  // Check if relation already exists
  const existingRelation = await PackRelation.findOne({
    travelPackLocaleGroupId: data.travelPackLocaleGroupId,
  });

  if (existingRelation) {
    throw new ValidationError(
      `PackRelation for pack "${data.travelPackLocaleGroupId}" already exists`
    );
  }

  const relation = await PackRelation.create(data);
  
  // Send notification about pack relation creation (optional - for admin)
  // Note: This requires admin email, which might not be available in the data
  // For now, we'll skip the notification or add it when admin email is available
  try {
    // If admin email is available in metadata or context, send notification
    // This is optional and can be added later when admin context is available
    // await NotificationService.sendEvent({
    //   type: NotificationType.PACK_RELATION_CREATED,
    //   recipient: { email: adminEmail },
    //   data: {
    //     packRelationId: relation._id.toString(),
    //     travelPackLocaleGroupId: data.travelPackLocaleGroupId,
    //     activityCount: data.relations?.activities?.length || 0,
    //     carCount: data.relations?.cars?.length || 0,
    //   },
    //   metadata: {
    //     source: 'packRelation.service.createPackRelation',
    //   },
    // });
  } catch (error) {
    // Don't fail the creation if notification fails
    // Log error silently
  }
  
  return relation.toObject();
};

/**
 * Update existing PackRelation
 */
export const updatePackRelation = async (
  travelPackLocaleGroupId: string,
  data: Partial<IPackRelation>
): Promise<IPackRelation> => {
  const relation = await PackRelation.findOneAndUpdate(
    { travelPackLocaleGroupId },
    data,
    { new: true, runValidators: true }
  );

  if (!relation) {
    throw new NotFoundError(
      `PackRelation for pack "${travelPackLocaleGroupId}" not found`
    );
  }

  return relation.toObject();
};

/**
 * Delete PackRelation
 */
export const deletePackRelation = async (
  travelPackLocaleGroupId: string
): Promise<boolean> => {
  const result = await PackRelation.deleteOne({ travelPackLocaleGroupId });
  return result.deletedCount > 0;
};

/**
 * Get all PackRelations (for admin)
 */
export const getAllPackRelations = async (): Promise<IPackRelation[]> => {
  const relations = await PackRelation.find().lean();
  return relations as any;
};
