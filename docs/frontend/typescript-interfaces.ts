// // 🚀 ExploreKG Server - TypeScript Interfaces للـFrontend
// // استخدم هذه الـInterfaces في مشروع React/Next.js للتكامل الصحيح

// // ====================================
// // 🌐 Base Types
// // ====================================

// export type Locale = 'en' | 'fr' | 'ar';
// export type Currency = 'USD' | 'KGS' | 'EUR';

// export interface APIResponse<T = any> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   message?: string;
//   statusCode?: number;
//   timestamp: string;
//   path?: string;
// }

// export interface PaginationParams {
//   page?: number;
//   limit?: number;
// }

// export interface PaginatedResponse<T> {
//   items: T[];
//   pagination: {
//     currentPage: number;
//     totalPages: number;
//     totalItems: number;
//     itemsPerPage: number;
//     hasNextPage: boolean;
//     hasPrevPage: boolean;
//   };
// }

// // ====================================
// // 👤 Guest System Types
// // ====================================

// export interface GuestMetadata {
//   userAgent?: string;
//   ipAddress?: string;
//   source?: 'web' | 'mobile' | 'api';
// }

// export interface CreateGuestRequest {
//   email: string;
//   fullName: string;
//   phone: string;
//   locale?: Locale;
//   metadata?: GuestMetadata;
// }

// export interface Guest {
//   sessionId: string;
//   email: string;
//   fullName: string;
//   phone: string;
//   locale: Locale;
//   metadata?: GuestMetadata;
//   canMigrate: boolean;
//   userId?: string;
//   expiresAt: string; // ISO date string
//   createdAt: string;
//   updatedAt: string;
//   isExpired?: boolean; // computed field
// }

// export interface UpdateGuestRequest {
//   email?: string;
//   fullName?: string;
//   phone?: string;
//   locale?: Locale;
//   metadata?: GuestMetadata;
// }

// export interface GuestStatistics {
//   total: number;
//   active: number;
//   expired: number;
//   byLocale: {
//     en: number;
//     fr: number;
//     ar: number;
//   };
//   canMigrate: number;
//   linked: number;
// }

// // ====================================
// // 🎫 Booking System Types
// // ====================================

// export type BookingItemType = 'travel_pack' | 'activity' | 'car';
// export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';
// export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';
// export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'paypal' | 'cash';

// export interface BookingSnapshot {
//   itemType: BookingItemType;
//   itemId: string;
//   title: string;
//   description?: string;
//   pricePerPerson?: number;
//   pricePerUnit?: number;
//   pricePerDay?: number;
//   currency: Currency;
//   locale: Locale;
//   duration?: number;
//   destinations?: string[];
//   activityType?: string;
//   location?: string;
//   carModel?: string;
//   carType?: string;
//   snapshotAt: string;
//   originalData?: any;
// }

// export interface CreateBookingRequest {
//   guestId: string;
//   itemType: BookingItemType;
//   itemId: string;
//   numberOfPersons?: number;
//   numberOfUnits?: number;
//   numberOfDays?: number;
//   startDate?: string; // ISO date string
//   endDate?: string; // ISO date string
//   locale?: Locale;
//   metadata?: Record<string, any>;
// }

// export interface Booking {
//   bookingNumber: string;
//   guestId: string;
//   snapshot: BookingSnapshot;
//   numberOfPersons?: number;
//   numberOfUnits?: number;
//   numberOfDays?: number;
//   startDate?: string;
//   endDate?: string;
//   subtotal: number;
//   tax: number;
//   discount: number;
//   totalPrice: number;
//   currency: Currency;
//   status: BookingStatus;
//   paymentStatus: PaymentStatus;
//   paymentMethod?: PaymentMethod;
//   paymentTransactionId?: string;
//   paidAt?: string;
//   expiresAt: string;
//   cancelledAt?: string;
//   cancellationReason?: string;
//   createdAt: string;
//   updatedAt: string;
//   metadata?: Record<string, any>;

//   // Computed fields
//   isExpired?: boolean;
//   timeRemaining?: number; // milliseconds
// }

