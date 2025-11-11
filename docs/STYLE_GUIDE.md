# Code Style Guide

**Project**: ExploreKG Backend  
**Last Updated**: 2025-01-27  
**Version**: 1.0

---

## Table of Contents

1. [Import Patterns](#import-patterns)
2. [Import Order](#import-order)
3. [Naming Conventions](#naming-conventions)
4. [Barrel Exports](#barrel-exports)
5. [File Organization](#file-organization)

---

## Import Patterns

### Services

**Pattern**: `import * as serviceName from './services/serviceName.service'`

**Rationale**: Services are typically used as namespaces with multiple functions. Using `import * as` allows accessing all service methods through a clear namespace.

**Example**:
```typescript
import * as bookingService from '../services/booking.service';
import * as guestService from '../services/guest.service';

const booking = await bookingService.createBooking(data);
const guest = await guestService.findBySessionId(sessionId);
```

**Note**: Do not use barrel exports for services to prevent circular dependencies and maintain explicit dependencies.

---

### Models

**Pattern**: `import ModelName from './models/modelName.model'`

**Rationale**: Models are typically default exports from Mongoose schemas. Use default import syntax.

**Example**:
```typescript
import Booking from '../models/booking.model';
import Guest from '../models/guest.model';
import TravelPack from '../models/travelPack.model';

const booking = await Booking.findById(id);
const guest = await Guest.findBySessionId(sessionId);
```

**Note**: Do not use barrel exports for models to prevent circular dependencies.

---

### Types

**Pattern**: `import { TypeName } from './types'`

**Rationale**: Types are typically named exports. Use barrel export from the types folder for cleaner imports.

**Example**:
```typescript
import { BookingStatus, PaymentStatus } from '../types';
import type { CreateBookingData } from '../types';
```

---

### Utils

**Pattern**: `import { utilName } from './utils/utilName'`

**Rationale**: Utils are typically individual named exports. Import specific utilities as needed.

**Example**:
```typescript
import { logger } from '../utils/logger';
import { NotFoundError, ValidationError } from '../utils/AppError';
```

**Note**: Utils can use barrel exports if multiple related utilities exist in the same file.

---

### Middleware

**Pattern**: `import { middlewareName } from './middleware'`

**Rationale**: Use barrel export from the middleware folder for cleaner imports.

**Example**:
```typescript
import { errorHandler, languageMiddleware, asyncHandler } from '../middleware';
```

---

### Security

**Pattern**: `import { securityFunction } from './security'`

**Rationale**: Use barrel export from the security module for all security-related imports.

**Example**:
```typescript
import { authenticate, requirePermission, validateBookingOwnership } from '../security';
import { inputSanitizer, generalRateLimit } from '../security';
```

---

### Controllers

**Pattern**: `import * as controller from '../controllers/entity.controller'`

**Rationale**: Controllers are typically used as namespaces in route definitions.

**Example**:
```typescript
import * as bookingController from '../controllers/booking.controller';
import * as guestController from '../controllers/guest.controller';

router.post('/', bookingController.createBooking);
router.get('/:id', guestController.getGuest);
```

**Note**: Do not use barrel exports for controllers to maintain explicit dependencies.

---

### Routes

**Pattern**: `import routerName from './routes/routerName.routes'`

**Rationale**: Routes are typically default exports from Express Router definitions.

**Example**:
```typescript
import bookingRouter from './routes/booking.routes';
import guestRouter from './routes/guest.routes';

app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/guests', guestRouter);
```

---

## Import Order

Imports must follow a strict order with clear visual separation:

1. **External Dependencies** (npm packages)
2. **Configuration** (config files)
3. **Security** (security module)
4. **Middleware** (middleware functions)
5. **Routes** (route definitions)
6. **Services** (business logic)
7. **Models** (database models)
8. **Utils** (utility functions)
9. **Types** (TypeScript types)

### Visual Separation

Use comment blocks to separate import groups:

```typescript
// ============================================
// External Dependencies
// ============================================
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// ============================================
// Configuration
// ============================================
import { ENV } from './config/env';
import { logger } from './utils/logger';

// ============================================
// Security
// ============================================
import { authenticate, requirePermission } from './security';

// ============================================
// Middleware
// ============================================
import { errorHandler, languageMiddleware } from './middleware';

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
// Types
// ============================================
import type { BookingStatus } from './types';
```

---

## Naming Conventions

### Files

- **Controllers**: `entity.controller.ts` (e.g., `booking.controller.ts`)
- **Services**: `entity.service.ts` (e.g., `booking.service.ts`)
- **Models**: `entity.model.ts` (e.g., `booking.model.ts`)
- **Routes**: `entity.routes.ts` (e.g., `booking.routes.ts`)
- **Validators**: `entity.validator.ts` (e.g., `booking.validator.ts`)
- **Utils**: `utilName.ts` (e.g., `logger.ts`, `AppError.ts`)

### Folders

- Use **kebab-case** for folder names: `travel-pack`, `pack-relation`
- Use **lowercase** for main folders: `controllers`, `services`, `models`

### Classes and Interfaces

- **Classes**: `PascalCase` (e.g., `BookingService`, `AppError`)
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `IBooking`, `IGuest`)
- **Types**: `PascalCase` (e.g., `BookingStatus`, `PaymentStatus`)

### Functions and Variables

- **Functions**: `camelCase` (e.g., `createBooking`, `findBySessionId`)
- **Variables**: `camelCase` (e.g., `bookingData`, `totalPrice`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`, `DEFAULT_LIMIT`)

---

## Barrel Exports

### When to Use Barrel Exports

Barrel exports (`index.ts`) should be used **only** for:

✅ **middleware** - All middleware functions  
✅ **security** - All security-related exports  
✅ **types** - All type definitions  
✅ **utils** - Related utility functions (optional)

### When NOT to Use Barrel Exports

Barrel exports should be **avoided** for:

❌ **services** - Prevents circular dependencies, maintains explicit dependencies  
❌ **controllers** - Maintains explicit dependencies  
❌ **models** - Prevents circular dependencies

### Barrel Export Example

**File**: `src/middleware/index.ts`
```typescript
/**
 * Middleware Barrel Export
 * Central export point for all middleware
 */

export { errorHandler } from './errorHandler';
export { asyncHandler } from './asyncHandler';
export { languageMiddleware } from './language';
```

**Usage**:
```typescript
import { errorHandler, languageMiddleware } from './middleware';
```

---

## File Organization

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # HTTP request handlers
├── middleware/      # Express middleware
├── models/          # Mongoose schemas
├── routes/          # Route definitions
├── security/        # Security module
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utility functions
└── validators/      # Zod validation schemas
```

### Feature-Based Organization

Each domain entity follows a consistent pattern:

```
entity.controller.ts    # HTTP handlers
entity.service.ts       # Business logic
entity.model.ts         # Database schema
entity.routes.ts        # Route definitions
entity.validator.ts     # Validation schemas
```

---

## Best Practices

### 1. Explicit Imports

Always import exactly what you need:

```typescript
// ✅ Good
import { errorHandler, languageMiddleware } from './middleware';

// ❌ Avoid
import * from './middleware';
```

### 2. Type-Only Imports

Use `import type` for type-only imports:

```typescript
import type { BookingStatus } from './types';
import type { Request, Response } from 'express';
```

### 3. Consistent Paths

Use relative paths consistently:

```typescript
// ✅ Good - Relative paths
import { logger } from '../utils/logger';
import * as service from '../services/booking.service';

// ❌ Avoid - Absolute paths (unless configured)
import { logger } from '@/utils/logger';
```

### 4. Group Related Imports

Group related imports together:

```typescript
// ✅ Good - Grouped by type
import { errorHandler } from './middleware';
import { authenticate } from './security';
import * as bookingService from './services/booking.service';

// ❌ Avoid - Mixed order
import * as bookingService from './services/booking.service';
import { errorHandler } from './middleware';
import { authenticate } from './security';
```

---

## Summary

| Category | Import Pattern | Barrel Export |
|----------|---------------|---------------|
| **Services** | `import * as serviceName from './services/serviceName.service'` | ❌ No |
| **Models** | `import ModelName from './models/modelName.model'` | ❌ No |
| **Types** | `import { TypeName } from './types'` | ✅ Yes |
| **Utils** | `import { utilName } from './utils/utilName'` | ⚠️ Optional |
| **Middleware** | `import { middlewareName } from './middleware'` | ✅ Yes |
| **Security** | `import { securityFunction } from './security'` | ✅ Yes |
| **Controllers** | `import * as controller from './controllers/entity.controller'` | ❌ No |
| **Routes** | `import routerName from './routes/routerName.routes'` | ❌ No |

---

**For detailed import and documentation conventions, see**: [IMPORT_AND_DOC_CONVENTIONS.md](./IMPORT_AND_DOC_CONVENTIONS.md)

