/**
 * Abstract Base Channel Class
 *
 * All channels should extend this class to ensure consistency.
 * Provides default implementations and common utilities.
 */
export abstract class BaseChannel {
  abstract name: string;

  /**
   * Validate if notification can be sent through this channel
   * Default implementation checks:
   * - Channel is enabled
   * - Notification type is supported
   * - Required recipient information is present
   *
   * Subclasses can override for additional validation
   */
  validate(notification: any): boolean {
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
   * Check if this channel is enabled
   * Default implementation returns true
   * Subclasses can override to check configuration
   */
  isEnabled(): boolean {
    return true;
  }

  /**
   * Get notification types supported by this channel
   * Must be implemented by subclasses
   */
  abstract getSupportedTypes(): string[];

  /**
   * Validate recipient information
   * Must be implemented by subclasses
   */
  abstract validateRecipient(notification: any): boolean;

  /**
   * Send notification
   * Must be implemented by subclasses
   */
  abstract send(notification: any): Promise<any>;

  /**
   * Create a successful channel result
   */
  createSuccessResult(messageId?: string): any {
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
  createErrorResult(error: string): any {
    return {
      success: false,
      channel: this.name,
      error,
      timestamp: new Date(),
    };
  }
}

