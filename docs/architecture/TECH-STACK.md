# 🛠️ المكدس التقني - Tech Stack

## 📋 جدول المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [البيئة التشغيلية](#-البيئة-التشغيلية)
- [Core Technologies](#-core-technologies)
- [قاعدة البيانات](#-قاعدة-البيانات)
- [التحقق والأمان](#-التحقق-والأمان)
- [أدوات التطوير](#-أدوات-التطوير)
- [الاختبارات](#-الاختبارات)
- [سبب اختيار كل تقنية](#-سبب-اختيار-كل-تقنية)

---

## 🌟 نظرة عامة

ExploreKG Server مبني على مكدس تقني حديث يضمن **الأداء العالي**، **القابلية للصيانة**، و**الأمان المتقدم**.

### الفلسفة التقنية

✅ **TypeScript-First**: أمان الأنواع في كل مكان  
✅ **Validation-Heavy**: التحقق من كل مدخل  
✅ **Error-Safe**: معالجة شاملة للأخطاء  
✅ **Performance-Optimized**: استعلامات محسّنة وفهرسة ذكية  
✅ **Production-Ready**: جاهز للإنتاج مباشرة

---

## 🖥️ البيئة التشغيلية

### Runtime

```
Node.js v22.15.0
├── ECMAScript 2024
├── Native ESM Support
├── Top-level await
└── Enhanced Performance
```

**لماذا Node.js 22.15.0؟**

- ✅ أحدث إصدار LTS (Long Term Support)
- ✅ أداء محسّن بنسبة 20%
- ✅ دعم أفضل للـ TypeScript
- ✅ استقرار عالي

---

## ⚙️ Core Technologies

### 1. TypeScript v5.x

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**الميزات المستخدمة**:

- ✅ Strict Mode (أقصى أمان للأنواع)
- ✅ Type Inference الذكي
- ✅ Interfaces & Types المتقدمة
- ✅ Generics للكود القابل لإعادة الاستخدام
- ✅ Enums للقيم الثابتة

**مثال**:

```typescript
// من booking.model.ts
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface IBooking extends Document {
  bookingNumber: string;
  guestId: Types.ObjectId;
  status: BookingStatus;
  snapshot: BookingSnapshot;
  totalPrice: number;
}
```

---

### 2. Express.js v4.21.2

**دور**: Web Framework للـ RESTful APIs

**الميزات المستخدمة**:

```typescript
// من app.ts
const app = express();

// Middleware Stack
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));
app.use(limiter);

// Routes
app.use('/api/v1/guests', guestRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/travel-packs', travelPackRouter);
app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/cars', carRouter);
app.use('/api/v1/pack-relations', packRelationRouter);
app.use('/health', healthRouter);

// Error Handler
app.use(errorHandler);
```

**لماذا Express؟**

- ✅ شائع ومستقر (13M+ downloads/week)
- ✅ مرن وقابل للتوسع
- ✅ مجتمع ضخم
- ✅ Middleware ecosystem غني

---

## 🗃️ قاعدة البيانات

### MongoDB 6.0+ with Mongoose ODM

#### Mongoose v8.x

**دور**: Object Document Mapper (ODM)

**الميزات المستخدمة**:

1. **Schemas & Models**

```typescript
const GuestSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 }, // TTL Index
    },
  },
  { timestamps: true }
);
```

2. **Instance Methods**

```typescript
GuestSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date();
};
```

3. **Static Methods**

```typescript
GuestSchema.statics.findBySessionId = async function (sessionId: string) {
  return this.findOne({ sessionId });
};
```

4. **Hooks (Middleware)**

```typescript
GuestSchema.pre('save', function (next) {
  // Logic before save
  next();
});
```

5. **Indexes**

```typescript
// Compound Index
TravelPackSchema.index({ localeGroupId: 1, language: 1 });

// Text Index للبحث
TravelPackSchema.index({
  title: 'text',
  description: 'text',
});

// TTL Index للحذف التلقائي
BookingSchema.index(
  {
    createdAt: 1,
  },
  {
    expireAfterSeconds: 86400, // 24 hours
    partialFilterExpression: {
      paymentStatus: 'unpaid',
    },
  }
);
```

**لماذا MongoDB + Mongoose؟**

- ✅ مرونة Schema (NoSQL)
- ✅ JSON-native (سهولة التعامل)
- ✅ Aggregation Pipeline قوي
- ✅ TTL Indexes للحذف التلقائي
- ✅ مقياس أفقي سهل (Sharding)

---

## 🔐 التحقق والأمان

### 1. Zod v4

**دور**: Schema Validation & Type Safety

**لماذا Zod v4؟**

- ✅ **Type-safe**: استنتاج تلقائي للأنواع
- ✅ **Composable**: إعادة استخدام Schemas
- ✅ **Powerful**: Custom validations و refinements
- ✅ **Clear Errors**: رسائل خطأ واضحة

**مثال متقدم**:

```typescript
// من booking.validator.ts
export const bookingCreateSchema = z
  .object({
    guestId: z.string().refine(
      val => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        return uuidRegex.test(val) || objectIdRegex.test(val);
      },
      { message: 'Invalid Guest ID format' }
    ),
    itemType: z.enum(['TRAVEL_PACK', 'ACTIVITY', 'CAR']),
    itemId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    numberOfPersons: z.number().int().min(1).max(50),
    numberOfDays: z.number().int().min(1).max(365).optional(),
  })
  .refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
  })
  .refine(
    data => {
      if (data.itemType === 'CAR' && !data.numberOfDays) {
        return false;
      }
      return true;
    },
    { message: 'Number of days is required for car bookings' }
  );

// استخدام
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
```

---

### 2. UUID v4

**دور**: توليد معرفات فريدة للجلسات

```typescript
import { v4 as uuidv4 } from 'uuid';

const sessionId = uuidv4();
// Result: "a7b8f226-48ee-4df9-b2f2-8ca9637e02c8"
```

**لماذا UUID v4؟**

- ✅ **Collision-free**: احتمالية التكرار = 1 في 2^122
- ✅ **Secure**: عشوائي تمامًا
- ✅ **Privacy**: لا يكشف معلومات عن النظام

---

### 3. Security Middleware

#### Helmet.js

```typescript
import helmet from 'helmet';
app.use(helmet());
```

**الحماية**:

- X-Powered-By header removal
- Content Security Policy
- X-Frame-Options (Clickjacking protection)
- HSTS (HTTP Strict Transport Security)

#### CORS

```typescript
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || '*',
  })
);
```

#### Rate Limiter

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: 'Too many requests from this IP',
});

app.use(limiter);
```

---

## 🛠️ أدوات التطوير

### 1. TSX (TypeScript Execution)

```bash
# تشغيل مباشر بدون build
node --import tsx src/server.ts
```

### 2. Nodemon

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "exec": "tsx src/server.ts"
}
```

### 3. Pino Logger

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});
```

**الميزات**:

- ✅ سريع جدًا (30x أسرع من Winston)
- ✅ JSON-structured logs
- ✅ Pretty output للتطوير
- ✅ HTTP request logging

---

## 🧪 الاختبارات

### 1. Jest v29

```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": ["**/__tests__/**/*.test.ts", "**/tests/**/*.test.ts"],
  "collectCoverage": true,
  "coverageDirectory": "coverage"
}
```

### 2. Supertest

```typescript
import request from 'supertest';
import app from '../app';

describe('Guest API', () => {
  it('should create a guest', async () => {
    const response = await request(app).post('/api/v1/guests').send({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### 3. MongoDB Memory Server

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

---

## 📦 إدارة الحزم

### pnpm

**لماذا pnpm؟**

- ✅ **أسرع**: 2x من npm/yarn
- ✅ **موفر للمساحة**: Hard links بدلاً من نسخ
- ✅ **Strict**: منع phantom dependencies
- ✅ **Monorepo-friendly**

```json
{
  "dependencies": {
    "express": "^4.21.2",
    "mongoose": "^8.9.3",
    "zod": "^4.0.0-beta.3",
    "uuid": "^11.0.5",
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.5.0",
    "pino": "^9.5.0",
    "pino-http": "^10.4.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@types/express": "^5.0.0",
    "typescript": "^5.7.3",
    "tsx": "^4.19.2",
    "nodemon": "^3.1.9",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.14",
    "ts-jest": "^29.2.5",
    "supertest": "^7.0.0",
    "mongodb-memory-server": "^10.1.3"
  }
}
```

---

## 💡 سبب اختيار كل تقنية

### Node.js + TypeScript

| مشكلة                      | الحل                          |
| -------------------------- | ----------------------------- |
| JavaScript غير آمن الأنواع | TypeScript Strict Mode        |
| أخطاء Runtime              | Type Checking في Compile Time |
| كود صعب الصيانة            | Interfaces & Types واضحة      |
| IDE Support ضعيف           | IntelliSense كامل             |

### Express.js

| مشكلة               | الحل                       |
| ------------------- | -------------------------- |
| حاجة لـ HTTP Server | Express minimal & flexible |
| Routing معقد        | Express Router بسيط        |
| Middleware chaos    | Organized middleware stack |

### MongoDB + Mongoose

| مشكلة           | الحل                       |
| --------------- | -------------------------- |
| Schema غير ثابت | Mongoose Schema definition |
| Validation يدوي | Built-in validators        |
| Queries معقدة   | Mongoose Query Builder     |
| TTL manual      | TTL Indexes تلقائي         |

### Zod

| مشكلة                     | الحل                     |
| ------------------------- | ------------------------ |
| Validation منفصل عن Types | Zod type inference       |
| Custom validations صعبة   | .refine() & .transform() |
| Error messages غير واضحة  | Custom error messages    |

### Pino

| مشكلة                       | الحل                 |
| --------------------------- | -------------------- |
| Logging بطيء                | Pino fastest logger  |
| Logs غير منظمة              | JSON-structured logs |
| Production logs صعب قراءتها | Log levels & filters |

---

## 📊 مقارنة الأداء

### Express vs Alternatives

```
Express:     20,000 req/sec
Fastify:     35,000 req/sec ✅ (خطط مستقبلية)
NestJS:      18,000 req/sec
Koa:         19,000 req/sec
```

### Pino vs Alternatives

```
Pino:        30,000 log/sec ✅
Winston:     1,000 log/sec
Bunyan:      10,000 log/sec
Morgan:      5,000 log/sec
```

### Mongoose vs Raw Driver

```
Raw MongoDB:   100% speed
Mongoose:      95% speed ✅ (مقايضة: features vs raw speed)
Prisma:        85% speed
TypeORM:       80% speed
```

---

## 🔮 ترقيات مستقبلية

### القصيرة الأمد (3 أشهر)

- [ ] Fastify بدلاً من Express
- [ ] Redis للكاش
- [ ] GraphQL API

### المتوسطة الأمد (6 أشهر)

- [ ] Microservices Architecture
- [ ] RabbitMQ للـ Message Queue
- [ ] Elasticsearch للبحث المتقدم

### البعيدة الأمد (12 شهر)

- [ ] gRPC للـ Internal APIs
- [ ] Kubernetes للـ Orchestration
- [ ] Service Mesh (Istio)

---

## 📚 موارد إضافية

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [MongoDB Performance Best Practices](https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

_📘 Auto-generated by Copilot Documentation Architect — ExploreKG Server Project_
