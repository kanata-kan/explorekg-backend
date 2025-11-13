import { ValidationError } from '../../utils/AppError';

/**
 * Activity Policy
 * Contains business rules for activity operations
 */
export class ActivityPolicy {
  /**
   * Rule: Validate activity data
   * @param data - Activity creation/update data
   * @returns true if data is valid, throws ValidationError otherwise
   */
  static validateActivityData(data: any): boolean {
    // Validate name
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length < 3) {
        throw new ValidationError('Activity name must be at least 3 characters');
      }
    }

    // Validate description
    if (data.description !== undefined && data.description) {
      if (data.description.trim().length < 10) {
        throw new ValidationError('Activity description must be at least 10 characters');
      }
    }

    // Validate price
    if (data.price !== undefined) {
      if (data.price < 0) {
        throw new ValidationError('Activity price cannot be negative');
      }
    }

    // Validate locale
    if (data.locale !== undefined) {
      if (!['en', 'fr'].includes(data.locale)) {
        throw new ValidationError('Locale must be either "en" or "fr"');
      }
    }

    // Validate status
    if (data.status !== undefined) {
      if (!['active', 'inactive', 'maintenance'].includes(data.status)) {
        throw new ValidationError('Invalid activity status');
      }
    }

    // Validate availabilityStatus
    if (data.availabilityStatus !== undefined) {
      if (!['available', 'unavailable'].includes(data.availabilityStatus)) {
        throw new ValidationError('Invalid availability status');
      }
    }

    return true;
  }

  /**
   * Rule: Check if activity can be created
   * @param data - Activity creation data
   * @returns true if activity can be created, false otherwise
   */
  static canCreateActivity(data: any): boolean {
    // Validate required fields
    if (!data.name || !data.locale) {
      return false;
    }

    // Validate data format
    try {
      this.validateActivityData(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rule: Check if activity can be updated
   * @param activity - Activity object to check
   * @param data - Update data
   * @returns true if activity can be updated, false otherwise
   */
  static canUpdateActivity(activity: any, data: any): boolean {
    // Cannot update if activity is deleted
    if (activity.deletedAt) {
      return false;
    }

    // Validate data format
    try {
      this.validateActivityData(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rule: Check if activity can be deleted
   * @param activity - Activity object to check
   * @returns true if activity can be deleted, false otherwise
   */
  static canDeleteActivity(activity: any): boolean {
    // Cannot delete if already deleted
    if (activity.deletedAt) {
      return false;
    }

    // Additional business rules can be added here:
    // - Check if activity has active bookings
    // - Check if activity is part of active travel packs
    // etc.

    return true;
  }
}

