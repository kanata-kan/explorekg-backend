# Import and Documentation Conventions

**Project**: ExploreKG Backend  
**Last Updated**: 2025-01-27  
**Version**: 1.0

---

## Table of Contents

1. [Import Order Rules](#import-order-rules)
2. [Folder Naming Conventions](#folder-naming-conventions)
3. [Barrel Export Usage](#barrel-export-usage)
4. [Docstring Format Conventions](#docstring-format-conventions)
5. [Folder-Level Documentation Structure](#folder-level-documentation-structure)

---

## Import Order Rules

### Standard Import Order

All imports must follow this exact order:

1. **External Dependencies** (npm packages)
2. **Configuration** (config files, environment variables)
3. **Security** (security module exports)
4. **Middleware** (middleware functions)
5. **Routes** (route definitions)
6. **Services** (business logic services)
7. **Models** (database models)
8. **Utils** (utility functions)
9. **Types** (TypeScript type definitions)

### Visual Separation

Each group must be separated by comment blocks:

```typescript
// ============================================
// External Dependencies
// ============================================
import express from 'express';
import helmet from 'helmet';

// ============================================
// Configuration
// ============================================
import { ENV } from './config/env';

// ============================================
// Security
// ============================================
import { authenticate } from './security';

// ============================================
// Middleware
// ============================================
import { errorHandler } from './middleware';

// ============================================
// Routes
// ============================================
import bookingRouter from './routes/booking.routes';

// ============================================
// Services
// ============================================
import * as bookingService from './services/booking.service';

// ============================================
// Models
// ============================================
import Booking from './models/booking.model';

// ============================================
// Utils
// ============================================
import { logger } from './utils/logger';

// ============================================
// Types
// ============================================
import type { BookingStatus } from './types';
```

### Alphabetical Order Within Groups

Within each group, imports should be alphabetically sorted:

```typescript
// ✅ Good - Alphabetical
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

// ❌ Avoid - Random order
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
```

---

## Folder Naming Conventions

### Main Folders

All main folders use **lowercase**:

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── security/
├── services/
├── types/
├── utils/
└── validators/
```

### Subfolders

Subfolders use **kebab-case**:

```
docs/
├── api/
│   ├── admin/
│   └── user/
├── architecture/
├── data-specs/
└── quick-reference/
```

### File Naming

Files follow the pattern: `entity.layer.ts`

- **Controllers**: `entity.controller.ts` (e.g., `booking.controller.ts`)
- **Services**: `entity.service.ts` (e.g., `booking.service.ts`)
- **Models**: `entity.model.ts` (e.g., `booking.model.ts`)
- **Routes**: `entity.routes.ts` (e.g., `booking.routes.ts`)
- **Validators**: `entity.validator.ts` (e.g., `booking.validator.ts`)
- **Utils**: `utilName.ts` (e.g., `logger.ts`, `AppError.ts`)

---

## Barrel Export Usage

### When to Use Barrel Exports

Barrel exports (`index.ts`) are **required** for:

✅ **middleware** - All middleware functions must be exported through `middleware/index.ts`  
✅ **security** - All security exports must be exported through `security/index.ts`  
✅ **types** - All type definitions must be exported through `types/index.ts`

### When NOT to Use Barrel Exports

Barrel exports are **prohibited** for:

❌ **services** - Prevents circular dependencies, maintains explicit dependencies  
❌ **controllers** - Maintains explicit dependencies, prevents accidental imports  
❌ **models** - Prevents circular dependencies, maintains explicit model usage

### Barrel Export Structure

**Example**: `src/middleware/index.ts`

```typescript
/**
 * Middleware Barrel Export
 * Central export point for all middleware
 */

// General middleware
export { errorHandler } from './errorHandler';

// Utility middleware
export { asyncHandler } from './asyncHandler';
export { languageMiddleware } from './language';
```

**Usage**:
```typescript
import { errorHandler, languageMiddleware } from './middleware';
```

---

## Docstring Format Conventions

### Function Documentation

All functions must have JSDoc-style comments in English:

```typescript
/**
 * Creates a new booking for a guest.
 * 
 * @param data - Booking creation data including guestId, itemType, and itemId
 * @returns Promise resolving to the created booking document
 * @throws {NotFoundError} If guest or item is not found
 * @throws {ValidationError} If booking data is invalid
 */
export const createBooking = async (
  data: CreateBookingData
): Promise<IBooking> => {
  // Implementation
};
```

### Class Documentation

All classes must have class-level documentation:

```typescript
/**
 * Authentication Service
 * Handles JWT generation, verification, and password hashing
 */
export class AuthService {
  // Implementation
}
```

### Interface Documentation

All interfaces must have interface-level documentation:

```typescript
/**
 * Booking creation data structure
 */
export interface CreateBookingData {
  guestId: string;
  itemType: BookingItemType;
  itemId: string;
  // ... other fields
}
```

### File Header Documentation

All files must start with a file-level comment:

```typescript
/**
 * Booking Service
 * Handles all booking-related business logic including creation,
 * status updates, and payment processing
 */

import { Booking } from '../models/booking.model';
// ... rest of file
```

### Documentation Rules

1. **Language**: All documentation must be in **English only**
2. **Style**: Use JSDoc format with `/** */` comments
3. **Completeness**: Document all public functions, classes, and interfaces
4. **Clarity**: Use clear, concise sentences
5. **Examples**: Include examples for complex functions when helpful

---

## Folder-Level Documentation Structure

### Documentation File Naming

All documentation files must follow these conventions:

- **Main documentation**: `README.md` (for folder overview)
- **Feature documentation**: `FEATURE-NAME.md` (e.g., `BOOKING-SYSTEM.md`)
- **API documentation**: `ENTITY-API.md` (e.g., `BOOKING-API.md`)
- **Architecture documentation**: `TOPIC.md` (e.g., `TECHNICAL-ARCHITECTURE.md`)

### Documentation Structure

All documentation files must follow this structure:

```markdown
# Title

**Project**: ExploreKG Backend  
**Last Updated**: YYYY-MM-DD  
**Version**: X.Y

---

## Table of Contents

1. [Section 1](#section-1)
2. [Section 2](#section-2)

---

## Section 1

Content here...

---

## Section 2

Content here...

---

**Related Documentation**: [Link to related docs](./RELATED.md)
```

### Documentation Hierarchy

Use consistent heading hierarchy:

- `#` - Main title (file name)
- `##` - Major sections
- `###` - Subsections
- `####` - Sub-subsections (use sparingly)

### Code Blocks

Always specify language for code blocks:

````markdown
```typescript
// TypeScript code
```

```bash
# Shell commands
```

```json
{
  "key": "value"
}
```
````

---

## Summary

### Import Order

1. External Dependencies
2. Configuration
3. Security
4. Middleware
5. Routes
6. Services
7. Models
8. Utils
9. Types

### Naming Conventions

- **Files**: `entity.layer.ts` (camelCase)
- **Folders**: `lowercase` or `kebab-case`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Barrel Exports

- ✅ Use for: middleware, security, types
- ❌ Avoid for: services, controllers, models

### Documentation

- **Language**: English only
- **Format**: JSDoc style
- **Structure**: Consistent hierarchy
- **Completeness**: Document all public APIs

---

**For coding style guidelines, see**: [STYLE_GUIDE.md](./STYLE_GUIDE.md)  
**For developer onboarding, see**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

