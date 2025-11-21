// src/validation/index.ts

/**
 * Validation Module
 * 
 * Real-time validation layer for booking system.
 * 
 * @module validation
 */

export * from './controllers/validation.controller';
export * from './services/validation.service';
export * from './services/cache.service';
export * from './services/error-mapping.service';
export * from './validators/format.validator';
export * from './validators/business.validator';
export * from './validators/availability.validator';
export { default as validationRouter } from './routes/validation.routes';

