# Error Handling Strategy

**Project**: ExploreKG Backend  
**Last Updated**: 2025-01-27  
**Version**: 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Error Class Hierarchy](#error-class-hierarchy)
3. [Error Types](#error-types)
4. [When to Use Each Error Type](#when-to-use-each-error-type)
5. [Error Response Format](#error-response-format)
6. [HTTP Status Code Mapping](#http-status-code-mapping)
7. [Examples](#examples)
8. [Best Practices](#best-practices)

---

## Overview

The ExploreKG Backend uses a unified error handling system based on custom error classes that extend `AppError`. All errors are caught by the global error handler middleware and transformed into consistent JSON responses.

### Key Principles

- ✅ All custom errors extend `AppError`
- ✅ Errors are thrown in services and caught in controllers
- ✅ Global error handler transforms errors to structured JSON
- ✅ Error responses include `errorType` for client-side handling
- ✅ Development mode includes stack traces

---

## Error Class Hierarchy

```
AppError (base class)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── BusinessRuleError (422)
├── TooManyRequestsError (429)
└── DatabaseError (500)
```

---

## Error Types

### AppError (Base Class)

**Status Code**: 500 (default)  
**Purpose**: Base class for all custom errors

```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}
```

**When to Use**: Never use directly. Always use a specific error subclass.

---

### ValidationError

**Status Code**: 400  
**Purpose**: Input validation failures, invalid data format

**Properties**:
- `field?: string` - Field name that failed validation
- `code?: string` - Validation error code (e.g., 'DUPLICATE_KEY')

**Example**:
```typescript
throw new ValidationError('Email is required', 'email');
throw new ValidationError('Invalid ID format', 'id', 'INVALID_FORMAT');
```

**When to Use**:
- Required fields missing
- Invalid data format (e.g., invalid ObjectId)
- Type mismatches
- MongoDB validation errors
- Duplicate key errors (MongoDB code 11000)

---

### AuthenticationError

**Status Code**: 401  
**Purpose**: Authentication failures

**Example**:
```typescript
throw new AuthenticationError('Invalid email or password');
throw new AuthenticationError('Token expired');
```

**When to Use**:
- Invalid credentials
- Missing authentication token
- Expired token
- Invalid token format

---

### AuthorizationError

**Status Code**: 403  
**Purpose**: Authorization failures (user authenticated but lacks permission)

**Example**:
```typescript
throw new AuthorizationError('Insufficient permissions');
throw new AuthorizationError('Admin access required');
```

**When to Use**:
- User lacks required permissions
- Role-based access denied
- Resource ownership validation failed

---

### NotFoundError

**Status Code**: 404  
**Purpose**: Resource not found

**Properties**:
- `resource?: string` - Resource type that was not found

**Example**:
```typescript
throw new NotFoundError('Booking not found', 'booking');
throw new NotFoundError('Car not found');
```

**When to Use**:
- Entity not found by ID
- Resource doesn't exist
- Invalid reference to non-existent resource

---

### ConflictError

**Status Code**: 409  
**Purpose**: Resource conflicts (e.g., duplicate entries)

**Properties**:
- `field?: string` - Field that caused the conflict

**Example**:
```typescript
throw new ConflictError('Email already exists', 'email');
throw new ConflictError('Booking number already exists', 'bookingNumber');
```

**When to Use**:
- Duplicate unique values
- Resource already exists
- Concurrent modification conflicts

---

### BusinessRuleError

**Status Code**: 422 (Unprocessable Entity)  
**Purpose**: Business logic violations (non-technical domain rules)

**Properties**:
- `rule?: string` - Business rule identifier
- `context?: Record<string, any>` - Additional context about the violation

**Example**:
```typescript
throw new BusinessRuleError(
  'Maximum booking limit exceeded',
  'MAX_BOOKINGS_EXCEEDED',
  { currentBookings: 5, maxAllowed: 3 }
);

throw new BusinessRuleError(
  'Booking cannot be cancelled after start date',
  'CANCELLATION_DEADLINE_PASSED',
  { startDate: '2025-02-01', currentDate: '2025-02-05' }
);
```

**When to Use**:
- Business logic violations
- Domain rule violations
- State transition invalidations
- Resource availability constraints
- Booking limits exceeded
- Date/time constraints violated

**Note**: Use `BusinessRuleError` for logical violations, not technical errors. For example:
- ✅ "Booking limit exceeded" → `BusinessRuleError`
- ❌ "Invalid date format" → `ValidationError`

---

### TooManyRequestsError

**Status Code**: 429  
**Purpose**: Rate limiting violations

**Properties**:
- `retryAfter?: number` - Seconds to wait before retrying

**Example**:
```typescript
throw new TooManyRequestsError('Too many requests', 60);
```

**When to Use**:
- Rate limit exceeded
- Too many requests in time window

---

### DatabaseError

**Status Code**: 500  
**Purpose**: Database operation failures

**Properties**:
- `operation?: string` - Database operation that failed

**Example**:
```typescript
throw new DatabaseError('Failed to save booking', 'save');
```

**When to Use**:
- Database connection failures
- Unexpected database errors
- Transaction failures

**Note**: This is typically used for unexpected database errors. Most database errors (validation, duplicate keys) are converted to `ValidationError` or `ConflictError` by the error handler.

---

## When to Use Each Error Type

| Scenario | Error Type | Example |
|----------|-----------|---------|
| Missing required field | `ValidationError` | "Email is required" |
| Invalid data format | `ValidationError` | "Invalid ObjectId format" |
| Invalid credentials | `AuthenticationError` | "Invalid email or password" |
| Missing token | `AuthenticationError` | "Authentication required" |
| Insufficient permissions | `AuthorizationError` | "Admin access required" |
| Resource not found | `NotFoundError` | "Booking not found" |
| Duplicate entry | `ConflictError` | "Email already exists" |
| Business rule violation | `BusinessRuleError` | "Booking limit exceeded" |
| Rate limit exceeded | `TooManyRequestsError` | "Too many requests" |
| Database failure | `DatabaseError` | "Failed to save booking" |

---

## Error Response Format

All errors are transformed into a consistent JSON structure:

### Standard Response

```json
{
  "success": false,
  "error": "Error message",
  "errorType": "ValidationError",
  "statusCode": 400,
  "timestamp": "2025-01-27T10:30:00.000Z",
  "path": "/api/v1/bookings"
}
```

### ValidationError Response

```json
{
  "success": false,
  "error": "Email is required",
  "errorType": "ValidationError",
  "statusCode": 400,
  "timestamp": "2025-01-27T10:30:00.000Z",
  "path": "/api/v1/guests",
  "field": "email",
  "code": "REQUIRED"
}
```

### BusinessRuleError Response

```json
{
  "success": false,
  "error": "Maximum booking limit exceeded",
  "errorType": "BusinessRuleError",
  "statusCode": 422,
  "timestamp": "2025-01-27T10:30:00.000Z",
  "path": "/api/v1/bookings",
  "rule": "MAX_BOOKINGS_EXCEEDED",
  "context": {
    "currentBookings": 5,
    "maxAllowed": 3
  }
}
```

### Development Mode Response

In development mode (`NODE_ENV=development`), additional fields are included:

```json
{
  "success": false,
  "error": "Internal Server Error",
  "errorType": "AppError",
  "statusCode": 500,
  "timestamp": "2025-01-27T10:30:00.000Z",
  "path": "/api/v1/bookings",
  "stack": "Error: Internal Server Error\n    at ...",
  "originalError": "Original error message"
}
```

---

## HTTP Status Code Mapping

| Error Class | HTTP Status Code | Description |
|-------------|------------------|-------------|
| `ValidationError` | 400 | Bad Request |
| `AuthenticationError` | 401 | Unauthorized |
| `AuthorizationError` | 403 | Forbidden |
| `NotFoundError` | 404 | Not Found |
| `ConflictError` | 409 | Conflict |
| `BusinessRuleError` | 422 | Unprocessable Entity |
| `TooManyRequestsError` | 429 | Too Many Requests |
| `DatabaseError` | 500 | Internal Server Error |
| `AppError` (default) | 500 | Internal Server Error |

---

## Examples

### Example 1: Validation Error in Service

```typescript
// src/services/booking.service.ts
export const createBooking = async (data: CreateBookingData) => {
  if (!data.guestId) {
    throw new ValidationError('Guest ID is required', 'guestId');
  }

  if (!Types.ObjectId.isValid(data.guestId)) {
    throw new ValidationError('Invalid guest ID format', 'guestId');
  }

  // ... rest of logic
};
```

### Example 2: Business Rule Error

```typescript
// src/services/booking.service.ts
export const createBooking = async (data: CreateBookingData) => {
  // Check booking limit
  const existingBookings = await Booking.countDocuments({
    guestId: data.guestId,
    status: { $in: ['pending', 'confirmed'] },
  });

  if (existingBookings >= MAX_BOOKINGS_PER_GUEST) {
    throw new BusinessRuleError(
      'Maximum booking limit exceeded',
      'MAX_BOOKINGS_EXCEEDED',
      {
        currentBookings: existingBookings,
        maxAllowed: MAX_BOOKINGS_PER_GUEST,
      }
    );
  }

  // ... rest of logic
};
```

### Example 3: Not Found Error

```typescript
// src/services/booking.service.ts
export const findByBookingNumber = async (
  bookingNumber: string
): Promise<IBooking> => {
  const booking = await Booking.findOne({ bookingNumber }).exec();

  if (!booking) {
    throw new NotFoundError('Booking not found', 'booking');
  }

  return booking;
};
```

### Example 4: Conflict Error

```typescript
// src/services/admin.service.ts
export const createAdmin = async (data: CreateAdminData): Promise<IAdmin> => {
  const existingAdmin = await Admin.findOne({
    email: data.email.toLowerCase(),
  });

  if (existingAdmin) {
    throw new ConflictError('Admin with this email already exists', 'email');
  }

  // ... rest of logic
};
```

---

## Best Practices

### 1. Throw Errors in Services, Not Controllers

✅ **Good**:
```typescript
// Service
export const findById = async (id: string) => {
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  return booking;
};

// Controller
export const getBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.findById(req.params.id);
    res.json(successResponse(booking));
  } catch (error) {
    next(error); // Let error handler process it
  }
};
```

❌ **Bad**:
```typescript
// Controller
export const getBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(successResponse(booking));
};
```

### 2. Use Specific Error Types

✅ **Good**:
```typescript
throw new ValidationError('Email is required', 'email');
throw new NotFoundError('Booking not found', 'booking');
throw new BusinessRuleError('Booking limit exceeded', 'MAX_BOOKINGS');
```

❌ **Bad**:
```typescript
throw new Error('Something went wrong');
throw new AppError('Error');
```

### 3. Provide Context for Business Rules

✅ **Good**:
```typescript
throw new BusinessRuleError(
  'Booking cannot be cancelled',
  'CANCELLATION_NOT_ALLOWED',
  {
    bookingStatus: 'confirmed',
    startDate: booking.startDate,
    reason: 'Booking starts in less than 24 hours',
  }
);
```

### 4. Use Error Codes for Client-Side Handling

✅ **Good**:
```typescript
throw new ValidationError('Duplicate email', 'email', 'DUPLICATE_EMAIL');
```

This allows clients to handle specific error codes:
```typescript
if (error.code === 'DUPLICATE_EMAIL') {
  // Show specific message
}
```

### 5. Don't Expose Internal Details

✅ **Good**:
```typescript
throw new DatabaseError('Failed to save booking');
```

❌ **Bad**:
```typescript
throw new DatabaseError(`MongoDB connection failed: ${err.message}`);
```

### 6. Use BusinessRuleError for Domain Logic

✅ **Good**:
```typescript
// Business rule: booking limit
if (bookings.length >= MAX_BOOKINGS) {
  throw new BusinessRuleError('Booking limit exceeded', 'MAX_BOOKINGS');
}

// Business rule: cancellation deadline
if (booking.startDate < new Date()) {
  throw new BusinessRuleError(
    'Cannot cancel past booking',
    'CANCELLATION_DEADLINE_PASSED'
  );
}
```

---

## Summary

- ✅ All errors extend `AppError`
- ✅ Use specific error types (`ValidationError`, `NotFoundError`, etc.)
- ✅ Throw errors in services, catch in controllers
- ✅ Global error handler transforms errors to JSON
- ✅ Use `BusinessRuleError` for domain logic violations
- ✅ Provide context for better error handling
- ✅ Use error codes for client-side handling

---

**For questions or updates to this guide, please refer to the project maintainers.**

