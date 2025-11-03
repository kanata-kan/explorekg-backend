# 📂 بنية المشروع - Project Structure

## 📋 جدول المحتويات

- [الهيكل الكامل](#-الهيكل-الكامل)
- [شرح المجلدات](#-شرح-المجلدات)
- [اتفاقيات التسمية](#-اتفاقيات-التسمية)
- [معمارية الملفات](#-معمارية-الملفات)
- [نمط التنظيم](#-نمط-التنظيم)

---

## 🌳 الهيكل الكامل

```
explorekg-server/
│
├── 📦 node_modules/              # التبعيات (مُدار بواسطة pnpm)
│
├── 📁 src/                       # الكود المصدري الرئيسي
│   │
│   ├── 📁 __tests__/            # اختبارات مجاورة للكود
│   │   └── guest.service.test.ts
│   │
│   ├── 📁 config/               # ملفات الإعداد
│   │   ├── db.ts               # اتصال MongoDB
│   │   └── env.ts              # متغيرات البيئة
│   │
│   ├── 📁 controllers/          # طبقة المتحكمات (HTTP Handlers)
│   │   ├── activity.controller.ts
│   │   ├── booking.controller.ts       ✅ نظام الحجوزات
│   │   ├── car.controller.ts
│   │   ├── guest.controller.ts         ✅ نظام الضيوف
│   │   ├── healthController.ts
│   │   ├── packRelation.controller.ts
│   │   └── travelPack.controller.ts
│   │
│   ├── 📁 middleware/           # البرمجيات الوسيطة
│   │   └── errorHandler.ts     # معالج الأخطاء المركزي
│   │
│   ├── 📁 models/               # نماذج Mongoose (Schemas)
│   │   ├── activity.model.ts
│   │   ├── booking.model.ts            ✅ نموذج الحجوزات
│   │   ├── bookingCounter.model.ts     ✅ عداد الحجوزات
│   │   ├── car.model.ts
│   │   ├── guest.model.ts              ✅ نموذج الضيوف
│   │   ├── packRelation.model.ts
│   │   └── travelPack.model.ts
│   │
│   ├── 📁 routes/               # تعريف المسارات (Routes)
│   │   ├── activity.routes.ts
│   │   ├── booking.routes.ts           ✅ 9 endpoints
│   │   ├── car.routes.ts
│   │   ├── guest.routes.ts             ✅ 10 endpoints
│   │   ├── health.ts
│   │   ├── packRelation.routes.ts
│   │   └── travelPack.routes.ts
│   │
│   ├── 📁 services/             # طبقة الخدمات (Business Logic)
│   │   ├── activity.service.ts
│   │   ├── booking.service.ts          ✅ منطق الحجوزات
│   │   ├── car.service.ts
│   │   ├── guest.service.ts            ✅ منطق الضيوف
│   │   ├── packRelation.service.ts
│   │   └── travelPack.service.ts
│   │
│   ├── 📁 types/                # تعريفات TypeScript
│   │   ├── common.ts           # أنواع مشتركة
│   │   ├── index.ts            # تصدير الأنواع
│   │   └── middleware/
│   │       ├── asyncHandler.ts
│   │       ├── errorHandler.ts
│   │       └── language.ts
│   │
│   ├── 📁 utils/                # أدوات مساعدة
│   │   ├── AppError.ts         # فئة الأخطاء المخصصة
│   │   ├── logger.ts           # Pino Logger
│   │   └── responseHelpers.ts  # دوال مساعدة للاستجابات
│   │
│   ├── 📁 validators/           # Zod Validation Schemas
│   │   ├── activity.validator.ts
│   │   ├── booking.validator.ts        ✅ Zod schemas للحجوزات
│   │   ├── car.validator.ts
│   │   ├── guest.validator.ts          ✅ Zod schemas للضيوف
│   │   ├── index.ts
│   │   ├── packRelation.validator.ts
│   │   └── travelPack.validator.ts
│   │
│   ├── 📄 app.ts                # تطبيق Express الرئيسي
│   ├── 📄 server.ts             # نقطة الدخول للخادم
│   ├── 📄 quick-test-booking.ts ✅ اختبار شامل للحجوزات
│   └── 📄 quick-test-guest.ts   ✅ اختبار سريع للضيوف
│
├── 📁 tests/                    # اختبارات Integration & Unit
│   ├── integration/
│   │   ├── activities.test.ts
│   │   ├── cars.test.ts
│   │   ├── health.test.ts
│   │   ├── packRelation.integration.test.ts
│   │   └── travelPacks.test.ts
│   ├── unit/
│   │   ├── db.test.ts
│   │   └── packRelation.test.ts
│   └── setup.ts                # إعداد بيئة الاختبار
│
├── 📁 scripts/                  # سكريبتات الصيانة والترحيل
│   ├── check-atlas.js
│   ├── check-cars.js
│   ├── debug-query.js
│   ├── migrate-cars.js
│   ├── migrateActivitiesFromJson.ts
│   ├── migrateCarsFromJson.ts
│   └── migrateTravelPacksFromJson.ts
│
├── 📁 data/                     # بيانات JSON للترحيل
│   └── content/
│       ├── en/                  # محتوى إنجليزي
│       │   ├── activities.json
│       │   ├── cars.json
│       │   ├── contact.json
│       │   ├── footerLinks.json
│       │   ├── gallery.json
│       │   ├── home.json
│       │   ├── navLinks.json
│       │   ├── our-story.json
│       │   ├── services.json
│       │   └── travel-packs.json
│       └── fr/                  # محتوى فرنسي
│           ├── activities.json
│           ├── cars.json
│           ├── contact.json
│           ├── footerLinks.json
│           ├── gallery.json
│           ├── home.json
│           ├── navLinks.json
│           ├── our-story.json
│           ├── services.json
│           └── travel-packs.json
│
├── 📁 docs/                     # التوثيق الكامل
│   ├── README.md               # مركز التوثيق
│   ├── architecture/           # وثائق البنية المعمارية
│   │   ├── SYSTEM-OVERVIEW.md
│   │   ├── TECH-STACK.md
│   │   ├── PROJECT-STRUCTURE.md  ← أنت هنا
│   │   └── DATA-FLOW.md
│   ├── api/                    # وثائق APIs
│   │   ├── API-OVERVIEW.md
│   │   ├── GUEST-API.md
│   │   ├── BOOKING-API.md
│   │   ├── TRAVEL-PACKS-API.md
│   │   ├── ACTIVITIES-API.md
│   │   ├── CARS-API.md
│   │   └── PACK-RELATIONS-API.md
│   ├── features/               # وثائق الأنظمة
│   │   ├── GUEST-SYSTEM.md
│   │   ├── BOOKING-SYSTEM.md
│   │   ├── CATALOG-SYSTEM.md
│   │   └── PACK-RELATIONS.md
│   ├── database/               # وثائق قاعدة البيانات
│   │   ├── MODELS-OVERVIEW.md
│   │   ├── GUEST-MODEL.md
│   │   ├── BOOKING-MODEL.md
│   │   └── SCHEMAS.md
│   ├── testing/                # وثائق الاختبارات
│   │   ├── TESTING-GUIDE.md
│   │   ├── INTEGRATION-TESTS.md
│   │   └── QUICK-TESTS.md
│   └── deployment/             # وثائق النشر
│       ├── SETUP-GUIDE.md
│       ├── ENVIRONMENT.md
│       └── PRODUCTION-CHECKLIST.md
│
├── 📁 reports/                  # تقارير الأداء والاختبارات
│   ├── BOOKING-JOURNEY-REPORT.md
│   ├── SYSTEM-STATUS.md
│   └── CHANGELOG.md
│
├── 📄 .env                      # متغيرات البيئة (غير مُتابع في Git)
├── 📄 .env.example             # قالب متغيرات البيئة
├── 📄 .gitignore               # ملفات مُستبعدة من Git
├── 📄 package.json             # تبعيات وسكريبتات npm
├── 📄 pnpm-lock.yaml           # قفل إصدارات التبعيات (pnpm)
├── 📄 tsconfig.json            # إعدادات TypeScript
├── 📄 jest.config.json         # إعدادات Jest
├── 📄 nodemon.json             # إعدادات Nodemon
├── 📄 test-booking.http        # طلبات HTTP للحجوزات (REST Client)
├── 📄 test-guest.http          # طلبات HTTP للضيوف (REST Client)
└── 📄 README.md                # الوثيقة الرئيسية للمشروع
```

---

## 📚 شرح المجلدات

### 📁 `src/` - المصدر الرئيسي

المجلد الذي يحتوي على **كل الكود التنفيذي**. مقسّم حسب المسؤوليات.

---

### 📁 `src/config/` - الإعدادات

**الغرض**: ملفات إعداد النظام والاتصالات الخارجية

| الملف    | الوصف                                  |
| -------- | -------------------------------------- |
| `db.ts`  | اتصال MongoDB، معالجة الأخطاء، Logging |
| `env.ts` | تحميل والتحقق من متغيرات البيئة        |

**مثال** (`db.ts`):

```typescript
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection failed', error);
    process.exit(1);
  }
};
```

---

### 📁 `src/controllers/` - المتحكمات

**الغرض**: معالجة طلبات HTTP وإرجاع استجابات

**المسؤوليات**:

1. استخراج البيانات من `req` (body, params, query)
2. استدعاء الـ Services
3. تنسيق الاستجابة
4. إرجاع الـ Response مع Status Code

**التسمية**: `<entity>.controller.ts`

**مثال** (`guest.controller.ts`):

```typescript
export const createGuest = async (req: Request, res: Response) => {
  const guestData = req.body;
  const guest = await guestService.createGuest(guestData);

  res.status(201).json({
    success: true,
    data: guest,
  });
};
```

**7 Controllers**:

- `activity.controller.ts` (6+ handlers)
- `booking.controller.ts` (9 handlers) ✅
- `car.controller.ts` (6+ handlers)
- `guest.controller.ts` (10 handlers) ✅
- `healthController.ts` (1 handler)
- `packRelation.controller.ts` (4+ handlers)
- `travelPack.controller.ts` (6+ handlers)

---

### 📁 `src/middleware/` - البرمجيات الوسيطة

**الغرض**: دوال تعالج الطلبات قبل/بعد Controllers

**الملفات**:

- `errorHandler.ts`: معالج أخطاء مركزي

**مثال**:

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  logger.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
```

---

### 📁 `src/models/` - النماذج

**الغرض**: تعريف Schemas وModels لـ Mongoose

**التسمية**: `<entity>.model.ts`

**بنية نموذج نموذجي**:

```typescript
// 1. TypeScript Interface
export interface IGuest extends Document {
  sessionId: string;
  email: string;
  name: string;
  expiresAt: Date;
}

// 2. Mongoose Schema
const GuestSchema = new Schema<IGuest>(
  {
    sessionId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// 3. Indexes
GuestSchema.index({ sessionId: 1 }, { unique: true });
GuestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 4. Instance Methods
GuestSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date();
};

// 5. Static Methods
GuestSchema.statics.findBySessionId = async function (sessionId: string) {
  return this.findOne({ sessionId });
};

// 6. Export Model
export const Guest = mongoose.model<IGuest>('Guest', GuestSchema);
```

**7 Models**:

1. `guest.model.ts` - نموذج الضيوف مع UUID sessions
2. `booking.model.ts` - نموذج الحجوزات مع snapshot
3. `bookingCounter.model.ts` - عداد أرقام الحجوزات
4. `travelPack.model.ts` - حزم السفر متعددة اللغات
5. `activity.model.ts` - الأنشطة السياحية
6. `car.model.ts` - السيارات للتأجير
7. `packRelation.model.ts` - علاقات الحزم

---

### 📁 `src/routes/` - المسارات

**الغرض**: تعريف نقاط النهاية (Endpoints) وربطها بالـ Controllers

**التسمية**: `<entity>.routes.ts`

**بنية ملف Routes**:

```typescript
import { Router } from 'express';
import * as controller from '../controllers/guest.controller';
import * as validator from '../validators/guest.validator';

const router = Router();

// POST /api/v1/guests - Create guest
router.post(
  '/',
  validator.validateBody(validator.guestCreateSchema),
  controller.createGuest
);

// GET /api/v1/guests/:sessionId - Get guest by session
router.get(
  '/:sessionId',
  validator.validateParams(validator.sessionIdParamSchema),
  controller.getGuestBySessionId
);

export default router;
```

**7 Routers**:

- `activity.routes.ts`
- `booking.routes.ts` (9 endpoints) ✅
- `car.routes.ts`
- `guest.routes.ts` (10 endpoints) ✅
- `health.ts`
- `packRelation.routes.ts`
- `travelPack.routes.ts`

---

### 📁 `src/services/` - الخدمات

**الغرض**: المنطق التجاري (Business Logic)

**المسؤوليات**:

1. التعامل مع الـ Models
2. تنفيذ قواعد الأعمال
3. العمليات المعقدة (Calculations, Snapshots)
4. التكامل مع خدمات خارجية
5. رمي Errors تجارية

**التسمية**: `<entity>.service.ts`

**مثال** (`booking.service.ts`):

```typescript
export const createBooking = async (
  data: BookingCreateInput
): Promise<IBooking> => {
  // 1. Business Rule: Verify guest
  const guest = await Guest.findBySessionId(data.guestId);
  if (!guest) {
    throw new NotFoundError('Guest not found');
  }

  // 2. Fetch item
  const item = await fetchItem(data.itemType, data.itemId);

  // 3. Complex Operation: Create snapshot
  const snapshot = await createBookingSnapshot(item, data.itemType);

  // 4. Calculation
  const totalPrice = calculateBookingPrice(snapshot, data);

  // 5. Generate unique number
  const bookingNumber = await BookingCounter.getNextBookingNumber();

  // 6. Save
  const booking = await Booking.create({
    bookingNumber,
    guestId: guest._id,
    snapshot,
    totalPrice,
    ...data,
  });

  return booking;
};
```

**6 Services**:

- `activity.service.ts`
- `booking.service.ts` (9 functions) ✅
- `car.service.ts`
- `guest.service.ts` (10 functions) ✅
- `packRelation.service.ts`
- `travelPack.service.ts`

---

### 📁 `src/types/` - تعريفات الأنواع

**الغرض**: TypeScript Interfaces, Types, Enums المشتركة

| الملف         | الوصف                          |
| ------------- | ------------------------------ |
| `common.ts`   | أنواع عامة مُستخدمة في المشروع |
| `index.ts`    | تصدير مركزي للأنواع            |
| `middleware/` | أنواع خاصة بالـ Middleware     |

---

### 📁 `src/utils/` - الأدوات المساعدة

**الغرض**: دوال وأدوات قابلة لإعادة الاستخدام

| الملف                | الوصف                            |
| -------------------- | -------------------------------- |
| `AppError.ts`        | فئة مخصصة للأخطاء مع Status Code |
| `logger.ts`          | إعداد Pino Logger                |
| `responseHelpers.ts` | دوال تنسيق الاستجابات            |

**مثال** (`AppError.ts`):

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}
```

---

### 📁 `src/validators/` - المُحققات

**الغرض**: Zod Schemas للتحقق من المدخلات

**التسمية**: `<entity>.validator.ts`

**بنية Validator**:

```typescript
import { z } from 'zod';

// 1. Define Schemas
export const guestCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
});

// 2. Export Inferred Types
export type GuestCreateInput = z.infer<typeof guestCreateSchema>;

// 3. Middleware Functions
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};
```

**7 Validators**:

- `activity.validator.ts`
- `booking.validator.ts` ✅ (UUID + ObjectId support)
- `car.validator.ts`
- `guest.validator.ts` ✅
- `index.ts`
- `packRelation.validator.ts`
- `travelPack.validator.ts`

---

## 🔤 اتفاقيات التسمية

### الملفات

```
<entity>.<layer>.ts

Examples:
- guest.model.ts      (Model layer)
- guest.service.ts    (Service layer)
- guest.controller.ts (Controller layer)
- guest.routes.ts     (Routes layer)
- guest.validator.ts  (Validator layer)
```

### المجلدات

```
lowercase-kebab-case

Examples:
- src/controllers/
- src/models/
- docs/architecture/
```

### الوظائف والمتغيرات

```
camelCase

Examples:
- createGuest()
- findBySessionId()
- totalPrice
```

### الأصناف والواجهات

```
PascalCase

Examples:
- class AppError
- interface IGuest
- enum BookingStatus
```

### الثوابت

```
UPPER_SNAKE_CASE

Examples:
- const MAX_REQUESTS = 1000;
- const DEFAULT_LIMIT = 10;
```

---

## 🏛️ معمارية الملفات

### تدفق الطلب خلال الملفات

```
┌─────────────────┐
│   HTTP Request  │
└────────┬────────┘
         │
┌────────▼────────┐
│   app.ts        │  ← Express app
└────────┬────────┘
         │
┌────────▼────────┐
│  <entity>.      │  ← Route matching
│  routes.ts      │
└────────┬────────┘
         │
┌────────▼────────┐
│  <entity>.      │  ← Validation
│  validator.ts   │
└────────┬────────┘
         │
┌────────▼────────┐
│  <entity>.      │  ← HTTP handling
│  controller.ts  │
└────────┬────────┘
         │
┌────────▼────────┐
│  <entity>.      │  ← Business logic
│  service.ts     │
└────────┬────────┘
         │
┌────────▼────────┐
│  <entity>.      │  ← Database operations
│  model.ts       │
└────────┬────────┘
         │
┌────────▼────────┐
│   MongoDB       │
└─────────────────┘
```

---

## 🎨 نمط التنظيم

### Feature-Based Organization

المشروع منظم حسب **الميزة** (Feature) وليس حسب **النوع** (Type).

#### ✅ الطريقة المستخدمة (Feature-Based)

```
guest/
├── guest.model.ts
├── guest.service.ts
├── guest.controller.ts
├── guest.routes.ts
└── guest.validator.ts
```

**المزايا**:

- سهولة العثور على كل شيء متعلق بميزة واحدة
- سهولة حذف أو إضافة ميزات
- وضوح الحدود بين الأنظمة

---

## 📊 إحصائيات البنية

```
📦 explorekg-server
├── 📁 src/                    (115 files)
│   ├── controllers/           (7 files)
│   ├── models/                (7 files)
│   ├── services/              (6 files)
│   ├── routes/                (7 files)
│   ├── validators/            (7 files)
│   └── ...
├── 📁 tests/                  (8 files)
├── 📁 docs/                   (28+ files)
├── 📁 scripts/                (7 files)
└── 📁 data/                   (20 JSON files)

Total: 21 directories, 115+ files
```

---

## 🚀 كيفية إضافة ميزة جديدة

### مثال: إضافة نظام Reviews

```bash
# 1. Create model
touch src/models/review.model.ts

# 2. Create service
touch src/services/review.service.ts

# 3. Create validator
touch src/validators/review.validator.ts

# 4. Create controller
touch src/controllers/review.controller.ts

# 5. Create routes
touch src/routes/review.routes.ts

# 6. Register routes in app.ts
# app.use('/api/v1/reviews', reviewRouter);

# 7. Create tests
touch tests/integration/reviews.test.ts

# 8. Create documentation
touch docs/api/REVIEW-API.md
```

---

## 📚 مراجع إضافية

- [نظرة عامة على النظام](./SYSTEM-OVERVIEW.md)
- [المكدس التقني](./TECH-STACK.md)
- [تدفق البيانات](./DATA-FLOW.md)

---

_📘 Auto-generated by Copilot Documentation Architect — ExploreKG Server Project_
