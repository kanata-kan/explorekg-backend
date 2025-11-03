# 🔐 نظام الحماية الشامل (RBAC + Admin System)

> **تاريخ الإنشاء:** 3 نوفمبر 2025  
> **النسخة:** 1.0.0  
> **الفرع:** feature/security-hardening-v1  
> **الحالة:** ✅ مكتمل وجاهز للاستخدام

---

## 📋 نظرة عامة

تم تطبيق نظام حماية متكامل على مشروع ExploreKG يعتمد على **Role-Based Access Control (RBAC)** مع نظام إدارة المدراء (Admin System) ومراجعة شاملة (Audit Logging).

---

## 🎯 المزايا الرئيسية

✅ **نظام RBAC كامل** مع 4 أدوار (SUPER_ADMIN, ADMIN, SUPPORT, GUEST)  
✅ **نظام Admin متكامل** للمصادقة وإدارة المدراء  
✅ **JWT Authentication** مع bcrypt password hashing  
✅ **Permission-based Authorization** لكل مورد وعملية  
✅ **Audit Logging** لجميع العمليات الحساسة  
✅ **حماية شاملة** لـ 54+ مسار في 8 مجموعات routes  
✅ **Optional Authentication** للمسارات المختلطة (guest/admin)

---

## 🏗️ البنية المُنفّذة

### 1️⃣ الملفات الأساسية (`src/security/`)

| الملف                     | الوظيفة                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `roles.enum.ts`           | تعريف الأدوار الأربعة مع وظائف مساعدة                      |
| `permissions.map.ts`      | خريطة الصلاحيات لكل دور (5 موارد × إجراءات متعددة)         |
| `auth.service.ts`         | خدمة JWT (generate, verify) + password hashing             |
| `auth.middleware.ts`      | `authenticate` (إجباري) و `optionalAuthenticate` (اختياري) |
| `authorize.middleware.ts` | `requireRole`, `requirePermission`, `validateOwnership`    |
| `audit.middleware.ts`     | `auditLog`, `auditAuth` لتسجيل العمليات                    |
| `index.ts`                | تصدير موحد لجميع المكونات                                  |

### 2️⃣ نظام Admin (`src/models/`, `src/services/`, `src/controllers/`, `src/routes/`)

| المكون                | الوصف                                           |
| --------------------- | ----------------------------------------------- |
| `admin.model.ts`      | نموذج MongoDB مع validations كاملة              |
| `admin.service.ts`    | منطق الأعمال (login, CRUD, password management) |
| `admin.controller.ts` | معالجة HTTP requests                            |
| `admin.routes.ts`     | 11 مسار محمي بـ RBAC                            |
| `createSuperAdmin.ts` | Script لإنشاء أول SUPER_ADMIN                   |

---

## 👥 الأدوار والصلاحيات

### الأدوار

| الدور           | المستوى | الوصف                           |
| --------------- | ------- | ------------------------------- |
| **SUPER_ADMIN** | 4       | التحكم الكامل في النظام         |
| **ADMIN**       | 3       | إدارة المحتوى والضيوف والحجوزات |
| **SUPPORT**     | 2       | دعم فني (عرض وتحديث فقط)        |
| **GUEST**       | 1       | زائر عادي بدون صلاحيات إدارية   |

### الموارد (Resources)

1. **guests** - إدارة الزوار
2. **bookings** - إدارة الحجوزات
3. **catalog** - المحتوى (travel packs, activities, cars)
4. **security** - مراقبة الأمان
5. **admins** - إدارة المدراء

### الإجراءات (Actions)

`VIEW`, `CREATE`, `UPDATE`, `DELETE`, `CLEANUP`, `CANCEL`, `STATISTICS`, `MONITOR`, `MANAGE`

### مصفوفة الصلاحيات

