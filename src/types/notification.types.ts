// src/types/notification.types.ts

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

/**
 * Recipient Information
 * Contact information for the notification recipient
 */
export interface NotificationRecipient {
  email?: string;
  phone?: string;
  userId?: string;
  name?: string;
  locale?: 'en' | 'fr';
}

/**
 * Notification Data
 * Contextual data for rendering the notification template
 */
export interface NotificationData {
  [key: string]: any;
  // Common fields:
  // bookingNumber?: string;
  // guestName?: string;
  // amount?: number;
  // dates?: { startDate: Date; endDate: Date };
}

/**
 * Notification Metadata
 * Additional metadata for tracking and analytics
 */
export interface NotificationMetadata {
  source?: string; // Where the notification was triggered from
  correlationId?: string; // For tracking related notifications
  retryCount?: number;
  scheduledAt?: Date;
  [key: string]: any;
}

/**
 * Notification Interface
 * Main interface for all notifications
 */
export interface INotification {
  type: NotificationType;
  recipient: NotificationRecipient;
  data: NotificationData;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  metadata?: NotificationMetadata;
}

/**
 * Channel Result
 * Result of sending a notification through a channel
 */
export interface ChannelResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

/**
 * Notification Event
 * Event that triggers a notification
 * Used by services to request notifications
 */
export interface NotificationEvent {
  type: NotificationType;
  recipient: NotificationRecipient;
  data: NotificationData;
  metadata?: NotificationMetadata;
  // Optional: Let service decide channels, or specify them
  channels?: NotificationChannel[];
}

/**
 * Channel Interface
 * Base interface that all notification channels must implement
 */
export interface IChannel {
  /**
   * Channel name (must match NotificationChannel enum)
   */
  readonly name: NotificationChannel;

  /**
   * Send notification through this channel
   * @param notification - The notification to send
   * @returns Promise resolving to channel result
   */
  send(notification: INotification): Promise<ChannelResult>;

  /**
   * Validate if notification can be sent through this channel
   * @param notification - The notification to validate
   * @returns true if valid, false otherwise
   */
  validate(notification: INotification): boolean;

  /**
   * Get notification types supported by this channel
   * @returns Array of supported notification types
   */
  getSupportedTypes(): NotificationType[];

  /**
   * Check if this channel is enabled
   * @returns true if enabled, false otherwise
   */
  isEnabled(): boolean;
}

/**
 * Template Context
 * Data passed to template for rendering
 */
export interface TemplateContext {
  recipient: NotificationRecipient;
  data: NotificationData;
  metadata?: NotificationMetadata;
  [key: string]: any;
}

