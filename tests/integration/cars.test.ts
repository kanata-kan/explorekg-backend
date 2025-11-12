import request from 'supertest';
import { createApp } from '../../src/app';
import { Car } from '../../src/models/car.model';
import { connectDB } from '../../src/config/db';
import { ENV } from '../../src/config/env';

describe('Cars API', () => {
  const app = createApp();
  let testCarId: string;

  beforeAll(async () => {
    // Connect to test database
    await connectDB(ENV.MONGO_URI);
  });

  beforeEach(async () => {
    // Clean up test data
    await Car.deleteMany({});
  });

  afterAll(async () => {
    // Clean up after tests
    await Car.deleteMany({});
  });

  describe('POST /api/v1/cars', () => {
    const validCar = {
      name: 'BMW X7 (2024)',
      description: 'A luxury SUV that blends elegance and power',
      coverImage: 'https://example.com/images/bmw-x7.jpg',
      pricing: {
        amount: 180,
        currency: 'USD',
        unit: 'day',
      },
      specs: {
        seats: '7',
        transmission: 'Automatic',
        drive: '4x4 xDrive',
        luggage: 'Large',
        fuel: 'Petrol',
      },
      metadata: {
        title: 'BMW X7 (2024) — Luxury SUV Rental in Kyrgyzstan',
        description: 'Experience elegance and power with the 2024 BMW X7',
        path: '/cars/bmw-x7-2024',
        image: 'https://example.com/images/bmw-x7.jpg',
        alt: 'BMW X7 2024 luxury SUV available for rental',
      },
      images: [
        'https://example.com/images/bmw-x7-1.jpg',
        'https://example.com/images/bmw-x7-2.jpg',
      ],
      locale: 'en',
      status: 'active',
      availabilityStatus: 'available',
    };

    it('should create a new car with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/cars')
        .send(validCar)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe('BMW X7 (2024)');
      expect(response.body.data.pricing.amount).toBe(180);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.availabilityStatus).toBe('available');

      testCarId = response.body.data._id;
    });

    it('should auto-generate tags from car name', async () => {
      const response = await request(app)
        .post('/api/v1/cars')
        .send(validCar)
        .expect(201);

      expect(response.body.data.tags).toBeInstanceOf(Array);
      expect(response.body.data.tags.length).toBeGreaterThan(0);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        locale: 'en',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/v1/cars')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should validate pricing information', async () => {
      const invalidData = {
        ...validCar,
        pricing: {
          amount: -100, // negative price
          currency: 'INVALID', // invalid currency
          unit: 'day',
        },
      };

      const response = await request(app)
        .post('/api/v1/cars')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it('should validate specs fields', async () => {
      const invalidData = {
        ...validCar,
        specs: {
          seats: '7',
          transmission: 'InvalidType', // invalid transmission
          drive: '4x4',
          luggage: 'Large',
          fuel: 'Petrol',
        },
      };

      const response = await request(app)
        .post('/api/v1/cars')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/cars', () => {
    beforeEach(async () => {
      // Create test cars
      await Car.insertMany([
        {
          name: 'BMW X7',
          description: 'Luxury SUV',
          coverImage: 'https://example.com/bmw.jpg',
          pricing: { amount: 180, currency: 'USD', unit: 'day' },
          specs: {
            seats: '7',
            transmission: 'Automatic',
            drive: '4x4',
            luggage: 'Large',
            fuel: 'Petrol',
          },
          metadata: {
            title: 'BMW X7',
            description: 'Luxury SUV',
            path: '/cars/bmw-x7',
            image: 'https://example.com/bmw.jpg',
            alt: 'BMW X7',
          },
          locale: 'en',
          status: 'active',
          availabilityStatus: 'available',
        },
        {
          name: 'Mercedes Sprinter',
          description: 'Group minibus',
          coverImage: 'https://example.com/sprinter.jpg',
          pricing: { amount: 140, currency: 'USD', unit: 'day' },
          specs: {
            seats: '15-20',
            transmission: 'Manual',
            drive: '2WD',
            luggage: 'Extra Large',
            fuel: 'Diesel',
          },
          metadata: {
            title: 'Mercedes Sprinter',
            description: 'Group minibus',
            path: '/cars/mercedes-sprinter',
            image: 'https://example.com/sprinter.jpg',
            alt: 'Mercedes Sprinter',
          },
          locale: 'en',
          status: 'active',
          availabilityStatus: 'available',
        },
        {
          name: 'Toyota Land Cruiser',
          description: 'Rugged 4x4',
          coverImage: 'https://example.com/landcruiser.jpg',
          pricing: { amount: 160, currency: 'USD', unit: 'day' },
          specs: {
            seats: '7',
            transmission: 'Automatic',
            drive: '4x4',
            luggage: 'Large',
            fuel: 'Diesel',
          },
          metadata: {
            title: 'Toyota Land Cruiser',
            description: 'Rugged 4x4',
            path: '/cars/toyota-landcruiser',
            image: 'https://example.com/landcruiser.jpg',
            alt: 'Toyota Land Cruiser',
          },
          locale: 'en',
          status: 'inactive',
          availabilityStatus: 'unavailable',
        },
      ]);
    });

    it('should return all cars with default pagination', async () => {
      const response = await request(app).get('/api/v1/cars').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBe(3);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/cars?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(2);
      response.body.data.items.forEach((car: any) => {
        expect(car.status).toBe('active');
      });
    });

    it('should filter by availability status', async () => {
      const response = await request(app)
        .get('/api/v1/cars?availabilityStatus=available')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(2);
      response.body.data.items.forEach((car: any) => {
        expect(car.availabilityStatus).toBe('available');
      });
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/v1/cars?minPrice=150&maxPrice=180')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.items.forEach((car: any) => {
        expect(car.pricing.amount).toBeGreaterThanOrEqual(150);
        expect(car.pricing.amount).toBeLessThanOrEqual(180);
      });
    });

    it('should filter by transmission type', async () => {
      const response = await request(app)
        .get('/api/v1/cars?transmission=Automatic')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.items.forEach((car: any) => {
        expect(car.specs.transmission).toBe('Automatic');
      });
    });

    it('should filter by fuel type', async () => {
      const response = await request(app)
        .get('/api/v1/cars?fuel=Diesel')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.items.forEach((car: any) => {
        expect(car.specs.fuel).toBe('Diesel');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/cars?page=1&limit=2')
        .expect(200);

      expect(response.body.data.items.length).toBe(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/v1/cars?sort=pricing.amount')
        .expect(200);

      const prices = response.body.data.items.map(
        (car: any) => car.pricing.amount
      );
      expect(prices[0]).toBeLessThanOrEqual(prices[1]);
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/cars?page=invalid&limit=999')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid query parameters');
    });
  });

  describe('GET /api/v1/cars/:id', () => {
    let carId: string;

    beforeEach(async () => {
      const car = await Car.create({
        name: 'Test Car',
        description: 'Test description',
        coverImage: 'https://example.com/test.jpg',
        pricing: { amount: 100, currency: 'USD', unit: 'day' },
        specs: {
          seats: '5',
          transmission: 'Automatic',
          drive: '4x4',
          luggage: 'Medium',
          fuel: 'Petrol',
        },
        metadata: {
          title: 'Test Car',
          description: 'Test',
          path: '/cars/test-car',
          image: 'https://example.com/test.jpg',
          alt: 'Test Car',
        },
        locale: 'en',
      });
      carId = car._id.toString();
    });

    it('should return car by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/cars/${carId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(carId);
      expect(response.body.data.name).toBe('Test Car');
    });

    it('should return car by slug (metadata path)', async () => {
      const response = await request(app)
        .get('/api/v1/cars/test-car')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Car');
    });

    it('should return 404 for non-existent car', async () => {
      const response = await request(app)
        .get('/api/v1/cars/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Car not found');
    });
  });

  describe('GET /api/v1/cars/statistics', () => {
    beforeEach(async () => {
      await Car.insertMany([
        {
          name: 'Car 1',
          description: 'Test',
          coverImage: 'https://example.com/1.jpg',
          pricing: { amount: 100, currency: 'USD', unit: 'day' },
          specs: {
            seats: '5',
            transmission: 'Automatic',
            drive: '4x4',
            luggage: 'Medium',
            fuel: 'Petrol',
          },
          metadata: {
            title: 'Car 1',
            description: 'Test',
            path: '/cars/car-1',
            image: 'https://example.com/1.jpg',
            alt: 'Car 1',
          },
          locale: 'en',
          status: 'active',
          availabilityStatus: 'available',
        },
        {
          name: 'Car 2',
          description: 'Test',
          coverImage: 'https://example.com/2.jpg',
          pricing: { amount: 200, currency: 'USD', unit: 'day' },
          specs: {
            seats: '7',
            transmission: 'Manual',
            drive: '2WD',
            luggage: 'Large',
            fuel: 'Diesel',
          },
          metadata: {
            title: 'Car 2',
            description: 'Test',
            path: '/cars/car-2',
            image: 'https://example.com/2.jpg',
            alt: 'Car 2',
          },
          locale: 'en',
          status: 'inactive',
          availabilityStatus: 'reserved',
        },
      ]);
    });

    it('should return statistics', async () => {
      const response = await request(app)
        .get('/api/v1/cars/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('byAvailability');
      expect(response.body.data).toHaveProperty('pricing');
      expect(response.body.data.total).toBe(2);
    });
  });

  describe('PATCH /api/v1/cars/:id', () => {
    let carId: string;

    beforeEach(async () => {
      const car = await Car.create({
        name: 'Original Name',
        description: 'Original description',
        coverImage: 'https://example.com/original.jpg',
        pricing: { amount: 100, currency: 'USD', unit: 'day' },
        specs: {
          seats: '5',
          transmission: 'Automatic',
          drive: '4x4',
          luggage: 'Medium',
          fuel: 'Petrol',
        },
        metadata: {
          title: 'Original',
          description: 'Original',
          path: '/cars/original',
          image: 'https://example.com/original.jpg',
          alt: 'Original',
        },
        locale: 'en',
      });
      carId = car._id.toString();
    });

    it('should update car successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        pricing: { amount: 150, currency: 'USD', unit: 'day' },
      };

      const response = await request(app)
        .patch(`/api/v1/cars/${carId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.pricing.amount).toBe(150);
    });

    it('should return 404 for non-existent car', async () => {
      const response = await request(app)
        .patch('/api/v1/cars/507f1f77bcf86cd799439011')
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/cars/:id', () => {
    let carId: string;

    beforeEach(async () => {
      const car = await Car.create({
        name: 'Car to Delete',
        description: 'Will be deleted',
        coverImage: 'https://example.com/delete.jpg',
        pricing: { amount: 100, currency: 'USD', unit: 'day' },
        specs: {
          seats: '5',
          transmission: 'Automatic',
          drive: '4x4',
          luggage: 'Medium',
          fuel: 'Petrol',
        },
        metadata: {
          title: 'Delete',
          description: 'Delete',
          path: '/cars/delete',
          image: 'https://example.com/delete.jpg',
          alt: 'Delete',
        },
        locale: 'en',
      });
      carId = car._id.toString();
    });

    it('should soft delete car (set deletedAt)', async () => {
      const response = await request(app)
        .delete(`/api/v1/cars/${carId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Car archived successfully');

      // Verify car still exists but is soft-deleted (has deletedAt)
      const car = await Car.findById(carId);
      expect(car).toBeDefined();
      expect(car?.deletedAt).toBeDefined();
      expect(car?.deletedAt).toBeInstanceOf(Date);
      
      // Verify car is excluded from normal queries
      const { excludeDeleted } = await import('../../src/utils/softDelete.util');
      const foundCar = await Car.findOne(excludeDeleted({ _id: carId }));
      expect(foundCar).toBeNull();
    });

    it('should return 404 for non-existent car', async () => {
      const response = await request(app)
        .delete('/api/v1/cars/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/cars/available', () => {
    beforeEach(async () => {
      await Car.insertMany([
        {
          name: 'Available Car',
          description: 'Available',
          coverImage: 'https://example.com/available.jpg',
          pricing: { amount: 100, currency: 'USD', unit: 'day' },
          specs: {
            seats: '5',
            transmission: 'Automatic',
            drive: '4x4',
            luggage: 'Medium',
            fuel: 'Petrol',
          },
          metadata: {
            title: 'Available',
            description: 'Available',
            path: '/cars/available',
            image: 'https://example.com/available.jpg',
            alt: 'Available',
          },
          locale: 'en',
          status: 'active',
          availabilityStatus: 'available',
        },
        {
          name: 'Reserved Car',
          description: 'Reserved',
          coverImage: 'https://example.com/reserved.jpg',
          pricing: { amount: 100, currency: 'USD', unit: 'day' },
          specs: {
            seats: '5',
            transmission: 'Automatic',
            drive: '4x4',
            luggage: 'Medium',
            fuel: 'Petrol',
          },
          metadata: {
            title: 'Reserved',
            description: 'Reserved',
            path: '/cars/reserved',
            image: 'https://example.com/reserved.jpg',
            alt: 'Reserved',
          },
          locale: 'en',
          status: 'active',
          availabilityStatus: 'reserved',
        },
      ]);
    });

    it('should return only available cars', async () => {
      const response = await request(app)
        .get('/api/v1/cars/available')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].availabilityStatus).toBe('available');
    });

    it('should filter by locale', async () => {
      const response = await request(app)
        .get('/api/v1/cars/available?locale=en')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((car: any) => {
        expect(car.locale).toBe('en');
      });
    });
  });
});
