// Quick manual test script for Guest System
import { createApp } from './app';
import mongoose from 'mongoose';
import { ENV } from './config/env';

const testGuestSystem = async () => {
  console.log('🧪 Starting Guest System Quick Test...\n');

  // Connect to test database
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('✅ Database connected\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  const app = createApp();
  const request = require('supertest');

  try {
    // Test 1: Create Guest
    console.log('📝 Test 1: Create Guest');
    const createResponse = await request(app).post('/api/v1/guests').send({
      email: 'quicktest@example.com',
      fullName: 'Quick Test User',
      phone: '+201234567890',
      locale: 'en',
    });

    console.log('Status:', createResponse.status);
    console.log('Response:', JSON.stringify(createResponse.body, null, 2));

    if (createResponse.status === 201) {
      console.log('✅ Test 1 PASSED\n');

      const sessionId = createResponse.body.data.sessionId;

      // Test 2: Get Guest
      console.log('📝 Test 2: Get Guest by SessionId');
      const getResponse = await request(app).get(`/api/v1/guests/${sessionId}`);

      console.log('Status:', getResponse.status);
      console.log('Response:', JSON.stringify(getResponse.body, null, 2));

      if (getResponse.status === 200) {
        console.log('✅ Test 2 PASSED\n');
      } else {
        console.log('❌ Test 2 FAILED\n');
      }

      // Test 3: Update Guest
      console.log('📝 Test 3: Update Guest');
      const updateResponse = await request(app)
        .patch(`/api/v1/guests/${sessionId}`)
        .send({
          fullName: 'Quick Test User - Updated',
        });

      console.log('Status:', updateResponse.status);
      console.log('Response:', JSON.stringify(updateResponse.body, null, 2));

      if (updateResponse.status === 200) {
        console.log('✅ Test 3 PASSED\n');
      } else {
        console.log('❌ Test 3 FAILED\n');
      }

      // Test 4: Get Statistics
      console.log('📝 Test 4: Get Statistics');
      const statsResponse = await request(app).get('/api/v1/guests/statistics');

      console.log('Status:', statsResponse.status);
      console.log('Response:', JSON.stringify(statsResponse.body, null, 2));

      if (statsResponse.status === 200) {
        console.log('✅ Test 4 PASSED\n');
      } else {
        console.log('❌ Test 4 FAILED\n');
      }

      // Clean up
      console.log('🧹 Cleaning up test data...');
      await request(app).delete(`/api/v1/guests/${sessionId}`);
      console.log('✅ Cleanup complete\n');
    } else {
      console.log('❌ Test 1 FAILED\n');
    }

    console.log('🎉 Guest System Quick Test Complete!');
  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

testGuestSystem();
