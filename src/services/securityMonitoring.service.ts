// src/services/securityMonitoring.service.ts
import { logger } from '../utils/logger';

/**
 * Security Monitoring Service
 * Provides real-time security metrics and alerts
 */

interface SecurityMetrics {
  timestamp: Date;
  requests: {
    total: number;
    blocked: number;
    suspicious: number;
  };
  attacks: {
    sqlInjection: number;
    xss: number;
    noSqlInjection: number;
    rateLimitExceeded: number;
  };
  authentication: {
    failed: number;
    successful: number;
    locked: number;
  };
  performance: {
    averageResponseTime: number;
    slowRequests: number;
    errorRate: number;
  };
}

class SecurityMonitoringService {
  private metrics: SecurityMetrics[] = [];
  private currentMetrics!: SecurityMetrics; // Initialized in constructor
  private alertThresholds = {
    maxFailedAuth: 10,
    maxBlockedRequests: 50,
    maxErrorRate: 0.05, // 5%
    maxResponseTime: 2000, // 2 seconds
  };

  constructor() {
    this.resetCurrentMetrics();
    this.startMetricsCollection();
  }

  private resetCurrentMetrics() {
    this.currentMetrics = {
      timestamp: new Date(),
      requests: { total: 0, blocked: 0, suspicious: 0 },
      attacks: {
        sqlInjection: 0,
        xss: 0,
        noSqlInjection: 0,
        rateLimitExceeded: 0,
      },
      authentication: { failed: 0, successful: 0, locked: 0 },
      performance: { averageResponseTime: 0, slowRequests: 0, errorRate: 0 },
    };
  }

  private startMetricsCollection() {
    // Collect metrics every minute
    setInterval(() => {
      this.metrics.push({ ...this.currentMetrics });
      this.checkAlerts();
      this.resetCurrentMetrics();

      // Keep only last 60 minutes of data
      if (this.metrics.length > 60) {
        this.metrics = this.metrics.slice(-60);
      }
    }, 60000);
  }

  /**
   * Record security events
   */
  recordRequest(type: 'normal' | 'blocked' | 'suspicious' = 'normal') {
    this.currentMetrics.requests.total++;
    if (type === 'blocked') this.currentMetrics.requests.blocked++;
    if (type === 'suspicious') this.currentMetrics.requests.suspicious++;
  }

  recordAttack(
    type: 'sqlInjection' | 'xss' | 'noSqlInjection' | 'rateLimitExceeded'
  ) {
    this.currentMetrics.attacks[type]++;
    this.recordRequest('blocked');
  }

  recordAuthentication(type: 'failed' | 'successful' | 'locked') {
    this.currentMetrics.authentication[type]++;
  }

  recordPerformance(responseTime: number, isError: boolean = false) {
    // Update average response time
    const current = this.currentMetrics.performance.averageResponseTime;
    const total = this.currentMetrics.requests.total;
    this.currentMetrics.performance.averageResponseTime =
      (current * (total - 1) + responseTime) / total;

    if (responseTime > 2000) {
      this.currentMetrics.performance.slowRequests++;
    }

    if (isError) {
      this.currentMetrics.performance.errorRate =
        (this.currentMetrics.performance.errorRate * (total - 1) + 1) / total;
    }
  }

  /**
   * Check for security alerts
   */
  private checkAlerts() {
    const alerts: string[] = [];

    if (
      this.currentMetrics.authentication.failed >
      this.alertThresholds.maxFailedAuth
    ) {
      alerts.push(
        `HIGH: ${this.currentMetrics.authentication.failed} failed authentications in last minute`
      );
    }

    if (
      this.currentMetrics.requests.blocked >
      this.alertThresholds.maxBlockedRequests
    ) {
      alerts.push(
        `HIGH: ${this.currentMetrics.requests.blocked} blocked requests in last minute`
      );
    }

    if (
      this.currentMetrics.performance.errorRate >
      this.alertThresholds.maxErrorRate
    ) {
      alerts.push(
        `MEDIUM: Error rate ${(this.currentMetrics.performance.errorRate * 100).toFixed(2)}% exceeds threshold`
      );
    }

    if (
      this.currentMetrics.performance.averageResponseTime >
      this.alertThresholds.maxResponseTime
    ) {
      alerts.push(
        `MEDIUM: Average response time ${this.currentMetrics.performance.averageResponseTime}ms exceeds threshold`
      );
    }

    // Log alerts
    alerts.forEach(alert => {
      logger.warn({ alert, metrics: this.currentMetrics }, '🚨 SECURITY ALERT');
    });
  }

