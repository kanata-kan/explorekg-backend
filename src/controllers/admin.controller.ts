/**
 * Admin Controller
 * Handles HTTP requests for admin operations
 */

import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { logger } from '../utils/logger';
import { AdminRole } from '../security/roles.enum';

/**
 * @route   POST /api/v1/admin/login
 * @desc    Admin login
 * @access  Public
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Attempt login
    const result = await AdminService.login({ email, password });

    logger.info({ email }, 'Admin logged in successfully');

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid')) {
      logger.warn({ email: req.body.email }, 'Failed login attempt');
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }
    next(error);
  }
};

/**
 * @route   POST /api/v1/admin/logout
 * @desc    Admin logout (client-side token removal)
 * @access  Private
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  // JWT is stateless, so logout is handled client-side
  // This endpoint is mainly for audit logging

  logger.info(
    { adminId: req.admin?.adminId, email: req.admin?.email },
    'Admin logged out'
  );

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

/**
 * @route   GET /api/v1/admin/me
 * @desc    Get current admin info
 * @access  Private
 */
export const getCurrentAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const admin = await AdminService.getAdminById(req.admin.adminId);

    if (!admin) {
      res.status(404).json({
        success: false,
        error: 'Admin not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/admin
 * @desc    Create a new admin
 * @access  Private (SUPER_ADMIN only)
 */
export const createAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !role || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
      return;
    }

    // Validate role
    if (!Object.values(AdminRole).includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
      return;
    }

    const admin = await AdminService.createAdmin({
      email,
      password,
      role,
      firstName,
      lastName,
      createdBy: req.admin?.adminId,
    });

    logger.info(
      { adminId: admin._id, email: admin.email, role: admin.role },
      'New admin created'
    );

    res.status(201).json({
      success: true,
      data: admin,
      message: 'Admin created successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin
 * @desc    Get all admins
 * @access  Private (ADMIN or SUPER_ADMIN)
 */
export const getAllAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const admins = await AdminService.getAllAdmins();

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/:id
 * @desc    Get admin by ID
 * @access  Private (ADMIN or SUPER_ADMIN)
 */
export const getAdminById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const admin = await AdminService.getAdminById(id);

    if (!admin) {
      res.status(404).json({
        success: false,
        error: 'Admin not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/v1/admin/:id
 * @desc    Update admin
 * @access  Private (SUPER_ADMIN only)
 */
export const updateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, isActive } = req.body;

    const admin = await AdminService.updateAdmin(id, {
      firstName,
      lastName,
      role,
      isActive,
    });

    if (!admin) {
      res.status(404).json({
        success: false,
        error: 'Admin not found',
      });
      return;
    }

    logger.info({ adminId: id }, 'Admin updated');

    res.status(200).json({
      success: true,
      data: admin,
      message: 'Admin updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/admin/:id
 * @desc    Delete admin (soft delete)
 * @access  Private (SUPER_ADMIN only)
 */
export const deleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.admin?.adminId === id) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete your own account',
      });
      return;
    }

    const success = await AdminService.deleteAdmin(id);

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Admin not found',
      });
      return;
    }

    logger.info({ adminId: id }, 'Admin deleted');

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/admin/change-password
 * @desc    Change admin password
 * @access  Private
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Current and new passwords are required',
      });
      return;
    }

    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const success = await AdminService.changePassword(
      req.admin.adminId,
      currentPassword,
      newPassword
    );

    if (success) {
      logger.info({ adminId: req.admin.adminId }, 'Password changed');

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Current password is incorrect')
    ) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
};

/**
 * @route   POST /api/v1/admin/:id/reset-password
 * @desc    Reset admin password
 * @access  Private (SUPER_ADMIN only)
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const newPassword = await AdminService.resetPassword(id);

    logger.info({ adminId: id }, 'Password reset by SUPER_ADMIN');

    res.status(200).json({
      success: true,
      data: { newPassword },
      message:
        'Password reset successfully. Please share the new password securely.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/statistics
 * @desc    Get admin statistics
 * @access  Private (SUPER_ADMIN only)
 */
export const getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await AdminService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
