// src/utils/encryption.ts
import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';

/**
 * Advanced Encryption Utilities
 * Handles encryption/decryption of sensitive data
 */

/**
 * Encrypt sensitive data (PII, payment info, etc.)
 */
export class DataEncryption {
  private static readonly ENCRYPTION_KEY = ENV.SESSION_SECRET;

  /**
   * Encrypt a string value
   */
  static encrypt(text: string): string {
    if (!text) return text;

    try {
      const encrypted = CryptoJS.AES.encrypt(
        text,
        this.ENCRYPTION_KEY
      ).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt a string value
   */
  static decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, this.ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Invalid encrypted data');
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data (emails for search indexing)
   */
  static hash(text: string): string {
    if (!text) return text;

    try {
      const salt = bcrypt.genSaltSync(12);
      return bcrypt.hashSync(text, salt);
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Verify hashed data
   */
  static verifyHash(text: string, hashedText: string): boolean {
    if (!text || !hashedText) return false;

    try {
      return bcrypt.compareSync(text, hashedText);
    } catch (error) {
      console.error('Hash verification failed:', error);
      return false;
    }
  }

  /**
   * Create secure token for sensitive operations
   */
  static createSecureToken(payload: any, expiresIn: string = '1h'): string {
    const jwt = require('jsonwebtoken');

    try {
      return jwt.sign(payload, this.ENCRYPTION_KEY, {
        expiresIn,
        algorithm: 'HS256',
      });
    } catch (error) {
      console.error('Token creation failed:', error);
      throw new Error('Failed to create secure token');
    }
  }

  /**
   * Verify secure token
   */
  static verifySecureToken(token: string): any {
    const jwt = require('jsonwebtoken');

    try {
      return jwt.verify(token, this.ENCRYPTION_KEY);
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  }
}

/**
 * Personal Data Protection Utilities
 */
export class PersonalDataProtection {
  /**
   * Mask email for logging and display
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;

    const [local, domain] = email.split('@');
    if (local.length <= 2) return `${local}***@${domain}`;

    return `${local.substring(0, 2)}***@${domain}`;
  }

  /**
   * Mask phone number for logging and display
   */
  static maskPhone(phone: string): string {
    if (!phone) return phone;

    if (phone.length <= 6) return '***';

    const start = phone.substring(0, 3);
    const end = phone.substring(phone.length - 3);
    return `${start}***${end}`;
  }

  /**
   * Mask credit card number
   */
  static maskCreditCard(cardNumber: string): string {
    if (!cardNumber) return cardNumber;

    if (cardNumber.length <= 8) return '****';

    const start = cardNumber.substring(0, 4);
    const end = cardNumber.substring(cardNumber.length - 4);
    return `${start}****${end}`;
  }

  /**
   * Generate anonymized ID for analytics
   */
  static generateAnonymousId(guestId: string): string {
    return CryptoJS.SHA256(guestId + ENV.SESSION_SECRET)
      .toString()
      .substring(0, 16);
  }
}

/**
 * Field-level encryption for sensitive model fields
 */
export class FieldEncryption {
  /**
   * Encrypt before saving to database
   */
  static encryptField(value: any): string {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    return DataEncryption.encrypt(value);
  }

  /**
   * Decrypt after reading from database
   */
  static decryptField(encryptedValue: string): any {
    try {
      const decrypted = DataEncryption.decrypt(encryptedValue);

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Field decryption failed:', error);
      return null;
    }
  }
}
