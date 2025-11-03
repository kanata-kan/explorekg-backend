// tests/unit/packRelation.test.ts

/**
 * Unit tests for PackRelation price calculation logic
 * Tests edge cases: item discounts, global discount, custom price, optional items
 */

// Mock types for testing
type DetailedActivity = {
  localeGroupId: string;
  name: string;
  price: number;
  discount: number;
  finalPrice: number;
  optional: boolean;
};

type DetailedCar = {
  localeGroupId: string;
  name: string;
  pricePerDay: number;
  durationDays: number;
  discount: number;
  totalPrice: number;
  optional: boolean;
};

type PricingConfig = {
  strategy: 'sum' | 'custom';
  customPrice?: number;
  globalDiscount?: number;
};

type PricingBreakdown = {
  activitiesTotal: number;
  optionalActivitiesTotal: number;
  carsTotal: number;
  subtotal: number;
  globalDiscount: number;
  discountAmount: number;
  finalTotal: number;
  deposit: number;
};

/**
 * Calculate total price based on activities, cars, and pricing config
 * This is the function we'll implement in the service
 */
function calculateTotalPrice(
  activities: DetailedActivity[],
  cars: DetailedCar[],
  pricingConfig: PricingConfig
): PricingBreakdown {
  // If custom strategy, ignore all item prices
  if (pricingConfig.strategy === 'custom' && pricingConfig.customPrice) {
    const finalTotal = pricingConfig.customPrice;
    return {
      activitiesTotal: 0,
      optionalActivitiesTotal: 0,
      carsTotal: 0,
      subtotal: pricingConfig.customPrice,
      globalDiscount: 0,
      discountAmount: 0,
      finalTotal,
      deposit: finalTotal * 0.2,
    };
  }

  // Sum strategy: calculate from items
  const requiredActivities = activities.filter(a => !a.optional);
  const optionalActivities = activities.filter(a => a.optional);

  const activitiesTotal = requiredActivities.reduce(
    (sum, a) => sum + a.finalPrice,
    0
  );

  const optionalActivitiesTotal = optionalActivities.reduce(
    (sum, a) => sum + a.finalPrice,
    0
  );

  const carsTotal = cars.reduce((sum, c) => sum + c.totalPrice, 0);

  const subtotal = activitiesTotal + carsTotal;

  const globalDiscount = pricingConfig.globalDiscount || 0;
  const discountAmount = subtotal * (globalDiscount / 100);

  const finalTotal = subtotal - discountAmount;
  const deposit = finalTotal * 0.2;

  return {
    activitiesTotal,
    optionalActivitiesTotal,
    carsTotal,
    subtotal,
    globalDiscount,
    discountAmount,
    finalTotal,
    deposit,
  };
}

