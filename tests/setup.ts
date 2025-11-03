// Test setup file
import { config } from 'dotenv';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Load test environment variables
config({ path: path.resolve(__dirname, '../.env.test') });

// Global test configuration
global.console = {
  ...console,
  // Silence console during tests unless needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for integration tests
jest.setTimeout(30000);

let mongoServer: MongoMemoryServer;

// Setup MongoDB Memory Server before all tests
beforeAll(async () => {
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to MongoDB Memory Server for tests');
  } catch (error) {
    console.error('❌ Error setting up MongoDB Memory Server:', error);
    throw error;
  }
});

// Cleanup after each test
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    // Disconnect from mongoose
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Stop MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('✅ Cleaned up MongoDB Memory Server');
  } catch (error) {
    console.error('❌ Error cleaning up:', error);
  }
});
