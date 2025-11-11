/**
 * Security Module Exports
 * Central export point for all security-related functionality
 */

// Roles and Permissions
export {
  AdminRole,
  isAdminRole,
  getRoleLevel,
  hasHigherOrEqualRole,
} from './roles.enum';
export {
  Resource,
  Action,
  rolePermissions,
  hasPermission,
  getRolePermissions,
  hasAnyAdminPermission,
} from './permissions.map';

// Authentication
export { AuthService, type JWTPayload } from './auth.service';
export {
  authenticate,
  optionalAuthenticate,
  requireAdminRole,
  getCurrentAdmin,
  isAuthenticated,
  AuthenticationError,
} from './auth.middleware';

// Authorization
export {
  requireRole,
  requirePermission,
  requireAnyAdmin,
  requireAdminOrHigher,
  requireSuperAdmin,
  validateOwnership,
  canPerformAction,
  AuthorizationError,
} from './authorize.middleware';

// Audit Logging
export {
  auditLog,
  auditAuth,
  AuditAction,
  getAuditLogs,
} from './audit.middleware';

// Ownership Validation
export {
  validateBookingOwnership,
  validateGuestOwnership,
  validateGuestBookingsOwnership,
} from './ownership.middleware';

// Security Middleware (moved from middleware/)
export {
  inputSanitizer,
  corsConfig,
  generalRateLimit,
  strictRateLimit,
  guestCreationLimit,
  paymentRateLimit,
  progressiveSlowDown,
  sessionFingerprintValidator,
} from '../middleware/security';

export {
  suspiciousActivityDetector,
  dataAccessAuditor,
  authFailureTracker,
  logSecurityEvent,
} from '../middleware/securityAudit';

export {
  advancedSecurityHeaders,
  advancedHSTS,
  advancedCSP,
  requestComplexityLimiter,
  suspiciousUserAgentDetector,
  honeypotEndpoints,
} from '../middleware/advancedSecurity';