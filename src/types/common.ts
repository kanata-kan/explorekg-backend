// Common types for the tourism booking system
import { Request as ExpressRequest } from 'express';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface LanguageSupport {
  en: string;
  fr: string;
  [key: string]: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
  timestamp?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    field?: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

/**
 * ValidatedRequest type for controllers
 * Extends Express Request with validated body/params/query from Zod validation
 */
export interface ValidatedRequest<TBody = any, TParams = any, TQuery = any> extends ExpressRequest {
  validatedBody?: TBody;
  validatedParams?: TParams;
  validatedQuery?: TQuery;
  sanitizedQuery?: TQuery;
  user?: {
    _id: string;
    email: string;
    role: string;
  };
}

// For use in Schema Models later
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  coordinates?: LocationCoordinates;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

export interface MediaFile {
  url: string;
  type: 'image' | 'video' | 'document';
  description?: LanguageSupport;
  isPrimary?: boolean;
}

// Base interface للكيانات مع multilingual support
export interface MultilingualEntity {
  name: LanguageSupport;
  description: LanguageSupport;
  slug: string;
}

// User roles for tourism system
export type UserRole = 'tourist' | 'guide' | 'business_owner' | 'admin';

// Booking status
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'refunded';

// Business types in tourism system
export type BusinessType =
  | 'hotel'
  | 'restaurant'
  | 'tour_operator'
  | 'transport'
  | 'attraction';