| الدور           | Guests                            | Bookings                         | Catalog | Security      | Admins |
| --------------- | --------------------------------- | -------------------------------- | ------- | ------------- | ------ |
| **SUPER_ADMIN** | Full                              | Full                             | Full    | Full          | Full   |
| **ADMIN**       | View, Update, Cleanup, Statistics | View, Update, Cancel, Statistics | Full    | View, Monitor | View   |
| **SUPPORT**     | View, Update, Statistics          | View, Update                     | View    | -             | -      |
| **GUEST**       | -                                 | -                                | -       | -             | -      |

---

## 🛣️ المسارات المحمية

### 1. **Admin Routes** (`/api/v1/admin`)

| المسار                | Method | الحماية       | الوصف                   |
| --------------------- | ------ | ------------- | ----------------------- |
| `/login`              | POST   | Public        | تسجيل دخول              |
| `/logout`             | POST   | Authenticated | تسجيل خروج              |
| `/me`                 | GET    | Authenticated | معلومات المدير الحالي   |
| `/change-password`    | POST   | Authenticated | تغيير كلمة المرور       |
| `/statistics`         | GET    | SUPER_ADMIN   | إحصائيات المدراء        |
| `/`                   | POST   | SUPER_ADMIN   | إنشاء مدير              |
| `/`                   | GET    | ADMIN+        | جميع المدراء            |
| `/:id`                | GET    | ADMIN+        | مدير محدد               |
| `/:id`                | PATCH  | SUPER_ADMIN   | تحديث مدير              |
| `/:id`                | DELETE | SUPER_ADMIN   | حذف مدير                |
| `/:id/reset-password` | POST   | SUPER_ADMIN   | إعادة تعيين كلمة المرور |

### 2. **Guest Routes** (`/api/v1/guests`)

| المسار                  | Method | الحماية            | الوصف         |
| ----------------------- | ------ | ------------------ | ------------- |
| `/`                     | POST   | Public             | إنشاء زائر    |
| `/statistics`           | GET    | Admin (STATISTICS) | إحصائيات      |
| `/cleanup-expired`      | POST   | Admin (CLEANUP)    | تنظيف         |
| `/email/:email`         | GET    | Public             | البحث بالبريد |
| `/:sessionId`           | GET    | Optional Auth      | بيانات زائر   |
| `/`                     | GET    | Admin (VIEW)       | جميع الزوار   |
| `/:sessionId`           | PATCH  | Optional Auth      | تحديث زائر    |
| `/:sessionId/extend`    | PATCH  | Optional Auth      | تمديد صلاحية  |
| `/:sessionId/link-user` | POST   | Optional Auth      | ربط بمستخدم   |
| `/:sessionId`           | DELETE | Admin (DELETE)     | حذف زائر      |

### 3. **Booking Routes** (`/api/v1/bookings`)

| المسار                    | Method | الحماية            | الوصف         |
| ------------------------- | ------ | ------------------ | ------------- |
| `/`                       | POST   | Public             | إنشاء حجز     |
| `/statistics`             | GET    | Admin (STATISTICS) | إحصائيات      |
| `/cleanup-expired`        | POST   | Admin (CLEANUP)    | تنظيف         |
| `/guest/:guestId`         | GET    | Optional Auth      | حجوزات زائر   |
| `/:bookingNumber`         | GET    | Optional Auth      | حجز محدد      |
| `/`                       | GET    | Admin (VIEW)       | جميع الحجوزات |
| `/:bookingNumber/status`  | PATCH  | Admin (UPDATE)     | تحديث الحالة  |
| `/:bookingNumber/payment` | POST   | Optional Auth      | معالجة دفع    |
| `/:bookingNumber/cancel`  | POST   | Optional Auth      | إلغاء حجز     |

### 4. **Catalog Routes** (Activities, Cars, Travel Packs)

#### Public Access:

- GET `/available` - عرض المتاح
- GET `/` - قائمة كاملة
- GET `/:id` - عنصر محدد

#### Admin Access (CREATE, UPDATE, DELETE, STATISTICS):

