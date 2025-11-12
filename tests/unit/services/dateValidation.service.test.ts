import { DateValidationService } from '../../../src/services/dateValidation.service';
import { ValidationError } from '../../../src/utils/AppError';

describe('DateValidationService', () => {
  describe('calculateEndDate', () => {
    it('should calculate end date correctly from start date + numberOfDays', () => {
      const startDate = new Date('2025-01-01');
      const numberOfDays = 5;
      const endDate = DateValidationService.calculateEndDate(startDate, numberOfDays);

      expect(endDate.getFullYear()).toBe(2025);
      expect(endDate.getMonth()).toBe(0);
      expect(endDate.getDate()).toBe(6);
      expect(endDate.getHours()).toBe(0);
      expect(endDate.getMinutes()).toBe(0);
      expect(endDate.getSeconds()).toBe(0);
    });

    it('should throw error if startDate is not provided', () => {
      expect(() => {
        DateValidationService.calculateEndDate(null as any, 5);
      }).toThrow(ValidationError);
    });

    it('should throw error if numberOfDays is less than 1', () => {
      const startDate = new Date('2025-01-01');
      expect(() => {
        DateValidationService.calculateEndDate(startDate, 0);
      }).toThrow(ValidationError);
    });

    it('should handle month boundaries correctly', () => {
      const startDate = new Date('2025-01-30');
      const numberOfDays = 3;
      const endDate = DateValidationService.calculateEndDate(startDate, numberOfDays);

      expect(endDate.getMonth()).toBe(1); // February
      expect(endDate.getDate()).toBe(2); // Feb 2
    });

    it('should handle year boundaries correctly', () => {
      const startDate = new Date('2025-12-30');
      const numberOfDays = 3;
      const endDate = DateValidationService.calculateEndDate(startDate, numberOfDays);

      expect(endDate.getFullYear()).toBe(2026);
      expect(endDate.getMonth()).toBe(0); // January
      expect(endDate.getDate()).toBe(2); // Jan 2
    });
  });

  describe('autoCalculateDates', () => {
    it('should calculate endDate from startDate + numberOfDays when endDate is not provided', () => {
      const startDate = new Date('2025-01-01');
      const numberOfDays = 5;
      const result = DateValidationService.autoCalculateDates(startDate, undefined, numberOfDays);

      expect(result.startDate).toEqual(startDate);
      expect(result.endDate).toBeDefined();
      expect(result.endDate!.getDate()).toBe(6);
    });

    it('should use provided endDate if it exists', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-10');
      const result = DateValidationService.autoCalculateDates(startDate, endDate, 5);

      expect(result.startDate).toEqual(startDate);
      expect(result.endDate).toEqual(endDate);
    });

    it('should return startDate only if numberOfDays is not provided', () => {
      const startDate = new Date('2025-01-01');
      const result = DateValidationService.autoCalculateDates(startDate, undefined, undefined);

      expect(result.startDate).toEqual(startDate);
      expect(result.endDate).toBeUndefined();
    });

    it('should handle both startDate and endDate provided', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-15');
      const result = DateValidationService.autoCalculateDates(startDate, endDate, undefined);

      expect(result.startDate).toEqual(startDate);
      expect(result.endDate).toEqual(endDate);
    });
  });

  describe('validateDateRange', () => {
    it('should not throw if startDate is before endDate', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-06');

      expect(() => {
        DateValidationService.validateDateRange(startDate, endDate);
      }).not.toThrow();
    });

    it('should throw error if startDate is after endDate', () => {
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-01');

      expect(() => {
        DateValidationService.validateDateRange(startDate, endDate);
      }).toThrow(ValidationError);
    });

    it('should throw error if startDate equals endDate', () => {
      const date = new Date('2025-01-01');

      expect(() => {
        DateValidationService.validateDateRange(date, date);
      }).toThrow(ValidationError);
    });
  });

  describe('validateFutureDate', () => {
    it('should not throw if date is today (allowToday = true)', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      expect(() => {
        DateValidationService.validateFutureDate(today, true);
      }).not.toThrow();
    });

    it('should throw error if date is yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);

      expect(() => {
        DateValidationService.validateFutureDate(yesterday, true);
      }).toThrow(ValidationError);
    });

    it('should not throw if date is tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      expect(() => {
        DateValidationService.validateFutureDate(tomorrow, true);
      }).not.toThrow();
    });

    it('should throw error if date is in the past (allowToday = false)', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      expect(() => {
        DateValidationService.validateFutureDate(today, false);
      }).toThrow(ValidationError);
    });
  });

  describe('validateMinimumDuration', () => {
    it('should not throw if duration meets minimum requirement', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-06'); // 5 days

      expect(() => {
        DateValidationService.validateMinimumDuration(startDate, endDate, 3);
      }).not.toThrow();
    });

    it('should throw error if duration is less than minimum', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03'); // 2 days

      expect(() => {
        DateValidationService.validateMinimumDuration(startDate, endDate, 3);
      }).toThrow(ValidationError);
    });
  });

  describe('validateMaximumDuration', () => {
    it('should not throw if duration is within maximum', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-06'); // 5 days

      expect(() => {
        DateValidationService.validateMaximumDuration(startDate, endDate, 10);
      }).not.toThrow();
    });

    it('should throw error if duration exceeds maximum', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-15'); // 14 days

      expect(() => {
        DateValidationService.validateMaximumDuration(startDate, endDate, 10);
      }).toThrow(ValidationError);
    });
  });

  describe('calculateDurationInDays', () => {
    it('should calculate duration correctly', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-06');

      const duration = DateValidationService.calculateDurationInDays(startDate, endDate);
      expect(duration).toBe(5);
    });

    it('should return 0 if dates are the same', () => {
      const date = new Date('2025-01-01');
      const duration = DateValidationService.calculateDurationInDays(date, date);
      expect(duration).toBe(0);
    });

    it('should handle month boundaries correctly', () => {
      const startDate = new Date('2025-01-30');
      const endDate = new Date('2025-02-02');
      const duration = DateValidationService.calculateDurationInDays(startDate, endDate);
      expect(duration).toBe(3);
    });
  });

  describe('doRangesOverlap', () => {
    it('should return true if ranges overlap (exclusive endDate logic)', () => {
      // Range 1: Jan 1 (inclusive) to Jan 6 (exclusive)
      // Range 2: Jan 4 (inclusive) to Jan 8 (exclusive)
      // Overlap: true (Jan 4 and Jan 5 are in both ranges)
      const start1 = new Date('2025-01-01');
      const end1 = new Date('2025-01-06');
      const start2 = new Date('2025-01-04');
      const end2 = new Date('2025-01-08');

      const overlaps = DateValidationService.doRangesOverlap(start1, end1, start2, end2);
      expect(overlaps).toBe(true);
    });

    it('should return false if ranges do not overlap', () => {
      // Range 1: Jan 1 (inclusive) to Jan 6 (exclusive)
      // Range 2: Jan 6 (inclusive) to Jan 10 (exclusive)
      // No overlap: end1 is exclusive, so ranges don't touch
      const start1 = new Date('2025-01-01');
      const end1 = new Date('2025-01-06');
      const start2 = new Date('2025-01-06');
      const end2 = new Date('2025-01-10');

      const overlaps = DateValidationService.doRangesOverlap(start1, end1, start2, end2);
      expect(overlaps).toBe(false);
    });

    it('should return false if ranges are completely separate', () => {
      const start1 = new Date('2025-01-01');
      const end1 = new Date('2025-01-06');
      const start2 = new Date('2025-01-07');
      const end2 = new Date('2025-01-10');

      const overlaps = DateValidationService.doRangesOverlap(start1, end1, start2, end2);
      expect(overlaps).toBe(false);
    });

    it('should return true if one range completely contains the other', () => {
      // Range 1: Jan 1 (inclusive) to Jan 10 (exclusive)
      // Range 2: Jan 3 (inclusive) to Jan 6 (exclusive)
      const start1 = new Date('2025-01-01');
      const end1 = new Date('2025-01-10');
      const start2 = new Date('2025-01-03');
      const end2 = new Date('2025-01-06');

      const overlaps = DateValidationService.doRangesOverlap(start1, end1, start2, end2);
      expect(overlaps).toBe(true);
    });

    it('should return true if ranges share the same start date', () => {
      const start1 = new Date('2025-01-01');
      const end1 = new Date('2025-01-06');
      const start2 = new Date('2025-01-01');
      const end2 = new Date('2025-01-08');

      const overlaps = DateValidationService.doRangesOverlap(start1, end1, start2, end2);
      expect(overlaps).toBe(true);
    });
  });
});
