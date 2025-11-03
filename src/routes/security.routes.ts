// src/routes/security.routes.ts
import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { getSecurityDashboard } from '../services/securityMonitoring.service';
import { ENV } from '../config/env';
import {
  authenticate,
  requirePermission,
  auditLog,
  AuditAction,
  Resource,
  Action,
} from '../security';

const router = Router();

/**
 * Security Routes
 * Base path: /api/v1/security
 * Note: These should be protected with admin authentication in production
 */

/**
 * @route   GET /api/v1/security/status
 * @desc    Get current security status
 * @access  Admin only
 */
router.get(
  '/status',
  authenticate,
  requirePermission(Resource.SECURITY, Action.VIEW),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const securityData = getSecurityDashboard();

      res.status(200).json({
        success: true,
        data: {
          securityLevel: securityData.summary.securityLevel,
          alerts: securityData.summary.alerts,
          last5Minutes: securityData.summary.last5Minutes,
          uptime: securityData.systemHealth.uptime,
          timestamp: securityData.systemHealth.timestamp,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/security/metrics
 * @desc    Get detailed security metrics
 * @access  Admin only
 */
router.get(
  '/metrics',
  authenticate,
  requirePermission(Resource.SECURITY, Action.MONITOR),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const securityData = getSecurityDashboard();

      res.status(200).json({
        success: true,
        data: securityData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/security/health
 * @desc    Get system health metrics
 * @access  Admin only
 */
router.get(
  '/health',
  authenticate,
  requirePermission(Resource.SECURITY, Action.VIEW),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const securityData = getSecurityDashboard();
      const healthData = securityData.systemHealth;

      // Calculate health score
      const memoryUsage =
        healthData.memoryUsage.heapUsed / healthData.memoryUsage.heapTotal;
      const healthScore =
        memoryUsage < 0.8
          ? 'HEALTHY'
          : memoryUsage < 0.9
            ? 'WARNING'
            : 'CRITICAL';

      res.status(200).json({
        success: true,
        data: {
          healthScore,
          uptime: healthData.uptime,
          memory: {
            usage: `${(memoryUsage * 100).toFixed(2)}%`,
            heapUsed: `${(healthData.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(healthData.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          },
          environment: ENV.NODE_ENV,
          version: '1.0.0',
          securityFeatures: {
            encryptionAtRest: ENV.ENABLE_ENCRYPTION_AT_REST,
            advancedLogging: ENV.ENABLE_ADVANCED_LOGGING,
            securityHeaders: ENV.ENABLE_SECURITY_HEADERS,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/security/test-alert
 * @desc    Test security alert system
 * @access  Admin only (Development only)
 */
if (!ENV.IS_PROD) {
  router.post(
    '/test-alert',
    authenticate,
    requirePermission(Resource.SECURITY, Action.MANAGE),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { alertType } = req.body;

        // Simulate different types of security events for testing
        const { recordSecurityEvent } = await import(
          '../services/securityMonitoring.service'
        );

        switch (alertType) {
          case 'sql-injection':
            recordSecurityEvent('attack', { attackType: 'sqlInjection' });
            break;
          case 'xss':
            recordSecurityEvent('attack', { attackType: 'xss' });
            break;
          case 'failed-auth':
            recordSecurityEvent('auth', { authType: 'failed' });
            break;
          case 'rate-limit':
            recordSecurityEvent('attack', { attackType: 'rateLimitExceeded' });
            break;
          default:
            return res.status(400).json({
              success: false,
              error: 'Invalid alert type',
            });
        }

        res.status(200).json({
          success: true,
          message: `Test ${alertType} alert triggered`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        next(error);
      }
    }
  );
}

export default router;
