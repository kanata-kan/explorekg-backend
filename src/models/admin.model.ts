/**
 * Admin Model
 * Represents administrative users in the system
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { AdminRole } from '../security/roles.enum';

/**
 * Admin Document Interface
 */
export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  role: AdminRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;

  // Virtual: full name
  fullName: string;
}

/**
 * Admin Model Interface
 */
export interface IAdminModel extends Model<IAdmin> {
  findByEmail(email: string): Promise<IAdmin | null>;
  findActiveAdmins(): Promise<IAdmin[]>;
}

/**
 * Admin Schema
 */
const AdminSchema = new Schema<IAdmin, IAdminModel>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Don't return password hash by default
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.SUPPORT,
      required: [true, 'Role is required'],
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: any) {
        // Remove sensitive fields
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

/**
 * Indexes for better query performance
 */
AdminSchema.index({ email: 1, isActive: 1 });
AdminSchema.index({ role: 1, isActive: 1 });
AdminSchema.index({ createdAt: -1 });

/**
 * Virtual: Full Name
 */
AdminSchema.virtual('fullName').get(function (this: IAdmin) {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Static Method: Find admin by email
 */
AdminSchema.statics.findByEmail = async function (
  email: string
): Promise<IAdmin | null> {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

/**
 * Static Method: Find all active admins
 */
AdminSchema.statics.findActiveAdmins = async function (): Promise<IAdmin[]> {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

/**
 * Pre-save hook: Update lastLogin on login
 */
AdminSchema.pre('save', function (next) {
  if (this.isModified('lastLogin')) {
    this.lastLogin = new Date();
  }
  next();
});

/**
 * Admin Model
 */
export const Admin = mongoose.model<IAdmin, IAdminModel>('Admin', AdminSchema);

export default Admin;
