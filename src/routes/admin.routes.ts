/**
 * Admin Routes
 * Defines all endpoints for admin operations
 */

import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import {
  authenticate,
  requireSuperAdmin,
  requireAdminOrHigher,
  auditLog,
  auditAuth,
  AuditAction,
} from '../security';

const router = Router();

/**
 * @route   POST /api/v1/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', auditAuth(AuditAction.LOGIN), adminController.login);

/**
 * @route   POST /api/v1/admin/logout
 * @desc    Admin logout
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  auditAuth(AuditAction.LOGOUT),
  adminController.logout
);

/**
 * @route   GET /api/v1/admin/me
 * @desc    Get current admin info
 * @access  Private
 */
router.get('/me', authenticate, adminController.getCurrentAdmin);

/**
 * @route   POST /api/v1/admin/change-password
 * @desc    Change admin password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  auditLog(AuditAction.UPDATE_ADMIN),
  adminController.changePassword
);

/**
 * @route   GET /api/v1/admin/statistics
 * @desc    Get admin statistics
 * @access  Private (SUPER_ADMIN only)
 */
router.get(
  '/statistics',
  authenticate,
  requireSuperAdmin,
  auditLog(AuditAction.VIEW_ADMIN),
  adminController.getStatistics
);

/**
 * @route   POST /api/v1/admin
 * @desc    Create a new admin
 * @access  Private (SUPER_ADMIN only)
 */
router.post(
  '/',
  authenticate,
  requireSuperAdmin,
  auditLog(AuditAction.CREATE_ADMIN),
  adminController.createAdmin
);

/**
 * @route   GET /api/v1/admin
 * @desc    Get all admins
 * @access  Private (ADMIN or SUPER_ADMIN)
 */
router.get(
  '/',
  authenticate,
  requireAdminOrHigher,
  auditLog(AuditAction.VIEW_ADMIN),
  adminController.getAllAdmins
);

/**
 * @route   GET /api/v1/admin/:id
 * @desc    Get admin by ID
 * @access  Private (ADMIN or SUPER_ADMIN)
 */
router.get(
  '/:id',
  authenticate,
  requireAdminOrHigher,
  auditLog(AuditAction.VIEW_ADMIN),
  adminController.getAdminById
);

/**
 * @route   PATCH /api/v1/admin/:id
 * @desc    Update admin
 * @access  Private (SUPER_ADMIN only)
 */
router.patch(
  '/:id',
  authenticate,
  requireSuperAdmin,
  auditLog(AuditAction.UPDATE_ADMIN),
  adminController.updateAdmin
);

/**
 * @route   DELETE /api/v1/admin/:id
 * @desc    Delete admin (soft delete)
 * @access  Private (SUPER_ADMIN only)
 */
router.delete(
  '/:id',
  authenticate,
  requireSuperAdmin,
  auditLog(AuditAction.DELETE_ADMIN),
  adminController.deleteAdmin
);

/**
 * @route   POST /api/v1/admin/:id/reset-password
 * @desc    Reset admin password
 * @access  Private (SUPER_ADMIN only)
 */
router.post(
  '/:id/reset-password',
  authenticate,
  requireSuperAdmin,
  auditLog(AuditAction.UPDATE_ADMIN),
  adminController.resetPassword
);

export default router;

/**
 * ✅ Admin Routes Features:
 * - POST /admin/login - Admin login (public)
 * - POST /admin/logout - Admin logout (authenticated)
 * - GET /admin/me - Get current admin info (authenticated)
 * - POST /admin/change-password - Change password (authenticated)
 * - GET /admin/statistics - Get statistics (SUPER_ADMIN)
 * - POST /admin - Create admin (SUPER_ADMIN)
 * - GET /admin - Get all admins (ADMIN+)
 * - GET /admin/:id - Get admin by ID (ADMIN+)
 * - PATCH /admin/:id - Update admin (SUPER_ADMIN)
 * - DELETE /admin/:id - Delete admin (SUPER_ADMIN)
 * - POST /admin/:id/reset-password - Reset password (SUPER_ADMIN)
 * - Full RBAC protection with audit logging
 */
