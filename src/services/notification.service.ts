import { NotificationPolicy } from '../policies/notification.policy';
import { EmailChannel } from '../channels/email.channel';
import { logger } from '../utils/logger';

/**
 * Notification Service
 *
 * Central service for all notifications.
 * Handles routing, validation, and sending.
 */
export class NotificationService {
  /**
   * Registered channels
   * Channels are registered at startup and can be added dynamically
   */
  private static channels = new Map<string, any>();

  /**
   * Initialize notification service
   * Registers all available channels
   *
   * Should be called at application startup
   */
  static initialize() {
    // Register email channel
    const emailChannel = new EmailChannel();
    this.registerChannel(emailChannel);

    logger.info(
      {
        channels: Array.from(this.channels.keys()),
      },
      'Notification service initialized'
    );
  }

  /**
   * Register a notification channel
   *
   * @param channel - Channel to register
   */
  static registerChannel(channel: any) {
    if (!channel.isEnabled()) {
      logger.warn({ channel: channel.name }, 'Attempted to register disabled channel');
      return;
    }

    this.channels.set(channel.name, channel);
    logger.info({ channel: channel.name }, 'Notification channel registered');
  }

  /**
   * Send notification from event
   *
   * This is the main entry point for services.
   * Services call this method with an event, and the service
   * handles the rest (policy, channel selection, sending).
   *
   * @param event - Notification event
   * @returns Promise resolving when all notifications are sent
   */
  static async sendEvent(event: any): Promise<void> {
    try {
      // Process event through policy
      const notificationData = NotificationPolicy.processEvent(event);

      if (!notificationData) {
        logger.debug(
          { type: event.type },
          'Notification not sent: Policy determined it should not be sent'
        );
        return;
      }

      // Create notification object
      const notification = {
        type: notificationData.type,
        recipient: notificationData.recipient,
        data: notificationData.data,
        channels: notificationData.channels,
        priority: notificationData.priority,
        metadata: notificationData.metadata,
      };

      // Send notification
      await this.send(notification);
    } catch (error: any) {
      // Log error but don't throw - notification failure shouldn't break the main flow
      logger.error(
        {
          error: error.message,
          type: event.type,
          recipient: event.recipient,
        },
        'Failed to send notification event'
      );
    }
  }

  /**
   * Send notification directly
   *
   * Use this when you have a fully formed notification object.
   * For most cases, use sendEvent() instead.
   *
   * @param notification - Notification to send
   * @returns Promise resolving when all channels have sent
   */
  static async send(notification: any): Promise<void> {
    const results: any[] = [];

    // Send through each specified channel
    for (const channelName of notification.channels) {
      try {
        const result = await this.sendToChannel(notification, channelName);
        results.push(result);
      } catch (error: any) {
        logger.error(
          {
            error: error.message,
            channel: channelName,
            type: notification.type,
          },
          'Failed to send notification to channel'
        );
        results.push({
          success: false,
          channel: channelName,
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    // Log results
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    if (failureCount > 0) {
      logger.warn(
        {
          type: notification.type,
          success: successCount,
          failures: failureCount,
        },
        'Some notification channels failed'
      );
    } else {
      logger.info(
        {
          type: notification.type,
          channels: notification.channels,
        },
        'Notification sent successfully'
      );
    }
  }

  /**
   * Send notification to a specific channel
   *
   * @param notification - Notification to send
   * @param channelName - Channel to use
   * @returns Promise resolving to channel result
   */
  static async sendToChannel(notification: any, channelName: string): Promise<any> {
    // Get channel
    const channel = this.channels.get(channelName);
    if (!channel) {
      const error = `Channel ${channelName} is not registered`;
      logger.error({ channel: channelName }, error);
      throw new Error(error);
    }

    // Check if channel is enabled
    if (!channel.isEnabled()) {
      const error = `Channel ${channelName} is disabled`;
      logger.warn({ channel: channelName }, error);
      throw new Error(error);
    }

    // Validate notification
    if (!channel.validate(notification)) {
      const error = `Notification validation failed for channel ${channelName}`;
      logger.warn(
        {
          channel: channelName,
          type: notification.type,
        },
        error
      );
      throw new Error(error);
    }

    // Send notification
    return await channel.send(notification);
  }

  /**
   * Get all registered channels
   */
  static getChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Get channel by name
   */
  static getChannel(channelName: string): any {
    return this.channels.get(channelName);
  }

  /**
   * Check if a channel is registered and enabled
   */
  static isChannelAvailable(channelName: string): boolean {
    const channel = this.channels.get(channelName);
    return channel !== undefined && channel.isEnabled();
  }
}

/**
 * Initialize notification service at module load
 * This ensures channels are registered when the service is imported
 */
NotificationService.initialize();

/**
 * Export service instance
 */
export const notificationService = NotificationService;

