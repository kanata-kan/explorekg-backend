import { ValidationError } from '../../utils/AppError';

/**
 * Car Policy
 * Contains business rules for car operations
 */
export class CarPolicy {
  /**
   * Rule: Validate car data
   * @param data - Car creation/update data
   * @returns true if data is valid, throws ValidationError otherwise
   */
  static validateCarData(data: any): boolean {
    // Validate name
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length < 3) {
        throw new ValidationError('Car name must be at least 3 characters');
      }
    }

    // Validate description
    if (data.description !== undefined && data.description) {
      if (data.description.trim().length < 10) {
        throw new ValidationError('Car description must be at least 10 characters');
      }
    }

    // Validate pricing
    if (data.pricing !== undefined) {
      if (!data.pricing.amount || data.pricing.amount < 0) {
        throw new ValidationError('Car price must be a positive number');
      }
      if (!data.pricing.currency) {
        throw new ValidationError('Car currency is required');
      }
      if (!data.pricing.unit) {
        throw new ValidationError('Car pricing unit is required');
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
        throw new ValidationError('Invalid car status');
      }
    }

    // Validate availabilityStatus
    if (data.availabilityStatus !== undefined) {
      if (!['available', 'reserved', 'unavailable'].includes(data.availabilityStatus)) {
        throw new ValidationError('Invalid availability status');
      }
    }

    // Validate specs
    if (data.specs !== undefined) {
      const requiredSpecs = ['seats', 'transmission', 'drive', 'luggage', 'fuel'];
      for (const spec of requiredSpecs) {
        if (!data.specs[spec]) {
          throw new ValidationError(`Car spec "${spec}" is required`);
        }
      }
    }

    return true;
  }

  /**
   * Rule: Check if car can be created
   * @param data - Car creation data
   * @returns true if car can be created, false otherwise
   */
  static canCreateCar(data: any): boolean {
    // Validate required fields
    if (!data.name || !data.description || !data.locale) {
      return false;
    }
    if (!data.pricing || !data.pricing.amount) {
      return false;
    }

    // Validate data format
    try {
      this.validateCarData(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rule: Check if car can be updated
   * @param car - Car object to check
   * @param data - Update data
   * @returns true if car can be updated, false otherwise
   */
  static canUpdateCar(car: any, data: any): boolean {
    // Cannot update if car is deleted
    if (car.deletedAt) {
      return false;
    }

    // Validate data format
    try {
      this.validateCarData(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rule: Check if car can be deleted
   * @param car - Car object to check
   * @returns true if car can be deleted, false otherwise
   */
  static canDeleteCar(car: any): boolean {
    // Cannot delete if already deleted
    if (car.deletedAt) {
      return false;
    }

    // Additional business rules can be added here:
    // - Check if car has active bookings
    // - Check if car is part of active travel packs
    // etc.

    return true;
  }
}

