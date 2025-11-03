// Check cars in Atlas
const mongoose = require('mongoose');
require('dotenv').config();

async function checkAtlas() {
  try {
    console.log('🔌 Connecting to Atlas...');
    console.log('URI:', process.env.MONGO_URI.replace(/:[^:]+@/, ':****@'));

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Atlas MongoDB');

    const Car = mongoose.model(
      'Car',
      new mongoose.Schema({}, { strict: false })
    );

    // Count total cars
    const total = await Car.countDocuments({});
    console.log(`\n📊 Total cars in Atlas: ${total}`);

    if (total > 0) {
      // Count by status
      const byStatus = await Car.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      console.log('\n📈 Cars by status:');
      byStatus.forEach(s =>
        console.log(`   ${s._id || 'null/undefined'}: ${s.count}`)
      );

      // Show sample
      const sample = await Car.findOne({}).lean();
      console.log('\n🚗 Sample car:');
      console.log(`   localeGroupId: ${sample.localeGroupId}`);
      console.log(`   locale: ${sample.locale}`);
      console.log(`   status: ${sample.status}`);
    } else {
      console.log('\n❌ Atlas database is EMPTY!');
      console.log('\n💡 Solution: Run one of these:');
      console.log('   1. node scripts/seed-cars-to-atlas.js');
      console.log('   2. Use Postman to create cars via POST /api/v1/cars');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAtlas();
