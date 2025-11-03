/**
 * Admin Roles Enumeration
 * Defines all available roles in the system
 */

export enum AdminRole {
  /**
   * Super Administrator - Full system control
   * Can manage all resources including other admins
   */
  SUPER_ADMIN = 'SUPER_ADMIN',

  /**
   * Administrator - General management
   * Can manage content, guests, and bookings
   */
  ADMIN = 'ADMIN',

  /**
   * Support Staff - Customer support
   * Can view and update guest information
   */
  SUPPORT = 'SUPPORT',

  /**
   * Guest User - Regular visitor
   * No administrative privileges
   */
  GUEST = 'GUEST',
}

/**
 * Check if a role is an admin role
 */
export const isAdminRole = (role: string): boolean => {
  return [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.SUPPORT].includes(
    role as AdminRole
  );
};

/**
 * Get role hierarchy level (higher number = more privileges)
 */
export const getRoleLevel = (role: AdminRole): number => {
  const levels = {
    [AdminRole.SUPER_ADMIN]: 4,
    [AdminRole.ADMIN]: 3,
    [AdminRole.SUPPORT]: 2,
    [AdminRole.GUEST]: 1,
  };
  return levels[role] || 0;
};

/**
 * Check if role1 has higher or equal privilege than role2
 */
export const hasHigherOrEqualRole = (
  role1: AdminRole,
  role2: AdminRole
): boolean => {
  return getRoleLevel(role1) >= getRoleLevel(role2);
};