- GET `/statistics` - إحصائيات
- POST `/` - إنشاء جديد
- PATCH `/:id` - تحديث
- DELETE `/:id` - حذف
- PATCH `/:id/availability` - تحديث التوفر
- POST `/:id/packs` - ربط برحلات

### 5. **Pack Relations** (`/api/v1/pack-relations`)

| المسار             | Method | الحماية        | الوصف         |
| ------------------ | ------ | -------------- | ------------- |
| `/calculate-price` | POST   | Public         | حساب السعر    |
| `/:packId`         | GET    | Public         | علاقة محددة   |
| `/`                | POST   | Admin (CREATE) | إنشاء علاقة   |
| `/`                | GET    | Admin (VIEW)   | جميع العلاقات |
| `/:packId`         | PUT    | Admin (UPDATE) | تحديث علاقة   |
| `/:packId`         | DELETE | Admin (DELETE) | حذف علاقة     |

### 6. **Security Routes** (`/api/v1/security`)

| المسار        | Method | الحماية              | الوصف            |
| ------------- | ------ | -------------------- | ---------------- |
| `/status`     | GET    | Admin (VIEW)         | حالة الأمان      |
| `/metrics`    | GET    | Admin (MONITOR)      | مقاييس تفصيلية   |
| `/health`     | GET    | Admin (VIEW)         | صحة النظام       |
| `/test-alert` | POST   | Admin (MANAGE) + Dev | اختبار التنبيهات |

---

## 🔑 استخدام النظام

### 1. إنشاء أول SUPER_ADMIN

```bash
pnpm tsx scripts/createSuperAdmin.ts
```

أدخل المعلومات المطلوبة:

- Email
- First Name
- Last Name
- Password (min 8 characters)
- Confirm Password

### 2. تسجيل الدخول

```http
POST /api/v1/admin/login
Content-Type: application/json

{
  "email": "admin@explorekg.com",
  "password": "your-password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "...",
      "email": "admin@explorekg.com",
      "role": "SUPER_ADMIN",
      "firstName": "...",
      "lastName": "...",
      "fullName": "..."
    }
  },
  "message": "Login successful"
}
```

### 3. استخدام Token في الطلبات

```http
GET /api/v1/guests/statistics
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4. إنشاء مدراء جدد (SUPER_ADMIN فقط)

```http
POST /api/v1/admin
Authorization: Bearer SUPER_ADMIN_TOKEN
Content-Type: application/json

