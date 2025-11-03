// src/middleware/securityAudit.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Security Audit Trail Middleware
 * Logs security-relevant events for monitoring and compliance
 */

interface SecurityEvent {
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  sessionId?: string;
  guestId?: string;
  timestamp: Date;
  metadata?: any;
}

/**
 * Log security events with structured format
 */
export function logSecurityEvent(event: SecurityEvent) {
  const logData = {
    type: 'SECURITY_EVENT',
    event: event.event,
    severity: event.severity,
    ip: event.ip,
    userAgent: event.userAgent,
    path: event.path,
    method: event.method,
    sessionId: event.sessionId,
    guestId: event.guestId,
    timestamp: event.timestamp.toISOString(),
    metadata: event.metadata,
  };

  switch (event.severity) {
    case 'critical':
      logger.fatal(logData, `🚨 CRITICAL SECURITY EVENT: ${event.event}`);
      break;
    case 'high':
      logger.error(logData, `🔴 HIGH SECURITY EVENT: ${event.event}`);
      break;
    case 'medium':
      logger.warn(logData, `🟡 MEDIUM SECURITY EVENT: ${event.event}`);
      break;
    case 'low':
      logger.info(logData, `🔍 SECURITY EVENT: ${event.event}`);
      break;
  }
}

/**
 * Suspicious activity detector middleware
 */
export const suspiciousActivityDetector = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  // Detect potential security threats
  const suspiciousPatterns = [
    // SQL injection attempts
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/i,
    // XSS attempts
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    // Path traversal attempts
    /(\.\.\/)|(\.\.\\)/g,
    // Command injection attempts
    /[;&|`$(){}[\]]/g,
  ];

  const requestData = JSON.stringify({
    query: req.query,
    body: req.body,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logSecurityEvent({
        event: 'SUSPICIOUS_PATTERN_DETECTED',
        severity: 'high',
        ip,
        userAgent,
        path: req.path,
        method: req.method,
        timestamp: new Date(),
        metadata: {
          pattern: pattern.toString(),
          matchedData: requestData.match(pattern)?.[0],
        },
      });
      break;
    }
  }

  next();
};

/**
 * Failed authentication attempts tracker
 */
const failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export const authFailureTracker = (ip: string, reason: string) => {
  const now = new Date();
  const key = ip;

  const attempts = failedAttempts.get(key) || { count: 0, lastAttempt: now };
  attempts.count += 1;
  attempts.lastAttempt = now;

  failedAttempts.set(key, attempts);

  // Clear old entries (older than 1 hour)
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  for (const [k, v] of failedAttempts.entries()) {
    if (v.lastAttempt < oneHourAgo) {
      failedAttempts.delete(k);
    }
  }

  const severity =
    attempts.count > 10 ? 'critical' : attempts.count > 5 ? 'high' : 'medium';

  logSecurityEvent({
    event: 'AUTHENTICATION_FAILURE',
    severity,
    ip,
    userAgent: 'unknown',
    path: '/auth',
    method: 'POST',
    timestamp: now,
    metadata: {
      reason,
      attemptCount: attempts.count,
      window: '1hour',
    },
  });
};

/**
 * Data access audit logger
 */
export const dataAccessAuditor = (
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE',
  resource: string,
  req: Request,
  guestId?: string
) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  logSecurityEvent({
    event: `DATA_${action}`,
    severity:
      action === 'DELETE' ? 'high' : action === 'UPDATE' ? 'medium' : 'low',
    ip,
    userAgent,
    path: req.path,
    method: req.method,
    timestamp: new Date(),
    guestId,
    metadata: {
      resource,
      action,
    },
  });
};
