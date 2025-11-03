/**
 * Express Request Type Extensions
 *
 * يوسّع Request type لإضافة خصائص إضافية
 * للمصادقة والتحقق من الملكية
 */

import { IAdmin } from '../models/admin.model';
import { IGuest } from '../models/guest.model';
import { IBooking } from '../models/booking.model';

declare global {
  namespace Express {
    interface Request {
      // Admin authentication (from JWT)
      admin?: {
        adminId: string;
        email: string;
        role: string;
      };

      // Guest & Booking entities (from ownership validation middleware)
      guest?: IGuest;
      booking?: IBooking;

      // Guest session ID (from headers/query)
      guestSessionId?: string;
    }
  }
}

export {};