{
  "email": "new-admin@explorekg.com",
  "password": "secure-password",
  "role": "ADMIN",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

## 🧪 اختبار النظام

### اختبار المصادقة

```bash
# ✅ Public route (بدون token)
curl http://localhost:4000/api/v1/travel-packs

# ❌ Admin route بدون token (401 Unauthorized)
curl http://localhost:4000/api/v1/guests/statistics

# ✅ Admin route مع token صحيح
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/guests/statistics
```

### اختبار الصلاحيات

```bash
# ✅ SUPPORT يستطيع عرض الزوار
curl -H "Authorization: Bearer SUPPORT_TOKEN" \
  http://localhost:4000/api/v1/guests

# ❌ SUPPORT لا يستطيع حذف زائر (403 Forbidden)
curl -X DELETE \
  -H "Authorization: Bearer SUPPORT_TOKEN" \
  http://localhost:4000/api/v1/guests/SESSION_ID

# ✅ ADMIN يستطيع حذف زائر
curl -X DELETE \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:4000/api/v1/guests/SESSION_ID
```

---

## 📊 Audit Logging

جميع العمليات الحساسة يتم تسجيلها تلقائياً مع المعلومات التالية:

```typescript
{
  action: 'CREATE_ADMIN' | 'UPDATE_GUEST' | 'DELETE_BOOKING' | ...,
  adminId: '507f1f77bcf86cd799439011',
  adminEmail: 'admin@explorekg.com',
  role: 'ADMIN',
  endpoint: '/api/v1/admin',
  method: 'POST',
  ip: '192.168.1.100',
  userAgent: 'PostmanRuntime/7.39.0',
  timestamp: '2025-11-03T14:30:00.000Z',
  success: true,
  statusCode: 201
}
```

---

## 🔒 أفضل الممارسات الأمنية

### ✅ تم تطبيقه

1. **Password Hashing:** bcrypt مع 12 salt rounds
2. **JWT Security:**
   - Issuer: `explorekg-api`
   - Audience: `explorekg-admin`
   - Expiry: 24 hours
3. **Sensitive Data Protection:**
   - `passwordHash` لا يُرجع في الـ API responses
   - `select: false` على حقل `passwordHash`
4. **Role Hierarchy:** مستويات أدوار واضحة
5. **Permission Granularity:** صلاحيات محددة لكل مورد وإجراء
6. **Audit Trail:** تسجيل شامل لجميع العمليات
7. **Soft Delete:** حذف آمن للمدراء (isActive flag)
8. **Self-Protection:** منع حذف الحساب الخاص

### 📝 توصيات إضافية

- [ ] تفعيل Refresh Tokens (النسخة 2.0)
- [ ] تطبيق Rate Limiting محدد للـ admin routes
- [ ] إضافة Two-Factor Authentication (2FA)
- [ ] تطبيق Password Policy (complexity, expiry)
- [ ] IP Whitelisting للـ admin access
- [ ] Session Management مع blacklist للـ logout

---

## 🔧 المتغيرات البيئية المطلوبة

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# أو يمكن استخدام
SESSION_SECRET=your-super-secret-session-key-min-32-characters
# (JWT_SECRET يستخدم SESSION_SECRET كـ fallback)
```

---

## 📁 هيكل الملفات الجديدة

```
src/
├── security/
│   ├── auth.service.ts
│   ├── auth.middleware.ts
│   ├── authorize.middleware.ts
│   ├── roles.enum.ts
│   ├── permissions.map.ts
│   ├── audit.middleware.ts
│   └── index.ts
├── models/
│   └── admin.model.ts
├── services/
│   └── admin.service.ts
├── controllers/
│   └── admin.controller.ts
└── routes/
    └── admin.routes.ts

scripts/
└── createSuperAdmin.ts

docs/security/
├── SECURITY_IMPLEMENTATION_LOG.md
├── ROUTES_BASE_ANALYSIS.md
└── RBAC_ADMIN_SYSTEM.md (هذا الملف)
```

---

## ✅ قائمة التحقق النهائية

- [x] نظام RBAC كامل (4 أدوار)
- [x] خريطة صلاحيات شاملة (5 موارد)
- [x] JWT Authentication مع bcrypt
- [x] Admin Model + Service + Controller + Routes
- [x] حماية 54+ مسار في 8 مجموعات
- [x] Audit Logging للعمليات الحساسة
- [x] Optional Authentication للمسارات المختلطة
- [x] Script لإنشاء SUPER_ADMIN
- [x] توثيق شامل ومفصّل
- [x] تحديث جميع routes بالحماية المناسبة

---

## 🎉 النتيجة النهائية

تم بنجاح تطبيق نظام حماية شامل على مشروع ExploreKG يتضمن:

✅ **Admin Authentication System (JWT)**  
✅ **Role-based Access Control (RBAC)**  
✅ **Permissions Map (5 Resources × Multiple Actions)**  
✅ **Audit Logging (Complete Tracking)**  
✅ **Ownership Validation (Optional Authentication)**  
✅ **Clean Route Protection (All 54+ routes secured)**  
✅ **Complete Documentation**

**النظام جاهز للاستخدام الفوري!** 🚀

---

**آخر تحديث:** 3 نوفمبر 2025  
**الفريق:** ExploreKG Development Team  
**الحالة:** ✅ Production Ready
