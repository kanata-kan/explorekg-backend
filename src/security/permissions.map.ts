/**
 * Permissions Map
 * Defines what actions each role can perform on different resources
 */

import { AdminRole } from './roles.enum';

/**
 * Available resources in the system
 */
export enum Resource {
  GUESTS = 'guests',
  BOOKINGS = 'bookings',
  CATALOG = 'catalog', // Travel packs, activities, cars
  SECURITY = 'security',
  ADMINS = 'admins',
}

/**
 * Available actions on resources
 */
export enum Action {
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  CLEANUP = 'cleanup',
  CANCEL = 'cancel',
  STATISTICS = 'statistics',
  MONITOR = 'monitor',
  MANAGE = 'manage', // Full CRUD
}

/**
 * Permission structure: Resource -> Actions
 */
type ResourcePermissions = {
  [key in Resource]?: Action[];
};

/**
 * Role-based permissions map
 */
export const rolePermissions: Record<AdminRole, ResourcePermissions> = {
  [AdminRole.SUPER_ADMIN]: {
    [Resource.GUESTS]: [
      Action.VIEW,
      Action.CREATE,
      Action.UPDATE,
      Action.DELETE,
      Action.CLEANUP,
      Action.STATISTICS,
    ],
    [Resource.BOOKINGS]: [
      Action.VIEW,
      Action.UPDATE,
      Action.CANCEL,
      Action.CLEANUP,
      Action.STATISTICS,
    ],
    [Resource.CATALOG]: [
      Action.VIEW,
      Action.CREATE,
      Action.UPDATE,
      Action.DELETE,
      Action.STATISTICS,
    ],
    [Resource.SECURITY]: [Action.VIEW, Action.MONITOR, Action.MANAGE],
    [Resource.ADMINS]: [
      Action.VIEW,
      Action.CREATE,
      Action.UPDATE,
      Action.DELETE,
      Action.MANAGE,
    ],
  },

  [AdminRole.ADMIN]: {
    [Resource.GUESTS]: [
      Action.VIEW,
      Action.UPDATE,
      Action.CLEANUP,
      Action.STATISTICS,
    ],
    [Resource.BOOKINGS]: [
      Action.VIEW,
      Action.UPDATE,
      Action.CANCEL,
      Action.STATISTICS,
    ],
    [Resource.CATALOG]: [
      Action.VIEW,
      Action.CREATE,
      Action.UPDATE,
      Action.DELETE,
      Action.STATISTICS,
    ],
    [Resource.SECURITY]: [Action.VIEW, Action.MONITOR],
    [Resource.ADMINS]: [Action.VIEW], // Can only view other admins
  },

  [AdminRole.SUPPORT]: {
    [Resource.GUESTS]: [Action.VIEW, Action.UPDATE, Action.STATISTICS],
    [Resource.BOOKINGS]: [Action.VIEW, Action.UPDATE],
    [Resource.CATALOG]: [Action.VIEW], // Read-only access to catalog
    [Resource.SECURITY]: [], // No security access
    [Resource.ADMINS]: [], // No admin management access
  },

  [AdminRole.GUEST]: {
    [Resource.GUESTS]: [], // No admin access to guests
    [Resource.BOOKINGS]: [], // No admin access to bookings
    [Resource.CATALOG]: [], // Public catalog access only
    [Resource.SECURITY]: [],
    [Resource.ADMINS]: [],
  },
};

/**
 * Check if a role has permission to perform an action on a resource
 */
export const hasPermission = (
  role: AdminRole,
  resource: Resource,
  action: Action
): boolean => {
  const permissions = rolePermissions[role]?.[resource];
  return permissions ? permissions.includes(action) : false;
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (
  role: AdminRole
): ResourcePermissions | undefined => {
  return rolePermissions[role];
};

/**
 * Check if a role has any admin permissions
 */
export const hasAnyAdminPermission = (role: AdminRole): boolean => {
  const permissions = rolePermissions[role];
  if (!permissions) return false;

  return Object.values(permissions).some(
    actions => actions && actions.length > 0
  );
};