// export interface PaymentRequest {
//   paymentMethod: PaymentMethod;
//   paymentTransactionId: string;
//   // Note: Never send sensitive payment data to backend
//   // Use secure payment gateways (Stripe, PayPal, etc.)
// }

// export interface CancelBookingRequest {
//   reason?: string;
// }

// export interface BookingStatistics {
//   total: number;
//   byStatus: Record<BookingStatus, number>;
//   byPaymentStatus: Record<PaymentStatus, number>;
//   revenue: {
//     totalRevenue: number;
//     averageBookingValue: number;
//   };
// }

// // ====================================
// // 🏞️ Travel Packs Types
// // ====================================

// export interface MultiLanguageText {
//   en: string;
//   fr: string;
//   ar?: string;
// }

// export interface Price {
//   amount: number;
//   currency: Currency;
// }

// export interface ImageMetadata {
//   url: string;
//   caption?: MultiLanguageText;
//   altText?: string;
//   metadata?: {
//     width?: number;
//     height?: number;
//     size?: number;
//     format?: string;
//   };
// }

// export interface TravelPack {
//   _id: string;
//   localeGroupId: string;
//   slug: string;
//   title: MultiLanguageText;
//   description: MultiLanguageText;
//   shortDescription?: MultiLanguageText;
//   pricing: Price;
//   duration: number; // days
//   destinations: string[];
//   features: string[];
//   images: ImageMetadata[];
//   highlights?: MultiLanguageText;
//   inclusions?: string[];
//   exclusions?: string[];
//   itinerary?: {
//     day: number;
//     title: MultiLanguageText;
//     description: MultiLanguageText;
//     activities?: string[];
//   }[];
//   difficulty?: 'easy' | 'medium' | 'hard';
//   groupSize?: {
//     min: number;
//     max: number;
//   };
//   season?: string[];
//   tags?: string[];
//   locale: Locale;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface TravelPackFilters extends PaginationParams {
//   locale?: Locale;
//   minPrice?: number;
//   maxPrice?: number;
//   duration?: number;
//   destinations?: string[];
//   difficulty?: string;
//   season?: string;
//   search?: string;
//   isActive?: boolean;
// }

// // ====================================
// // 🎯 Activities Types
// // ====================================

// export type ActivityCategory =
//   | 'adventure'
//   | 'cultural'
//   | 'nature'
//   | 'wellness'
//   | 'family';
// export type ActivityDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

// export interface Activity {
//   _id: string;
//   localeGroupId: string;
//   slug: string;
//   title: MultiLanguageText;
//   description: MultiLanguageText;
//   shortDescription?: MultiLanguageText;
//   category: ActivityCategory;
//   pricing: Price;
//   duration: number; // hours
//   location: string;
//   coordinates?: {
//     latitude: number;
//     longitude: number;
//   };
//   difficulty: ActivityDifficulty;
//   groupSize?: {
//     min: number;
//     max: number;
//   };
//   equipment?: MultiLanguageText;
//   requirements?: MultiLanguageText;
//   images: ImageMetadata[];
//   features: string[];
//   inclusions?: string[];
//   exclusions?: string[];
//   schedule?: {
//     startTime: string;
//     endTime: string;
//     frequency?: string;
//   };
//   season?: string[];
//   tags?: string[];
//   locale: Locale;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface ActivityFilters extends PaginationParams {
//   locale?: Locale;
//   category?: ActivityCategory;
//   difficulty?: ActivityDifficulty;
//   location?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   duration?: number;
//   search?: string;
//   isActive?: boolean;
// }

// // ====================================
// // 🚗 Cars Types
// // ====================================

// export type CarType = 'SUV' | 'sedan' | 'hatchback' | 'van' | 'coupe';
// export type TransmissionType = 'automatic' | 'manual';
// export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';

// export interface CarSpecifications {
//   engine?: string;
//   power?: string;
//   consumption?: string;
//   capacity?: string;
//   features?: string[];
// }

