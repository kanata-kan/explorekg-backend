import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Activity } from '../src/models/activity.model';
import { Car } from '../src/models/car.model';
import TravelPack from '../src/models/travelPack.model';

// Load environment variables
dotenv.config();

// MongoDB Connection URI
const MONGODB_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/explorekg';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg: string) =>
    console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

interface SeedStats {
  activities: { en: number; fr: number; total: number };
  cars: { en: number; fr: number; total: number };
  travelPacks: number;
  totalDocuments: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

const stats: SeedStats = {
  activities: { en: 0, fr: 0, total: 0 },
  cars: { en: 0, fr: 0, total: 0 },
  travelPacks: 0,
  totalDocuments: 0,
  startTime: new Date(),
};

/**
 * Connect to MongoDB
 */
async function connectDB(): Promise<void> {
  try {
    log.info(
      `Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`
    );
    await mongoose.connect(MONGODB_URI);
    log.success('Connected to MongoDB successfully');
  } catch (error: any) {
    log.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Load JSON data from file
 */
function loadJSONFile<T>(filePath: string): T {
  try {
    const absolutePath = path.resolve(__dirname, '..', filePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  } catch (error: any) {
    log.error(`Failed to load ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Clear existing data from collections
 */
async function clearCollections(): Promise<void> {
  log.header('🗑️  Clearing existing collections...');

  try {
    const activityCount = await Activity.countDocuments();
    const carCount = await Car.countDocuments();
    const travelPackCount = await TravelPack.countDocuments();

    if (activityCount > 0) {
      await Activity.deleteMany({});
      log.warning(`Deleted ${activityCount} existing activities`);
    }

    if (carCount > 0) {
      await Car.deleteMany({});
      log.warning(`Deleted ${carCount} existing cars`);
    }

    if (travelPackCount > 0) {
      await TravelPack.deleteMany({});
      log.warning(`Deleted ${travelPackCount} existing travel packs`);
    }

    if (activityCount === 0 && carCount === 0 && travelPackCount === 0) {
      log.info('Collections are already empty');
    }
  } catch (error: any) {
    log.error(`Failed to clear collections: ${error.message}`);
    throw error;
  }
}

/**
 * Seed Activities
 */
async function seedActivities(): Promise<void> {
  log.header('📍 Seeding Activities...');

  try {
    // Load EN activities
    const activitiesEN = loadJSONFile<any[]>('data/content/en/activities.json');
    log.info(`Loaded ${activitiesEN.length} EN activities`);

    // Load FR activities
    const activitiesFR = loadJSONFile<any[]>('data/content/fr/activities.json');
    log.info(`Loaded ${activitiesFR.length} FR activities`);

    // Insert EN activities
    const insertedEN = await Activity.insertMany(activitiesEN);
    stats.activities.en = insertedEN.length;
    log.success(`Inserted ${insertedEN.length} EN activities`);

    // Insert FR activities
    const insertedFR = await Activity.insertMany(activitiesFR);
    stats.activities.fr = insertedFR.length;
    log.success(`Inserted ${insertedFR.length} FR activities`);

    stats.activities.total = stats.activities.en + stats.activities.fr;
    log.success(`Total activities inserted: ${stats.activities.total}`);
  } catch (error: any) {
    log.error(`Failed to seed activities: ${error.message}`);
    throw error;
  }
}

/**
 * Seed Cars
 */
async function seedCars(): Promise<void> {
  log.header('🚗 Seeding Cars...');

  try {
    // Load EN cars
    const carsEN = loadJSONFile<any[]>('data/content/en/cars.json');
    log.info(`Loaded ${carsEN.length} EN cars`);

    // Load FR cars
    const carsFR = loadJSONFile<any[]>('data/content/fr/cars.json');
    log.info(`Loaded ${carsFR.length} FR cars`);

    // Insert EN cars
    const insertedEN = await Car.insertMany(carsEN);
    stats.cars.en = insertedEN.length;
    log.success(`Inserted ${insertedEN.length} EN cars`);

    // Insert FR cars
    const insertedFR = await Car.insertMany(carsFR);
    stats.cars.fr = insertedFR.length;
    log.success(`Inserted ${insertedFR.length} FR cars`);

    stats.cars.total = stats.cars.en + stats.cars.fr;
    log.success(`Total cars inserted: ${stats.cars.total}`);
  } catch (error: any) {
    log.error(`Failed to seed cars: ${error.message}`);
    throw error;
  }
}

/**
 * Seed Travel Packs
 */
async function seedTravelPacks(): Promise<void> {
  log.header('🎒 Seeding Travel Packs...');

  try {
    // Load travel packs (multilingual)
    const travelPacks = loadJSONFile<any[]>('data/content/travel-packs.json');
    log.info(`Loaded ${travelPacks.length} travel packs (multilingual)`);

    // Insert travel packs
    const inserted = await TravelPack.insertMany(travelPacks);
    stats.travelPacks = inserted.length;
    log.success(`Inserted ${inserted.length} travel packs`);
  } catch (error: any) {
    log.error(`Failed to seed travel packs: ${error.message}`);
    throw error;
  }
}

/**
 * Verify inserted data
 */
async function verifyData(): Promise<void> {
  log.header('🔍 Verifying inserted data...');

  try {
    const activityCount = await Activity.countDocuments();
    const carCount = await Car.countDocuments();
    const travelPackCount = await TravelPack.countDocuments();

    log.info(
      `Activities in DB: ${activityCount} (expected: ${stats.activities.total})`
    );
    log.info(`Cars in DB: ${carCount} (expected: ${stats.cars.total})`);
    log.info(
      `Travel Packs in DB: ${travelPackCount} (expected: ${stats.travelPacks})`
    );

    stats.totalDocuments = activityCount + carCount + travelPackCount;

    if (
      activityCount === stats.activities.total &&
      carCount === stats.cars.total &&
      travelPackCount === stats.travelPacks
    ) {
      log.success('✅ All documents verified successfully!');
    } else {
      log.warning('⚠️  Document count mismatch detected!');
    }
  } catch (error: any) {
    log.error(`Verification failed: ${error.message}`);
    throw error;
  }
}

/**
 * Print final statistics
 */
function printStatistics(): void {
  stats.endTime = new Date();
  stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

  console.log('\n' + '='.repeat(60));
  log.header('📊 SEEDING STATISTICS | إحصائيات الإدخال');
  console.log('='.repeat(60));
  console.log('');
  console.log(`  📍 Activities (EN):        ${stats.activities.en} documents`);
  console.log(`  📍 Activities (FR):        ${stats.activities.fr} documents`);
  console.log(
    `  📍 Activities Total:       ${stats.activities.total} documents`
  );
  console.log('');
  console.log(`  🚗 Cars (EN):              ${stats.cars.en} documents`);
  console.log(`  🚗 Cars (FR):              ${stats.cars.fr} documents`);
  console.log(`  🚗 Cars Total:             ${stats.cars.total} documents`);
  console.log('');
  console.log(`  🎒 Travel Packs:           ${stats.travelPacks} documents`);
  console.log('');
  console.log('  ' + '─'.repeat(40));
  console.log(`  📊 TOTAL DOCUMENTS:        ${stats.totalDocuments} documents`);
  console.log('  ' + '─'.repeat(40));
  console.log('');
  console.log(
    `  ⏱️  Start Time:             ${stats.startTime.toLocaleTimeString()}`
  );
  console.log(
    `  ⏱️  End Time:               ${stats.endTime?.toLocaleTimeString()}`
  );
  console.log(
    `  ⏱️  Duration:               ${stats.duration}ms (${(stats.duration! / 1000).toFixed(2)}s)`
  );
  console.log('');
  console.log('='.repeat(60));
  log.success('✅ Data seeding completed successfully!');
  log.success('✅ تم إدخال البيانات بنجاح!');
  console.log('='.repeat(60));
  console.log('');
}

/**
 * Main seeding function
 */
async function seedDatabase(): Promise<void> {
  try {
    console.log('\n' + '='.repeat(60));
    log.header('🌱 EXPLOREKG CONTENT SEEDING | إدخال بيانات EXPLOREKG');
    console.log('='.repeat(60));
    console.log('');

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearCollections();

    // Seed all collections
    await seedActivities();
    await seedCars();
    await seedTravelPacks();

    // Verify data
    await verifyData();

    // Print statistics
    printStatistics();
  } catch (error: any) {
    log.error(`Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    log.info('Database connection closed');
  }
}

// Run seeding
seedDatabase();
