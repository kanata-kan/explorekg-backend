// src/policies/notification.policy.ts

/**
 * Notification Policy
 * 
 * Business rules for notifications:
 * - Determine if notification should be sent
 * - Determine which channels to use
 * - Apply business logic (e.g., don't send if user opted out)
 */

import {
  NotificationType,
  NotificationChannel,
  NotificationEvent,
  NotificationPriority,
} from '../types/notification.types';

/**
 * Notification Policy
 * 
 * Centralizes all business rules related to notifications.
 * This ensures consistency and makes it easy to modify rules.
 */
export class NotificationPolicy {
  /**
   * Determine if notification should be sent
   * 
   * @param type - Notification type
   * @param context - Context data (e.g., booking, guest)
   * @returns true if notification should be sent
   */
  static shouldSend(type: NotificationType, context: any): boolean {
    // Basic validation: context must exist
    if (!context) {
      return false;
    }

    // Type-specific rules
    switch (type) {
      case NotificationType.BOOKING_CONFIRMATION:
        // Always send booking confirmation
        return !!context.booking && !!context.guest;

      case NotificationType.PAYMENT_CONFIRMATION:
        // Only send if payment was actually made
        return !!context.booking && context.booking.paymentStatus === 'paid';

      case NotificationType.BOOKING_CANCELLATION:
        // Always send cancellation notice
        return !!context.booking && !!context.guest;

      case NotificationType.BOOKING_EXPIRATION:
        // Only send if booking actually expired
        return !!context.booking && context.booking.status === 'expired';

      default:
        // Unknown type: don't send
        return false;
    }
  }

  /**
   * Determine which channels to use for a notification
   * 
   * @param type - Notification type
   * @param context - Context data
   * @returns Array of channels to use
   */
  static getChannels(
    type: NotificationType,
    context: any
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    // Check if recipient has email (always try email if available)
    if (context.guest?.email) {
      channels.push(NotificationChannel.EMAIL);
    }

    // Future: Add SMS if phone number available
    // if (context.guest?.phone) {
    //   channels.push(NotificationChannel.SMS);
    // }

    // Future: Add Push if user is logged in
    // if (context.guest?.userId) {
    //   channels.push(NotificationChannel.PUSH);
    // }

    // If no channels found, default to email if email exists
    if (channels.length === 0 && context.guest?.email) {
      channels.push(NotificationChannel.EMAIL);
    }

    return channels;
  }

  /**
   * Get notification priority
   * 
   * @param type - Notification type
   * @returns Priority level
   */
  static getPriority(type: NotificationType): NotificationPriority {
    switch (type) {
      case NotificationType.BOOKING_CONFIRMATION:
      case NotificationType.PAYMENT_CONFIRMATION:
        return NotificationPriority.HIGH; // Important notifications

      case NotificationType.BOOKING_CANCELLATION:
        return NotificationPriority.NORMAL;

      case NotificationType.BOOKING_EXPIRATION:
        return NotificationPriority.LOW; // Less urgent

      default:
        return NotificationPriority.NORMAL;
    }
  }

  /**
   * Process notification event and create notification object
   * 
   * @param event - Notification event
   * @returns Notification object ready to send, or null if should not send
   */
  static processEvent(event: NotificationEvent): {
    type: NotificationType;
    recipient: any;
    data: any;
    channels: NotificationChannel[];
    priority: NotificationPriority;
    metadata?: any;
  } | null {
    // Check if should send
    if (!this.shouldSend(event.type, event)) {
      return null;
    }

    // Get channels
    const channels = event.channels || this.getChannels(event.type, event);

    // If no channels available, cannot send
    if (channels.length === 0) {
      return null;
    }

    // Get priority
    const priority = this.getPriority(event.type);

    return {
      type: event.type,
      recipient: event.recipient,
      data: event.data,
      channels,
      priority,
      metadata: event.metadata,
    };
  }
}
