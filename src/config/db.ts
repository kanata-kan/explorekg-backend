// Database configuration

import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { ENV } from './env';

export async function connectDB(uri: string) {
  let retries = 3;
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  while (retries) {
    try {
      mongoose.set('strictQuery', false);

      await mongoose.connect(uri, {
        // Security configurations
        // SSL is always required for MongoDB Atlas
        tls: true,

        // Performance and connection management
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 2,

        // Connection monitoring
        heartbeatFrequencyMS: 10000,
        socketTimeoutMS: 45000,
      });

      logger.info('✅ MongoDB connected successfully');
      break; // ✅ connected — break retry loop
    } catch (error) {
      retries -= 1;
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error(
        { errMsg },
        `❌ MongoDB connection failed. Retries left: ${retries}`
      );

      if (!retries) {
        logger.fatal('🚨 All MongoDB connection attempts failed. Exiting...');
        process.exit(1);
      }

      logger.warn('⏳ Retrying connection in 5 seconds...');
      await delay(5000);
    }
  }
}
