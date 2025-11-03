# 🚀 ExploreKG Server - Project Overview للـ ChatGPT

**هذه وثيقة شاملة تشرح مشروع ExploreKG Server لمساعدة ChatGPT في فهم النظام وتقديم الدعم الفني**

---

## 🎯 نظرة عامة سريعة

**ExploreKG Server** هو نظام backend متكامل مبني بـ **Node.js + TypeScript** لإدارة منصة سياحية شاملة في قيرغيزستان. النظام يركز على **تجربة الضيوف بدون تسجيل دائم** مع نظام حجوزات متقدم.

### 🔑 المفاهيم الأساسية:

- **Guest-Based System**: ضيوف مؤقتون بدلاً من مستخدمين دائمين
- **Snapshot Architecture**: حماية بيانات الحجوزات من التغييرات
- **TTL System**: انتهاء تلقائي للجلسات والحجوزات
- **Multi-language**: دعم العربية والإنجليزية والفرنسية

---

## 🏗️ المكدس التقني

```json
{
  "runtime": "Node.js 22.15+",
  "language": "TypeScript 5.x",
  "framework": "Express.js 5.x",
  "database": "MongoDB 8.x + Mongoose",
  "validation": "Zod 4.x",
  "testing": "Jest 30.x",
  "logging": "Pino",
  "security": "Helmet + CORS + Rate Limiting"
}
```

### 📦 هيكل المشروع:

```
src/
├── controllers/    # HTTP handlers (7 controllers)
├── services/       # Business logic (6 services)
├── models/         # Mongoose schemas (7 models)
├── routes/         # API endpoints (6 route files)
├── validators/     # Zod validation schemas
├── middleware/     # Express middleware
├── config/         # Environment & DB config
├── types/          # TypeScript interfaces
└── utils/          # Helper functions
```

---

## 🧩 الأنظمة الرئيسية (6 أنظمة)

### 1️⃣ **Guest System** - نظام الضيوف

**الفكرة**: زوار مؤقتون بدون حسابات دائمة

- **API**: 10 endpoints (`/api/v1/guests`)
- **UUID Sessions**: جلسات v4 لمدة 24 ساعة
- **Auto-cleanup**: حذف تلقائي للجلسات المنتهية
- **Statistics**: إحصائيات الضيوف والنشاط

### 2️⃣ **Booking System** - نظام الحجوزات

**الفكرة**: حجوزات محمية بـ snapshot architecture

- **API**: 9 endpoints (`/api/v1/bookings`)
- **Booking Number**: رقم فريد بصيغة `BKG-20251102-0001`
- **Snapshot**: تجميد بيانات العنصر المحجوز لحماية السعر
- **Payment Flow**: معالجة دفع وإلغاء متقدمة
- **TTL**: انتهاء تلقائي للحجوزات غير المدفوعة (24 ساعة)

### 3️⃣ **Travel Packs System** - حزم السفر

**الفكرة**: باقات سياحية شاملة متعددة اللغات

- **API**: 6+ endpoints (`/api/v1/travel-packs`)
- **Multi-language**: محتوى بالعربية والإنجليزية والفرنسية
- **Advanced Search**: بحث وفلترة متقدمة
- **Images**: معرض صور مع metadata

### 4️⃣ **Activities System** - الأنشطة

**الفكرة**: تجارب وفعاليات سياحية منفردة

- **API**: 6+ endpoints (`/api/v1/activities`)
- **Categories**: تصنيفات متنوعة (adventure, cultural, etc.)
- **Duration**: مدة النشاط وتوقيتات مرنة
- **Pricing**: أسعار متدرجة حسب المجموعة

### 5️⃣ **Cars System** - السيارات

**الفكرة**: خدمة تأجير مركبات متنوعة

- **API**: 6+ endpoints (`/api/v1/cars`)
- **Fleet Management**: إدارة أسطول متنوع
- **Availability**: نظام تتبع التوفر
- **Pricing**: أسعار حسب النوع والمدة

### 6️⃣ **Pack Relations System** - علاقات الحزم

**الفكرة**: ربط الحزم بالأنشطة والسيارات

- **API**: 4+ endpoints (`/api/v1/pack-relations`)
- **Linking**: ربط حزم السفر بمكوناتها
- **Bundling**: تجميع العناصر في باقات
- **Pricing Logic**: حساب أسعار الباقات

---

## 🔄 تدفق العمل الأساسي

### مثال: رحلة حجز كاملة

