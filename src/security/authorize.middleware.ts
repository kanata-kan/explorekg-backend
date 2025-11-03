/**
 * Authorization Middleware
 * Handles role-based access control and permission checking
 */

import { Request, Response, NextFunction } from 'express';
import { AdminRole } from './roles.enum';
import {
  Resource,
  Action,
  hasPermission,
  hasAnyAdminPermission,
} from './permissions.map';

/**
 * Authorization Error
 */
export class AuthorizationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
  }
}

/**
 * Require specific role(s) middleware
 * Checks if user has one of the allowed roles
 */
export const requireRole = (allowedRoles: AdminRole | AdminRole[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.admin) {
        throw new AuthorizationError('Authentication required', 401);
      }

      // Check if user has one of the allowed roles
      if (!roles.includes(req.admin.role)) {
        throw new AuthorizationError(
          `Insufficient privileges. Required role: ${roles.join(' or ')}`,
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: 'INSUFFICIENT_PRIVILEGES',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Authorization failed',
        code: 'AUTHORIZATION_ERROR',
      });
    }
  };
};

/**
 * Require specific permission middleware
 * Checks if user's role has permission to perform action on resource
 */
export const requirePermission = (resource: Resource, action: Action) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.admin) {
        throw new AuthorizationError('Authentication required', 401);
      }

      // Check if user has the required permission
      if (!hasPermission(req.admin.role, resource, action)) {
        throw new AuthorizationError(
          `You don't have permission to ${action} ${resource}`,
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: 'INSUFFICIENT_PERMISSIONS',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Permission check failed',
        code: 'PERMISSION_ERROR',
      });
    }
  };
};

/**
 * Require any admin role (SUPER_ADMIN, ADMIN, or SUPPORT)
 */
export const requireAnyAdmin = requireRole([
  AdminRole.SUPER_ADMIN,
  AdminRole.ADMIN,
  AdminRole.SUPPORT,
]);

/**
 * Require SUPER_ADMIN or ADMIN role only
 */
export const requireAdminOrHigher = requireRole([
  AdminRole.SUPER_ADMIN,
  AdminRole.ADMIN,
]);

/**
 * Require SUPER_ADMIN role only
 */
export const requireSuperAdmin = requireRole(AdminRole.SUPER_ADMIN);

/**
 * Ownership validation middleware
 * Ensures user can only access their own resources
 */
export const validateOwnership = (
  resourceIdParam: string = 'id',
  userIdField: string = 'adminId'
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.admin?.[userIdField as keyof typeof req.admin];

      // If user is admin, skip ownership check
      if (req.admin && hasAnyAdminPermission(req.admin.role as AdminRole)) {
        next();
        return;
      }

      // Check ownership
      if (!userId || resourceId !== userId) {
        throw new AuthorizationError(
          'You can only access your own resources',
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: 'OWNERSHIP_VIOLATION',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Ownership validation failed',
        code: 'VALIDATION_ERROR',
      });
    }
  };
};

/**
 * Check if current admin can perform action (helper function)
 */
export const canPerformAction = (
  req: Request,
  resource: Resource,
  action: Action
): boolean => {
  if (!req.admin) return false;
  return hasPermission(req.admin.role as AdminRole, resource, action);
};