  /**
   * Get current security status
   */
  getSecurityStatus() {
    const last5Minutes = this.metrics.slice(-5);
    const totalMetrics = last5Minutes.reduce(
      (acc, curr) => ({
        requests: {
          total: acc.requests.total + curr.requests.total,
          blocked: acc.requests.blocked + curr.requests.blocked,
          suspicious: acc.requests.suspicious + curr.requests.suspicious,
        },
        attacks: {
          sqlInjection: acc.attacks.sqlInjection + curr.attacks.sqlInjection,
          xss: acc.attacks.xss + curr.attacks.xss,
          noSqlInjection:
            acc.attacks.noSqlInjection + curr.attacks.noSqlInjection,
          rateLimitExceeded:
            acc.attacks.rateLimitExceeded + curr.attacks.rateLimitExceeded,
        },
        authentication: {
          failed: acc.authentication.failed + curr.authentication.failed,
          successful:
            acc.authentication.successful + curr.authentication.successful,
          locked: acc.authentication.locked + curr.authentication.locked,
        },
      }),
      {
        requests: { total: 0, blocked: 0, suspicious: 0 },
        attacks: {
          sqlInjection: 0,
          xss: 0,
          noSqlInjection: 0,
          rateLimitExceeded: 0,
        },
        authentication: { failed: 0, successful: 0, locked: 0 },
      }
    );

    const securityLevel = this.calculateSecurityLevel(totalMetrics);

    return {
      securityLevel,
      last5Minutes: totalMetrics,
      currentMetrics: this.currentMetrics,
      alerts: this.getActiveAlerts(),
      timestamp: new Date().toISOString(),
    };
  }

  private calculateSecurityLevel(
    metrics: any
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let score = 0;

    // Calculate threat score
    if (metrics.attacks.sqlInjection > 0) score += 10;
    if (metrics.attacks.xss > 0) score += 8;
    if (metrics.attacks.noSqlInjection > 0) score += 10;
    if (metrics.authentication.failed > 5) score += 5;
    if (metrics.requests.blocked > 20) score += 5;

    if (score >= 20) return 'CRITICAL';
    if (score >= 10) return 'HIGH';
    if (score >= 5) return 'MEDIUM';
    return 'LOW';
  }

  private getActiveAlerts(): string[] {
    // Return any active security concerns
    const alerts: string[] = [];

    if (this.currentMetrics.authentication.failed > 5) {
      alerts.push('Multiple authentication failures detected');
    }

    if (this.currentMetrics.requests.blocked > 10) {
      alerts.push('High number of blocked requests');
    }

    return alerts;
  }

  /**
   * Get detailed metrics for dashboard
   */
  getDetailedMetrics() {
    return {
      historical: this.metrics,
      current: this.currentMetrics,
      summary: this.getSecurityStatus(),
      systemHealth: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Singleton instance
export const securityMonitoring = new SecurityMonitoringService();

// Helper functions for controllers
export const getSecurityDashboard = () =>
  securityMonitoring.getDetailedMetrics();
export const recordSecurityEvent = (type: string, data: any) => {
  switch (type) {
    case 'request':
      securityMonitoring.recordRequest(data.requestType);
      break;
    case 'attack':
      securityMonitoring.recordAttack(data.attackType);
      break;
    case 'auth':
      securityMonitoring.recordAuthentication(data.authType);
      break;
    case 'performance':
      securityMonitoring.recordPerformance(data.responseTime, data.isError);
      break;
  }
};
