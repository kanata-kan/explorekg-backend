import { ValidationError } from '../../utils/AppError';

/**
 * TravelPack Policy
 * Contains business rules for travel pack operations
 */
export class TravelPackPolicy {
  /**
   * Rule: Validate travel pack data
   * @param data - Travel pack creation/update data
   * @returns true if data is valid, throws ValidationError otherwise
   */
  static validateTravelPackData(data: any): boolean {
    // Validate locales
    if (data.locales !== undefined) {
      const hasEn = !!data.locales.en;
      const hasFr = !!data.locales.fr;

      if (!hasEn && !hasFr) {
        throw new ValidationError('At least one localized version (en or fr) is required');
      }

      // Validate English locale if provided
      if (hasEn && data.locales.en) {
        if (!data.locales.en.name || data.locales.en.name.trim().length < 3) {
          throw new ValidationError('English name must be at least 3 characters');
        }
      }

      // Validate French locale if provided
      if (hasFr && data.locales.fr) {
        if (!data.locales.fr.name || data.locales.fr.name.trim().length < 3) {
          throw new ValidationError('French name must be at least 3 characters');
        }
      }
    }

    // Validate status
    if (data.status !== undefined) {
      if (!['draft', 'published', 'archived'].includes(data.status)) {
        throw new ValidationError('Invalid travel pack status');
      }
    }

    // Validate basePrice
    if (data.basePrice !== undefined && data.basePrice !== null) {
      if (data.basePrice < 0) {
        throw new ValidationError('Base price cannot be negative');
      }
    }

    // Validate duration
    if (data.duration !== undefined && data.duration !== null) {
      if (data.duration < 1) {
        throw new ValidationError('Duration must be at least 1 day');
      }
    }

    // Validate currency
    if (data.currency !== undefined) {
      if (!data.currency || data.currency.trim().length !== 3) {
        throw new ValidationError('Currency must be a valid 3-letter ISO code');
      }
    }

    return true;
  }

  /**
   * Rule: Check if travel pack can be created
   * @param data - Travel pack creation data
   * @returns true if travel pack can be created, false otherwise
   */
  static canCreateTravelPack(data: any): boolean {
    // Validate required fields
    if (!data.locales || (!data.locales.en && !data.locales.fr)) {
      return false;
    }

    // Validate data format
    try {
      this.validateTravelPackData(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rule: Check if travel pack can be updated
   * @param pack - Travel pack object to check
   * @param data - Update data
   * @returns true if travel pack can be updated, false otherwise
   */
  static canUpdateTravelPack(pack: any, data: any): boolean {
    // Cannot update if pack is deleted
    if (pack.deletedAt) {
      return false;
    }

    // Cannot update if pack is archived (unless changing status)
    if (pack.status === 'archived' && data.status !== 'published' && data.status !== 'draft') {
      return false;
    }

    // Validate data format
    try {
      this.validateTravelPackData(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rule: Check if travel pack can be deleted
   * @param pack - Travel pack object to check
   * @returns true if travel pack can be deleted, false otherwise
   */
  static canDeleteTravelPack(pack: any): boolean {
    // Cannot delete if already deleted
    if (pack.deletedAt) {
      return false;
    }

    // Additional business rules can be added here:
    // - Check if pack has active bookings
    // - Check if pack has active pack relations
    // etc.

    return true;
  }

  /**
   * Rule: Check if travel pack can be published
   * @param pack - Travel pack object to check
   * @returns true if travel pack can be published, false otherwise
   */
  static canPublishTravelPack(pack: any): boolean {
    // Cannot publish if deleted
    if (pack.deletedAt) {
      return false;
    }

    // Must have at least one locale
    if (!pack.locales.en && !pack.locales.fr) {
      return false;
    }

    // Additional business rules can be added here:
    // - Check if pack has at least one pack relation
    // - Check if pack has cover image
    // etc.

    return true;
  }
}

