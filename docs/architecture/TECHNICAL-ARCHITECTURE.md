# 🏗️ ExploreKG Server - Technical Architecture

> **Document Version**: 1.0  
> **Last Updated**: October 30, 2025  
> **Phase**: Phase 2 - Data Modeling & API Implementation  
> **Branch**: `phase-2-Data-Modeling`

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Architecture Pattern](#-architecture-pattern)
4. [Data Flow](#-data-flow)
5. [Database Schema & Relationships](#-database-schema--relationships)
6. [API Structure](#-api-structure)
7. [Translation & Localization System](#-translation--localization-system)
8. [Validation & Error Handling](#-validation--error-handling)
9. [File Structure](#-file-structure)
10. [Current Implementation Status](#-current-implementation-status)
11. [Future Phases](#-future-phases)

---

## 🎯 Project Overview

**ExploreKG** هو نظام backend متكامل لإدارة وحجز الأنشطة السياحية، تأجير السيارات، وحزم السفر في قيرغيزستان.

### Core Features

- **Multi-language Support**: نظام ترجمة متقدم (EN/FR حاليًا)
- **RESTful API**: APIs موحدة ومنظمة
- **Type Safety**: TypeScript في كل المشروع
- **Validation**: Zod schemas للتحقق من البيانات
- **Scalability**: بنية قابلة للتوسع

### Business Domains

1. **Activities** (أنشطة سياحية): رحلات، مغامرات، تجارب محلية
2. **Cars** (تأجير سيارات): مركبات 4x4، سيارات عائلية، نقل
3. **Travel Packs** (حزم سفر): حزم سياحية جاهزة ومخصصة

---

## 🔧 Technology Stack

### Backend Core

```typescript
{
  "runtime": "Node.js (v18+)",
  "framework": "Express 5.x",
  "language": "TypeScript 5.x",
  "database": "MongoDB (Mongoose ODM)",
  "validation": "Zod",
  "packageManager": "pnpm"
}
```

### Key Dependencies

| Package        | Version | Purpose            |
| -------------- | ------- | ------------------ |
| **express**    | ^5.0.1  | Web framework      |
| **mongoose**   | ^8.8.3  | MongoDB ODM        |
| **zod**        | ^3.23.8 | Runtime validation |
| **typescript** | ^5.6.3  | Type safety        |
| **dotenv**     | ^16.4.5 | Environment config |

### Development Tools

- **ts-node**: TypeScript execution
- **nodemon**: Auto-reload development server
- **ESLint**: Code linting (future)
- **Prettier**: Code formatting (future)

---

## 🏛️ Architecture Pattern

### Layered Architecture (4 Layers)

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│            (React/Next.js Frontend - Future)             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │
│  │  Routes  │→ │Validators│→ │   Controllers       │  │
│  │  (.ts)   │  │  (Zod)   │  │ (Request Handlers)  │  │
│  └──────────┘  └──────────┘  └─────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ Validated Data
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Services Layer                      │   │
│  │  - Business Rules                                │   │
│  │  - Data Processing                               │   │
│  │  - Complex Queries                               │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ Service Calls
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Models  │  │ Schemas  │  │  Indexes │             │
│  │(Mongoose)│  │(MongoDB) │  │(Optimized)│             │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │ Database Queries
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                         │
│                    MongoDB Atlas                         │
└─────────────────────────────────────────────────────────┘
```

### Why This Architecture?

1. **Separation of Concerns**: كل layer عندو مسؤولية واضحة
2. **Testability**: سهل تختبر كل layer بوحدو
3. **Maintainability**: سهل تعدل في layer واحد بلا ما تأثر على لخرين
4. **Scalability**: يمكن تزيد features جديدة بسهولة

---

## 🔄 Data Flow

### Request → Response Flow

```typescript
// 1️⃣ CLIENT REQUEST
GET /api/v1/activities?locale=en&status=published

         ↓

// 2️⃣ ROUTE HANDLER (routes/activity.routes.ts)
router.get('/',
  validateQuery(activityQuerySchema),  // Validation middleware
  getAllActivities                      // Controller
);

         ↓

// 3️⃣ VALIDATION (validators/activity.validator.ts)
const activityQuerySchema = z.object({
  locale: z.enum(['en', 'fr']).optional(),
  status: z.enum(['draft', 'published']).optional(),
  // ... more fields
});
// ✅ Data validated or ❌ 400 Bad Request

         ↓

// 4️⃣ CONTROLLER (controllers/activity.controller.ts)
export const getAllActivities = async (req, res, next) => {
  try {
    const filters = {
      locale: req.query.locale,
      status: req.query.status,
    };
    const result = await activityService.findMany(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error); // Pass to error handler
  }
};

         ↓

// 5️⃣ SERVICE (services/activity.service.ts)
export const findMany = async (filters) => {
  // Build query
  const query: any = {};
  if (filters.locale) query.locale = filters.locale;
  if (filters.status) query.status = filters.status;

  // Execute with pagination
  const items = await Activity.find(query)
    .skip(skip)
    .limit(limit)
    .lean();

  return { items, pagination: {...} };
};

         ↓

// 6️⃣ MODEL (models/activity.model.ts)
const ActivitySchema = new Schema({
  slug: { type: String, required: true },
  locale: { type: String, required: true },
  localeGroupId: { type: String, required: true },
  // ... more fields
});

         ↓

// 7️⃣ MONGODB QUERY
db.activities.find({
  locale: "en",
  status: "published"
})
.skip(0)
.limit(20)

         ↓

// 8️⃣ RESPONSE TO CLIENT
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### Error Flow

```typescript
// Error occurs anywhere in the chain
throw new ValidationError('Invalid data');

         ↓

// Caught by Express error handler (middleware/errorHandler.ts)
app.use((error, req, res, next) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: error.message,
      statusCode: 400,
      timestamp: new Date().toISOString()
    });
  }
  // ... handle other error types
});

         ↓

// Response to client
{
  "success": false,
  "error": "Invalid data",
  "statusCode": 400,
  "timestamp": "2025-10-30T10:30:00.000Z"
}
```

---

## 🗄️ Database Schema & Relationships

### Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANSLATION SYSTEM                        │
│                   (localeGroupId Links)                      │
└────────────┬───────────────────────┬────────────────────────┘
             │                       │
             ▼                       ▼
┌──────────────────────┐  ┌──────────────────────┐
│    ACTIVITIES        │  │       CARS           │
│  (Separate Docs)     │  │  (Separate Docs)     │
├──────────────────────┤  ├──────────────────────┤
│ _id: ObjectId        │  │ _id: ObjectId        │
│ slug: string (U)     │  │ slug: string (U)     │
│ localeGroupId: str   │  │ localeGroupId: str   │
│ locale: "en"|"fr"    │  │ locale: "en"|"fr"    │
│ name: string         │  │ name: string         │
│ description: string  │  │ type: string         │
│ category: string     │  │ brand: string        │
│ difficulty: string   │  │ seats: number        │
│ duration: number     │  │ transmission: string │
│ price: number        │  │ pricePerDay: number  │
│ status: enum         │  │ status: enum         │
│ availability: bool   │  │ availability: bool   │
│ createdAt: Date      │  │ createdAt: Date      │
│ updatedAt: Date      │  │ updatedAt: Date      │
└──────────────────────┘  └──────────────────────┘
             ▲                       ▲
             │ localeGroupId links   │
             │ EN/FR versions        │
             └───────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │   Example Link:               │
         │   localeGroupId: "hiking-1"   │
         │                               │
         │   Document 1 (EN):            │
         │   { locale: "en",             │
         │     localeGroupId: "hiking-1",│
         │     name: "Mountain Hiking" } │
         │                               │
         │   Document 2 (FR):            │
         │   { locale: "fr",             │
         │     localeGroupId: "hiking-1",│
         │     name: "Randonnée..." }    │
         └───────────────────────────────┘

┌──────────────────────────────────────────────┐
│          TRAVEL PACKS                        │
│      (Nested Locales Structure)              │
├──────────────────────────────────────────────┤
│ _id: ObjectId                                │
│ slug: string (U)                             │
│ localeGroupId: string                        │
│ locale: "en" (primary)                       │
│ status: enum                                 │
│                                              │
│ locales: {                                   │
│   en?: {                                     │
│     name: string,                            │
│     description: string,                     │
│     ctaLabel: string,                        │
│     metadata: {...}                          │
│   },                                         │
│   fr?: {                                     │
│     name: string,                            │
│     description: string,                     │
│     ctaLabel: string,                        │
│     metadata: {...}                          │
│   }                                          │
│ }                                            │
│                                              │
│ coverImage: string                           │
│ features: string[]                           │
│ duration: number                             │
│ basePrice: number                            │
│ currency: string                             │
│ availability: boolean                        │
│ createdAt: Date                              │
│ updatedAt: Date                              │
└──────────────────────────────────────────────┘
         ▲
         │ Single document contains
         │ ALL translations
         └────────────────────────────
```

### Key Design Decisions

#### 1. Activities & Cars: Separate Documents

**Why?**

- ✅ Simpler queries per language
- ✅ Better for complex relationships (bookings, reviews)
- ✅ Easier to update single language
- ✅ Better for permission management per locale

**Trade-offs:**

- ❌ Need to query multiple docs for all translations
- ❌ Must maintain consistency across documents

#### 2. Travel Packs: Nested Locales

**Why?**

- ✅ Single fetch gets all translations
- ✅ Perfect for static/presentation content
- ✅ Guaranteed consistency (atomic updates)
- ✅ Simpler frontend logic

**Trade-offs:**

- ❌ Larger documents
- ❌ All translations loaded together

### Indexes Strategy

```typescript
// ACTIVITIES & CARS
ActivitySchema.index({ slug: 1 }, { unique: true });
ActivitySchema.index({ localeGroupId: 1 }); // Translation linking
ActivitySchema.index({ locale: 1 });
ActivitySchema.index({ status: 1 });
ActivitySchema.index({ status: 1, locale: 1 }); // Compound
ActivitySchema.index({ category: 1, locale: 1 }); // Filtering

// TRAVEL PACKS
TravelPackSchema.index({ slug: 1 }, { unique: true });
TravelPackSchema.index({ localeGroupId: 1 }); // Consistency
TravelPackSchema.index({ status: 1 });
TravelPackSchema.index({
  'locales.en.name': 'text',
  'locales.fr.name': 'text',
}); // Full-text search
```

---

## 🌐 Translation & Localization System

### localeGroupId Strategy

**Purpose**: ربط جميع الترجمات لنفس المحتوى

```typescript
// Concept:
localeGroupId = "unique-identifier-for-content"

// Example - Activities (Separate Docs):
{
  "_id": "67890abc...",
  "slug": "mountain-hiking-en",
  "locale": "en",
  "localeGroupId": "hiking-1",  // 🔗 Link
  "name": "Mountain Hiking"
}

{
  "_id": "67890def...",
  "slug": "mountain-hiking-fr",
  "locale": "fr",
  "localeGroupId": "hiking-1",  // 🔗 Same link
  "name": "Randonnée en Montagne"
}

// Query: Get all translations
GET /api/v1/activities?localeGroupId=hiking-1
// Returns: 2 documents (EN + FR)
```

```typescript
// Example - Travel Packs (Nested):
{
  "_id": "67890xyz...",
  "slug": "rent-a-car-and-go",
  "localeGroupId": "pack-1",  // 🔗 Identifier
  "locale": "en",
  "locales": {
    "en": { "name": "Rent a Car & Go" },
    "fr": { "name": "Louez une Voiture..." }
  }
}

// Query: Get travel pack with all translations
GET /api/v1/travel-packs?localeGroupId=pack-1
// Returns: 1 document with nested EN + FR
```

### Translation Matrix

| Model            | Structure      | Query Pattern                | Use Case                |
| ---------------- | -------------- | ---------------------------- | ----------------------- |
| **Activities**   | Separate docs  | `?localeGroupId=X&locale=en` | Get specific language   |
| **Cars**         | Separate docs  | `?localeGroupId=X`           | Get all translations    |
| **Travel Packs** | Nested locales | `?localeGroupId=X`           | Get single doc with all |

### Frontend Integration Pattern

```typescript
// React/Next.js Example
const ActivityDetail = ({ localeGroupId, currentLocale }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Fetch all translations
    fetch(`/api/v1/activities?localeGroupId=${localeGroupId}`)
      .then(res => res.json())
      .then(({ data }) => setActivities(data.items));
  }, [localeGroupId]);

  // Find current locale version
  const activity = activities.find(a => a.locale === currentLocale);

  // Language switcher
  const switchLanguage = (newLocale) => {
    const translated = activities.find(a => a.locale === newLocale);
    if (translated) setCurrentActivity(translated);
  };

  return (
    <div>
      <h1>{activity?.name}</h1>
      <LanguageSwitcher
        available={activities.map(a => a.locale)}
        current={currentLocale}
        onChange={switchLanguage}
      />
    </div>
  );
};
```

---

## 🛡️ Validation & Error Handling

### Validation Layer (Zod)

```typescript
// Input Validation Flow:

┌──────────────────┐
│  Raw Request     │
│  req.body/query  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│   Zod Schema Validation      │
│                              │
│  const schema = z.object({   │
│    name: z.string()          │
│      .min(3)                 │
│      .max(100),              │
│    price: z.number()         │
│      .positive()             │
│  });                         │
└────────┬─────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  VALID    INVALID
    │         │
    │         └──→ ❌ 400 Bad Request
    │              {
    │                "success": false,
    │                "error": "Validation failed",
    │                "details": [
    │                  {
    │                    "field": "name",
    │                    "message": "String must contain at least 3 character(s)"
    │                  }
    │                ]
    │              }
    │
    ▼
  ✅ Pass to Controller
```

### Error Hierarchy

```typescript
// Custom Error Classes
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.statusCode = 404;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message);
    this.statusCode = 401;
  }
}

// Error Handler Middleware
app.use((error, req, res, next) => {
  // Log error
  console.error('Error:', error);

  // Operational errors (expected)
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  // Programming errors (unexpected)
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    statusCode: 500,
  });
});
```

### Validation Rules Summary

| Field Type        | Rules                                               | Example                    |
| ----------------- | --------------------------------------------------- | -------------------------- |
| **slug**          | min: 3, max: 100, lowercase, alphanumeric + hyphens | `mountain-hiking`          |
| **localeGroupId** | min: 3, max: 100, required                          | `hiking-1`                 |
| **locale**        | enum: ['en', 'fr']                                  | `en`                       |
| **status**        | enum: ['draft', 'published', 'archived']            | `published`                |
| **name**          | min: 3, max: 200, trimmed                           | `Mountain Hiking`          |
| **description**   | max: 2000                                           | `Experience the beauty...` |
| **price**         | positive, max: 1000000, 2 decimals                  | `99.99`                    |
| **email**         | valid email format                                  | `user@example.com`         |
| **url**           | valid URL format                                    | `https://example.com`      |

---

## 📂 File Structure

```
explorekg-server/
│
├── src/
│   ├── config/              # Configuration files
│   │   └── env.ts          # Environment variables & constants
│   │
│   ├── models/             # Mongoose models & schemas
│   │   ├── activity.model.ts
│   │   ├── car.model.ts
│   │   └── travelPack.model.ts
│   │
│   ├── controllers/        # Request handlers (thin layer)
│   │   ├── activity.controller.ts
│   │   ├── car.controller.ts
│   │   └── travelPack.controller.ts
│   │
│   ├── services/           # Business logic (thick layer)
│   │   ├── activity.service.ts
│   │   ├── car.service.ts
│   │   └── travelPack.service.ts
│   │
│   ├── validators/         # Zod validation schemas
│   │   ├── activity.validator.ts
│   │   ├── car.validator.ts
│   │   └── travelPack.validator.ts
│   │
│   ├── routes/             # Express route definitions
│   │   ├── activity.routes.ts
│   │   ├── car.routes.ts
│   │   ├── travelPack.routes.ts
│   │   └── index.ts        # Route aggregator
│   │
│   ├── middleware/         # Express middleware
│   │   └── errorHandler.ts
│   │
│   ├── utils/              # Utility functions
│   │   └── AppError.ts     # Custom error classes
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── express.d.ts    # Express type extensions
│   │
│   ├── database/           # Database connection
│   │   └── connection.ts   # MongoDB connection logic
│   │
│   └── app.ts              # Express app setup
│
├── scripts/                # Migration & utility scripts
│   ├── migrateActivitiesFromJson.ts
│   ├── migrateCarsFromJson.ts
│   └── migrateTravelPacksFromJson.ts
│
├── data/                   # JSON data files
│   └── content/
│       ├── en/
│       │   ├── activities.json
│       │   ├── cars.json
│       │   └── travel-packs.json
│       └── fr/
│           ├── activities.json
│           ├── cars.json
│           └── travel-packs.json
│
├── docs/                   # Documentation
│   ├── TECHNICAL-ARCHITECTURE.md  # 👈 This file
│   ├── activities-quickref.md
│   ├── activities-data.md
│   ├── cars-quickref.md
│   ├── cars-data.md
│   ├── travel-packs-quickref.md
│   ├── travel-packs-data.md
│   └── localeGroupId-implementation.md
│
├── .env                    # Environment variables (gitignored)
├── .gitignore             # Git ignore rules
├── package.json           # Project dependencies
├── pnpm-lock.yaml         # Lock file
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project readme
```

### Layer Responsibilities

```typescript
// 1. ROUTES (routes/*.routes.ts)
// - Define HTTP endpoints
// - Apply middleware (validation, auth)
// - Delegate to controllers
router.get('/', validateQuery(schema), controller.getAll);

// 2. VALIDATORS (validators/*.validator.ts)
// - Define Zod schemas
// - Input validation rules
// - Transform/sanitize data
export const activityCreateSchema = z.object({...});

// 3. CONTROLLERS (controllers/*.controller.ts)
// - Handle HTTP request/response
// - Extract data from req
// - Call service layer
// - Format response
export const getAllActivities = async (req, res, next) => {
  const result = await service.findMany(filters);
  res.json({ success: true, data: result });
};

// 4. SERVICES (services/*.service.ts)
// - Business logic
// - Data processing
// - Database queries
// - Complex operations
export const findMany = async (filters) => {
  const items = await Model.find(query).lean();
  return { items, pagination };
};

// 5. MODELS (models/*.model.ts)
// - Define data structure
// - Mongoose schemas
// - Database indexes
// - Model methods
const ActivitySchema = new Schema({...});
export default mongoose.model('Activity', ActivitySchema);
```

---

## ✅ Current Implementation Status

### Phase 1: Foundation ✅ (Completed)

- [x] Project setup (TypeScript, Express 5)
- [x] MongoDB connection
- [x] Environment configuration
- [x] Basic error handling
- [x] Project structure

### Phase 2: Data Modeling & APIs ✅ (Current - 95% Complete)

#### Activities API ✅

- [x] Model with localeGroupId
- [x] CRUD operations
- [x] Validators (Zod)
- [x] Service layer
- [x] Routes
- [x] Documentation
- [x] Migration script
- [x] Sample data (10 activities)

#### Cars API ✅

- [x] Model with localeGroupId
- [x] CRUD operations
- [x] Validators (Zod)
- [x] Service layer
- [x] Routes
- [x] Documentation
- [x] Migration script
- [x] Sample data (10 cars)

#### Travel Packs API ✅

- [x] Model with nested locales + localeGroupId
- [x] CRUD operations
- [x] Validators (Zod)
- [x] Service layer
- [x] Routes
- [x] Documentation
- [x] Migration script
- [x] Sample data (3 packs)

#### Translation System ✅

- [x] localeGroupId implementation
- [x] Unified query patterns
- [x] Documentation
- [x] Frontend integration examples

### API Endpoints Implemented

```
📍 Activities
GET    /api/v1/activities              # List all
GET    /api/v1/activities/:id          # Get one
POST   /api/v1/activities              # Create
PUT    /api/v1/activities/:id          # Update
DELETE /api/v1/activities/:id          # Delete (soft)
GET    /api/v1/activities/stats        # Statistics

📍 Cars
GET    /api/v1/cars                    # List all
GET    /api/v1/cars/:id                # Get one
POST   /api/v1/cars                    # Create
PUT    /api/v1/cars/:id                # Update
DELETE /api/v1/cars/:id                # Delete (soft)
GET    /api/v1/cars/stats              # Statistics

📍 Travel Packs
GET    /api/v1/travel-packs            # List all
GET    /api/v1/travel-packs/:id        # Get one
POST   /api/v1/travel-packs            # Create
PUT    /api/v1/travel-packs/:id        # Update
DELETE /api/v1/travel-packs/:id        # Delete (soft)
GET    /api/v1/travel-packs/stats      # Statistics
```

### Database Collections

```javascript
// Current collections in MongoDB:
db.activities     // ~10 documents (5 EN + 5 FR)
db.cars          // ~10 documents (5 EN + 5 FR)
db.travelpacks   // ~3 documents (each with nested EN+FR)

// Indexes created:
- slug (unique)
- localeGroupId (indexed for fast queries)
- status (filtered queries)
- locale (language filtering)
- Compound indexes for common query patterns
- Text indexes for search (Travel Packs)
```

---

## 🚀 Future Phases

### Phase 3: Authentication & Authorization (Next)

**Priority**: HIGH  
**Estimated Duration**: 2-3 weeks

#### Planned Features:

- [ ] User model (Tourist, Admin, Guide)
- [ ] JWT authentication
- [ ] Role-based access control (RBAC)
- [ ] Password hashing (bcrypt)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Session management
- [ ] Protected routes middleware

#### Architecture Impact:

```typescript
// New models:
models/
  ├── user.model.ts        // User schema
  └── token.model.ts       // Refresh tokens

// New middleware:
middleware/
  ├── auth.ts              // JWT verification
  ├── authorize.ts         // Role checking
  └── rateLimiter.ts       // Request limiting

// Updated routes:
routes/
  └── auth.routes.ts       // Login, register, refresh, logout

// New services:
services/
  ├── auth.service.ts      // Authentication logic
  └── email.service.ts     // Email notifications
```

#### Security Considerations:

- Password minimum requirements
- JWT expiration strategy
- Refresh token rotation
- Rate limiting per IP
- CORS configuration

---

### Phase 4: Bookings & Reservations

**Priority**: HIGH  
**Estimated Duration**: 3-4 weeks

#### Planned Features:

- [ ] Booking model (Activities, Cars, Travel Packs)
- [ ] Availability calendar
- [ ] Payment integration (Stripe/PayPal)
- [ ] Booking status workflow
- [ ] Email confirmations
- [ ] Invoice generation
- [ ] Cancellation policy
- [ ] Review & rating system

#### Database Schema:

```typescript
// New collections:
bookings {
  _id: ObjectId,
  userId: ObjectId,           // ref: User
  resourceType: 'activity' | 'car' | 'travelPack',
  resourceId: ObjectId,       // ref: Activity/Car/TravelPack
  startDate: Date,
  endDate: Date,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  totalPrice: Number,
  currency: String,
  paymentStatus: 'pending' | 'paid' | 'refunded',
  paymentMethod: String,
  specialRequests: String,
  createdAt: Date,
  updatedAt: Date
}

reviews {
  _id: ObjectId,
  userId: ObjectId,
  bookingId: ObjectId,
  resourceType: 'activity' | 'car' | 'travelPack',
  resourceId: ObjectId,
  rating: Number (1-5),
  comment: String,
  images: String[],
  response: String,           // Admin response
  createdAt: Date
}
```

#### Business Logic:

- Double-booking prevention
- Availability checking
- Dynamic pricing
- Discount codes
- Booking notifications

---

### Phase 5: Advanced Features

**Priority**: MEDIUM  
**Estimated Duration**: 4-6 weeks

#### Planned Features:

- [ ] Search & filtering optimization
- [ ] Recommendations engine
- [ ] Wishlist/favorites
- [ ] Multi-language expansion (Arabic, Russian)
- [ ] Image upload & processing
- [ ] Map integration
- [ ] Weather integration
- [ ] Analytics dashboard
- [ ] Export reports (PDF, Excel)
- [ ] Webhook system

#### Technical Enhancements:

- Redis caching layer
- ElasticSearch for advanced search
- Bull queue for background jobs
- S3/Cloudinary for image storage
- WebSocket for real-time updates
- GraphQL API (optional)

---

### Phase 6: DevOps & Production

**Priority**: HIGH  
**Estimated Duration**: 2-3 weeks

#### Planned Tasks:

- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production deployment (AWS/DigitalOcean)
- [ ] SSL certificates
- [ ] Backup strategy
- [ ] Monitoring (Sentry, New Relic)
- [ ] Load testing
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Performance optimization

#### Infrastructure:

```yaml
# Docker Compose structure
services:
  app:
    build: .
    ports: ['4000:4000']
    depends_on: [mongodb, redis]

  mongodb:
    image: mongo:7
    volumes: [mongodb_data:/data/db]

  redis:
    image: redis:7
    ports: ['6379:6379']

  nginx:
    image: nginx:latest
    ports: ['80:80', '443:443']
```

---

## 🎓 Design Patterns & Best Practices

### 1. Repository Pattern (Service Layer)

**What**: Separation of data access from business logic  
**Why**: Testability, maintainability, flexibility

```typescript
// ❌ Bad: Direct model usage in controller
export const getActivity = async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  res.json(activity);
};

// ✅ Good: Service layer abstraction
export const getActivity = async (req, res) => {
  const activity = await activityService.findByIdOrSlug(req.params.id);
  res.json({ success: true, data: activity });
};
```

### 2. Dependency Injection (Loose Coupling)

**What**: Components depend on abstractions, not concretions  
**Why**: Easier testing, swapping implementations

```typescript
// Service can be easily mocked for testing
class ActivityController {
  constructor(private activityService: IActivityService) {}

  async getAll(req, res) {
    const result = await this.activityService.findMany({});
    res.json(result);
  }
}
```

### 3. Error Handling Strategy

**What**: Centralized error handling middleware  
**Why**: Consistent error responses, cleaner code

```typescript
// Throw errors anywhere
throw new NotFoundError('Activity');

// Handled in one place
app.use(errorHandler);
```

### 4. Validation at Boundaries

**What**: Validate data at entry points (controllers)  
**Why**: Prevent invalid data from entering system

```typescript
// Validate before processing
router.post('/', validateBody(activityCreateSchema), createActivity);
```

### 5. Lean Queries

**What**: Use `.lean()` for read-only queries  
**Why**: 5-10x faster, returns plain JavaScript objects

```typescript
// ❌ Slow: Returns Mongoose documents
const activities = await Activity.find({});

// ✅ Fast: Returns plain objects
const activities = await Activity.find({}).lean();
```

### 6. Pagination by Default

**What**: Always paginate list endpoints  
**Why**: Prevent memory issues, better UX

```typescript
const limit = Math.min(req.query.limit || 20, 100);
const skip = (page - 1) * limit;
const items = await Model.find({}).skip(skip).limit(limit);
```

### 7. Soft Delete

**What**: Mark as deleted instead of removing  
**Why**: Data recovery, audit trail

```typescript
// Add deletedAt field instead of delete
await Activity.findByIdAndUpdate(id, {
  deletedAt: new Date(),
});

// Exclude soft-deleted in queries
const query = { deletedAt: { $exists: false } };
```

---

## 📊 Performance Considerations

### Current Optimizations

1. **Database Indexes**: All high-traffic queries indexed
2. **Lean Queries**: Read operations use `.lean()`
3. **Pagination**: Default limit of 20, max 100
4. **Field Selection**: Use `.select()` to limit fields
5. **Compound Indexes**: Common filter combinations indexed

### Performance Metrics (Target)

```
Response Time (95th percentile):
  - GET /activities (list): < 100ms
  - GET /activities/:id: < 50ms
  - POST /activities: < 200ms

Database Queries:
  - Indexed queries: < 10ms
  - Aggregations: < 100ms
  - Text search: < 200ms

Concurrent Requests:
  - Target: 1000 req/s
  - Connection pooling: 10-100 connections
```

### Future Optimizations (Phase 5+)

- Redis caching (hot data)
- CDN for static assets
- Database read replicas
- Query result caching
- GraphQL batching

---

## 🔒 Security Measures

### Current Security

- [x] Environment variables (sensitive data)
- [x] Input validation (Zod schemas)
- [x] MongoDB injection prevention (Mongoose)
- [x] Error message sanitization
- [x] CORS configured (future)

### Future Security (Phase 3+)

- [ ] JWT authentication
- [ ] Password hashing (bcrypt)
- [ ] Rate limiting
- [ ] Helmet.js (HTTP headers)
- [ ] HTTPS/SSL
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] SQL injection prevention (already via Mongoose)
- [ ] File upload validation
- [ ] API key rotation

---

## 🧪 Testing Strategy (Future)

### Test Pyramid

```
              /\
             /  \
            / E2E \         End-to-End (5%)
           /------\         - Full user flows
          /  Integ \        Integration (25%)
         /----------\       - API endpoints, DB
        /    Unit    \      Unit Tests (70%)
       /--------------\     - Services, utils
```

### Planned Test Coverage

```typescript
// Unit tests (services, utils)
describe('activityService.findMany', () => {
  it('should return paginated activities', async () => {
    const result = await activityService.findMany({}, { page: 1, limit: 10 });
    expect(result.items).toHaveLength(10);
    expect(result.pagination.page).toBe(1);
  });
});

// Integration tests (routes)
describe('GET /api/v1/activities', () => {
  it('should return 200 and activities list', async () => {
    const res = await request(app).get('/api/v1/activities').expect(200);
    expect(res.body.success).toBe(true);
  });
});

// E2E tests (full flows)
describe('Activity booking flow', () => {
  it('should allow user to book an activity', async () => {
    // Login -> Browse -> Select -> Book -> Confirm
  });
});
```

---

## 📈 Monitoring & Logging (Future)

### Logging Strategy

```typescript
// Structured logging with Winston
logger.info('Activity created', {
  activityId: activity._id,
  userId: req.user._id,
  locale: activity.locale,
  timestamp: new Date(),
});

// Error logging
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  timestamp: new Date(),
});
```

### Metrics to Track

- Request count per endpoint
- Response times (p50, p95, p99)
- Error rates
- Database query performance
- Active users
- Booking conversion rate

### Tools (Phase 6)

- **Sentry**: Error tracking
- **New Relic/DataDog**: APM
- **CloudWatch/Grafana**: Infrastructure monitoring
- **LogRocket**: User session replay

---

## 🤝 Contributing Guidelines (Future)

### Git Workflow

```bash
# Branch naming
feature/add-booking-system
bugfix/fix-activity-validation
hotfix/critical-payment-issue

# Commit messages
feat: Add booking model and routes
fix: Correct localeGroupId validation
docs: Update API documentation
refactor: Extract email service
test: Add activity service tests
```

### Code Review Checklist

- [ ] Tests pass
- [ ] No console.logs
- [ ] TypeScript types defined
- [ ] Error handling present
- [ ] Documentation updated
- [ ] Performance considered

---

## 🎯 Success Metrics

### Technical KPIs

- **API Response Time**: < 100ms (p95)
- **Uptime**: > 99.9%
- **Test Coverage**: > 80%
- **Bug Rate**: < 0.5% per release
- **Code Review Time**: < 24 hours

### Business KPIs (Future)

- **Booking Conversion Rate**: > 5%
- **User Registration Rate**: > 10%
- **Average Booking Value**: Track growth
- **Customer Satisfaction**: > 4.5/5

---

## 📚 Key Learnings & Decisions

### Why Express 5?

- ✅ Read-only request objects (better performance)
- ✅ Modern async/await support
- ✅ Improved error handling
- ⚠️ Breaking changes from Express 4 (req mutation)

### Why Mongoose over Native Driver?

- ✅ Schema validation
- ✅ Middleware hooks
- ✅ Population (joins)
- ✅ Better developer experience
- ❌ Slight performance overhead (acceptable)

### Why Zod over Joi?

- ✅ TypeScript-first
- ✅ Type inference
- ✅ Smaller bundle size
- ✅ Better error messages

### Why Separate vs Nested Translations?

- **Separate (Activities/Cars)**: Better for complex relations
- **Nested (Travel Packs)**: Better for static content
- Both patterns coexist successfully with `localeGroupId`

---

## 🔗 External Resources

### Documentation

- [Express 5 Guide](https://expressjs.com/en/5x/api.html)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/administration/production-notes/)

### Related Project Files

- [Activities Quick Reference](./activities-quickref.md)
- [Cars Quick Reference](./cars-quickref.md)
- [Travel Packs Quick Reference](./travel-packs-quickref.md)
- [localeGroupId Implementation](./localeGroupId-implementation.md)

---

## 📝 Changelog

### v1.0 - October 30, 2025

- Initial architecture documentation
- Phase 2 implementation complete
- Activities, Cars, Travel Packs APIs live
- Translation system with localeGroupId
- Comprehensive validation layer
- Migration scripts ready

---

## 👥 Team & Contacts

**Project**: ExploreKG Server  
**Phase**: 2 (Data Modeling & APIs)  
**Status**: 95% Complete  
**Next Phase**: Authentication & Authorization

---

## 🎓 For Future Developers

### Getting Started

1. Read this document completely
2. Review `README.md` for setup instructions
3. Check `docs/` folder for API references
4. Explore `src/` structure
5. Run migration scripts to populate data
6. Test APIs with provided examples

### Key Concepts to Understand

1. **Layered Architecture**: Routes → Controllers → Services → Models
2. **localeGroupId**: Translation linking system
3. **Validation Flow**: Zod schemas at route level
4. **Error Handling**: Centralized middleware
5. **Mongoose Indexes**: Performance optimization

### Before Making Changes

- ✅ Understand the current architecture
- ✅ Follow existing patterns
- ✅ Maintain consistency across modules
- ✅ Update documentation
- ✅ Test thoroughly

---

**Document End** 🎉

_هذا الملف هو المرجع الرئيسي للمشروع. يجب تحديثه مع كل phase جديدة._
