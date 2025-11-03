// src/utils/responseHelpers.ts

/**
 * Standardized success response format
 */
export const successResponse = (data: any, message?: string) => {
  return {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Standardized error response format
 */
export const errorResponse = (
  error: string,
  statusCode: number = 400,
  details?: any
) => {
  return {
    success: false,
    error,
    statusCode,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };
};
