import request from 'supertest';
import { createApp } from '../../src/app';
import TravelPack from '../../src/models/travelPack.model';
import { connectDB } from '../../src/config/db';
import { ENV } from '../../src/config/env';

describe('Travel Packs API', () => {
  const app = createApp();
  let testTravelPackId: string;

  beforeAll(async () => {
    // Connect to test database
    await connectDB(ENV.MONGO_URI);
  });

  beforeEach(async () => {
    // Clean up test data
    await TravelPack.deleteMany({});
  });

  afterAll(async () => {
    // Clean up after tests
    await TravelPack.deleteMany({});
  });

  describe('POST /api/v1/travel-packs', () => {
    const validTravelPack = {
      locales: {
        en: {
          name: 'Kyrgyzstan Adventure',
          description: 'Explore the beautiful mountains of Kyrgyzstan',
          ctaLabel: 'Book Now',
        },
      },
      status: 'published',
      locale: 'en',
      duration: 7,
      basePrice: 899.99,
      currency: 'USD',
      features: ['Mountain hiking', 'Cultural tours', 'Local cuisine'],
      availability: true,
    };

    it('should create a new travel pack with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/travel-packs')
        .send(validTravelPack)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.locales.en.name).toBe('Kyrgyzstan Adventure');
      expect(response.body.data.slug).toBeTruthy();
      expect(response.body.data.status).toBe('published');

      testTravelPackId = response.body.data._id;
    });

    it('should auto-generate slug if not provided', async () => {
      const response = await request(app)
        .post('/api/v1/travel-packs')
        .send(validTravelPack)
        .expect(201);

      expect(response.body.data.slug).toMatch(/^kyrgyzstan-adventure$/);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        status: 'published',
        // Missing locales
      };

      const response = await request(app)
        .post('/api/v1/travel-packs')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        'At least one localized version (en or fr) is required'
      );
      // Note: Details might not be present for this specific validation error
    });

    it('should validate price and currency', async () => {
      const invalidData = {
        ...validTravelPack,
        basePrice: -100, // negative price
        currency: 'INVALID', // invalid currency format
      };

      const response = await request(app)
        .post('/api/v1/travel-packs')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(
        response.body.details.some((d: any) => d.field.includes('basePrice'))
      ).toBe(true);
      expect(
        response.body.details.some((d: any) => d.field.includes('currency'))
      ).toBe(true);
    });

    it('should validate slug format', async () => {
      const invalidData = {
        ...validTravelPack,
        slug: 'Invalid Slug With Spaces',
      };

      const response = await request(app)
        .post('/api/v1/travel-packs')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/travel-packs', () => {
    beforeEach(async () => {
      // Create test data
      await TravelPack.create([
        {
          slug: 'pack-1',
          status: 'published',
          locale: 'en',
          locales: {
            en: { name: 'Pack 1', description: 'Description 1' },
          },
          basePrice: 100,
          duration: 3,
          availability: true,
        },
        {
          slug: 'pack-2',
          status: 'draft',
          locale: 'en',
          locales: {
            en: { name: 'Pack 2', description: 'Description 2' },
          },
          basePrice: 200,
          duration: 5,
          availability: false,
        },
        {
          slug: 'pack-3',
          status: 'published',
          locale: 'fr',
          locales: {
            fr: { name: 'Pack 3', description: 'Description 3' },
          },
          basePrice: 300,
          duration: 7,
          availability: true,
        },
      ]);
    });

    it('should return all travel packs with default pagination', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(3);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 3,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs?status=published')
        .expect(200);

      expect(response.body.data.items).toHaveLength(2);
      expect(
        response.body.data.items.every(
          (item: any) => item.status === 'published'
        )
      ).toBe(true);
    });

    it('should filter by availability', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs?availability=true')
        .expect(200);

      expect(response.body.data.items).toHaveLength(2);
      expect(
        response.body.data.items.every(
          (item: any) => item.availability === true
        )
      ).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs?minPrice=150&maxPrice=250')
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].basePrice).toBe(200);
    });

    it('should filter by duration range', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs?minDuration=4&maxDuration=6')
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].duration).toBe(5);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs?page=1&limit=2')
        .expect(200);

      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.hasNext).toBe(true);
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs?sort=basePrice')
        .expect(200);

      const prices = response.body.data.items.map(
        (item: any) => item.basePrice
      );
      expect(prices).toEqual([100, 200, 300]);
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs?page=invalid&limit=999')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Query validation failed');
    });
  });

  describe('GET /api/v1/travel-packs/:id', () => {
    let travelPack: any;

    beforeEach(async () => {
      travelPack = await TravelPack.create({
        slug: 'test-pack',
        status: 'published',
        locale: 'en',
        locales: {
          en: { name: 'Test Pack', description: 'Test Description' },
        },
        basePrice: 100,
        availability: true,
      });
    });

    it('should return travel pack by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/travel-packs/${travelPack._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(travelPack._id.toString());
      expect(response.body.data.locales.en.name).toBe('Test Pack');
    });

    it('should return travel pack by slug', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs/test-pack')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('test-pack');
    });

    it('should return 404 for non-existent travel pack', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('TravelPack not found');
    });
  });

  describe('GET /api/v1/travel-packs/statistics', () => {
    beforeEach(async () => {
      await TravelPack.create([
        {
          slug: 'pack-1',
          status: 'published',
          basePrice: 100,
          availability: true,
          locales: { en: { name: 'Pack 1' } },
        },
        {
          slug: 'pack-2',
          status: 'draft',
          basePrice: 200,
          availability: false,
          locales: { en: { name: 'Pack 2' } },
        },
      ]);
    });

    it('should return statistics', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('statusBreakdown');
      expect(response.body.data).toHaveProperty('availabilityBreakdown');
      expect(response.body.data).toHaveProperty('priceStatistics');
    });
  });

  describe('PATCH /api/v1/travel-packs/:id', () => {
    let travelPack: any;

    beforeEach(async () => {
      travelPack = await TravelPack.create({
        slug: 'test-pack',
        status: 'draft',
        locale: 'en',
        locales: {
          en: { name: 'Original Name', description: 'Original Description' },
        },
        basePrice: 100,
        availability: true,
      });
    });

    it('should update travel pack successfully', async () => {
      const updateData = {
        status: 'published',
        basePrice: 150,
        'locales.en.name': 'Updated Name',
      };

      const response = await request(app)
        .patch(`/api/v1/travel-packs/${travelPack._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('published');
      expect(response.body.data.basePrice).toBe(150);
    });

    it('should return 404 for non-existent travel pack', async () => {
      const response = await request(app)
        .patch('/api/v1/travel-packs/non-existent')
        .send({ status: 'published' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/travel-packs/:id', () => {
    let travelPack: any;

    beforeEach(async () => {
      travelPack = await TravelPack.create({
        slug: 'test-pack',
        status: 'published',
        locales: { en: { name: 'Test Pack' } },
      });
    });

    it('should archive travel pack (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/v1/travel-packs/${travelPack._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('archived');

      // Verify the pack is archived
      const archivedPack = await TravelPack.findById(travelPack._id);
      expect(archivedPack?.status).toBe('archived');
    });

    it('should return 404 for non-existent travel pack', async () => {
      const response = await request(app)
        .delete('/api/v1/travel-packs/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
