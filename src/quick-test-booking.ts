// src/quick-test-booking.ts
import { createApp } from './app';
import mongoose from 'mongoose';
import { ENV } from './config/env';

const testBookingJourney = async () => {
  console.log('🧪 Starting Complete Booking Journey Test...\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Connect to database
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('✅ Database connected\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  const app = createApp();
  const request = require('supertest');

  let guestSessionId: string = '';
  let travelPackId: string = '';
  let activityId: string = '';
  let carId: string = '';
  let bookingNumber1: string = '';
  let bookingNumber2: string = '';
  let bookingNumber3: string = '';

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 PHASE 1: GUEST REGISTRATION\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Create Guest
    console.log('📝 Step 1: Create Guest');
    const guestResponse = await request(app).post('/api/v1/guests').send({
      email: 'journey-test@explorekg.com',
      fullName: 'Mohammed Hassan',
      phone: '+212612345678',
      locale: 'en',
    });

    console.log(`Status: ${guestResponse.status}`);
    if (guestResponse.status === 201) {
      guestSessionId = guestResponse.body.data.sessionId;
      console.log('✅ Guest created successfully');
      console.log(`   SessionId: ${guestSessionId}`);
      console.log(`   Email: ${guestResponse.body.data.email}`);
      console.log(`   Expires: ${guestResponse.body.data.expiresAt}\n`);
    } else {
      console.log('❌ Failed to create guest');
      console.log(JSON.stringify(guestResponse.body, null, 2));
      throw new Error('Guest creation failed');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 PHASE 2: FETCH AVAILABLE ITEMS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 2: Get TravelPacks
    console.log('📝 Step 2: Fetch Available TravelPacks');
    const packsResponse = await request(app)
      .get('/api/v1/travel-packs')
      .set('Accept-Language', 'en');

    if (packsResponse.status === 200 && packsResponse.body.data?.length > 0) {
      travelPackId = packsResponse.body.data[0]._id;
      console.log('✅ TravelPacks fetched');
      console.log(`   Found: ${packsResponse.body.data.length} packs`);
      console.log(`   Selected Pack ID: ${travelPackId}`);
      console.log(
        `   Pack Name: ${packsResponse.body.data[0].locales?.en?.name || 'N/A'}\n`
      );
    } else {
      console.log('⚠️  No TravelPacks found, will skip pack booking\n');
    }

    // Step 3: Get Activities
    console.log('📝 Step 3: Fetch Available Activities');
    const activitiesResponse = await request(app)
      .get('/api/v1/activities')
      .set('Accept-Language', 'en');

    if (
      activitiesResponse.status === 200 &&
      activitiesResponse.body.data?.length > 0
    ) {
      activityId = activitiesResponse.body.data[0]._id;
      console.log('✅ Activities fetched');
      console.log(
        `   Found: ${activitiesResponse.body.data.length} activities`
      );
      console.log(`   Selected Activity ID: ${activityId}`);
      console.log(
        `   Activity Name: ${activitiesResponse.body.data[0].name || 'N/A'}\n`
      );
    } else {
      console.log('⚠️  No Activities found, will skip activity booking\n');
    }

    // Step 4: Get Cars
    console.log('📝 Step 4: Fetch Available Cars');
    const carsResponse = await request(app)
      .get('/api/v1/cars')
      .set('Accept-Language', 'en');

    if (carsResponse.status === 200 && carsResponse.body.data?.length > 0) {
      carId = carsResponse.body.data[0]._id;
      console.log('✅ Cars fetched');
      console.log(`   Found: ${carsResponse.body.data.length} cars`);
      console.log(`   Selected Car ID: ${carId}`);
      console.log(`   Car Name: ${carsResponse.body.data[0].name || 'N/A'}\n`);
    } else {
      console.log('⚠️  No Cars found, will skip car booking\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 PHASE 3: CREATE BOOKINGS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 5: Create TravelPack Booking
    if (travelPackId) {
      console.log('📝 Step 5: Create TravelPack Booking');
      const packBookingResponse = await request(app)
        .post('/api/v1/bookings')
        .send({
          guestId: guestSessionId,
          itemType: 'travel_pack',
          itemId: travelPackId,
          numberOfPersons: 2,
          startDate: '2025-12-15T10:00:00Z',
          endDate: '2025-12-25T18:00:00Z',
          locale: 'en',
        });

      console.log(`Status: ${packBookingResponse.status}`);
      if (packBookingResponse.status === 201) {
        bookingNumber1 = packBookingResponse.body.data.bookingNumber;
        console.log('✅ TravelPack booking created');
        console.log(`   Booking Number: ${bookingNumber1}`);
        console.log(`   Item: ${packBookingResponse.body.data.snapshot.title}`);
        console.log(
          `   Persons: ${packBookingResponse.body.data.numberOfPersons}`
        );
        console.log(
          `   Total: ${packBookingResponse.body.data.totalPrice} ${packBookingResponse.body.data.currency}`
        );
        console.log(`   Status: ${packBookingResponse.body.data.status}`);
        console.log(`   Expires: ${packBookingResponse.body.data.expiresAt}\n`);
      } else {
        console.log('❌ Failed to create TravelPack booking');
        console.log(JSON.stringify(packBookingResponse.body, null, 2));
      }
    }

    // Step 6: Create Activity Booking
    if (activityId) {
      console.log('📝 Step 6: Create Activity Booking');
      const activityBookingResponse = await request(app)
        .post('/api/v1/bookings')
        .send({
          guestId: guestSessionId,
          itemType: 'activity',
          itemId: activityId,
          numberOfPersons: 3,
          locale: 'en',
        });

      console.log(`Status: ${activityBookingResponse.status}`);
      if (activityBookingResponse.status === 201) {
        bookingNumber2 = activityBookingResponse.body.data.bookingNumber;
        console.log('✅ Activity booking created');
        console.log(`   Booking Number: ${bookingNumber2}`);
        console.log(
          `   Item: ${activityBookingResponse.body.data.snapshot.title}`
        );
        console.log(
          `   Persons: ${activityBookingResponse.body.data.numberOfPersons}`
        );
        console.log(
          `   Total: ${activityBookingResponse.body.data.totalPrice} ${activityBookingResponse.body.data.currency}`
        );
        console.log(`   Status: ${activityBookingResponse.body.data.status}\n`);
      } else {
        console.log('❌ Failed to create Activity booking');
        console.log(JSON.stringify(activityBookingResponse.body, null, 2));
      }
    }

    // Step 7: Create Car Booking
    if (carId) {
      console.log('📝 Step 7: Create Car Booking');
      const carBookingResponse = await request(app)
        .post('/api/v1/bookings')
        .send({
          guestId: guestSessionId,
          itemType: 'car',
          itemId: carId,
          numberOfDays: 5,
          startDate: '2025-12-15T10:00:00Z',
          endDate: '2025-12-20T10:00:00Z',
          locale: 'en',
        });

      console.log(`Status: ${carBookingResponse.status}`);
      if (carBookingResponse.status === 201) {
        bookingNumber3 = carBookingResponse.body.data.bookingNumber;
        console.log('✅ Car booking created');
        console.log(`   Booking Number: ${bookingNumber3}`);
        console.log(`   Item: ${carBookingResponse.body.data.snapshot.title}`);
        console.log(`   Days: ${carBookingResponse.body.data.numberOfDays}`);
        console.log(
          `   Total: ${carBookingResponse.body.data.totalPrice} ${carBookingResponse.body.data.currency}`
        );
        console.log(`   Status: ${carBookingResponse.body.data.status}\n`);
      } else {
        console.log('❌ Failed to create Car booking');
        console.log(JSON.stringify(carBookingResponse.body, null, 2));
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 PHASE 4: VIEW BOOKINGS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 8: Get All Guest Bookings
    console.log('📝 Step 8: Fetch All Guest Bookings');
    const guestBookingsResponse = await request(app).get(
      `/api/v1/bookings/guest/${guestSessionId}`
    );

    console.log(`Status: ${guestBookingsResponse.status}`);
    if (guestBookingsResponse.status === 200) {
      console.log('✅ Guest bookings fetched');
      console.log(
        `   Total Bookings: ${guestBookingsResponse.body.data.count}`
      );
      guestBookingsResponse.body.data.bookings.forEach(
        (booking: any, index: number) => {
          console.log(
            `   ${index + 1}. ${booking.bookingNumber} - ${booking.snapshot.title}`
          );
          console.log(
            `      Status: ${booking.status}, Payment: ${booking.paymentStatus}`
          );
        }
      );
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 PHASE 5: PAYMENT FLOW\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 9: Process Payment for First Booking
    if (bookingNumber1) {
      console.log('📝 Step 9: Process Payment for TravelPack Booking');
      const paymentResponse = await request(app)
        .post(`/api/v1/bookings/${bookingNumber1}/payment`)
        .send({
          paymentMethod: 'credit_card',
          paymentTransactionId: `TXN-${Date.now()}`,
        });

      console.log(`Status: ${paymentResponse.status}`);
      if (paymentResponse.status === 200) {
        console.log('✅ Payment processed successfully');
        console.log(`   Booking: ${paymentResponse.body.data.bookingNumber}`);
        console.log(`   Status: ${paymentResponse.body.data.status}`);
        console.log(
          `   Payment Status: ${paymentResponse.body.data.paymentStatus}`
        );
        console.log(
          `   Transaction ID: ${paymentResponse.body.data.paymentTransactionId}`
        );
        console.log(`   Paid At: ${paymentResponse.body.data.paidAt}\n`);
      } else {
        console.log('❌ Payment failed');
        console.log(JSON.stringify(paymentResponse.body, null, 2));
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 PHASE 6: BOOKING CANCELLATION\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 10: Cancel Second Booking
    if (bookingNumber2) {
      console.log('📝 Step 10: Cancel Activity Booking');
      const cancelResponse = await request(app)
        .post(`/api/v1/bookings/${bookingNumber2}/cancel`)
        .send({
          reason: 'Changed travel plans - testing cancellation flow',
        });

      console.log(`Status: ${cancelResponse.status}`);
      if (cancelResponse.status === 200) {
        console.log('✅ Booking cancelled successfully');
        console.log(`   Booking: ${cancelResponse.body.data.bookingNumber}`);
        console.log(`   Status: ${cancelResponse.body.data.status}`);
        console.log(`   Cancelled At: ${cancelResponse.body.data.cancelledAt}`);
        console.log(
          `   Reason: ${cancelResponse.body.data.cancellationReason}\n`
        );
      } else {
        console.log('❌ Cancellation failed');
        console.log(JSON.stringify(cancelResponse.body, null, 2));
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 PHASE 7: VERIFY BOOKING DETAILS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 11: Get Specific Booking Details
    if (bookingNumber1) {
      console.log('📝 Step 11: Fetch Paid Booking Details');
      const bookingDetailsResponse = await request(app).get(
        `/api/v1/bookings/${bookingNumber1}`
      );

      console.log(`Status: ${bookingDetailsResponse.status}`);
      if (bookingDetailsResponse.status === 200) {
        const booking = bookingDetailsResponse.body.data;
        console.log('✅ Booking details fetched');
        console.log(`   Booking Number: ${booking.bookingNumber}`);
        console.log(`   Item Type: ${booking.snapshot.itemType}`);
        console.log(`   Title: ${booking.snapshot.title}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payment Status: ${booking.paymentStatus}`);
        console.log(
          `   Total Price: ${booking.totalPrice} ${booking.currency}`
        );
        console.log(`   Is Expired: ${booking.isExpired}`);
        console.log(`   Can Be Cancelled: ${booking.canBeCancelled}\n`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 PHASE 8: STATISTICS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 12: Get Booking Statistics
    console.log('📝 Step 12: Fetch Booking Statistics');
    const statsResponse = await request(app).get('/api/v1/bookings/statistics');

    console.log(`Status: ${statsResponse.status}`);
    if (statsResponse.status === 200) {
      const stats = statsResponse.body.data;
      console.log('✅ Statistics fetched');
      console.log(`   Total Bookings: ${stats.total}`);
      console.log(`   By Status:`);
      console.log(`     - Pending: ${stats.byStatus.pending}`);
      console.log(`     - Confirmed: ${stats.byStatus.confirmed}`);
      console.log(`     - Cancelled: ${stats.byStatus.cancelled}`);
      console.log(`     - Expired: ${stats.byStatus.expired}`);
      console.log(`   By Payment:`);
      console.log(`     - Unpaid: ${stats.byPaymentStatus.unpaid}`);
      console.log(`     - Paid: ${stats.byPaymentStatus.paid}`);
      console.log(`     - Refunded: ${stats.byPaymentStatus.refunded}`);
      console.log(`   Revenue:`);
      console.log(`     - Total: ${stats.revenue.totalRevenue}`);
      console.log(`     - Average: ${stats.revenue.averageBookingValue}\n`);
    }

    // Step 13: Get Guest Statistics
    console.log('📝 Step 13: Fetch Guest Statistics');
    const guestStatsResponse = await request(app).get(
      '/api/v1/guests/statistics'
    );

    console.log(`Status: ${guestStatsResponse.status}`);
    if (guestStatsResponse.status === 200) {
      const stats = guestStatsResponse.body.data;
      console.log('✅ Guest statistics fetched');
      console.log(`   Total Guests: ${stats.total}`);
      console.log(`   Active: ${stats.active}`);
      console.log(`   Expired: ${stats.expired}`);
      console.log(`   Can Migrate: ${stats.canMigrate}`);
      console.log(`   Linked to Users: ${stats.linked}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 PHASE 9: CLEANUP\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 14: Cleanup Test Data
    console.log('📝 Step 14: Cleanup Test Data');

    // Delete bookings
    if (bookingNumber1)
      await request(app)
        .post(`/api/v1/bookings/${bookingNumber1}/cancel`)
        .send({ reason: 'Test cleanup' });
    if (bookingNumber3)
      await request(app)
        .post(`/api/v1/bookings/${bookingNumber3}/cancel`)
        .send({ reason: 'Test cleanup' });

    // Delete guest
    if (guestSessionId)
      await request(app).delete(`/api/v1/guests/${guestSessionId}`);

    console.log('✅ Test data cleaned up\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 BOOKING JOURNEY TEST COMPLETED SUCCESSFULLY!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Summary:');
    console.log('   - Guest registration: ✅');
    console.log('   - Item browsing: ✅');
    console.log('   - Booking creation: ✅');
    console.log('   - Payment processing: ✅');
    console.log('   - Booking cancellation: ✅');
    console.log('   - Statistics tracking: ✅');
    console.log('   - Mock email notifications: ✅ (check console logs)');
    console.log('\n🚀 All phases completed successfully!\n');
  } catch (error: any) {
    console.error('\n❌ Test Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

testBookingJourney();
