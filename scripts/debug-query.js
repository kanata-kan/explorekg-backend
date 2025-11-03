// Debug: Test the exact query that API uses
const mongoose = require('mongoose');
require('dotenv').config();

async function testQuery() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Atlas');

    const Car = mongoose.model(
      'Car',
      new mongoose.Schema({}, { strict: false })
    );

    // Test 1: Empty query (same as API)
    console.log('\n🧪 Test 1: Empty query {}');
    const query1 = {};
    const result1 = await Car.find(query1).limit(20).lean().exec();
    console.log(`   Result: ${result1.length} cars`);
    if (result1.length > 0) {
      console.log('   ✅ Cars found!');
      result1.forEach(car => {
        console.log(`      - ${car.localeGroupId} (${car.locale})`);
      });
    }

    // Test 2: With sort
    console.log('\n🧪 Test 2: With sort -createdAt');
    const result2 = await Car.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();
    console.log(`   Result: ${result2.length} cars`);

    // Test 3: Count total
    console.log('\n🧪 Test 3: Count documents');
    const count = await Car.countDocuments({}).exec();
    console.log(`   Total: ${count} cars`);

    // Test 4: Check if cars have required fields
    console.log('\n🧪 Test 4: Check car fields');
    const sample = await Car.findOne({}).lean();
    if (sample) {
      console.log('   Fields present:');
      console.log(`      _id: ${sample._id ? '✅' : '❌'}`);
      console.log(`      localeGroupId: ${sample.localeGroupId ? '✅' : '❌'}`);
      console.log(`      locale: ${sample.locale ? '✅' : '❌'}`);
      console.log(`      status: ${sample.status ? '✅' : '❌'}`);
      console.log(`      name: ${sample.name ? '✅' : '❌'}`);
      console.log(`      pricing: ${sample.pricing ? '✅' : '❌'}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testQuery();
