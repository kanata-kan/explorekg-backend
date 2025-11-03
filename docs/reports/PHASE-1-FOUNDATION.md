# Phase 1 - Foundation Setup

## Overview

This document outlines the foundational architecture and setup completed in Phase 1 of the Explore Kyrgyzstan server project. The goal was to establish a robust, production-ready foundation before moving to data modeling and business logic implementation.

## What We've Accomplished

### Core Infrastructure
- ✅ **Express.js Server** with TypeScript
- ✅ **MongoDB Connection** with Mongoose and retry logic
- ✅ **Environment Management** with comprehensive validation
- ✅ **Security Middleware** (Helmet, CORS, Rate Limiting)
- ✅ **Logging System** using Pino with pretty printing
- ✅ **Error Handling** with custom error classes
- ✅ **Testing Framework** with Jest and Supertest
- ✅ **Code Quality Tools** (ESLint, Prettier)

### Key Files and Architecture

#### Server Entry Points
- `src/server.ts` - Main server entry point with startup logic
- `src/app.ts` - Express app configuration and middleware setup

#### Configuration
- `src/config/env.ts` - Environment variables management with validation
- `src/config/db.ts` - MongoDB connection with retry mechanism
- `.env.example` - Template for environment variables
- `.env.test` - Test environment configuration

#### Middleware
- `src/middleware/errorHandler.ts` - Global error handling middleware
- `src/middleware/language.ts` - Language detection middleware
- `src/middleware/asyncHandler.ts` - Async error wrapper

#### Utilities
- `src/utils/logger.ts` - Pino logger configuration
- `src/utils/AppError.ts` - Custom error classes for different scenarios

#### Types and Validation
- `src/types/common.ts` - Common TypeScript interfaces
- `src/types/index.ts` - Main types export file

#### Routes
- `src/routes/health.ts` - Health check endpoint

#### Testing
- `tests/setup.ts` - Jest test configuration
- `tests/integration/health.test.ts` - Health endpoint integration tests
- `tests/unit/db.test.ts` - Database connection unit tests
- `jest.config.json` - Jest configuration

#### Code Quality
- `.eslintrc.json` - ESLint configuration for TypeScript
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to ignore during formatting

## How to Run the Project Locally

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- pnpm (package manager)

### Setup Steps

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd explorekg-server
   pnpm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Required environment variables:**
   - `MONGO_URI` - Your MongoDB connection string
   - `PORT` - Server port (default: 4000)
   - `NODE_ENV` - Environment (development/production)

4. **Start development server:**
   ```bash
   pnpm dev
   ```

5. **Build for production:**
   ```bash
   pnpm build
   pnpm start
   ```

## How to Run Tests

### Run all tests:
```bash
pnpm test
```

### Run tests in watch mode:
```bash
pnpm test:watch
```

### Run tests with coverage:
```bash
pnpm test:coverage
```

### Run specific test file:
```bash
pnpm test -- health.test.ts
```

## Code Quality Commands

### Linting:
```bash
pnpm lint          # Check for linting errors
pnpm lint:fix      # Fix auto-fixable linting errors
```

### Formatting:
```bash
pnpm format        # Format code with Prettier
pnpm format:check  # Check if code is properly formatted
```

### Type checking:
```bash
pnpm type-check    # Run TypeScript compiler without emitting files
```

## Architecture Decisions

### Security
- **Helmet**: Provides security headers
- **CORS**: Configured for development flexibility, production restrictions
- **Rate Limiting**: 100 requests per 15 minutes in production

### Error Handling
- Custom error classes for different scenarios (ValidationError, DatabaseError, etc.)
- Global error handler with appropriate HTTP status codes
- Development vs production error responses

### Logging
- Pino for high-performance JSON logging
- Pretty printing in development
- Structured logging for production monitoring

### Environment Management
- Comprehensive validation of required environment variables
- Development, test, and production configurations
- Type-safe environment access

## Next Steps (Phase 2)

1. **Data Modeling**: Create Mongoose schemas for tourism entities
2. **Authentication**: Implement JWT-based authentication
3. **API Endpoints**: Build CRUD operations for main entities
4. **Validation**: Integrate Zod schemas with API endpoints
5. **File Upload**: Implement image upload for tourism content

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed:**
   - Check if MongoDB is running
   - Verify `MONGO_URI` in `.env` file
   - Ensure network connectivity

2. **Tests Failing:**
   - Run `pnpm test:coverage` to see which tests are failing
   - Check if test database is accessible
   - Verify environment variables in `.env.test`

3. **TypeScript Errors:**
   - Run `pnpm type-check` to see all type errors
   - Ensure all dependencies have type definitions

### Health Check

Visit `http://localhost:4000/api/health` to verify the server is running correctly.