// export interface Car {
//   _id: string;
//   localeGroupId: string;
//   slug: string;
//   name: MultiLanguageText;
//   description: MultiLanguageText;
//   model: string;
//   brand: string;
//   year: number;
//   type: CarType;
//   transmission: TransmissionType;
//   fuelType: FuelType;
//   seatingCapacity: number;
//   pricing: Price; // per day
//   specifications?: CarSpecifications;
//   images: ImageMetadata[];
//   features: string[];
//   isAvailable: boolean;
//   location?: string;
//   insuranceIncluded?: boolean;
//   driverIncluded?: boolean;
//   minimumRentalDays?: number;
//   maximumRentalDays?: number;
//   locale: Locale;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CarFilters extends PaginationParams {
//   locale?: Locale;
//   type?: CarType;
//   transmission?: TransmissionType;
//   fuelType?: FuelType;
//   minPrice?: number;
//   maxPrice?: number;
//   seatingCapacity?: number;
//   brand?: string;
//   isAvailable?: boolean;
//   location?: string;
//   search?: string;
//   isActive?: boolean;
// }

// // ====================================
// // 🔗 Pack Relations Types
// // ====================================

// export type PricingStrategy = 'sum' | 'custom';

// export interface PackRelationActivity {
//   activityId: string;
//   isOptional: boolean;
//   discountPercentage?: number;
//   finalPrice?: number;
// }

// export interface PackRelationCar {
//   carId: string;
//   durationDays: number;
//   discountPercentage?: number;
//   finalPrice?: number;
// }

// export interface PackRelation {
//   _id: string;
//   travelPackLocaleGroupId: string;
//   activities: PackRelationActivity[];
//   cars: PackRelationCar[];
//   pricingStrategy: PricingStrategy;
//   customPrice?: number;
//   globalDiscountPercentage?: number;
//   depositPercentage?: number;
//   locale: Locale;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface PackRelationCalculation {
//   subtotal: number;
//   requiredSubtotal: number;
//   optionalSubtotal: number;
//   globalDiscount: number;
//   finalTotal: number;
//   deposit: number;
//   currency: Currency;
//   breakdown: {
//     activities: {
//       required: { itemId: string; price: number }[];
//       optional: { itemId: string; price: number }[];
//     };
//     cars: { itemId: string; price: number; durationDays: number }[];
//   };
// }

// // ====================================
// // 🔍 Search & Filter Types
// // ====================================

// export interface SearchParams {
//   query?: string;
//   locale?: Locale;
//   category?: string;
//   location?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   dateFrom?: string;
//   dateTo?: string;
//   sortBy?: 'price' | 'duration' | 'rating' | 'name';
//   sortOrder?: 'asc' | 'desc';
// }

// export interface SearchResult<T> {
//   items: T[];
//   totalCount: number;
//   facets?: {
//     categories: { name: string; count: number }[];
//     priceRanges: { min: number; max: number; count: number }[];
//     locations: { name: string; count: number }[];
//   };
// }

// // ====================================
// // 🛡️ Security & Monitoring Types
// // ====================================

// export type SecurityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// export interface SecurityStatus {
//   securityLevel: SecurityLevel;
//   alerts: string[];
//   last5Minutes: {
//     requests: {
//       total: number;
//       blocked: number;
//       suspicious: number;
//     };
//     attacks: {
//       sqlInjection: number;
//       xss: number;
//       noSqlInjection: number;
//       rateLimitExceeded: number;
//     };
//     authentication: {
//       failed: number;
//       successful: number;
//       locked: number;
//     };
//   };
//   uptime: number;
//   timestamp: string;
// }

// export interface SystemHealth {
//   healthScore: 'HEALTHY' | 'WARNING' | 'CRITICAL';
//   uptime: number;
//   memory: {
//     usage: string;
//     heapUsed: string;
//     heapTotal: string;
//   };
//   environment: string;
//   version: string;
//   securityFeatures: {
//     encryptionAtRest: boolean;
//     advancedLogging: boolean;
//     securityHeaders: boolean;
//   };
//   timestamp: string;
// }

// // ====================================
// // 🔧 API Configuration Types
// // ====================================

// export interface APIConfig {
//   baseURL: string;
//   timeout?: number;
//   headers?: Record<string, string>;
//   retryAttempts?: number;
//   retryDelay?: number;
// }

