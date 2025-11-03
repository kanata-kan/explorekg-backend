/**
 * Admin Service
 * Business logic for admin operations
 */

import { Admin, IAdmin } from '../models/admin.model';
import { AuthService } from '../security/auth.service';
import { AdminRole } from '../security/roles.enum';
import mongoose from 'mongoose';

/**
 * Admin creation data
 */
export interface CreateAdminData {
  email: string;
  password: string;
  role: AdminRole;
  firstName: string;
  lastName: string;
  createdBy?: string;
}

/**
 * Admin update data
 */
export interface UpdateAdminData {
  firstName?: string;
  lastName?: string;
  role?: AdminRole;
  isActive?: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    role: AdminRole;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

/**
 * Admin Service Class
 */
export class AdminService {
  /**
   * Create a new admin
   */
  static async createAdmin(data: CreateAdminData): Promise<IAdmin> {
    // Check if email already exists
    const existingAdmin = await Admin.findOne({
      email: data.email.toLowerCase(),
    });
    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(data.password);

    // Create admin
    const admin = new Admin({
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: true,
      createdBy: data.createdBy
        ? new mongoose.Types.ObjectId(data.createdBy)
        : undefined,
    });

    await admin.save();
    return admin;
  }

  /**
   * Login admin
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Find admin with password hash
    const admin = await Admin.findOne({
      email: credentials.email.toLowerCase(),
      isActive: true,
    }).select('+passwordHash');

    if (!admin) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await AuthService.verifyPassword(
      credentials.password,
      admin.passwordHash
    );

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = AuthService.generateToken({
      adminId: (admin._id as mongoose.Types.ObjectId).toString(),
      email: admin.email,
      role: admin.role,
    });

    return {
      token,
      admin: {
        id: (admin._id as mongoose.Types.ObjectId).toString(),
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        fullName: admin.fullName,
      },
    };
  }

  /**
   * Get admin by ID
   */
  static async getAdminById(adminId: string): Promise<IAdmin | null> {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return null;
    }
    return Admin.findById(adminId);
  }

  /**
   * Get admin by email
   */
  static async getAdminByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findByEmail(email);
  }

  /**
   * Update admin
   */
  static async updateAdmin(
    adminId: string,
    data: UpdateAdminData
  ): Promise<IAdmin | null> {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      throw new Error('Invalid admin ID');
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Update fields
    if (data.firstName !== undefined) admin.firstName = data.firstName;
    if (data.lastName !== undefined) admin.lastName = data.lastName;
    if (data.role !== undefined) admin.role = data.role;
    if (data.isActive !== undefined) admin.isActive = data.isActive;

    await admin.save();
    return admin;
  }

  /**
   * Delete admin (soft delete - set isActive to false)
   */
  static async deleteAdmin(adminId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      throw new Error('Invalid admin ID');
    }

    const result = await Admin.findByIdAndUpdate(
      adminId,
      { isActive: false },
      { new: true }
    );

    return !!result;
  }

  /**
   * Get all active admins
   */
  static async getAllAdmins(): Promise<IAdmin[]> {
    return Admin.findActiveAdmins();
  }

  /**
   * Get admins by role
   */
  static async getAdminsByRole(role: AdminRole): Promise<IAdmin[]> {
    return Admin.find({ role, isActive: true }).sort({ createdAt: -1 });
  }

  /**
   * Change admin password
   */
  static async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      throw new Error('Invalid admin ID');
    }

    const admin = await Admin.findById(adminId).select('+passwordHash');
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Verify current password
    const isValid = await AuthService.verifyPassword(
      currentPassword,
      admin.passwordHash
    );

    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    admin.passwordHash = await AuthService.hashPassword(newPassword);
    await admin.save();

    return true;
  }

  /**
   * Reset admin password (by SUPER_ADMIN only)
   */
  static async resetPassword(adminId: string): Promise<string> {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      throw new Error('Invalid admin ID');
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Generate random password
    const newPassword = AuthService.generateRandomPassword(16);

    // Hash and save
    admin.passwordHash = await AuthService.hashPassword(newPassword);
    await admin.save();

    return newPassword;
  }

  /**
   * Get admin statistics
   */
  static async getStatistics() {
    const [totalAdmins, activeAdmins, roleDistribution] = await Promise.all([
      Admin.countDocuments(),
      Admin.countDocuments({ isActive: true }),
      Admin.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      totalAdmins,
      activeAdmins,
      inactiveAdmins: totalAdmins - activeAdmins,
      roleDistribution: roleDistribution.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}

export default AdminService;
