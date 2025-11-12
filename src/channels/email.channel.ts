// src/channels/email.channel.ts

/**
 * Email Channel
 * 
 * Implementation of email notifications.
 * Currently uses a simple console.log for demonstration.
 * Can be easily replaced with SendGrid, AWS SES, or any other email provider.
 */

import { BaseChannel } from './base.channel';
import {
  INotification,
  NotificationChannel,
  NotificationType,
  ChannelResult,
} from '../types/notification.types';
import { logger } from '../utils/logger';

/**
 * Email Channel Implementation
 * 
 * Sends notifications via email.
 * 
 * Current implementation: Console logging (for development)
 * Future: Integrate with SendGrid, AWS SES, or similar service
 */
export class EmailChannel extends BaseChannel {
  readonly name = NotificationChannel.EMAIL;

  /**
   * Get notification types supported by email channel
   */
  getSupportedTypes(): NotificationType[] {
    return [
      NotificationType.BOOKING_CONFIRMATION,
      NotificationType.PAYMENT_CONFIRMATION,
      NotificationType.BOOKING_CANCELLATION,
      NotificationType.BOOKING_EXPIRATION,
    ];
  }

  /**
   * Validate recipient has email address
   */
  protected validateRecipient(notification: INotification): boolean {
    if (!notification.recipient.email) {
      logger.warn(
        { notification: notification.type },
        'Email channel: Missing recipient email address'
      );
      return false;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notification.recipient.email)) {
      logger.warn(
        { email: notification.recipient.email },
        'Email channel: Invalid email format'
      );
      return false;
    }

    return true;
  }

  /**
   * Send notification via email
   * 
   * Current implementation: Console logging
   * TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
   */
  async send(notification: INotification): Promise<ChannelResult> {
    try {
      // Validate before sending
      if (!this.validate(notification)) {
        return this.createErrorResult('Validation failed');
      }

      // Extract email details
      const { email, name } = notification.recipient;
      const recipientName = name || email || 'Guest';

      // Log email (current implementation)
      // In production, this would call an email service
      logger.info(
        {
          type: notification.type,
          recipient: email,
          channel: this.name,
        },
        `📧 [EMAIL] ${this.getEmailSubject(notification.type)}`
      );

      // Simulate email sending
      // TODO: Replace with actual email service
      const emailContent = this.formatEmailContent(notification);
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📧 EMAIL NOTIFICATION`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${this.getEmailSubject(notification.type)}`);
      console.log(`\n${emailContent}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // Generate message ID (in real implementation, this comes from email service)
      const messageId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return this.createSuccessResult(messageId);
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          notification: notification.type,
          recipient: notification.recipient.email,
        },
        'Email channel: Failed to send notification'
      );

      return this.createErrorResult(error.message || 'Unknown error');
    }
  }

  /**
   * Get email subject based on notification type
   */
  private getEmailSubject(type: NotificationType): string {
    const subjects: Record<NotificationType, string> = {
      [NotificationType.BOOKING_CONFIRMATION]: 'Booking Confirmation - ExploreKG',
      [NotificationType.PAYMENT_CONFIRMATION]: 'Payment Confirmation - ExploreKG',
      [NotificationType.BOOKING_CANCELLATION]: 'Booking Cancellation - ExploreKG',
      [NotificationType.BOOKING_EXPIRATION]: 'Booking Expired - ExploreKG',
    };

    return subjects[type] || 'Notification from ExploreKG';
  }

  /**
   * Format email content
   * TODO: Replace with template rendering
   */
  private formatEmailContent(notification: INotification): string {
    const { recipient, data } = notification;
    const recipientName = recipient.name || recipient.email || 'Guest';

    switch (notification.type) {
      case NotificationType.BOOKING_CONFIRMATION:
        return `
Hello ${recipientName},

Your booking has been confirmed!

Booking Number: ${data.bookingNumber || 'N/A'}
Item: ${data.itemName || 'N/A'}
Start Date: ${data.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A'}
End Date: ${data.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A'}
Total Amount: ${data.totalAmount ? `$${data.totalAmount}` : 'N/A'}

Thank you for choosing ExploreKG!

Best regards,
ExploreKG Team
        `.trim();

      case NotificationType.PAYMENT_CONFIRMATION:
        return `
Hello ${recipientName},

Your payment has been confirmed!

Booking Number: ${data.bookingNumber || 'N/A'}
Amount Paid: ${data.amountPaid ? `$${data.amountPaid}` : 'N/A'}
Payment Date: ${data.paymentDate ? new Date(data.paymentDate).toLocaleDateString() : 'N/A'}

Thank you for your payment!

Best regards,
ExploreKG Team
        `.trim();

      case NotificationType.BOOKING_CANCELLATION:
        return `
Hello ${recipientName},

Your booking has been cancelled.

Booking Number: ${data.bookingNumber || 'N/A'}
Cancellation Date: ${new Date().toLocaleDateString()}
${data.refundAmount ? `Refund Amount: $${data.refundAmount}` : ''}

If you have any questions, please contact us.

Best regards,
ExploreKG Team
        `.trim();

      case NotificationType.BOOKING_EXPIRATION:
        return `
Hello ${recipientName},

Your booking has expired.

Booking Number: ${data.bookingNumber || 'N/A'}
Expiration Reason: Payment not received within 24 hours

If you would like to make a new booking, please visit our website.

Best regards,
ExploreKG Team
        `.trim();

      default:
        return `Hello ${recipientName},\n\nYou have a new notification from ExploreKG.\n\nBest regards,\nExploreKG Team`;
    }
  }
}

