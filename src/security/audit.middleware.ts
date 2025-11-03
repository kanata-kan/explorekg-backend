/**
 * Audit Middleware
 * Logs all sensitive administrative operations for security monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AdminRole } from './roles.enum';

/**
 * Audit event types
 */
export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',

  // Guest Management
  CREATE_GUEST = 'CREATE_GUEST',
  UPDATE_GUEST = 'UPDATE_GUEST',
  DELETE_GUEST = 'DELETE_GUEST',
  CLEANUP_GUESTS = 'CLEANUP_GUESTS',
  VIEW_GUEST_STATISTICS = 'VIEW_GUEST_STATISTICS',

  // Booking Management
  CREATE_BOOKING = 'CREATE_BOOKING',
  UPDATE_BOOKING = 'UPDATE_BOOKING',
  CANCEL_BOOKING = 'CANCEL_BOOKING',
  UPDATE_BOOKING_STATUS = 'UPDATE_BOOKING_STATUS',
  CLEANUP_BOOKINGS = 'CLEANUP_BOOKINGS',
  VIEW_BOOKING_STATISTICS = 'VIEW_BOOKING_STATISTICS',

  // Catalog Management
  CREATE_ACTIVITY = 'CREATE_ACTIVITY',
  UPDATE_ACTIVITY = 'UPDATE_ACTIVITY',
  DELETE_ACTIVITY = 'DELETE_ACTIVITY',
  CREATE_CAR = 'CREATE_CAR',
  UPDATE_CAR = 'UPDATE_CAR',
  DELETE_CAR = 'DELETE_CAR',
  CREATE_TRAVEL_PACK = 'CREATE_TRAVEL_PACK',
  UPDATE_TRAVEL_PACK = 'UPDATE_TRAVEL_PACK',
  DELETE_TRAVEL_PACK = 'DELETE_TRAVEL_PACK',
  CREATE_PACK_RELATION = 'CREATE_PACK_RELATION',
  UPDATE_PACK_RELATION = 'UPDATE_PACK_RELATION',
  DELETE_PACK_RELATION = 'DELETE_PACK_RELATION',

  // Admin Management
  CREATE_ADMIN = 'CREATE_ADMIN',
  UPDATE_ADMIN = 'UPDATE_ADMIN',
  DELETE_ADMIN = 'DELETE_ADMIN',
  VIEW_ADMIN = 'VIEW_ADMIN',

  // Security
  VIEW_SECURITY_METRICS = 'VIEW_SECURITY_METRICS',
  TRIGGER_SECURITY_TEST = 'TRIGGER_SECURITY_TEST',
}

/**
 * Audit log entry structure
 */
interface AuditLogEntry {
  timestamp: string;
  action: AuditAction;
  adminId?: string;
  adminEmail?: string;
  adminRole?: AdminRole;
  ip?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  success: boolean;
  error?: string;
}

/**
 * Create audit log middleware
 * Logs the specified action after the request completes
 */
export const auditLog = (
  action: AuditAction,
  details?: Record<string, any>
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Store original send function
    const originalSend = res.send;
    let responseBody: any;

    // Override send to capture response
    res.send = function (this: Response, body: any): Response {
      responseBody = body;
      return originalSend.call(this, body);
    } as any;

    // Continue to next middleware
    next();

    // Log after response is sent
    res.on('finish', () => {
      const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        action,
        adminId: req.admin?.adminId,
        adminEmail: req.admin?.email,
        adminRole: req.admin?.role,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        resource: req.baseUrl + req.path,
        resourceId:
          req.params.id || req.params.sessionId || req.params.bookingNumber,
        details: {
          ...details,
          method: req.method,
          query: req.query,
          statusCode: res.statusCode,
        },
        success: res.statusCode < 400,
      };

      // Add error info if request failed
      if (res.statusCode >= 400) {
        try {
          const parsed =
            typeof responseBody === 'string'
              ? JSON.parse(responseBody)
              : responseBody;
          entry.error = parsed?.error || 'Unknown error';
        } catch {
          entry.error = 'Failed to parse error';
        }
      }

      // Log the audit entry
      if (entry.success) {
        logger.info({ audit: entry }, `[AUDIT] ${action}`);
      } else {
        logger.warn({ audit: entry }, `[AUDIT_FAILED] ${action}`);
      }
    });
  };
};

/**
 * Audit log for authentication events
 */
export const auditAuth = (
  action: AuditAction.LOGIN | AuditAction.LOGOUT | AuditAction.LOGIN_FAILED,
  email?: string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      action,
      adminEmail: email || req.body?.email,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      resource: req.baseUrl + req.path,
      details: {
        method: req.method,
      },
      success: false, // Will be updated after response
    };

    // Override response to log after completion
    const originalJson = res.json;
    res.json = function (body: any): Response {
      entry.success = res.statusCode < 400;

      if (!entry.success) {
        entry.error = body?.error || 'Authentication failed';
      }

      if (entry.success && action === AuditAction.LOGIN) {
        logger.info({ audit: entry }, `[AUDIT] Admin logged in: ${email}`);
      } else if (action === AuditAction.LOGIN_FAILED) {
        logger.warn({ audit: entry }, `[AUDIT] Login failed for: ${email}`);
      } else if (action === AuditAction.LOGOUT) {
        logger.info({ audit: entry }, `[AUDIT] Admin logged out: ${email}`);
      }

      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Get audit logs (for future implementation with database storage)
 */
export const getAuditLogs = async (filters?: {
  adminId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
}): Promise<AuditLogEntry[]> => {
  // TODO: Implement database-backed audit log retrieval
  // For now, audit logs are only written to the logger
  return [];
};
