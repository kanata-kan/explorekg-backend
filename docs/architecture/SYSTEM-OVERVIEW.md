# 🏛️ نظرة عامة على النظام - System Overview

## 📋 جدول المحتويات

- [المقدمة](#-المقدمة)
- [الهيكل المعماري](#-الهيكل-المعماري)
- [الطبقات الأساسية](#-الطبقات-الأساسية)
- [تدفق الطلبات](#-تدفق-الطلبات)
- [الأنظمة الفرعية](#-الأنظمة-الفرعية)
- [قرارات التصميم](#-قرارات-التصميم)

---

## 🎯 المقدمة

**ExploreKG Server** هو نظام backend متكامل مبني على معمارية **Layered Architecture** مع فصل واضح للمسؤوليات (Separation of Concerns). يتبع المشروع نمط **MVC المحسّن** مع طبقة خدمات (Service Layer) إضافية للمنطق التجاري.

### الأهداف المعمارية

1. **القابلية للصيانة** (Maintainability): كود نظيف ومنظم
2. **القابلية للتوسع** (Scalability): سهولة إضافة ميزات جديدة
3. **الأمان** (Security): حماية متعددة الطبقات
4. **الأداء** (Performance): استجابة سريعة وكفاءة عالية
5. **الموثوقية** (Reliability): معالجة أخطاء شاملة

---

## 🏗️ الهيكل المعماري

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Web    │  │  Mobile  │  │  Admin   │  │  External│   │
│  │   App    │  │   App    │  │Dashboard │  │   APIs   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS (REST)
┌────────────────────────▼────────────────────────────────────┐
│                   Load Balancer (Optional)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Express.js Server :4000                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Middleware Stack                          │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │  │
│  │  │ CORS │→│Helmet│→│ Rate │→│Logger│→│ Error│      │  │
│  │  │      │ │      │ │Limit │ │(Pino)│ │Handle│      │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Routes Layer (API Endpoints)              │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  /api/v1/guests        [10 endpoints]      │    │  │
│  │  │  /api/v1/bookings      [9 endpoints]       │    │  │
│  │  │  /api/v1/travel-packs  [6+ endpoints]      │    │  │
│  │  │  /api/v1/activities    [6+ endpoints]      │    │  │
│  │  │  /api/v1/cars          [6+ endpoints]      │    │  │
│  │  │  /api/v1/pack-relations[4+ endpoints]      │    │  │
│  │  │  /health               [1 endpoint]        │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Validators Layer (Zod v4 Schemas)            │  │
│  │  - Request body validation                           │  │
│  │  - Query parameters validation                       │  │
│  │  - URL parameters validation                         │  │
│  │  - Custom business rules                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Controllers Layer (HTTP Handlers)            │  │
│  │  - Request/Response handling                         │  │
│  │  - Input extraction                                  │  │
│  │  - Response formatting                               │  │
│  │  - Status codes management                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Services Layer (Business Logic)              │  │
│  │  - Core business rules                               │  │
│  │  - Data transformation                               │  │
│  │  - External service integration                      │  │
│  │  - Complex operations orchestration                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Models Layer (Mongoose ODM)                  │  │
│  │  - Database schemas                                  │  │
│  │  - Validation rules                                  │  │
│  │  - Instance/Static methods                           │  │
│  │  - Hooks & Middleware                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ MongoDB Driver
┌────────────────────────▼────────────────────────────────────┐
│                   MongoDB Database                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Collections:                                        │  │
│  │  • guests            (TTL: 24h on sessionId)         │  │
│  │  • bookings          (TTL: 24h on unpaid)            │  │
│  │  • bookingcounters   (Daily counters)                │  │
│  │  • travelpacks       (Multi-language content)        │  │
│  │  • activities        (Multi-language content)        │  │
│  │  • cars              (Multi-language content)        │  │
│  │  • packrelations     (Linking system)                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Indexes:                                            │  │
│  │  • sessionId (unique) on guests                      │  │
│  │  • bookingNumber (unique) on bookings                │  │
│  │  • localeGroupId on content collections              │  │
│  │  • TTL indexes for auto-cleanup                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 الطبقات الأساسية

### 1️⃣ **Middleware Layer** - طبقة البرمجيات الوسيطة

**الموقع**: `src/middleware/`

**المسؤوليات**:

- معالجة الطلبات قبل وصولها للـ Controllers
- تطبيق سياسات الأمان (CORS, Helmet)
- تحديد معدل الطلبات (Rate Limiting)
- تسجيل الطلبات (Logging with Pino)
- معالجة الأخطاء المركزية

**المكونات الرئيسية**:

```typescript
- errorHandler.ts    // معالج أخطاء مركزي
- CORS Middleware    // التحكم في الوصول
- Helmet             // حماية HTTP headers
- Rate Limiter       // تحديد معدل الطلبات (1000 req/15min)
- Pino HTTP Logger   // تسجيل الطلبات والاستجابات
```

---

### 2️⃣ **Routes Layer** - طبقة المسارات

**الموقع**: `src/routes/`

**المسؤوليات**:

- تعريف نقاط النهاية (Endpoints)
- ربط HTTP Methods بالـ Controllers
- تطبيق Validators على الطلبات
- تنظيم الـ API versioning

**المسارات المتاحة**:
| Route | Endpoints | Description |
|-------|-----------|-------------|
| `/api/v1/guests` | 10 | إدارة الضيوف والجلسات |
| `/api/v1/bookings` | 9 | نظام الحجوزات الكامل |
| `/api/v1/travel-packs` | 6+ | إدارة حزم السفر |
| `/api/v1/activities` | 6+ | إدارة الأنشطة |
| `/api/v1/cars` | 6+ | إدارة السيارات |
| `/api/v1/pack-relations` | 4+ | ربط الحزم |
| `/health` | 1 | فحص صحة النظام |

---

### 3️⃣ **Validators Layer** - طبقة التحقق

**الموقع**: `src/validators/`

**المسؤوليات**:

- التحقق من صحة بيانات الإدخال
- تطبيق قواعد الأعمال (Business Rules)
- تحويل البيانات (Data Transformation)
- رسائل أخطاء واضحة ومفصلة

**التقنية المستخدمة**: **Zod v4**

**مثال على Schema**:

```typescript
// من booking.validator.ts
export const bookingCreateSchema = z
  .object({
    guestId: z.string().uuid(),
    itemType: z.enum(['TRAVEL_PACK', 'ACTIVITY', 'CAR']),
    itemId: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    numberOfPersons: z.number().int().min(1),
    numberOfDays: z.number().int().min(1).optional(),
  })
  .refine(data => {
    // قواعد مخصصة
    if (data.itemType === 'CAR' && !data.numberOfDays) {
      return false;
    }
    return new Date(data.endDate) > new Date(data.startDate);
  });
```

---

### 4️⃣ **Controllers Layer** - طبقة التحكم

**الموقع**: `src/controllers/`

**المسؤوليات**:

- استقبال HTTP Requests
- استخراج البيانات (body, params, query)
- استدعاء الـ Services
- تنسيق الاستجابات (Response Formatting)
- إدارة أكواد الحالة (Status Codes)

**مثال**:

```typescript
export const createBooking = async (req: Request, res: Response) => {
  const bookingData = req.body;
  const booking = await bookingService.createBooking(bookingData);
  res.status(201).json({
    success: true,
    data: booking,
  });
};
```

---

### 5️⃣ **Services Layer** - طبقة الخدمات

**الموقع**: `src/services/`

**المسؤوليات**:

- تنفيذ المنطق التجاري (Business Logic)
- التعامل مع الـ Models
- عمليات معقدة (Snapshots, Calculations)
- التكامل مع خدمات خارجية
- معالجة الأخطاء التجارية

**مثال على عملية معقدة**:

```typescript
// من booking.service.ts
export const createBooking = async (data: BookingCreateInput) => {
  // 1. التحقق من وجود الضيف
  const guest = await Guest.findBySessionId(data.guestId);

  // 2. جلب العنصر المراد حجزه
  const item = await fetchItem(data.itemType, data.itemId);

  // 3. إنشاء snapshot للبيانات
  const snapshot = await createBookingSnapshot(item, data.itemType);

  // 4. حساب السعر
  const totalPrice = calculateBookingPrice(snapshot, data);

  // 5. توليد رقم حجز فريد
  const bookingNumber = await BookingCounter.getNextBookingNumber();

  // 6. حفظ الحجز
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

---

### 6️⃣ **Models Layer** - طبقة النماذج

**الموقع**: `src/models/`

**المسؤوليات**:

- تعريف Schemas لـ MongoDB
- قواعد التحقق على مستوى قاعدة البيانات
- Instance Methods (دوال الكائن)
- Static Methods (دوال الصنف)
- Hooks (Pre/Post Middleware)
- فهرسة البيانات (Indexes)

**النماذج المتوفرة**:

1. `guest.model.ts` - نموذج الضيوف
2. `booking.model.ts` - نموذج الحجوزات
3. `bookingCounter.model.ts` - عداد الحجوزات
4. `travelPack.model.ts` - نموذج حزم السفر
5. `activity.model.ts` - نموذج الأنشطة
6. `car.model.ts` - نموذج السيارات
7. `packRelation.model.ts` - نموذج علاقات الحزم

---

## 🔄 تدفق الطلبات

### مثال: إنشاء حجز جديد

```
1. CLIENT
   └─> POST /api/v1/bookings
       Body: { guestId, itemType, itemId, ... }

2. MIDDLEWARE STACK
   ├─> CORS: ✅ Origin allowed
   ├─> Helmet: ✅ Security headers applied
   ├─> Rate Limiter: ✅ Under limit
   └─> Logger: 📝 Request logged

3. ROUTES
   └─> Match route: POST /api/v1/bookings
       └─> Apply validator: validateBody(bookingCreateSchema)

4. VALIDATOR
   ├─> Check guestId format (UUID)
   ├─> Validate itemType (enum)
   ├─> Validate dates
   └─> Custom rules (endDate > startDate)
       ✅ Validation passed

5. CONTROLLER
   ├─> Extract req.body
   ├─> Call bookingService.createBooking(data)
   └─> Wait for response...

6. SERVICE
   ├─> Verify guest exists
   ├─> Fetch item (TravelPack/Activity/Car)
   ├─> Create snapshot
   ├─> Calculate price
   ├─> Generate booking number
   ├─> Create booking record
   └─> Return booking object

7. CONTROLLER
   ├─> Format response
   ├─> Set status code: 201
   └─> Send JSON response

8. CLIENT
   └─> Receive: { success: true, data: { booking } }
```

---

## 🧩 الأنظمة الفرعية

### 1. نظام الضيوف (Guest System)

**الهدف**: إدارة الزوار بدون حسابات دائمة

**المكونات**:

- `guest.model.ts`: Schema مع TTL index (24h)
- `guest.service.ts`: 10 وظائف أساسية
- `guest.controller.ts`: 10 HTTP handlers
- `guest.routes.ts`: 10 endpoints
- `guest.validator.ts`: Zod schemas

**الميزات**:

- UUID v4 للجلسات
- انتهاء تلقائي بعد 24 ساعة
- تجديد الجلسة عند كل طلب
- حذف تلقائي للجلسات المنتهية

---

### 2. نظام الحجوزات (Booking System)

**الهدف**: إدارة حجوزات شاملة مع حماية البيانات

**المكونات**:

- `booking.model.ts`: Schema مع snapshot و TTL
- `bookingCounter.model.ts`: عداد ذري للأرقام
- `booking.service.ts`: 9 وظائف معقدة
- `booking.controller.ts`: 9 HTTP handlers
- `booking.routes.ts`: 9 endpoints
- `booking.validator.ts`: Zod schemas متقدمة

**الميزات**:

- رقم حجز فريد: `BKG-20251102-0001`
- Snapshot-based architecture
- معالجة الدفع والإلغاء
- انتهاء تلقائي للحجوزات غير المدفوعة
- دعم 3 أنواع: TravelPack, Activity, Car

---

### 3. نظام الكتالوج (Catalog System)

**الهدف**: إدارة المحتوى السياحي متعدد اللغات

**المكونات**:

- TravelPacks, Activities, Cars models
- Services متخصصة لكل نوع
- Controllers موحدة
- Multi-language support (en, fr, ar)

**الميزات**:

- localeGroupId لربط اللغات
- بحث وفلترة متقدمة
- إحصائيات
- تصدير/استيراد JSON

---

### 4. نظام العلاقات (Pack Relations System)

**الهدف**: ربط الحزم السياحية ببعضها

**المكونات**:

- `packRelation.model.ts`
- `packRelation.service.ts`
- `packRelation.controller.ts`

**الميزات**:

- ربط ثنائي الاتجاه
- توصيات ذكية
- تحليل العلاقات

---

## 💡 قرارات التصميم

### 1. لماذا Layered Architecture؟

✅ **فصل واضح للمسؤوليات**
✅ **سهولة الاختبار** (كل طبقة قابلة للاختبار منفصلة)
✅ **قابلية الصيانة** (تعديل طبقة دون تأثير الأخرى)
✅ **قابلية التوسع** (إضافة طبقات جديدة بسهولة)

### 2. لماذا Service Layer منفصلة؟

✅ **إعادة استخدام المنطق التجاري**
✅ **استقلالية عن HTTP** (يمكن استدعاء الخدمات من CLI, Jobs, etc.)
✅ **تسهيل الاختبارات** (Unit tests للـ Services)

### 3. لماذا Zod للتحقق؟

✅ **Type-safe** مع TypeScript
✅ **Schemas قابلة لإعادة الاستخدام**
✅ **رسائل أخطاء واضحة**
✅ **دعم Custom validations**

### 4. لماذا Snapshot-based للحجوزات؟

✅ **حماية من تغيير الأسعار**
✅ **حفظ تاريخي للبيانات**
✅ **قابلية للتدقيق** (Audit trail)

### 5. لماذا UUID للجلسات؟

✅ **أمان أعلى** من Auto-increment IDs
✅ **Collision-free** (احتمالية تكرار: 1 في 2^122)
✅ **Privacy-friendly** (لا يكشف عدد المستخدمين)

---

## 🔐 الأمان

### طبقات الحماية

1. **CORS**: تحديد Origins المسموحة
2. **Helmet**: حماية HTTP headers
3. **Rate Limiting**: 1000 طلب/15 دقيقة
4. **Validation**: التحقق من جميع المدخلات
5. **Error Handling**: عدم كشف تفاصيل داخلية
6. **TTL Indexes**: حذف تلقائي للبيانات القديمة

---

## 📈 الأداء

### استراتيجيات التحسين

1. **Indexing**: فهرسة جميع الحقول المستخدمة في البحث
2. **Lean Queries**: استخدام `.lean()` عند عدم الحاجة لـ Mongoose documents
3. **Projection**: جلب الحقول المطلوبة فقط
4. **Caching**: (خطط مستقبلية مع Redis)
5. **Pagination**: تحديد عدد النتائج

---

## 🔮 التطور المستقبلي

### الخطط القادمة

1. **Microservices**: تقسيم النظام لخدمات صغيرة
2. **GraphQL**: إضافة API بـ GraphQL
3. **WebSockets**: إشعارات فورية
4. **Caching Layer**: Redis للكاش
5. **Queue System**: RabbitMQ للمهام الخلفية
6. **Monitoring**: Prometheus + Grafana
7. **CI/CD**: Pipeline كامل

---

## 📚 مراجع إضافية

- [المكدس التقني](./TECH-STACK.md)
- [بنية المشروع](./PROJECT-STRUCTURE.md)
- [تدفق البيانات](./DATA-FLOW.md)
- [دليل API](../api/API-OVERVIEW.md)

---

_📘 Auto-generated by Copilot Documentation Architect — ExploreKG Server Project_
