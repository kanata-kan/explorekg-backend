/**
 * Services Barrel Export
 * Central export point for all services
 * Using named exports to avoid duplicate export errors
 */

// Activity service
export { ActivityService } from './activity.service';

// Admin service
export * from './admin.service';

// Booking service
export {
  createBooking,
  findByBookingNumber,
  findByGuestId,
  updateBookingStatus,
  markAsPaid,
  cancelBooking,
  findActiveBookings,
  cleanExpiredBookings,
  getStatistics as getBookingStatistics,
  BookingService,
  type CreateBookingData,
  type BookingStatistics,
} from './booking.service';

// Car service
export {
  findMany as findManyCars,
  findById as findCarById,
  findByLocaleGroupId as findCarsByLocaleGroupId,
  create as createCar,
  update as updateCar,
  remove as removeCar,
  findAvailable as findAvailableCars,
  findByLocale as findCarsByLocale,
  getStatistics as getCarStatistics,
  updateAvailability as updateCarAvailability,
  associateWithPacks as associateCarWithPacks,
  CarService,
} from './car.service';

// Guest service
export {
  createGuest,
  findBySessionId,
  findByEmail,
  updateGuest,
  extendExpiration,
  linkToUser,
  findActiveGuests,
  cleanExpiredGuests,
  getStatistics as getGuestStatistics,
  deleteGuest,
  isValidSessionId,
  GuestService,
  type CreateGuestData,
  type UpdateGuestData,
  type GuestStatistics,
} from './guest.service';

// PackRelation service
export * from './packRelation.service';

// SecurityMonitoring service
export * from './securityMonitoring.service';

// TravelPack service
export {
  findMany as findManyTravelPacks,
  findByIdOrSlug,
  createOne as createTravelPack,
  updateByIdOrSlug as updateTravelPack,
  archiveByIdOrSlug as archiveTravelPack,
  getStatistics as getTravelPackStatistics,
  findByLocaleGroupId as findTravelPacksByLocaleGroupId,
} from './travelPack.service';
