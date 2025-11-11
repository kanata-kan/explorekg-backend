# Developer Guide

**Project**: ExploreKG Backend  
**Last Updated**: 2025-01-27  
**Version**: 1.0

---

## Welcome

Welcome to the ExploreKG Backend project. This guide will help you understand the project structure, coding conventions, and best practices to contribute effectively.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architectural Structure](#architectural-structure)
3. [Coding Style & Import Conventions](#coding-style--import-conventions)
4. [Documentation Writing Rules](#documentation-writing-rules)
5. [Getting Started](#getting-started)
6. [Reference Documentation](#reference-documentation)

---

## Project Overview

ExploreKG Backend is a comprehensive Node.js/Express API server built with TypeScript for managing tourism activities, car rentals, and travel packages in Kyrgyzstan. The system provides a RESTful API with multi-language support (English/French), comprehensive security features, and a scalable layered architecture.

---

## Architectural Structure

### Four-Layer Architecture

The project follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   Routes → Validators → Controllers │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Business Logic Layer              │
│   Services                          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Access Layer                 │
│   Models (Mongoose)                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Database Layer                    │
│   MongoDB Atlas                     │
└─────────────────────────────────────┘
```

### Directory Structure

```
src/
├── config/          # Configuration files (env, db)
├── controllers/     # HTTP request handlers
├── middleware/      # Express middleware
├── models/          # Mongoose schemas
├── routes/          # Route definitions
├── security/        # Security module (auth, authorization, audit)
├── services/        # Business logic layer
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── validators/      # Zod validation schemas
├── app.ts           # Express app configuration
└── server.ts        # Application entry point
```

### Feature-Based Organization

Each domain entity follows a consistent pattern:

- `entity.controller.ts` - HTTP request handlers
- `entity.service.ts` - Business logic
- `entity.model.ts` - Database schema
- `entity.routes.ts` - Route definitions
- `entity.validator.ts` - Validation schemas

**Example**: Booking feature
- `booking.controller.ts`
- `booking.service.ts`
- `booking.model.ts`
- `booking.routes.ts`
- `booking.validator.ts`

---

## Coding Style & Import Conventions

### Import Order

All imports must follow this strict order:

1. External Dependencies (npm packages)
2. Configuration (config files)
3. Security (security module)
4. Middleware (middleware functions)
5. Routes (route definitions)
6. Services (business logic)
7. Models (database models)
8. Utils (utility functions)
9. Types (TypeScript types)

### Import Patterns

| Category | Pattern | Example |
|----------|---------|---------|
| **Services** | `import * as serviceName from './services/serviceName.service'` | `import * as bookingService from '../services/booking.service'` |
| **Models** | `import ModelName from './models/modelName.model'` | `import Booking from '../models/booking.model'` |
| **Types** | `import { TypeName } from './types'` | `import { BookingStatus } from '../types'` |
| **Utils** | `import { utilName } from './utils/utilName'` | `import { logger } from '../utils/logger'` |
| **Middleware** | `import { middlewareName } from './middleware'` | `import { errorHandler } from '../middleware'` |
| **Security** | `import { securityFunction } from './security'` | `import { authenticate } from '../security'` |
| **Controllers** | `import * as controller from './controllers/entity.controller'` | `import * as bookingController from '../controllers/booking.controller'` |
| **Routes** | `import routerName from './routes/routerName.routes'` | `import bookingRouter from './routes/booking.routes'` |

### Barrel Exports

Barrel exports (`index.ts`) are used **only** for:
- ✅ `middleware/` - All middleware functions
- ✅ `security/` - All security exports
- ✅ `types/` - All type definitions

Barrel exports are **avoided** for:
- ❌ `services/` - Prevents circular dependencies
- ❌ `controllers/` - Maintains explicit dependencies
- ❌ `models/` - Prevents circular dependencies

### Naming Conventions

- **Files**: `entity.layer.ts` (camelCase)
- **Folders**: `lowercase` or `kebab-case`
- **Classes**: `PascalCase` (e.g., `BookingService`)
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `IBooking`)
- **Functions**: `camelCase` (e.g., `createBooking`)
- **Variables**: `camelCase` (e.g., `bookingData`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)

---

## Documentation Writing Rules

### Language

**All documentation must be written in English only.**

### Code Comments

All code comments and docstrings must follow JSDoc format:

```typescript
/**
 * Creates a new booking for a guest.
 * 
 * @param data - Booking creation data including guestId, itemType, and itemId
 * @returns Promise resolving to the created booking document
 * @throws {NotFoundError} If guest or item is not found
 */
export const createBooking = async (
  data: CreateBookingData
): Promise<IBooking> => {
  // Implementation
};
```

### Documentation Files

All documentation files must:
- Use consistent heading hierarchy (`#`, `##`, `###`)
- Include a table of contents for files longer than 3 sections
- Use code blocks with language specification
- Follow the standard structure with metadata header

### File Header Format

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
```

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 10.16.1+
- MongoDB Atlas account (or local MongoDB)
- TypeScript 5.9+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# SESSION_SECRET=your_session_secret

# Run development server
pnpm dev
```

### Project Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate test coverage report

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format code with Prettier
pnpm type-check       # TypeScript type checking
```

### Development Workflow

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Follow coding conventions**: Use the style guide and import patterns
3. **Write tests**: Add tests for new features
4. **Update documentation**: Keep documentation in sync with code changes
5. **Submit pull request**: Include description and reference related issues

---

## Reference Documentation

### Essential Reading

- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - Complete coding style and import pattern guide
- **[IMPORT_AND_DOC_CONVENTIONS.md](./IMPORT_AND_DOC_CONVENTIONS.md)** - Detailed import and documentation conventions
- **[architecture/TECHNICAL-ARCHITECTURE.md](./architecture/TECHNICAL-ARCHITECTURE.md)** - Technical architecture overview
- **[architecture/SYSTEM-OVERVIEW.md](./architecture/SYSTEM-OVERVIEW.md)** - System overview and design decisions

### API Documentation

- **[api/API_OVERVIEW.md](./api/API_OVERVIEW.md)** - API overview and endpoints
- **[api/BOOKING-API.md](./api/BOOKING-API.md)** - Booking API documentation
- **[api/GUEST-API.md](./api/GUEST-API.md)** - Guest API documentation

### Security Documentation

- **[security/RBAC_ADMIN_SYSTEM.md](./security/RBAC_ADMIN_SYSTEM.md)** - Role-based access control
- **[security/PRODUCTION-SECURITY-CHECKLIST.md](./security/PRODUCTION-SECURITY-CHECKLIST.md)** - Security checklist

### Testing Documentation

- **[testing/TESTING-GUIDE.md](./testing/TESTING-GUIDE.md)** - Testing guidelines and examples

---

## Best Practices

### Code Quality

1. **Type Safety**: Always use TypeScript types, avoid `any`
2. **Error Handling**: Use custom error classes (`AppError`, `NotFoundError`, etc.)
3. **Validation**: Validate all inputs using Zod schemas
4. **Security**: Follow security best practices from security documentation
5. **Testing**: Write tests for all new features

### Git Workflow

1. **Commit Messages**: Use conventional commit format
   - `feat: Add new booking endpoint`
   - `fix: Resolve authentication issue`
   - `docs: Update API documentation`
   - `refactor: Improve service layer structure`

2. **Branch Naming**: Use descriptive branch names
   - `feature/add-payment-integration`
   - `bugfix/fix-booking-validation`
   - `refactor/improve-error-handling`

### Code Review Checklist

Before submitting a pull request, ensure:

- [ ] Code follows style guide and import conventions
- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Security considerations are addressed

---

## Support

For questions or issues:

1. Check the documentation in `/docs`
2. Review existing code examples
3. Consult the team lead or senior developers
4. Create an issue in the project repository

---

**Last Updated**: 2025-01-27  
**Maintained by**: ExploreKG Backend Team

