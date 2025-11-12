// tests/unit/utils/softDelete.util.test.ts
import {
  SOFT_DELETE_FILTER,
  SOFT_DELETED_ONLY_FILTER,
  excludeDeleted,
  markAsDeleted,
  restoreDeleted,
  isDeleted,
} from '../../../src/utils/softDelete.util';

describe('Soft Delete Utility', () => {
  describe('SOFT_DELETE_FILTER', () => {
    it('should have correct structure', () => {
      expect(SOFT_DELETE_FILTER).toEqual({
        deletedAt: { $exists: false },
      });
    });
  });

  describe('SOFT_DELETED_ONLY_FILTER', () => {
    it('should have correct structure', () => {
      expect(SOFT_DELETED_ONLY_FILTER).toEqual({
        deletedAt: { $exists: true },
      });
    });
  });

  describe('excludeDeleted', () => {
    it('should exclude deleted items by default', () => {
      const query = { status: 'active' };
      const result = excludeDeleted(query);

      expect(result).toEqual({
        status: 'active',
        deletedAt: { $exists: false },
      });
    });

    it('should include deleted items when includeDeleted is true', () => {
      const query = { status: 'active' };
      const result = excludeDeleted(query, true);

      expect(result).toEqual({
        status: 'active',
        deletedAt: { $exists: true },
      });
    });

    it('should merge with existing query filters', () => {
      const query = {
        status: 'active',
        locale: 'en',
        price: { $gte: 100 },
      };
      const result = excludeDeleted(query);

      expect(result).toEqual({
        status: 'active',
        locale: 'en',
        price: { $gte: 100 },
        deletedAt: { $exists: false },
      });
    });

    it('should work with empty query', () => {
      const query = {};
      const result = excludeDeleted(query);

      expect(result).toEqual({
        deletedAt: { $exists: false },
      });
    });
  });

  describe('markAsDeleted', () => {
    it('should return object with deletedAt field', () => {
      const result = markAsDeleted();

      expect(result).toHaveProperty('deletedAt');
      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it('should set deletedAt to current date', () => {
      const before = new Date();
      const result = markAsDeleted();
      const after = new Date();

      expect(result.deletedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.deletedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('restoreDeleted', () => {
    it('should return $unset object', () => {
      const result = restoreDeleted();

      expect(result).toEqual({
        $unset: { deletedAt: 1 },
      });
    });
  });

  describe('isDeleted', () => {
    it('should return false for null', () => {
      expect(isDeleted(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isDeleted(undefined)).toBe(false);
    });

    it('should return false for item without deletedAt', () => {
      const item: any = { id: '123', name: 'Test', deletedAt: undefined };
      expect(isDeleted(item)).toBe(false);
    });

    it('should return false for item with deletedAt = null', () => {
      const item: any = { id: '123', deletedAt: null };
      expect(isDeleted(item)).toBe(false);
    });

    it('should return true for item with deletedAt = Date', () => {
      const item: any = { id: '123', deletedAt: new Date() };
      expect(isDeleted(item)).toBe(true);
    });

    it('should return true for item with deletedAt = string date', () => {
      const item: any = { id: '123', deletedAt: '2025-01-27' };
      expect(isDeleted(item)).toBe(true);
    });
  });
});