```
1. إنشاء ضيف مؤقت
   POST /api/v1/guests
   → UUID sessionId + معلومات أساسية

2. تصفح الكتالوج
   GET /api/v1/travel-packs
   → قائمة الحزم السياحية

3. إنشاء حجز
   POST /api/v1/bookings
   → snapshot + رقم حجز فريد

4. معالجة الدفع
   POST /api/v1/bookings/{number}/payment
   → تأكيد وإتمام الحجز

5. إدارة الحجز
   GET /api/v1/bookings/{number}
   → تفاصيل، إلغاء، أو تعديل
```

---

## 📊 نماذج البيانات الأساسية

### Guest Model

```typescript
{
  sessionId: string,        // UUID v4
  email: string,
  firstName: string,
  lastName: string,
  phoneNumber?: string,
  preferences?: object,
  createdAt: Date,
  expiresAt: Date          // TTL: 24 hours
}
```

### Booking Model

```typescript
{
  bookingNumber: string,    // "BKG-20251102-0001"
  guestId: ObjectId,
  itemType: "TravelPack" | "Activity" | "Car",
  itemId: ObjectId,
  snapshot: object,         // Frozen item data
  totalPrice: number,
  status: "pending" | "paid" | "cancelled",
  paymentInfo?: object,
  createdAt: Date,
  expiresAt: Date          // TTL: 24 hours for unpaid
}
```

### Travel Pack Model

```typescript
{
  localeGroupId: string,    // Links translations
  title: { ar: string, en: string, fr: string },
  description: { ar: string, en: string, fr: string },
  price: { amount: number, currency: "USD" },
  duration: number,         // Days
  images: Array<{url, caption, metadata}>,
  features: string[],
  isActive: boolean
}
```

---

## 🚨 نقاط مهمة للـ ChatGPT

### ✅ نقاط القوة:

- **مُختبر بالكامل**: جميع الأنظمة مختبرة ومُؤكدة العمل
- **موثق جيداً**: 60+ ملف وثائق منظمة
- **Architecture متين**: Snapshot + TTL + UUID sessions
- **Production Ready**: نظام الحجوزات مكتمل ومُختبر

### ⚠️ تحديات محتملة:

- **TTL Management**: إدارة انتهاء الجلسات والحجوزات
- **Snapshot Consistency**: ضمان تطابق البيانات المجمدة
- **Multi-language**: إدارة المحتوى متعدد اللغات
- **Payment Integration**: تكامل مع بوابات دفع حقيقية

### 🔧 مناطق التطوير:

- **Authentication**: نظام مستخدمين دائم مستقبلاً
- **Notifications**: إشعارات email/SMS
- **Analytics**: تحليلات متقدمة للاستخدام
- **Mobile API**: تحسينات للتطبيقات المحمولة

---

## 📁 هيكل الوثائق

```
docs/
├── INDEX.md                    # فهرس شامل
├── frontend/                   # أدلة تكامل Frontend (9 ملفات)
├── api/                       # وثائق APIs (7 ملفات)
├── architecture/              # تصميم النظام (5 ملفات)
├── features/                  # شرح الأنظمة (4 ملفات)
├── database/                  # نماذج البيانات (4 ملفات)
├── testing/                   # أدلة الاختبار (4 ملفات)
├── reports/                   # تقارير التطوير (11 ملف)
├── data-specs/                # مواصفات البيانات (3 ملفات)
├── quick-reference/           # مراجع سريعة (4 ملفات)
├── implementation/            # تفاصيل التنفيذ (1 ملف)
└── github/                    # ملفات GitHub (2 ملف)
```

---

## 🎯 حالات الاستخدام الشائعة للمساعدة

### للتطوير:

- **إضافة endpoints جديدة** لأي من الأنظمة الـ6
- **تحسين validation** باستخدام Zod schemas
- **تطوير اختبارات** جديدة للميزات
- **تحسين الأداء** وفهرسة MongoDB

### لـ Frontend Integration:

- **تكامل React/Next.js** مع APIs
- **إدارة state** للـ Guest sessions
- **معالجة errors** وتجربة المستخدم
- **TypeScript interfaces** للبيانات

### للنشر والتشغيل:

- **Environment configuration** للبيئات المختلفة
- **Database optimization** وفهرسة
- **Performance monitoring** ومتابعة الأداء
- **Security hardening** وحماية النظام

---

## 🔗 مراجع سريعة

- **Base URL**: `http://localhost:4000/api/v1`
- **Database**: MongoDB مع Mongoose ODM
- **Branch**: `feature/booking-journey-guest-v1`
- **Status**: Production-ready للضيوف والحجوزات ✅
- **Documentation**: 60 ملف منظم في `docs/`
- **Tests**: مُختبر بالكامل مع Jest

**ملاحظة للـ ChatGPT**: هذا النظام مُختبر ومُؤكد العمل. يمكنك الثقة في البنية المعمارية وتقديم نصائح تطوير متقدمة بناءً على هذا الأساس المتين! 🚀
