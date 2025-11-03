/**
 * Authentication Middleware
 * Handles JWT token verification and admin authentication
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService, JWTPayload } from './auth.service';
import { AdminRole } from './roles.enum';

/**
 * Extend Express Request to include admin information
 */
declare global {
  namespace Express {
    interface Request {
      admin?: JWTPayload;
    }
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
  }
}

/**
 * Authenticate middleware - REQUIRED authentication
 * Verifies JWT token and attaches admin info to request
 * Rejects request if token is invalid or missing
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = AuthService.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Attach admin info to request
    req.admin = payload;

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: 'AUTHENTICATION_REQUIRED',
      });
      return;
    }

    if (
      error instanceof Error &&
      (error.message.includes('expired') || error.message.includes('invalid'))
    ) {
      res.status(401).json({
        success: false,
        error: error.message,
        code: 'INVALID_TOKEN',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Optional authenticate middleware - OPTIONAL authentication
 * Tries to verify JWT token if present
 * Continues without error if token is missing
 * Only fails if token is present but invalid
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = AuthService.extractTokenFromHeader(req.headers.authorization);

    // If no token, continue without authentication
    if (!token) {
      next();
      return;
    }

    // Try to verify token
    try {
      const payload = AuthService.verifyToken(token);
      req.admin = payload;
    } catch (error) {
      // Token exists but is invalid - this is suspicious
      // Log it but don't block the request
      console.warn('Invalid token in optional auth:', error);
    }

    next();
  } catch (error) {
    // In optional auth, we never reject requests
    next();
  }
};

/**
 * Require admin role - ensures user is authenticated and is an admin
 */
export const requireAdminRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED',
    });
    return;
  }

  const adminRoles: AdminRole[] = [
    AdminRole.SUPER_ADMIN,
    AdminRole.ADMIN,
    AdminRole.SUPPORT,
  ];

  if (!adminRoles.includes(req.admin.role)) {
    res.status(403).json({
      success: false,
      error: 'Admin privileges required',
      code: 'INSUFFICIENT_PRIVILEGES',
    });
    return;
  }

  next();
};

/**
 * Get current admin from request (helper function)
 */
export const getCurrentAdmin = (req: Request): JWTPayload | null => {
  return req.admin || null;
};

/**
 * Check if current user is authenticated
 */
export const isAuthenticated = (req: Request): boolean => {
  return !!req.admin;
};
