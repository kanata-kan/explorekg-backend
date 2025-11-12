// tests/integration/activities.test.ts
import request from 'supertest';
import { createApp } from '../../src/app';
import { connectDB } from '../../src/config/db';
import { Activity } from '../../src/models/activity.model';
import mongoose from 'mongoose';
import { ENV } from '../../src/config/env';

const app = createApp();

describe('Activities API Integration Tests', () => {
  beforeAll(async () => {
    await connectDB(ENV.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear activities collection before each test
    await Activity.deleteMany({});
  });

  // ==================== POST /api/v1/activities ====================

  describe('POST /api/v1/activities', () => {
    const validActivity = {
      name: 'Eagle Hunting Show',
      description:
        'Witness the ancient art of eagle hunting performed by a world champion',
      coverImage: 'https://example.com/eagle-hunting.webp',
      images: [
        'https://example.com/eagle-1.webp',
        'https://example.com/eagle-2.webp',
      ],
      duration: '1-2 hours',
      location: 'Alysh village, near the Salkyn Tor mountains',
      groupSize: 'Any',
      price: 0,
      metadata: {
        title: 'Eagle Hunting Show – With a World Champion',
        description:
          'See a live eagle hunting performance by a 3-time Nomad Games champion',
        path: '/activities/eagle-hunting-show',
        image: 'https://example.com/eagle-hunting.webp',
        alt: 'Eagle hunter performing in Kyrgyz mountains',
      },
      locale: 'en',
      status: 'active',
      availabilityStatus: 'available',
    };

    it('should create a new activity with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/activities')
        .send(validActivity)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(validActivity.name);
      expect(response.body.data.location).toBe(validActivity.location);
      expect(response.body.data.price).toBe(0);
      expect(response.body.data.tags).toBeDefined();
      expect(response.body.data.tags.length).toBeGreaterThan(0);
    });

    it('should auto-generate tags from name and description', async () => {
      const response = await request(app)
        .post('/api/v1/activities')
        .send(validActivity)
        .expect(201);

      expect(response.body.data.tags).toContain('eagle');
      expect(response.body.data.tags).toContain('hunting');
    });

    it('should return 400 if name is missing', async () => {
      const { name, ...invalidActivity } = validActivity;

      const response = await request(app)
        .post('/api/v1/activities')
        .send(invalidActivity)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 if price is negative', async () => {
      const invalidActivity = { ...validActivity, price: -50 };

      const response = await request(app)
        .post('/api/v1/activities')
        .send(invalidActivity)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if locale is invalid', async () => {
      const invalidActivity = { ...validActivity, locale: 'de' };

      const response = await request(app)
        .post('/api/v1/activities')
        .send(invalidActivity)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if metadata.path format is invalid', async () => {
      const invalidActivity = {
        ...validActivity,
        metadata: { ...validActivity.metadata, path: '/invalid-path' },
      };

      const response = await request(app)
        .post('/api/v1/activities')
        .send(invalidActivity)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== GET /api/v1/activities ====================

  describe('GET /api/v1/activities', () => {
    beforeEach(async () => {
      // Create test activities
      await Activity.create([
        {
          name: 'Beshbarmak Cooking Class',
          description: 'Learn to cook traditional Kyrgyz dish',
          coverImage: 'https://example.com/beshbarmak.webp',
          images: [],
          duration: '1.5 hours',
          location: 'Naryn Museum',
          groupSize: 'Small groups',
          price: 0,
          metadata: {
            title: 'Beshbarmak Cooking Class',
            description: 'Authentic cooking experience',
            path: '/activities/beshbarmak-class',
            image: 'https://example.com/beshbarmak.webp',
            alt: 'Cooking Beshbarmak',
          },
          locale: 'en',
          status: 'active',
          availabilityStatus: 'available',
        },
        {
          name: 'Eagle Hunting Show',
          description: 'Watch eagle hunting demonstration',
          coverImage: 'https://example.com/eagle.webp',
          images: [],
          duration: '2 hours',
          location: 'Alysh village',
          groupSize: 'Any',
          price: 50,
          metadata: {
            title: 'Eagle Hunting Show',
            description: 'Amazing eagle show',
            path: '/activities/eagle-show',
            image: 'https://example.com/eagle.webp',
            alt: 'Eagle hunting',
          },
          locale: 'en',
          status: 'active',
          availabilityStatus: 'available',
        },
        {
          name: 'Mountain Camping',
          description: 'Overnight camping in Kyrgyz mountains',
          coverImage: 'https://example.com/camping.webp',
          images: [],
          duration: 'Overnight',
          location: 'Remote mountains',
          groupSize: 'Any',
          price: 100,
          metadata: {
            title: 'Mountain Camping',
            description: 'Sleep under the stars',
            path: '/activities/mountain-camping',
            image: 'https://example.com/camping.webp',
            alt: 'Camping',
          },
          locale: 'en',
          status: 'inactive',
          availabilityStatus: 'unavailable',
        },
      ]);
    });

    it('should return paginated activities', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ limit: 2, page: 1 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        pages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should filter activities by status', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ status: 'active' })
        .expect(200);

      expect(response.body.data.items).toHaveLength(2);
      response.body.data.items.forEach((activity: any) => {
        expect(activity.status).toBe('active');
      });
    });

    it('should filter activities by availability status', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ availabilityStatus: 'available' })
        .expect(200);

      expect(response.body.data.items).toHaveLength(2);
      response.body.data.items.forEach((activity: any) => {
        expect(activity.availabilityStatus).toBe('available');
      });
    });

    it('should filter activities by price range', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ minPrice: 0, maxPrice: 50 })
        .expect(200);

      expect(response.body.data.items.length).toBeGreaterThan(0);
      response.body.data.items.forEach((activity: any) => {
        expect(activity.price).toBeGreaterThanOrEqual(0);
        expect(activity.price).toBeLessThanOrEqual(50);
      });
    });

    it('should filter free activities', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ isFree: 'true' })
        .expect(200);

      expect(response.body.data.items.length).toBeGreaterThan(0);
      response.body.data.items.forEach((activity: any) => {
        expect(activity.price).toBe(0);
      });
    });

    it('should filter by location', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ location: 'Naryn' })
        .expect(200);

      expect(response.body.data.items.length).toBeGreaterThan(0);
      response.body.data.items.forEach((activity: any) => {
        expect(activity.location.toLowerCase()).toContain('naryn');
      });
    });

    it('should sort activities by price ascending', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ sort: 'price' })
        .expect(200);

      const prices = response.body.data.items.map((a: any) => a.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('should sort activities by price descending', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ sort: '-price' })
        .expect(200);

      const prices = response.body.data.items.map((a: any) => a.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('should return 400 for invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ limit: -5 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid query parameters');
    });
  });

  // ==================== GET /api/v1/activities/:id ====================

  describe('GET /api/v1/activities/:id', () => {
    let activityId: string;
    let activitySlug: string;

    beforeEach(async () => {
      const activity = await Activity.create({
        name: 'Test Activity',
        description: 'Test activity description',
        coverImage: 'https://example.com/test.webp',
        images: [],
        duration: '1 hour',
        location: 'Test location',
        groupSize: '1-5',
        price: 25,
        metadata: {
          title: 'Test Activity',
          description: 'Test description',
          path: '/activities/test-activity',
          image: 'https://example.com/test.webp',
          alt: 'Test activity',
        },
        locale: 'en',
        status: 'active',
        availabilityStatus: 'available',
      });

      activityId = activity._id.toString();
      activitySlug = 'test-activity';
    });

    it('should get activity by ObjectId', async () => {
      const response = await request(app)
        .get(`/api/v1/activities/${activityId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(activityId);
      expect(response.body.data.name).toBe('Test Activity');
    });

    it('should get activity by slug', async () => {
      const response = await request(app)
        .get(`/api/v1/activities/${activitySlug}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.path).toContain(activitySlug);
    });

    it('should return 404 for non-existent activity', async () => {
      const response = await request(app)
        .get('/api/v1/activities/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== GET /api/v1/activities/statistics ====================

  describe('GET /api/v1/activities/statistics', () => {
    beforeEach(async () => {
      await Activity.create([
        {
          name: 'Activity 1',
          description: 'Description 1',
          coverImage: 'https://example.com/1.webp',
          images: [],
          duration: '1h',
          location: 'Location 1',
          groupSize: '1-5',
          price: 0,
          metadata: {
            title: 'Activity 1',
            description: 'Desc 1',
            path: '/activities/activity-1',
            image: 'https://example.com/1.webp',
            alt: 'Activity 1',
          },
          locale: 'en',
          status: 'active',
          availabilityStatus: 'available',
        },
        {
          name: 'Activity 2',
          description: 'Description 2',
          coverImage: 'https://example.com/2.webp',
          images: [],
          duration: '2h',
          location: 'Location 2',
          groupSize: '5-10',
          price: 50,
          metadata: {
            title: 'Activity 2',
            description: 'Desc 2',
            path: '/activities/activity-2',
            image: 'https://example.com/2.webp',
            alt: 'Activity 2',
          },
          locale: 'en',
          status: 'inactive',
          availabilityStatus: 'unavailable',
        },
      ]);
    });

    it('should return activity statistics', async () => {
      const response = await request(app)
        .get('/api/v1/activities/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('byAvailability');
      expect(response.body.data).toHaveProperty('pricing');

      expect(response.body.data.total).toBe(2);
      expect(response.body.data.byStatus.active).toBe(1);
      expect(response.body.data.byStatus.inactive).toBe(1);
      expect(response.body.data.pricing.freeActivitiesCount).toBe(1);
    });
  });

  // ==================== PATCH /api/v1/activities/:id ====================

  describe('PATCH /api/v1/activities/:id', () => {
    let activityId: string;

    beforeEach(async () => {
      const activity = await Activity.create({
        name: 'Original Name',
        description: 'Original description',
        coverImage: 'https://example.com/original.webp',
        images: [],
        duration: '1h',
        location: 'Original location',
        groupSize: '1-5',
        price: 25,
        metadata: {
          title: 'Original Title',
          description: 'Original desc',
          path: '/activities/original',
          image: 'https://example.com/original.webp',
          alt: 'Original',
        },
        locale: 'en',
        status: 'active',
        availabilityStatus: 'available',
      });

      activityId = activity._id.toString();
    });

    it('should update activity successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        price: 30,
      };

      const response = await request(app)
        .patch(`/api/v1/activities/${activityId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.price).toBe(30);
    });

    it('should return 404 for non-existent activity', async () => {
      await request(app)
        .patch('/api/v1/activities/507f1f77bcf86cd799439011')
        .send({ name: 'New Name' })
        .expect(404);
    });
  });

  // ==================== DELETE /api/v1/activities/:id ====================

  describe('DELETE /api/v1/activities/:id', () => {
    let activityId: string;

    beforeEach(async () => {
      const activity = await Activity.create({
        name: 'To Delete',
        description: 'Will be deleted',
        coverImage: 'https://example.com/delete.webp',
        images: [],
        duration: '1h',
        location: 'Location',
        groupSize: '1-5',
        price: 10,
        metadata: {
          title: 'To Delete',
          description: 'Delete me',
          path: '/activities/to-delete',
          image: 'https://example.com/delete.webp',
          alt: 'Delete',
        },
        locale: 'en',
        status: 'active',
        availabilityStatus: 'available',
      });

      activityId = activity._id.toString();
    });

    it('should soft delete activity (set deletedAt)', async () => {
      const response = await request(app)
        .delete(`/api/v1/activities/${activityId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Activity archived successfully');

      // Verify activity still exists but is soft-deleted (has deletedAt)
      const activity = await Activity.findById(activityId);
      expect(activity).toBeDefined();
      expect(activity?.deletedAt).toBeDefined();
      expect(activity?.deletedAt).toBeInstanceOf(Date);
      
      // Verify activity is excluded from normal queries
      const { excludeDeleted } = await import('../../src/utils/softDelete.util');
      const foundActivity = await Activity.findOne(excludeDeleted({ _id: activityId }));
      expect(foundActivity).toBeNull();
    });

    it('should return 404 for non-existent activity', async () => {
      await request(app)
        .delete('/api/v1/activities/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  // ==================== GET /api/v1/activities/available ====================

  describe('GET /api/v1/activities/available', () => {
    beforeEach(async () => {
      await Activity.create([
        {
          name: 'Available EN',
          description: 'Available in English',
          coverImage: 'https://example.com/en.webp',
          images: [],
          duration: '1h',
          location: 'EN Location',
          groupSize: '1-5',
          price: 10,
          metadata: {
            title: 'Available EN',
            description: 'EN desc',
            path: '/activities/available-en',
            image: 'https://example.com/en.webp',
            alt: 'Available EN',
          },
          locale: 'en',
          status: 'active',
          availabilityStatus: 'available',
        },
        {
          name: 'Unavailable',
          description: 'Not available',
          coverImage: 'https://example.com/unavail.webp',
          images: [],
          duration: '1h',
          location: 'Location',
          groupSize: '1-5',
          price: 10,
          metadata: {
            title: 'Unavailable',
            description: 'Unavail desc',
            path: '/activities/unavailable',
            image: 'https://example.com/unavail.webp',
            alt: 'Unavailable',
          },
          locale: 'en',
          status: 'inactive',
          availabilityStatus: 'unavailable',
        },
      ]);
    });

    it('should return only available activities', async () => {
      const response = await request(app)
        .get('/api/v1/activities/available')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Available EN');
    });

    it('should filter available activities by locale', async () => {
      const response = await request(app)
        .get('/api/v1/activities/available')
        .query({ locale: 'en' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((activity: any) => {
        expect(activity.locale).toBe('en');
        expect(activity.status).toBe('active');
        expect(activity.availabilityStatus).toBe('available');
      });
    });
  });
});

// ✅ Activity Integration Tests completed with comprehensive coverage
