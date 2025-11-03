// tests/integration/packRelation.integration.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../src/app';
import PackRelation from '../../src/models/packRelation.model';
import TravelPack from '../../src/models/travelPack.model';
import { Activity } from '../../src/models/activity.model';
import { Car } from '../../src/models/car.model';

/**
 * Integration tests for PackRelation API endpoints
 * Tests complete flow: create, get, update, delete, calculate-price, detailed endpoint
 */

const app = createApp();

// Test data IDs
let testPackLocaleGroupId: string;
let testActivityLocaleGroupId1: string;
let testActivityLocaleGroupId2: string;
let testCarLocaleGroupId: string;
let createdPackRelationId: string;

// Helper function to create complete activity data
function createActivityData(
  localeGroupId: string,
  name: string,
  slug: string,
  price: number
) {
  return {
    localeGroupId,
    locale: 'en',
    name,
    slug,
    description: 'Test activity description for integration testing purposes',
    coverImage: `https://example.com/images/${slug}.jpg`,
    price,
    duration: 2,
    location: 'Test Location, Morocco',
    groupSize: '4-8 people',
    availability: true,
    status: 'active',
    metadata: {
      title: `Meta title for ${name} activity`,
      description:
        'This is a meta description for the test activity with enough characters to pass validation',
      path: `/activities/${slug}`,
      image: `https://example.com/meta/${slug}.jpg`,
      alt: `${name} activity image`,
    },
  };
}

// Helper function to create complete car data
function createCarData(localeGroupId: string, name: string, slug: string) {
  return {
    localeGroupId,
    locale: 'en',
    name,
    slug,
    description: 'Test car description for integration testing purposes',
    coverImage: `https://example.com/images/${slug}.jpg`,
    pricing: {
      amount: 50,
      currency: 'USD',
      unit: 'day',
    },
    specs: {
      seats: '4',
      transmission: 'Automatic',
      drive: 'FWD',
      luggage: '2',
      fuel: 'Petrol',
    },
    availability: true,
    status: 'active',
    metadata: {
      title: `Meta title for ${name} car`,
      description:
        'This is a meta description for the test car with enough characters to pass validation',
      path: `/cars/${slug}`,
      image: `https://example.com/meta/${slug}.jpg`,
      alt: `${name} car image`,
    },
  };
}

