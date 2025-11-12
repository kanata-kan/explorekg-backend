// src/channels/base.channel.ts

/**
 * Base Channel
 * 
 * Abstract base class for all notification channels.
 * Provides common functionality and enforces the IChannel interface.
 */

import {
  IChannel,
  INotification,
  NotificationChannel,
  NotificationType,
  ChannelResult,
} from '../types/notification.types';

/**
 * Abstract Base Channel Class
 * 
 * All channels should extend this class to ensure consistency.
 * Provides default implementations and common utilities.
 */
export abstract class BaseChannel implements IChannel {
  /**
   * Channel name (must be set by subclasses)
   */
  abstract readonly name: NotificationChannel;

  /**
   * Send notification through this channel
   * Must be implemented by subclasses
   */
  abstract send(notification: INotification): Promise<ChannelResult>;

  /**
   * Validate if notification can be sent through this channel
   * Default implementation checks:
   * - Channel is enabled
   * - Notification type is supported
   * - Required recipient information is present
   * 
   * Subclasses can override for additional validation
   */
  validate(notification: INotification): boolean {
    // Check if channel is enabled
    if (!this.isEnabled()) {
      return false;
    }

    // Check if notification type is supported
    if (!this.getSupportedTypes().includes(notification.type)) {
      return false;
    }

    // Check if channel is in notification's channels list
    if (!notification.channels.includes(this.name)) {
      return false;
    }

    // Additional validation in subclasses
    return this.validateRecipient(notification);
  }

  /**
   * Validate recipient information
   * Must be implemented by subclasses to check channel-specific requirements
   * (e.g., email channel requires email address)
   */
  protected abstract validateRecipient(notification: INotification): boolean;

  /**
   * Get notification types supported by this channel
   * Must be implemented by subclasses
   */
  abstract getSupportedTypes(): NotificationType[];

  /**
   * Check if this channel is enabled
   * Default implementation returns true
   * Subclasses can override to check configuration
   */
  isEnabled(): boolean {
    return true;
  }

  /**
   * Create a successful channel result
   */
  protected createSuccessResult(messageId?: string): ChannelResult {
    return {
      success: true,
      channel: this.name,
      messageId,
      timestamp: new Date(),
    };
  }

  /**
   * Create a failed channel result
   */
  protected createErrorResult(error: string): ChannelResult {
    return {
      success: false,
      channel: this.name,
      error,
      timestamp: new Date(),
    };
  }
}

