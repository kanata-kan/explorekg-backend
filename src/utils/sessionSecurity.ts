// src/utils/sessionSecurity.ts
import crypto from 'crypto';
import { ENV } from '../config/env';

/**
 * Session Security Utilities
 * Handles session signing, verification, and rotation
 */

/**
 * Generate HMAC signature for session data
 */
export function signSession(
  sessionId: string,
  guestId: string,
  timestamp: number
): string {
  const data = `${sessionId}:${guestId}:${timestamp}`;
  return crypto
    .createHmac('sha256', ENV.SESSION_SECRET)
    .update(data)
    .digest('hex');
}

/**
 * Verify session signature
 */
export function verifySession(
  sessionId: string,
  guestId: string,
  timestamp: number,
  signature: string
): boolean {
  const expectedSignature = signSession(sessionId, guestId, timestamp);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Check if session needs rotation (every 24 hours)
 */
export function shouldRotateSession(lastRotation: Date): boolean {
  const now = new Date();
  const hoursSinceRotation =
    (now.getTime() - lastRotation.getTime()) / (1000 * 60 * 60);
  return hoursSinceRotation >= 24;
}

/**
 * Generate session fingerprint based on request
 */
export function generateSessionFingerprint(req: any): string {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const ip = req.ip || req.connection.remoteAddress || '';

  const data = `${userAgent}:${acceptLanguage}:${ip}`;
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Verify session fingerprint
 */
export function verifySessionFingerprint(
  req: any,
  storedFingerprint: string
): boolean {
  const currentFingerprint = generateSessionFingerprint(req);
  return currentFingerprint === storedFingerprint;
}
