// Script to migrate cars from localhost to Atlas
const mongoose = require('mongoose');
require('dotenv').config();

const LOCALHOST_URI = 'mongodb://localhost:27017/explorekg';
const ATLAS_URI = process.env.MONGO_URI;

async function migrateCars() {
  try {
    // Connect to localhost
    console.log('🔌 Connecting to localhost MongoDB...');
    const localConn = await mongoose
      .createConnection(LOCALHOST_URI)
      .asPromise();
    console.log('✅ Connected to localhost');

    // Connect to Atlas
    console.log('🔌 Connecting to Atlas MongoDB...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to Atlas');

    // Define schema
    const carSchema = new mongoose.Schema({}, { strict: false });
    const LocalCar = localConn.model('Car', carSchema);
    const AtlasCar = atlasConn.model('Car', carSchema);

    // Get cars from localhost
    const cars = await LocalCar.find({}).lean();
    console.log(`\n📦 Found ${cars.length} cars in localhost`);

    if (cars.length === 0) {
      console.log('❌ No cars to migrate');
      await localConn.close();
      await atlasConn.close();
      return;
    }

    // Check existing cars in Atlas
    const existingCars = await AtlasCar.countDocuments({});
    console.log(`📊 Existing cars in Atlas: ${existingCars}`);

    // Insert cars to Atlas
    console.log('\n📤 Migrating cars to Atlas...');
    for (const car of cars) {
      const exists = await AtlasCar.findOne({
        localeGroupId: car.localeGroupId,
        locale: car.locale,
      });
      if (exists) {
        console.log(
          `⏭️  Skipping: ${car.localeGroupId} (${car.locale}) - already exists`
        );
      } else {
        delete car._id; // Remove _id to let MongoDB generate new one
        await AtlasCar.create(car);
        console.log(`✅ Migrated: ${car.localeGroupId} (${car.locale})`);
      }
    }

    // Verify
    const finalCount = await AtlasCar.countDocuments({});
    console.log(`\n✅ Migration complete! Total cars in Atlas: ${finalCount}`);

    await localConn.close();
    await atlasConn.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrateCars();
