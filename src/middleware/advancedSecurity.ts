// src/middleware/advancedSecurity.ts
import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';

/**
 * Advanced Security Headers Middleware
 * Implements comprehensive security headers for production
 */

/**
 * Security headers configuration
 */
export const advancedSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy for privacy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()'
  );

  // Expect-CT header for certificate transparency
  if (ENV.IS_PROD) {
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
  }

  // Custom security header to identify our API
  res.setHeader('X-API-Version', 'v1.0.0');
  res.setHeader('X-Security-Level', 'high');

  // Remove server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Cache control for sensitive endpoints
  if (req.path.includes('/guests') || req.path.includes('/bookings')) {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  next();
};

/**
 * Advanced HSTS (HTTP Strict Transport Security)
 */
export const advancedHSTS = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (ENV.IS_PROD) {
    // 2 years HSTS with includeSubDomains and preload
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  next();
};

/**
 * Content Security Policy (CSP) for API
 */
export const advancedCSP = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cspDirectives = [
    "default-src 'none'",
    "script-src 'none'",
    "object-src 'none'",
    "style-src 'none'",
    "img-src 'none'",
    "media-src 'none'",
    "frame-src 'none'",
    "font-src 'none'",
    "connect-src 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  // Report-only mode for testing
  if (!ENV.IS_PROD) {
    res.setHeader('Content-Security-Policy-Report-Only', cspDirectives);
  }

  next();
};

/**
 * Request size and complexity limiter
 */
export const requestComplexityLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const maxDepth = 10;
  const maxKeys = 100;

  const checkComplexity = (obj: any, depth = 0): boolean => {
    if (depth > maxDepth) return false;

    if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      if (keys.length > maxKeys) return false;

      for (const key of keys) {
        if (!checkComplexity(obj[key], depth + 1)) return false;
      }
    }

    return true;
  };

  // Check request body complexity
  if (req.body && !checkComplexity(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Request structure too complex',
      code: 'REQUEST_TOO_COMPLEX',
    });
  }

  // Check query parameters complexity
  if (req.query && !checkComplexity(req.query)) {
    return res.status(400).json({
      success: false,
      error: 'Query parameters too complex',
      code: 'QUERY_TOO_COMPLEX',
    });
  }

  next();
};

/**
 * Suspicious user agent detector
 */
export const suspiciousUserAgentDetector = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userAgent = req.get('User-Agent') || '';

  // Suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /node/i,
    /postman/i,
  ];

  // Known attack tools
  const attackTools = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /dirb/i,
    /gobuster/i,
    /burpsuite/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(userAgent)
  );
  const isAttackTool = attackTools.some(pattern => pattern.test(userAgent));

  if (isAttackTool) {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      code: 'FORBIDDEN_USER_AGENT',
    });
  }

  if (isSuspicious && ENV.IS_PROD) {
    // Log but allow in production (might be legitimate automation)
    console.warn(
      `🤖 Suspicious User-Agent detected: ${userAgent} from ${req.ip}`
    );
  }

  next();
};

/**
 * Honeypot endpoints for detecting attacks
 */
export const honeypotEndpoints = (app: any) => {
  const honeypotPaths = [
    '/admin',
    '/wp-admin',
    '/phpmyadmin',
    '/.env',
    '/backup',
    '/config',
    '/database',
    '/test',
  ];

  honeypotPaths.forEach(path => {
    app.all(path, (req: Request, res: Response) => {
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'unknown';

      console.warn(`🍯 HONEYPOT TRIGGERED: ${path} from ${ip} (${userAgent})`);

      // Return realistic 404 to not reveal it's a honeypot
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'The requested resource was not found on this server.',
      });
    });
  });
};
