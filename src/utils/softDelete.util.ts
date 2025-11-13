/**
 * Soft Delete Utility
 *
 * Provides consistent soft delete functionality across all catalog entities.
 * Uses `deletedAt` field to mark items as deleted without removing them from the database.
 *
 * @module softDelete
 */

/**
 * Filter condition to exclude soft-deleted items
 * Items with `deletedAt` field are considered deleted
 */
export const SOFT_DELETE_FILTER = {
  deletedAt: { $exists: false },
};

/**
 * Filter condition to include only soft-deleted items
 */
export const SOFT_DELETED_ONLY_FILTER = {
  deletedAt: { $exists: true },
};

/**
 * Merges a query filter with soft delete exclusion
 * Automatically excludes soft-deleted items from queries
 *
 * @param query - Base query filter object
 * @param includeDeleted - If true, includes deleted items. If false, excludes them. Default: false
 * @returns Merged query filter with soft delete condition
 *
 * @example
 * ```typescript
 * // Exclude deleted items
 * const filter = excludeDeleted({ status: 'active' });
 * // Returns: { status: 'active', deletedAt: { $exists: false } }
 *
 * // Include deleted items
 * const filter = excludeDeleted({ status: 'active' }, true);
 * // Returns: { status: 'active', deletedAt: { $exists: true } }
 * ```
 */
export const excludeDeleted = (query: any, includeDeleted: boolean = false) => {
  const softDeleteFilter = includeDeleted ? SOFT_DELETED_ONLY_FILTER : SOFT_DELETE_FILTER;
  return {
    ...query,
    ...softDeleteFilter,
  };
};

/**
 * Marks an item as soft-deleted by setting deletedAt to current date
 *
 * @param item - Mongoose document or plain object
 * @returns Object with deletedAt field set to current date
 *
 * @example
 * ```typescript
 * const updateData = markAsDeleted();
 * // Returns: { deletedAt: new Date() }
 *
 * await Activity.findByIdAndUpdate(id, updateData);
 * ```
 */
export const markAsDeleted = () => {
  return {
    deletedAt: new Date(),
  };
};

/**
 * Restores a soft-deleted item by removing deletedAt field
 *
 * @returns Object with deletedAt set to null (to unset the field)
 *
 * @example
 * ```typescript
 * const updateData = restoreDeleted();
 * // Returns: { $unset: { deletedAt: 1 } }
 *
 * await Activity.findByIdAndUpdate(id, updateData);
 * ```
 */
export const restoreDeleted = () => {
  return {
    $unset: { deletedAt: 1 },
  };
};

/**
 * Checks if an item is soft-deleted
 *
 * @param item - Item with optional deletedAt field
 * @returns True if item is deleted, false otherwise
 *
 * @example
 * ```typescript
 * const activity = await Activity.findById(id);
 * if (isDeleted(activity)) {
 *   throw new NotFoundError('Activity not found');
 * }
 * ```
 */
export const isDeleted = (item: any): boolean => {
  if (!item) return false;
  return item.deletedAt !== null && item.deletedAt !== undefined;
};