describe('PackRelation API Integration Tests', () => {
  // Setup: Connect to test database
  beforeAll(async () => {
    const mongoUri =
      process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/explorekg-test';
    await mongoose.connect(mongoUri);
  });

  // Cleanup: Clear collections before each test
  beforeEach(async () => {
    await PackRelation.deleteMany({});
    await TravelPack.deleteMany({});
    await Activity.deleteMany({});
    await Car.deleteMany({});

    // Create test data
    testPackLocaleGroupId = `pack-${Date.now()}`;
    testActivityLocaleGroupId1 = `activity-${Date.now()}-1`;
    testActivityLocaleGroupId2 = `activity-${Date.now()}-2`;
    testCarLocaleGroupId = `car-${Date.now()}`;

    // Create TravelPack
    await TravelPack.create({
      localeGroupId: testPackLocaleGroupId,
      locale: 'en',
      slug: `test-pack-${Date.now()}`,
      locales: {
        en: {
          name: 'Test Pack',
          description: 'Test description',
        },
      },
      basePrice: 1000,
      currency: 'USD',
      duration: 5,
      status: 'published',
      availability: true,
    });

    // Create Activities
    await Activity.create([
      createActivityData(
        testActivityLocaleGroupId1,
        'Test Activity 1',
        `test-activity-1-${Date.now()}`,
        100
      ),
      createActivityData(
        testActivityLocaleGroupId2,
        'Test Activity 2',
        `test-activity-2-${Date.now()}`,
        150
      ),
    ]);

    // Create Car
    await Car.create(
      createCarData(testCarLocaleGroupId, 'Test Car', `test-car-${Date.now()}`)
    );
  });

  // Teardown: Disconnect after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // =============================================
  // Test 1: Create PackRelation
  // =============================================
  describe('POST /api/v1/pack-relations', () => {
    it('should create a new pack relation with valid data', async () => {
      const payload = {
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [
            {
              localeGroupId: testActivityLocaleGroupId1,
              discount: 10,
              optional: false,
            },
            {
              localeGroupId: testActivityLocaleGroupId2,
              discount: 5,
              optional: true,
            },
          ],
          cars: [
            {
              localeGroupId: testCarLocaleGroupId,
              durationDays: 3,
              discount: 15,
            },
          ],
        },
        pricing: {
          strategy: 'sum',
          globalDiscount: 5,
        },
        settings: {
          allowCustomization: true,
          minActivities: 1,
          maxActivities: 3,
        },
      };

      const response = await request(app)
        .post('/api/v1/pack-relations')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.travelPackLocaleGroupId).toBe(
        testPackLocaleGroupId
      );
      expect(response.body.data.relations.activities).toHaveLength(2);
      expect(response.body.data.relations.cars).toHaveLength(1);

      createdPackRelationId = response.body.data._id;
    });

    it('should fail to create pack relation with duplicate travelPackLocaleGroupId', async () => {
      // Create first relation
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [],
          cars: [],
        },
        pricing: { strategy: 'sum' },
        settings: { allowCustomization: false },
      });

      // Try to create duplicate
      const payload = {
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: { activities: [], cars: [] },
        pricing: { strategy: 'sum' },
        settings: { allowCustomization: false },
      };

      const response = await request(app)
        .post('/api/v1/pack-relations')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid discount (> 100)', async () => {
      const payload = {
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [
            {
              localeGroupId: testActivityLocaleGroupId1,
              discount: 150, // Invalid
              optional: false,
            },
          ],
          cars: [],
        },
        pricing: { strategy: 'sum' },
        settings: { allowCustomization: false },
      };

      const response = await request(app)
        .post('/api/v1/pack-relations')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require customPrice when strategy is custom', async () => {
      const payload = {
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: { activities: [], cars: [] },
        pricing: { strategy: 'custom' }, // Missing customPrice
        settings: { allowCustomization: false },
      };

      const response = await request(app)
        .post('/api/v1/pack-relations')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate minActivities <= maxActivities', async () => {
      const payload = {
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: { activities: [], cars: [] },
        pricing: { strategy: 'sum' },
        settings: {
          allowCustomization: true,
          minActivities: 5,
          maxActivities: 2, // Invalid: min > max
        },
      };

      const response = await request(app)
        .post('/api/v1/pack-relations')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // =============================================
  // Test 2: Get All PackRelations
  // =============================================
  describe('GET /api/v1/pack-relations', () => {
    it('should return all pack relations', async () => {
      // Create multiple relations
      await PackRelation.create([
        {
          travelPackLocaleGroupId: `pack-1-${Date.now()}`,
          relations: { activities: [], cars: [] },
          pricing: { strategy: 'sum' },
          settings: { allowCustomization: false },
        },
        {
          travelPackLocaleGroupId: `pack-2-${Date.now()}`,
          relations: { activities: [], cars: [] },
          pricing: { strategy: 'sum' },
          settings: { allowCustomization: false },
        },
      ]);

      const response = await request(app)
        .get('/api/v1/pack-relations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.count).toBe(2);
    });

    it('should return empty array when no relations exist', async () => {
      const response = await request(app)
        .get('/api/v1/pack-relations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.count).toBe(0);
    });
  });

  // =============================================
  // Test 3: Get PackRelation by ID
  // =============================================
  describe('GET /api/v1/pack-relations/:packId', () => {
    it('should get pack relation by travelPackLocaleGroupId', async () => {
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [
            {
              localeGroupId: testActivityLocaleGroupId1,
              discount: 10,
              optional: false,
            },
          ],
          cars: [],
        },
        pricing: { strategy: 'sum', globalDiscount: 5 },
        settings: { allowCustomization: true },
      });

      const response = await request(app)
        .get(`/api/v1/pack-relations/${testPackLocaleGroupId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.travelPackLocaleGroupId).toBe(
        testPackLocaleGroupId
      );
      expect(response.body.data.relations.activities).toHaveLength(1);
    });

    it('should return 404 for non-existent pack relation', async () => {
      const response = await request(app)
        .get('/api/v1/pack-relations/non-existent-pack')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // =============================================
  // Test 4: Update PackRelation
  // =============================================
  describe('PUT /api/v1/pack-relations/:packId', () => {
    it('should update pack relation successfully', async () => {
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: { activities: [], cars: [] },
        pricing: { strategy: 'sum' },
        settings: { allowCustomization: false },
      });

      const updatePayload = {
        pricing: { strategy: 'custom', customPrice: 500 },
        settings: { allowCustomization: true, minActivities: 2 },
      };

      const response = await request(app)
        .put(`/api/v1/pack-relations/${testPackLocaleGroupId}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pricing.strategy).toBe('custom');
      expect(response.body.data.pricing.customPrice).toBe(500);
      expect(response.body.data.settings.allowCustomization).toBe(true);
    });

    it('should return 404 when updating non-existent relation', async () => {
      const response = await request(app)
        .put('/api/v1/pack-relations/non-existent-pack')
        .send({ pricing: { strategy: 'sum' } })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // =============================================
  // Test 5: Delete PackRelation
  // =============================================
  describe('DELETE /api/v1/pack-relations/:packId', () => {
    it('should delete pack relation successfully', async () => {
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: { activities: [], cars: [] },
        pricing: { strategy: 'sum' },
        settings: { allowCustomization: false },
      });

      const response = await request(app)
        .delete(`/api/v1/pack-relations/${testPackLocaleGroupId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await PackRelation.findOne({
        travelPackLocaleGroupId: testPackLocaleGroupId,
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting non-existent relation', async () => {
      const response = await request(app)
        .delete('/api/v1/pack-relations/non-existent-pack')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // =============================================
  // Test 6: Calculate Custom Price
  // =============================================
  describe('POST /api/v1/pack-relations/calculate-price', () => {
    beforeEach(async () => {
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [
            {
              localeGroupId: testActivityLocaleGroupId1,
              discount: 10,
              optional: false,
            },
            {
              localeGroupId: testActivityLocaleGroupId2,
              discount: 0,
              optional: true,
            },
          ],
          cars: [
            {
              localeGroupId: testCarLocaleGroupId,
              durationDays: 3,
              discount: 0,
            },
          ],
        },
        pricing: { strategy: 'sum', globalDiscount: 0 },
        settings: {
          allowCustomization: true,
          minActivities: 1,
          maxActivities: 3,
        },
      });
    });

    it('should calculate custom price with selected activities', async () => {
      const payload = {
        travelPackLocaleGroupId: testPackLocaleGroupId,
        selectedActivities: [
          testActivityLocaleGroupId1,
          testActivityLocaleGroupId2,
        ],
        locale: 'en',
      };

      const response = await request(app)
        .post('/api/v1/pack-relations/calculate-price')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('breakdown');
      expect(response.body.data.breakdown).toHaveProperty('finalTotal');
      expect(response.body.data.breakdown.finalTotal).toBeGreaterThan(0);
    });

    it('should enforce minActivities constraint', async () => {
      const payload = {
        travelPackLocaleGroupId: testPackLocaleGroupId,
        selectedActivities: [], // Empty, but min is 1
        locale: 'en',
      };

      const response = await request(app)
        .post('/api/v1/pack-relations/calculate-price')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Minimum');
    });

    it('should enforce maxActivities constraint', async () => {
      // Create more activities
      const extraActivity1 = `activity-extra-1-${Date.now()}`;
      const extraActivity2 = `activity-extra-2-${Date.now()}`;

      await Activity.create([
        createActivityData(
          extraActivity1,
          'Extra Activity 1',
          `extra-activity-1-${Date.now()}`,
          50
        ),
        createActivityData(
          extraActivity2,
          'Extra Activity 2',
          `extra-activity-2-${Date.now()}`,
          50
        ),
      ]);

      // Update relation to include extra activities
      await PackRelation.findOneAndUpdate(
        { travelPackLocaleGroupId: testPackLocaleGroupId },
        {
          $push: {
            'relations.activities': [
              {
                localeGroupId: extraActivity1,
                discount: 0,
                optional: true,
                quantity: 1,
              },
              {
                localeGroupId: extraActivity2,
                discount: 0,
                optional: true,
                quantity: 1,
              },
            ],
          },
        }
      );

      const payload = {
        travelPackLocaleGroupId: testPackLocaleGroupId,
        selectedActivities: [
          testActivityLocaleGroupId1,
          testActivityLocaleGroupId2,
          extraActivity1,
          extraActivity2, // 4 activities, max is 3
        ],
        locale: 'en',
      };

      const response = await request(app)
        .post('/api/v1/pack-relations/calculate-price')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Maximum');
    });

    it('should handle missing activities gracefully', async () => {
      const payload = {
        travelPackLocaleGroupId: testPackLocaleGroupId,
        selectedActivities: [
          testActivityLocaleGroupId1,
          'non-existent-activity',
        ], // Include valid one to pass min constraint
        locale: 'en',
      };

      const response = await request(app)
        .post('/api/v1/pack-relations/calculate-price')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('breakdown');
      expect(response.body.data.selectedItems.activities).toHaveLength(2);
      // Should include missing activity with missing: true flag
      const missingActivity = response.body.data.selectedItems.activities.find(
        (a: any) => a.localeGroupId === 'non-existent-activity'
      );
      expect(missingActivity).toBeDefined();
      expect(missingActivity.missing).toBe(true);
    });
  });

  // =============================================
  // Test 7: Get Detailed TravelPack
  // =============================================
  describe('GET /api/v1/travel-packs/:id/detailed', () => {
    beforeEach(async () => {
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [
            {
              localeGroupId: testActivityLocaleGroupId1,
              discount: 10,
              optional: false,
            },
            {
              localeGroupId: testActivityLocaleGroupId2,
              discount: 5,
              optional: true,
            },
          ],
          cars: [
            {
              localeGroupId: testCarLocaleGroupId,
              durationDays: 3,
              discount: 15,
            },
          ],
        },
        pricing: { strategy: 'sum', globalDiscount: 5 },
        settings: {
          allowCustomization: true,
          minActivities: 1,
          maxActivities: 3,
        },
      });
    });

    it('should get full detailed pack', async () => {
      const response = await request(app)
        .get(`/api/v1/travel-packs/${testPackLocaleGroupId}/detailed`)
        .query({ step: 'full', locale: 'en' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pack');
      expect(response.body.data).toHaveProperty('relations');
      expect(response.body.data).toHaveProperty('pricing');
      expect(response.body.data.relations.activities).toHaveLength(2);
      expect(response.body.data.relations.cars).toHaveLength(1);
    });

    it('should get overview step (pack + pricing only)', async () => {
      const response = await request(app)
        .get(`/api/v1/travel-packs/${testPackLocaleGroupId}/detailed`)
        .query({ step: 'overview', locale: 'en' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pack');
      expect(response.body.data).toHaveProperty('pricing');
      expect(response.body.data).toHaveProperty('settings');
      expect(response.body.data).not.toHaveProperty('relations');
    });

    it('should get activities step', async () => {
      const response = await request(app)
        .get(`/api/v1/travel-packs/${testPackLocaleGroupId}/detailed`)
        .query({ step: 'activities', locale: 'en' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pack');
      expect(response.body.data).toHaveProperty('activities');
      expect(response.body.data.activities).toHaveLength(2);
      expect(response.body.data).not.toHaveProperty('cars');
    });

    it('should get cars step', async () => {
      const response = await request(app)
        .get(`/api/v1/travel-packs/${testPackLocaleGroupId}/detailed`)
        .query({ step: 'cars', locale: 'en' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pack');
      expect(response.body.data).toHaveProperty('cars');
      expect(response.body.data.cars).toHaveLength(1);
      expect(response.body.data).not.toHaveProperty('activities');
    });

    it('should return 404 for non-existent pack', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs/non-existent-pack/detailed')
        .query({ step: 'full', locale: 'en' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle French locale', async () => {
      // Create French version of activities and car
      await Activity.create([
        {
          ...createActivityData(
            testActivityLocaleGroupId1,
            'Activité Test 1',
            `test-activity-1-fr-${Date.now()}`,
            100
          ),
          locale: 'fr',
        },
        {
          ...createActivityData(
            testActivityLocaleGroupId2,
            'Activité Test 2',
            `test-activity-2-fr-${Date.now()}`,
            150
          ),
          locale: 'fr',
        },
      ]);

      await Car.create({
        ...createCarData(
          testCarLocaleGroupId,
          'Voiture Test',
          `test-car-fr-${Date.now()}`
        ),
        locale: 'fr',
      });

      // Create French version of pack
      await TravelPack.create({
        localeGroupId: testPackLocaleGroupId,
        locale: 'fr',
        slug: `test-pack-fr-${Date.now()}`,
        locales: {
          fr: {
            name: 'Pack de Test',
            description: 'Description test',
          },
        },
        basePrice: 1000,
        currency: 'USD',
        duration: 5,
        status: 'published',
        availability: true,
      });

      const response = await request(app)
        .get(`/api/v1/travel-packs/${testPackLocaleGroupId}/detailed`)
        .query({ step: 'full', locale: 'fr' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pack');
      expect(response.body.data.pack).toBeDefined();
      expect(response.body.data.pack.locale).toBe('fr');
      expect(response.body.data.pack.locales.fr.name).toBe('Pack de Test');
      expect(response.body.data.relations.activities).toHaveLength(2);
      expect(response.body.data.relations.cars).toHaveLength(1);
    });
  });

  // =============================================
  // Test 8: Pricing Calculations
  // =============================================
  describe('Pricing Calculation Scenarios', () => {
    it('should calculate correct price with item-level discounts', async () => {
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [
            {
              localeGroupId: testActivityLocaleGroupId1,
              discount: 20,
              optional: false,
            }, // 100 * 0.8 = 80
          ],
          cars: [
            {
              localeGroupId: testCarLocaleGroupId,
              durationDays: 2,
              discount: 10,
            }, // 50*2 * 0.9 = 90
          ],
        },
        pricing: { strategy: 'sum', globalDiscount: 0 },
        settings: { allowCustomization: false },
      });

      const response = await request(app)
        .get(`/api/v1/travel-packs/${testPackLocaleGroupId}/detailed`)
        .query({ step: 'full', locale: 'en' })
        .expect(200);

      const pricing = response.body.data.pricing;
      expect(pricing.activitiesTotal).toBe(80); // 100 - 20%
      expect(pricing.carsTotal).toBe(90); // 100 - 10%
      expect(pricing.subtotal).toBe(170);
      expect(pricing.finalTotal).toBe(170);
      expect(pricing.deposit).toBe(34); // 20% of 170
    });

    it('should apply global discount after item discounts', async () => {
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [
            {
              localeGroupId: testActivityLocaleGroupId1,
              discount: 10,
              optional: false,
            }, // 100 * 0.9 = 90
          ],
          cars: [
            {
              localeGroupId: testCarLocaleGroupId,
              durationDays: 2,
              discount: 0,
            }, // 50*2 = 100
          ],
        },
        pricing: { strategy: 'sum', globalDiscount: 10 }, // 10% off subtotal
        settings: { allowCustomization: false },
      });

      const response = await request(app)
        .get(`/api/v1/travel-packs/${testPackLocaleGroupId}/detailed`)
        .query({ step: 'full', locale: 'en' })
        .expect(200);

      const pricing = response.body.data.pricing;
      expect(pricing.subtotal).toBe(190); // 90 + 100
      expect(pricing.discountAmount).toBe(19); // 10% of 190
      expect(pricing.finalTotal).toBe(171); // 190 - 19
    });

    it('should use custom price when strategy is custom', async () => {
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [
            {
              localeGroupId: testActivityLocaleGroupId1,
              discount: 0,
              optional: false,
            },
          ],
          cars: [],
        },
        pricing: { strategy: 'custom', customPrice: 500 },
        settings: { allowCustomization: false },
      });

      const response = await request(app)
        .get(`/api/v1/travel-packs/${testPackLocaleGroupId}/detailed`)
        .query({ step: 'full', locale: 'en' })
        .expect(200);

      const pricing = response.body.data.pricing;
      expect(pricing.finalTotal).toBe(500);
      expect(pricing.deposit).toBe(100); // 20% of 500
    });

    it('should separate optional items in pricing', async () => {
      await PackRelation.create({
        travelPackLocaleGroupId: testPackLocaleGroupId,
        relations: {
          activities: [
            {
              localeGroupId: testActivityLocaleGroupId1,
              discount: 0,
              optional: false,
            }, // Required: 100
            {
              localeGroupId: testActivityLocaleGroupId2,
              discount: 0,
              optional: true,
            }, // Optional: 150
          ],
          cars: [],
        },
        pricing: { strategy: 'sum', globalDiscount: 0 },
        settings: { allowCustomization: true },
      });

      const response = await request(app)
        .get(`/api/v1/travel-packs/${testPackLocaleGroupId}/detailed`)
        .query({ step: 'full', locale: 'en' })
        .expect(200);

      const pricing = response.body.data.pricing;
      expect(pricing.activitiesTotal).toBe(100); // Only required
      expect(pricing.optionalActivitiesTotal).toBe(150); // Optional separate
      expect(pricing.subtotal).toBe(100); // Only required in subtotal
    });
  });
});