describe('PackRelation - calculateTotalPrice', () => {
  describe('Sum Strategy - Basic Calculations', () => {
    it('should calculate correct total with no discounts', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'hiking-1',
          name: 'Hiking',
          price: 150,
          discount: 0,
          finalPrice: 150,
          optional: false,
        },
      ];

      const cars: DetailedCar[] = [
        {
          localeGroupId: 'car-1',
          name: 'Land Cruiser',
          pricePerDay: 80,
          durationDays: 7,
          discount: 0,
          totalPrice: 560,
          optional: false,
        },
      ];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 0,
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.activitiesTotal).toBe(150);
      expect(result.carsTotal).toBe(560);
      expect(result.subtotal).toBe(710);
      expect(result.finalTotal).toBe(710);
      expect(result.deposit).toBe(142); // 20%
    });

    it('should apply global discount correctly', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'hiking-1',
          name: 'Hiking',
          price: 100,
          discount: 0,
          finalPrice: 100,
          optional: false,
        },
      ];

      const cars: DetailedCar[] = [
        {
          localeGroupId: 'car-1',
          name: 'Car',
          pricePerDay: 50,
          durationDays: 2,
          discount: 0,
          totalPrice: 100,
          optional: false,
        },
      ];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 10, // 10%
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.subtotal).toBe(200);
      expect(result.globalDiscount).toBe(10);
      expect(result.discountAmount).toBe(20); // 10% of 200
      expect(result.finalTotal).toBe(180);
      expect(result.deposit).toBe(36); // 20% of 180
    });
  });

  describe('Sum Strategy - Item-level Discounts', () => {
    it('should handle item-level discounts in finalPrice', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'hiking-1',
          name: 'Hiking',
          price: 100,
          discount: 20, // 20% item discount
          finalPrice: 80, // Already discounted
          optional: false,
        },
      ];

      const cars: DetailedCar[] = [
        {
          localeGroupId: 'car-1',
          name: 'Car',
          pricePerDay: 100,
          durationDays: 5,
          discount: 10, // 10% item discount
          totalPrice: 450, // Already discounted: 500 * 0.9
          optional: false,
        },
      ];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 0,
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.activitiesTotal).toBe(80);
      expect(result.carsTotal).toBe(450);
      expect(result.finalTotal).toBe(530);
    });

    it('should combine item and global discounts', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'hiking-1',
          name: 'Hiking',
          price: 200,
          discount: 25, // 25% item discount
          finalPrice: 150,
          optional: false,
        },
      ];

      const cars: DetailedCar[] = [];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 10, // Additional 10% global discount
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.activitiesTotal).toBe(150);
      expect(result.subtotal).toBe(150);
      expect(result.discountAmount).toBe(15); // 10% of 150
      expect(result.finalTotal).toBe(135);
    });
  });

  describe('Sum Strategy - Optional Items', () => {
    it('should separate required and optional activities', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'hiking-1',
          name: 'Hiking',
          price: 100,
          discount: 0,
          finalPrice: 100,
          optional: false,
        },
        {
          localeGroupId: 'camping-2',
          name: 'Camping',
          price: 50,
          discount: 0,
          finalPrice: 50,
          optional: true,
        },
      ];

      const cars: DetailedCar[] = [];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 0,
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.activitiesTotal).toBe(100); // Only required
      expect(result.optionalActivitiesTotal).toBe(50); // Optional tracked separately
      expect(result.subtotal).toBe(100); // Only required in subtotal
      expect(result.finalTotal).toBe(100);
    });

    it('should not include optional items in subtotal calculation', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'required-1',
          name: 'Required Activity',
          price: 100,
          discount: 0,
          finalPrice: 100,
          optional: false,
        },
        {
          localeGroupId: 'optional-1',
          name: 'Optional Activity',
          price: 200,
          discount: 0,
          finalPrice: 200,
          optional: true,
        },
      ];

      const cars: DetailedCar[] = [
        {
          localeGroupId: 'car-1',
          name: 'Car',
          pricePerDay: 50,
          durationDays: 2,
          discount: 0,
          totalPrice: 100,
          optional: false,
        },
      ];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 10,
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      // Optional activity should not affect subtotal or discount
      expect(result.activitiesTotal).toBe(100);
      expect(result.optionalActivitiesTotal).toBe(200);
      expect(result.carsTotal).toBe(100);
      expect(result.subtotal).toBe(200); // 100 + 100, no optional
      expect(result.discountAmount).toBe(20); // 10% of 200
      expect(result.finalTotal).toBe(180);
    });
  });

  describe('Custom Strategy', () => {
    it('should use customPrice and ignore all item calculations', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'hiking-1',
          name: 'Hiking',
          price: 1000,
          discount: 50,
          finalPrice: 500,
          optional: false,
        },
      ];

      const cars: DetailedCar[] = [
        {
          localeGroupId: 'car-1',
          name: 'Car',
          pricePerDay: 100,
          durationDays: 10,
          discount: 20,
          totalPrice: 800,
          optional: false,
        },
      ];

      const pricing: PricingConfig = {
        strategy: 'custom',
        customPrice: 999,
        globalDiscount: 20, // Should be ignored
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.finalTotal).toBe(999);
      expect(result.subtotal).toBe(999);
      expect(result.activitiesTotal).toBe(0);
      expect(result.carsTotal).toBe(0);
      expect(result.globalDiscount).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.deposit).toBe(199.8); // 20% of 999
    });

    it('should handle custom strategy with no items', () => {
      const activities: DetailedActivity[] = [];
      const cars: DetailedCar[] = [];

      const pricing: PricingConfig = {
        strategy: 'custom',
        customPrice: 500,
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.finalTotal).toBe(500);
      expect(result.deposit).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty activities and cars', () => {
      const activities: DetailedActivity[] = [];
      const cars: DetailedCar[] = [];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 10,
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.activitiesTotal).toBe(0);
      expect(result.carsTotal).toBe(0);
      expect(result.subtotal).toBe(0);
      expect(result.finalTotal).toBe(0);
      expect(result.deposit).toBe(0);
    });

    it('should handle 100% discount correctly', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'free-activity',
          name: 'Free Activity',
          price: 100,
          discount: 100,
          finalPrice: 0,
          optional: false,
        },
      ];

      const cars: DetailedCar[] = [];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 0,
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.finalTotal).toBe(0);
      expect(result.deposit).toBe(0);
    });

    it('should round deposit to 2 decimal places', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'activity-1',
          name: 'Activity',
          price: 123.45,
          discount: 0,
          finalPrice: 123.45,
          optional: false,
        },
      ];

      const cars: DetailedCar[] = [];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 7.5,
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.finalTotal).toBeCloseTo(114.19, 2);
      expect(result.deposit).toBeCloseTo(22.84, 2); // 20% of 114.19
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical adventure pack', () => {
      const activities: DetailedActivity[] = [
        {
          localeGroupId: 'hiking-1',
          name: 'Mountain Hiking',
          price: 150,
          discount: 0,
          finalPrice: 150,
          optional: false,
        },
        {
          localeGroupId: 'camping-2',
          name: 'Camping',
          price: 100,
          discount: 10,
          finalPrice: 90,
          optional: true,
        },
      ];

      const cars: DetailedCar[] = [
        {
          localeGroupId: 'car-1',
          name: 'Land Cruiser 4x4',
          pricePerDay: 80,
          durationDays: 7,
          discount: 15,
          totalPrice: 476, // 80 * 7 * 0.85
          optional: false,
        },
      ];

      const pricing: PricingConfig = {
        strategy: 'sum',
        globalDiscount: 5,
      };

      const result = calculateTotalPrice(activities, cars, pricing);

      expect(result.activitiesTotal).toBe(150);
      expect(result.optionalActivitiesTotal).toBe(90);
      expect(result.carsTotal).toBe(476);
      expect(result.subtotal).toBe(626); // 150 + 476
      expect(result.discountAmount).toBeCloseTo(31.3, 1); // 5% of 626
      expect(result.finalTotal).toBeCloseTo(594.7, 1);
      expect(result.deposit).toBeCloseTo(118.94, 2);
    });
  });
});
