/**
 * Create Initial Super Admin
 * Script to create the first SUPER_ADMIN user
 */

import mongoose from 'mongoose';
import { ENV } from '../src/config/env';
import { AdminService } from '../src/services/admin.service';
import { AdminRole } from '../src/security/roles.enum';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
};

async function createSuperAdmin() {
  try {
    console.log('🔐 Creating Initial Super Admin\n');

    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(ENV.MONGO_URI);
    console.log('✅ Connected to database\n');

    // Get admin details
    const email = await question('Email: ');
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const password = await question('Password (min 8 characters): ');
    const confirmPassword = await question('Confirm Password: ');

    // Validate input
    if (!email || !firstName || !lastName || !password) {
      console.error('❌ All fields are required');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    // Check if email already exists
    const existing = await AdminService.getAdminByEmail(email);
    if (existing) {
      console.error('❌ Admin with this email already exists');
      process.exit(1);
    }

    // Create super admin
    console.log('\n🔄 Creating SUPER_ADMIN...');
    const admin = await AdminService.createAdmin({
      email,
      password,
      firstName,
      lastName,
      role: AdminRole.SUPER_ADMIN,
    });

    console.log('\n✅ SUPER_ADMIN created successfully!');
    console.log('\n📋 Admin Details:');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.fullName}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n✅ You can now login with these credentials\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating super admin:', error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

// Run script
createSuperAdmin();
