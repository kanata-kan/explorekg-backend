/**
 * Controllers Barrel Export
 * Central export point for all controllers
 * Using named exports to avoid duplicate export errors
 */

// Activity controllers
export {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getStatistics as getActivityStatistics,
  getAvailableActivities,
  updateAvailability as updateActivityAvailability,
  associateWithPacks as associateActivityWithPacks,
} from './activity.controller';

// Admin controllers
export * from './admin.controller';

// Booking controllers
export {
  createBooking,
  getBooking,
  getGuestBookings,
  updateBookingStatus,
  markBookingAsPaid,
  cancelBooking,
  getAllActiveBookings,
  getStatistics as getBookingStatistics,
  cleanupExpired as cleanupExpiredBookings,
} from './booking.controller';

// Car controllers
export {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getStatistics as getCarStatistics,
  getAvailableCars,
  updateAvailability as updateCarAvailability,
  associateWithPacks as associateCarWithPacks,
} from './car.controller';

// Guest controllers
export {
  createGuest,
  getGuest,
  getGuestByEmail,
  updateGuest,
  extendExpiration,
  linkToUser,
  deleteGuest,
  getStatistics as getGuestStatistics,
  getAllGuests,
  cleanupExpired as cleanupExpiredGuests,
} from './guest.controller';

// PackRelation controllers
export * from './packRelation.controller';

// TravelPack controllers
export * from './travelPack.controller';
