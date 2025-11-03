# 🔐 Admin Dashboard API Documentation

## 🎯 نظرة عامة

هذا القسم يحتوي على توثيق كامل لجميع الـAPI endpoints المخصصة للوحة التحكم (Admin Dashboard).  
جميع المسارات هنا **محمية بنظام RBAC** وتتطلب مصادقة إدارية.

---

## 📂 محتويات التوثيق

### 1️⃣ [`endpoints.md`](./endpoints.md)

توثيق شامل لجميع الـendpoints الإدارية مع أمثلة كاملة للطلبات والاستجابات.

**الأقسام:**

- 👥 Admin Management (إدارة المسؤولين)
- 📦 Content Management (إدارة المحتوى)
  - Travel Packs
  - Activities
  - Cars
  - Pack Relations
- 📅 Booking Management (إدارة الحجوزات)
- 👤 Guest Management (إدارة الضيوف)
- 🔒 Security Monitoring (مراقبة الأمان)
- 📊 Statistics & Analytics (الإحصائيات)

---

### 2️⃣ [`roles-and-permissions.md`](./roles-and-permissions.md)

شرح تفصيلي لنظام الأدوار والصلاحيات (RBAC):

- الأدوار المتاحة (SUPER_ADMIN, ADMIN, EDITOR)
- الصلاحيات لكل دور
- كيفية إدارة الأدوار

---

### 3️⃣ [`content-management.md`](./content-management.md)

دليل شامل لإدارة المحتوى:

- إنشاء وتعديل الباقات
- إدارة الأنشطة والسيارات
- ربط الباقات بالأنشطة والسيارات
- إدارة التوفر (Availability)

---

### 4️⃣ [`examples.http`](./examples.http)

ملف يحتوي على أمثلة HTTP جاهزة للاختبار المباشر.

---

## 🌐 Base URL

```
Development:  http://localhost:5000/api/v1
Production:   https://api.explorekg.com/api/v1
```

---

## 🔐 نظام المصادقة

### 1. تسجيل الدخول

```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@explorekg.com",
  "password": "your-secure-password"
}
```

**استجابة:**

```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here...",
    "admin": {
      "id": "admin_123",
      "email": "admin@explorekg.com",
      "role": "ADMIN",
      "fullName": "Admin User",
      "permissions": [...]
    },
    "expiresAt": "2025-11-04T12:00:00.000Z"
  }
}
```

### 2. استخدام Token في الطلبات

```http
GET /admin/me
Authorization: Bearer jwt_token_here...
```

---

## 👥 الأدوار والصلاحيات

### 🔵 SUPER_ADMIN

**الصلاحيات الكاملة:**

- ✅ إدارة المسؤولين (إنشاء، تعديل، حذف)
- ✅ إدارة المحتوى (إنشاء، تعديل، حذف)
- ✅ إدارة الحجوزات والضيوف
- ✅ الوصول لجميع الإحصائيات
- ✅ مراقبة الأمان
- ✅ عرض سجلات التدقيق (Audit Logs)

### 🟢 ADMIN

**صلاحيات محدودة:**

- ✅ عرض المسؤولين (بدون إنشاء أو حذف)
- ✅ إدارة المحتوى (إنشاء، تعديل، حذف)
- ✅ إدارة الحجوزات والضيوف
- ✅ عرض الإحصائيات الأساسية
- ✅ عرض حالة الأمان
- ❌ لا يمكن إنشاء أو حذف مسؤولين

### 🟡 EDITOR

**صلاحيات المحتوى فقط:**

- ✅ إدارة المحتوى (إنشاء، تعديل)
- ✅ عرض الحجوزات (بدون تعديل)
- ❌ لا يمكن حذف المحتوى
- ❌ لا يمكن إدارة المسؤولين
- ❌ لا يمكن الوصول للإحصائيات المتقدمة

---

## 📊 الموارد والصلاحيات (Resources & Actions)

### Resources

