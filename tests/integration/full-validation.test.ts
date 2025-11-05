/**
 * 🧪 FULL INTELLIGENCE VALIDATION TEST
 *
 * هذا الملف يحاكي تجربة المستخدم الكاملة من البداية للنهاية
 * ويختبر جميع الـ endpoints بذكاء وسياق واقعي
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { Application } from 'express';

// Models
import Guest from '../../src/models/guest.model';
import { Booking } from '../../src/models/booking.model';
import TravelPack from '../../src/models/travelPack.model';
import { Activity } from '../../src/models/activity.model';
import { Car } from '../../src/models/car.model';

// Test data storage
interface TestContext {
  guestSessionId?: string;
  guestId?: string;
  bookingNumber?: string;
  travelPackId?: string;
  activityId?: string;
  carId?: string;
  adminToken?: string;
  adminId?: string;
}

describe('🧠 Full Intelligence Validation - Complete UX Flow', () => {
  let app: Application;
  const ctx: TestContext = {};

  // إعداد بيئة الاختبار
  beforeAll(async () => {
    console.log('🚀 Starting test environment setup...');

    // إنشاء التطبيق
    console.log('🏗️ Creating Express app...');
    app = createApp();
    console.log('✅ App created');

    console.log('\n✨ Test environment initialized - Ready to test!\n');
  }, 60000);

  // تنظيف بعد الاختبارات
  afterAll(async () => {
    console.log('✅ Test environment cleaned up');
  });

  // تنظيف قبل كل اختبار
  beforeEach(async () => {
    // تنظيف Guests ماعدا الـ test guest للـ booking tests
    await Guest.deleteMany({
      sessionId: { $ne: '12345678-1234-4123-8234-123456789012' },
    });
    await Booking.deleteMany({});
    console.log('🧹 Collections cleaned');
  });

  /**
   * ========================================
   * SCENARIO 1: رحلة الضيف الكاملة
   * ========================================
   */
  describe('👤 Guest Journey - من التسجيل للحجز', () => {
    test('1.1 - إنشاء ضيف جديد', async () => {
      console.log('\n🧪 TEST 1.1: Creating new guest...');
      const response = await request(app)
        .post('/api/v1/guests')
        .send({
          email: 'tourist@example.com',
          fullName: 'Ahmed Khan',
          phone: '+996700123456',
          locale: 'en',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data.email).toBe('tourist@example.com');

      // حفظ Session ID للاختبارات القادمة
      ctx.guestSessionId = response.body.data.sessionId;
      ctx.guestId = response.body.data._id;

      console.log(`✅ Guest created with sessionId: ${ctx.guestSessionId}`);
    });

    test('1.2 - التحقق من صلاحية الجلسة', async () => {
      // أولاً إنشاء ضيف
      const createResponse = await request(app).post('/api/v1/guests').send({
        email: 'verify@example.com',
        fullName: 'Verify User',
        phone: '+996700111222',
        locale: 'en',
      });

      const sessionId = createResponse.body.data.sessionId;

      // التحقق من الجلسة (with guest session header)
      const response = await request(app)
        .get(`/api/v1/guests/${sessionId}`)
        .set('x-guest-session', sessionId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBe(sessionId);

      console.log('✅ Session verified successfully');
    });

    test('1.3 - تحديث معلومات الضيف', async () => {
      // إنشاء ضيف
      const createResponse = await request(app).post('/api/v1/guests').send({
        email: 'update@example.com',
        fullName: 'Update User',
        phone: '+996700333444',
        locale: 'en',
      });

      const sessionId = createResponse.body.data.sessionId;

      // تحديث المعلومات (with session header)
      const response = await request(app)
        .patch(`/api/v1/guests/${sessionId}`)
        .set('x-guest-session', sessionId)
        .send({
          fullName: 'Updated Name',
          phone: '+996700999888',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fullName).toBe('Updated Name');

      console.log('✅ Guest profile updated');
    });

    test('1.4 - تمديد صلاحية الجلسة', async () => {
      // إنشاء ضيف
      const createResponse = await request(app).post('/api/v1/guests').send({
        email: 'extend@example.com',
        fullName: 'Extend User',
        phone: '+996700555666',
        locale: 'en',
      });

      const sessionId = createResponse.body.data.sessionId;
      const originalExpiry = new Date(createResponse.body.data.expiresAt);

      // تمديد الجلسة (with session header)
      const response = await request(app)
        .patch(`/api/v1/guests/${sessionId}/extend`)
        .set('x-guest-session', sessionId)
        .send({
          hours: 12,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const newExpiry = new Date(response.body.data.expiresAt);
      expect(newExpiry.getTime()).toBeGreaterThan(originalExpiry.getTime());

      console.log('✅ Session extended successfully');
    });
  });

  /**
   * ========================================
   * SCENARIO 2: تصفح المحتوى (Public)
   * ========================================
   */
  describe('🔍 Content Browsing - تصفح الحزم والأنشطة', () => {
    // إنشاء بيانات تجريبية
    beforeAll(async () => {
      // إنشاء حزمة سياحية
      const pack = await TravelPack.create({
        localeGroupId: 'test-pack-001',
        locale: 'en',
        slug: 'ala-archa-tour',
        locales: {
          en: {
            name: 'Ala-Archa National Park Tour',
            description: 'Beautiful mountain tour',
          },
        },
        status: 'published',
        basePrice: 150,
        duration: 5,
        features: ['Hiking', 'Nature'],
        availability: true,
      });
      ctx.travelPackId = String(pack._id);

      // إنشاء نشاط
      const activity = await Activity.create({
        localeGroupId: 'test-activity-001',
        locale: 'en',
        name: 'Horseback Riding',
        description:
          'Traditional horseback riding experience in the beautiful mountains of Kyrgyzstan',
        coverImage: 'https://images.unsplash.com/photo-1.jpg',
        duration: '3 hours',
        location: 'Issyk-Kul',
        groupSize: '1-10 people',
        price: 50,
        metadata: {
          title: 'Horseback Riding',
          description:
            'Traditional horseback riding experience in the beautiful mountains',
          path: '/activities/horseback-riding',
          image: 'https://images.unsplash.com/photo-1.jpg',
          alt: 'Horseback riding',
        },
        status: 'active',
        availabilityStatus: 'available',
        tags: ['adventure'],
      });
      ctx.activityId = String(activity._id);

      // إنشاء سيارة
      const car = await Car.create({
        localeGroupId: 'test-car-001',
        locale: 'en',
        name: 'Toyota Land Cruiser 2023',
        description: 'Comfortable SUV for mountain roads',
        coverImage: 'https://images.unsplash.com/photo-2.jpg',
        carModel: 'Toyota Land Cruiser',
        carType: 'SUV',
        pricePerDay: 80,
        capacity: 7,
        fuelType: 'diesel',
        transmission: 'automatic',
        // إضافة الحقول المطلوبة
        pricing: {
          amount: 80,
          currency: 'USD',
          unit: 'day',
        },
        specs: {
          seats: '7',
          transmission: 'Automatic',
          drive: '4WD',
          luggage: '3 large bags',
          fuel: 'Diesel',
        },
        metadata: {
          title: 'Toyota Land Cruiser 2023',
          description: 'SUV rental for mountain adventures',
          path: '/cars/toyota-land-cruiser',
          image: 'https://images.unsplash.com/photo-2.jpg',
          alt: 'Toyota Land Cruiser',
        },
        status: 'active',
        availabilityStatus: 'available',
        tags: ['suv', 'mountain'],
      });
      ctx.carId = String(car._id);

      console.log('✅ Test content created');
    });

    test('2.1 - جلب قائمة الحزم السياحية', async () => {
      const response = await request(app)
        .get('/api/v1/travel-packs')
        .query({ language: 'en', page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);

      console.log(`✅ Found ${response.body.data.items.length} travel packs`);
    });

    test('2.2 - جلب تفاصيل حزمة محددة', async () => {
      const response = await request(app)
        .get(`/api/v1/travel-packs/${ctx.travelPackId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // API returns locales.en.name not name directly
      expect(response.body.data.locales.en.name).toBe(
        'Ala-Archa National Park Tour'
      );

      console.log('✅ Travel pack details retrieved');
    });

    test('2.3 - جلب قائمة الأنشطة', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .query({ language: 'en' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);

      console.log(`✅ Found ${response.body.data.items.length} activities`);
    });

    test('2.4 - جلب قائمة السيارات المتاحة', async () => {
      const response = await request(app)
        .get('/api/v1/cars/available')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      console.log(`✅ Found ${response.body.data.length} available cars`);
    });
  });

  /**
   * ========================================
   * SCENARIO 3: عملية الحجز الكاملة
   * ========================================
   */
  describe('📅 Booking Flow - من الإنشاء للدفع', () => {
    let testGuestId: string;
    let testSessionId: string;
    let testTravelPackId: string;
    let testActivityId: string;
    let testCarId: string;

    beforeAll(async () => {
      // إنشاء test content أولاً
      const pack = await TravelPack.create({
        localeGroupId: 'booking-test-pack',
        locale: 'en',
        slug: 'booking-test-tour',
        locales: {
          en: {
            name: 'Booking Test Tour',
            description: 'Test tour for bookings',
          },
        },
        status: 'published',
        basePrice: 100,
        duration: 3,
        features: ['Test'],
        availability: true,
      });
      testTravelPackId = String(pack._id);

      const activity = await Activity.create({
        localeGroupId: 'booking-test-activity',
        locale: 'en',
        name: 'Test Activity',
        description: 'Test activity for bookings test',
        coverImage: 'https://test.jpg',
        duration: '2 hours',
        location: 'Test Location',
        groupSize: '1-5',
        price: 50,
        metadata: {
          title: 'Test Activity',
          description: 'Test activity description for booking tests',
          path: '/activities/booking-test-activity',
          image: 'https://test.jpg',
          alt: 'Test Activity Image',
        },
        status: 'active',
        availabilityStatus: 'available',
        tags: ['test'],
      });
      testActivityId = String(activity._id);

      const car = await Car.create({
        localeGroupId: 'booking-test-car',
        locale: 'en',
        name: 'Test Car',
        description: 'Test car for bookings',
        coverImage: 'https://test.jpg',
        carModel: 'Test Model',
        carType: 'Sedan',
        pricePerDay: 60,
        capacity: 4,
        fuelType: 'petrol',
        transmission: 'manual',
        pricing: {
          amount: 60,
          currency: 'USD',
          unit: 'day',
        },
        specs: {
          seats: '4',
          transmission: 'Manual',
          drive: 'FWD',
          luggage: '2 bags',
          fuel: 'Petrol',
        },
        metadata: {
          title: 'Test Car',
          description: 'Test car for booking tests',
          path: '/cars/booking-test-car',
          image: 'https://test.jpg',
          alt: 'Test Car Image',
        },
        status: 'active',
        availabilityStatus: 'available',
        tags: ['test'],
      });
      testCarId = String(car._id);

      // إنشاء ضيف للاختبار
      const guest = await Guest.create({
        sessionId: '12345678-1234-4123-8234-123456789012',
        email: 'booking@example.com',
        fullName: 'Booking Test User',
        phone: '+996700777888',
        locale: 'en',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      testGuestId = guest._id.toString();
      testSessionId = guest.sessionId;

      console.log(`✅ Test guest created: ${testSessionId}`);
    });

    test('3.1 - إنشاء حجز جديد', async () => {
      const response = await request(app)
        .post('/api/v1/bookings')
        .send({
          guestId: testGuestId, // استخدام MongoDB ObjectId
          itemType: 'travel_pack',
          itemId: testTravelPackId, // استخدام test travel pack
          startDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date(
            Date.now() + 12 * 24 * 60 * 60 * 1000
          ).toISOString(),
          numberOfPersons: 2,
        });

      // Debug: طباعة الخطأ إذا فشل
      if (response.status !== 201) {
        console.error('Booking creation failed:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('bookingNumber');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.paymentStatus).toBe('unpaid');

      ctx.bookingNumber = response.body.data.bookingNumber;

      console.log(`✅ Booking created: ${ctx.bookingNumber}`);
    });

    test('3.2 - جلب تفاصيل الحجز', async () => {
      // إنشاء حجز أولاً (for test guest)
      const createResponse = await request(app)
        .post('/api/v1/bookings')
        .send({
          guestId: testGuestId, // Test guest ObjectId
          itemType: 'activity',
          itemId: testActivityId,
          startDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          numberOfPersons: 2,
        });

      const bookingNumber = createResponse.body.data.bookingNumber;

      // جلب التفاصيل (must use test guest's session)
      const response = await request(app)
        .get(`/api/v1/bookings/${bookingNumber}`)
        .set('x-guest-session', testSessionId) // Test guest's session
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookingNumber).toBe(bookingNumber);

      console.log('✅ Booking details retrieved');
    });

    test('3.3 - معالجة الدفع', async () => {
      // إنشاء حجز
      const createResponse = await request(app)
        .post('/api/v1/bookings')
        .send({
          guestId: testGuestId,
          itemType: 'car',
          itemId: testCarId,
          startDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date(
            Date.now() + 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          numberOfDays: 3,
        });

      const bookingNumber = createResponse.body.data.bookingNumber;

      // معالجة الدفع (with guest session header)
      const response = await request(app)
        .post(`/api/v1/bookings/${bookingNumber}/payment`)
        .set('x-guest-session', testSessionId)
        .send({
          paymentMethod: 'credit_card',
          paymentTransactionId: 'TXN-TEST-12345', // Fixed field name
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentStatus).toBe('paid');
      expect(response.body.data.status).toBe('confirmed');

      console.log('✅ Payment processed successfully');
    });

    test('3.4 - إلغاء حجز', async () => {
      // إنشاء حجز
      const createResponse = await request(app)
        .post('/api/v1/bookings')
        .send({
          guestId: testGuestId,
          itemType: 'travel_pack',
          itemId: testTravelPackId,
          startDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          numberOfPersons: 1,
        });

      const bookingNumber = createResponse.body.data.bookingNumber;

      // إلغاء الحجز (with guest session header)
      const response = await request(app)
        .post(`/api/v1/bookings/${bookingNumber}/cancel`)
        .set('x-guest-session', testSessionId)
        .send({
          reason: 'Change of plans',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');

      console.log('✅ Booking cancelled successfully');
    });

    test('3.5 - جلب حجوزات ضيف محدد', async () => {
      const response = await request(app)
        .get(`/api/v1/bookings/guest/${testSessionId}`)
        .set('x-guest-session', testSessionId)
        .expect(200);

      expect(response.body.success).toBe(true);
      // API returns {bookings: [], count: 0} not {items: []}
      expect(response.body.data).toHaveProperty('bookings');
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
      expect(response.body.data).toHaveProperty('count');

      console.log(`✅ Found ${response.body.data.count} bookings for guest`);
    });
  });

  /**
   * ========================================
   * SCENARIO 4: Health Check
   * ========================================
   */
  describe('🏥 System Health', () => {
    test('4.1 - فحص صحة النظام', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('uptime');

      console.log('✅ System health check passed');
    });
  });
});

export {};
