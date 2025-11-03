// Quick script to check cars in database
const mongoose = require('mongoose');
require('dotenv').config();

async function checkCars() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/explorekg'
    );
    console.log('✅ Connected to MongoDB');

    const Car = mongoose.model(
      'Car',
      new mongoose.Schema({}, { strict: false })
    );

    // Count total cars
    const total = await Car.countDocuments({});
    console.log(`\n📊 Total cars in database: ${total}`);

    // Count by status
    const byStatus = await Car.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    console.log('\n📈 Cars by status:');
    byStatus.forEach(s =>
      console.log(`   ${s._id || 'null/undefined'}: ${s.count}`)
    );

    // Count by locale
    const byLocale = await Car.aggregate([
      { $group: { _id: '$locale', count: { $sum: 1 } } },
    ]);
    console.log('\n🌐 Cars by locale:');
    byLocale.forEach(l =>
      console.log(`   ${l._id || 'null/undefined'}: ${l.count}`)
    );

    // Show sample car
    const sample = await Car.findOne({}).lean();
    if (sample) {
      console.log('\n🚗 Sample car:');
      console.log(`   _id: ${sample._id}`);
      console.log(`   name: ${sample.name || 'N/A'}`);
      console.log(`   localeGroupId: ${sample.localeGroupId || 'N/A'}`);
      console.log(`   locale: ${sample.locale || 'N/A'}`);
      console.log(`   status: ${sample.status || 'N/A'}`);
      console.log(
        `   availabilityStatus: ${sample.availabilityStatus || 'N/A'}`
      );
    }

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCars();