// export interface RequestOptions {
//   method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
//   headers?: Record<string, string>;
//   body?: any;
//   timeout?: number;
//   signal?: AbortSignal;
// }

// // ====================================
// // 🎭 Error Handling Types
// // ====================================

// export interface APIError {
//   status: number;
//   statusText: string;
//   message: string;
//   code?: string;
//   field?: string;
//   timestamp: string;
//   path?: string;
//   originalError?: any;
// }

// export interface ValidationError {
//   field: string;
//   message: string;
//   code?: string;
//   value?: any;
// }

// // ====================================
// // 📱 Frontend State Types
// // ====================================

// export interface AppState {
//   guest: Guest | null;
//   currentBooking: Booking | null;
//   cart: {
//     items: (TravelPack | Activity | Car)[];
//     total: number;
//     currency: Currency;
//   };
//   ui: {
//     loading: boolean;
//     error: string | null;
//     notifications: Notification[];
//   };
//   preferences: {
//     locale: Locale;
//     currency: Currency;
//     theme: 'light' | 'dark';
//   };
// }

// export interface Notification {
//   id: string;
//   type: 'success' | 'error' | 'warning' | 'info';
//   title: string;
//   message: string;
//   duration?: number;
//   timestamp: string;
// }

// // ====================================
// // 🎯 React Hook Types
// // ====================================

// export interface UseExploreKGReturn {
//   // State
//   guest: Guest | null;
//   loading: boolean;
//   error: string | null;

//   // Guest operations
//   createGuest: (data: CreateGuestRequest) => Promise<Guest>;
//   updateGuest: (data: UpdateGuestRequest) => Promise<Guest>;
//   getGuest: (sessionId: string) => Promise<Guest | null>;

//   // Booking operations
//   createBooking: (data: CreateBookingRequest) => Promise<Booking>;
//   getBooking: (bookingNumber: string) => Promise<Booking | null>;
//   processPayment: (
//     bookingNumber: string,
//     data: PaymentRequest
//   ) => Promise<Booking>;
//   cancelBooking: (bookingNumber: string, reason?: string) => Promise<Booking>;

//   // Catalog operations
//   getTravelPacks: (
//     filters?: TravelPackFilters
//   ) => Promise<PaginatedResponse<TravelPack>>;
//   getActivities: (
//     filters?: ActivityFilters
//   ) => Promise<PaginatedResponse<Activity>>;
//   getCars: (filters?: CarFilters) => Promise<PaginatedResponse<Car>>;

//   // Utility
//   refreshData: () => void;
//   clearError: () => void;
// }

// // ====================================
// // 📦 Export All Types
// // ====================================

// export type {
//   // Base
//   APIResponse,
//   PaginatedResponse,
//   PaginationParams,

//   // Guest
//   Guest,
//   CreateGuestRequest,
//   UpdateGuestRequest,
//   GuestStatistics,

//   // Booking
//   Booking,
//   CreateBookingRequest,
//   PaymentRequest,
//   CancelBookingRequest,
//   BookingStatistics,
//   BookingSnapshot,

//   // Catalog
//   TravelPack,
//   Activity,
//   Car,
//   PackRelation,

//   // Filters
//   TravelPackFilters,
//   ActivityFilters,
//   CarFilters,

//   // Security
//   SecurityStatus,
//   SystemHealth,

//   // App
//   AppState,
//   UseExploreKGReturn,
// };

// // Export enums as const objects for JavaScript compatibility
// export const BOOKING_ITEM_TYPES = {
//   TRAVEL_PACK: 'travel_pack' as const,
//   ACTIVITY: 'activity' as const,
//   CAR: 'car' as const,
// } as const;

// export const BOOKING_STATUS = {
//   PENDING: 'pending' as const,
//   CONFIRMED: 'confirmed' as const,
//   CANCELLED: 'cancelled' as const,
//   EXPIRED: 'expired' as const,
// } as const;

// export const PAYMENT_STATUS = {
//   UNPAID: 'unpaid' as const,
//   PAID: 'paid' as const,
//   REFUNDED: 'refunded' as const,
//   FAILED: 'failed' as const,
// } as const;