- `CATALOG` → Travel Packs, Activities, Cars
- `PACK_RELATIONS` → علاقات الباقات
- `BOOKINGS` → الحجوزات
- `GUESTS` → الضيوف
- `ADMINS` → المسؤولين
- `SECURITY` → الأمان والمراقبة

### Actions

- `VIEW` → عرض
- `CREATE` → إنشاء
- `UPDATE` → تعديل
- `DELETE` → حذف
- `MANAGE` → إدارة كاملة
- `STATISTICS` → عرض الإحصائيات
- `MONITOR` → المراقبة
- `CLEANUP` → تنظيف البيانات

---

## 🚀 البدء السريع

### 1. تسجيل الدخول

```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@explorekg.com",
  "password": "secure-password"
}
```

### 2. عرض معلوماتي

```http
GET /admin/me
Authorization: Bearer {token}
```

### 3. عرض الإحصائيات

```http
GET /admin/statistics
Authorization: Bearer {token}
```

### 4. إنشاء باقة سياحية

```http
POST /travel-packs
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Bishkek City Tour",
  "locale": "en",
  "slug": "bishkek-city-tour",
  "price": 500,
  "duration": 3,
  ...
}
```

---

## 🔒 نظام التدقيق (Audit Logging)

جميع العمليات الإدارية يتم تسجيلها تلقائياً:

- ✅ من قام بالعملية (Admin ID)
- ✅ نوع العملية (CREATE, UPDATE, DELETE, etc.)
- ✅ المورد المتأثر (Resource ID)
- ✅ التوقيت الدقيق
- ✅ IP Address
- ✅ User Agent

**أمثلة الأحداث المسجلة:**

- `LOGIN` / `LOGOUT`
- `CREATE_ADMIN` / `UPDATE_ADMIN` / `DELETE_ADMIN`
- `CREATE_ACTIVITY` / `UPDATE_ACTIVITY` / `DELETE_ACTIVITY`
- `CREATE_CAR` / `UPDATE_CAR` / `DELETE_CAR`
- `UPDATE_BOOKING_STATUS` / `CANCEL_BOOKING`
- `CLEANUP_GUESTS` / `CLEANUP_BOOKINGS`

---

## ⚠️ Error Handling

جميع الـendpoints تستخدم نفس بنية الأخطاء:

```json
{
  "success": false,
  "error": {
    "message": "وصف الخطأ",
    "code": "ERROR_CODE",
    "statusCode": 403,
    "details": {
      "required": "SUPER_ADMIN",
      "current": "ADMIN"
    }
  }
}
```

**أكواد الأخطاء الشائعة:**

- `400 Bad Request` → بيانات غير صحيحة
- `401 Unauthorized` → مصادقة مطلوبة (Token مفقود أو غير صحيح)
- `403 Forbidden` → ليس لديك صلاحية (Role غير كافٍ)
- `404 Not Found` → المورد غير موجود
- `409 Conflict` → تعارض في البيانات
- `500 Internal Server Error` → خطأ في الخادم

---

## 🛡️ Security Best Practices

### ✅ يجب عليك:

- استخدام HTTPS في Production
- تخزين Token بشكل آمن (httpOnly cookies)
- تحديث Token بشكل دوري
- عدم مشاركة Token مع أي شخص
- استخدام كلمات مرور قوية

### ❌ لا تفعل:

- تخزين Token في localStorage (في Frontend)
- إرسال Token في URL
- استخدام نفس Token لفترات طويلة
- مشاركة بيانات المصادقة

---

## 📞 الدعم الفني

إذا واجهت أي مشكلة في التوثيق أو الـAPI:

1. راجع قسم الأمثلة في [`examples.http`](./examples.http)
2. تحقق من صلاحياتك في [`roles-and-permissions.md`](./roles-and-permissions.md)
3. راجع دليل المحتوى في [`content-management.md`](./content-management.md)
4. اتصل بفريق التطوير أو SUPER_ADMIN

---

## 📚 مصادر إضافية

- [Security System Documentation](../../security/)
- [Database Models](../../database/MODELS-OVERVIEW.md)
- [API Overview](../API-OVERVIEW.md)
- [Audit Logs](../../reports/)

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
