/**
 * Notification System Types
 *
 * Central type definitions for the notification system.
 * These types ensure type safety and consistency across the system.
 */

/**
 * Notification Types
 * Different types of notifications the system can send
 */
export enum NotificationType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  BOOKING_CANCELLATION = 'booking_cancellation',
  BOOKING_EXPIRATION = 'booking_expiration',
  PACK_RELATION_CREATED = 'pack_relation_created',
  // Future types can be added here:
  // BOOKING_REMINDER = 'booking_reminder',
  // PAYMENT_REMINDER = 'payment_reminder',
}

/**
 * Notification Channels
 * Different channels through which notifications can be sent
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  // Future channels can be added here:
  // WHATSAPP = 'whatsapp',
  // TELEGRAM = 'telegram',
}

/**
 * Notification Priority
 * Determines the urgency of the notification
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

