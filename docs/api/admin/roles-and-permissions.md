# 👥 Roles and Permissions (RBAC)

## 🎯 نظرة عامة

نظام الأدوار والصلاحيات في ExploreKG يعتمد على RBAC (Role-Based Access Control).

---

## 🔵 SUPER_ADMIN

**الصلاحيات الكاملة:**

### Admins Management

- ✅ CREATE: إنشاء مسؤولين جدد
- ✅ VIEW: عرض جميع المسؤولين
- ✅ UPDATE: تعديل بيانات المسؤولين
- ✅ DELETE: حذف المسؤولين
- ✅ MANAGE: إعادة تعيين كلمات المرور

### Content Management

- ✅ CREATE: إنشاء محتوى جديد
- ✅ VIEW: عرض المحتوى
- ✅ UPDATE: تعديل المحتوى
- ✅ DELETE: حذف المحتوى
- ✅ STATISTICS: عرض جميع الإحصائيات

### Bookings & Guests

- ✅ VIEW: عرض جميع الحجوزات والضيوف
- ✅ UPDATE: تعديل حالة الحجوزات
- ✅ DELETE: حذف الضيوف
- ✅ STATISTICS: عرض الإحصائيات
- ✅ CLEANUP: تنظيف البيانات المنتهية

### Security

- ✅ VIEW: عرض حالة الأمان
- ✅ MONITOR: مراقبة الأحداث الأمنية
- ✅ MANAGE: إدارة إعدادات الأمان

---

## 🟢 ADMIN

**صلاحيات محدودة:**

### Admins Management

- ✅ VIEW: عرض المسؤولين (بدون الصلاحيات الحساسة)
- ❌ CREATE: لا يمكن إنشاء مسؤولين
- ❌ UPDATE: لا يمكن تعديل مسؤولين
- ❌ DELETE: لا يمكن حذف مسؤولين

### Content Management

- ✅ CREATE: إنشاء محتوى جديد
- ✅ VIEW: عرض المحتوى
- ✅ UPDATE: تعديل المحتوى
- ✅ DELETE: حذف المحتوى
- ✅ STATISTICS: عرض إحصائيات المحتوى

### Bookings & Guests

- ✅ VIEW: عرض جميع الحجوزات والضيوف
- ✅ UPDATE: تعديل حالة الحجوزات
- ✅ STATISTICS: عرض الإحصائيات
- ✅ CLEANUP: تنظيف البيانات المنتهية
- ❌ DELETE: لا يمكن حذف ضيوف

### Security

- ✅ VIEW: عرض حالة الأمان الأساسية
- ❌ MONITOR: لا يمكن الوصول للمراقبة المتقدمة
- ❌ MANAGE: لا يمكن إدارة الأمان

---

## 🟡 EDITOR

**صلاحيات المحتوى فقط:**

### Content Management

- ✅ CREATE: إنشاء محتوى جديد
- ✅ VIEW: عرض المحتوى
- ✅ UPDATE: تعديل المحتوى
- ❌ DELETE: لا يمكن حذف المحتوى
- ❌ STATISTICS: لا يمكن عرض الإحصائيات المتقدمة

### Bookings & Guests

- ✅ VIEW: عرض الحجوزات والضيوف (للقراءة فقط)
- ❌ UPDATE: لا يمكن تعديل الحجوزات
- ❌ DELETE: لا يمكن حذف البيانات

### Admins & Security

- ❌ لا يمكن الوصول لإدارة المسؤولين
- ❌ لا يمكن الوصول لمراقبة الأمان

---

## 📊 جدول الصلاحيات الكامل

| Resource     | Action     | SUPER_ADMIN | ADMIN | EDITOR |
| ------------ | ---------- | ----------- | ----- | ------ |
| **ADMINS**   |
|              | VIEW       | ✅          | ✅    | ❌     |
|              | CREATE     | ✅          | ❌    | ❌     |
|              | UPDATE     | ✅          | ❌    | ❌     |
|              | DELETE     | ✅          | ❌    | ❌     |
|              | MANAGE     | ✅          | ❌    | ❌     |
| **CATALOG**  |
|              | VIEW       | ✅          | ✅    | ✅     |
|              | CREATE     | ✅          | ✅    | ✅     |
|              | UPDATE     | ✅          | ✅    | ✅     |
|              | DELETE     | ✅          | ✅    | ❌     |
|              | STATISTICS | ✅          | ✅    | ❌     |
| **BOOKINGS** |
|              | VIEW       | ✅          | ✅    | ✅     |
|              | UPDATE     | ✅          | ✅    | ❌     |
|              | DELETE     | ✅          | ❌    | ❌     |
|              | STATISTICS | ✅          | ✅    | ❌     |
|              | CLEANUP    | ✅          | ✅    | ❌     |
| **GUESTS**   |
|              | VIEW       | ✅          | ✅    | ✅     |
|              | UPDATE     | ✅          | ✅    | ❌     |
|              | DELETE     | ✅          | ❌    | ❌     |
|              | STATISTICS | ✅          | ✅    | ❌     |
|              | CLEANUP    | ✅          | ✅    | ❌     |
| **SECURITY** |
|              | VIEW       | ✅          | ✅    | ❌     |
|              | MONITOR    | ✅          | ❌    | ❌     |
|              | MANAGE     | ✅          | ❌    | ❌     |

---

## 🔐 Permission Codes

```typescript
enum Resource {
  ADMINS = 'ADMINS',
  CATALOG = 'CATALOG',
  PACK_RELATIONS = 'PACK_RELATIONS',
  BOOKINGS = 'BOOKINGS',
  GUESTS = 'GUESTS',
  SECURITY = 'SECURITY',
}

enum Action {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE',
  STATISTICS = 'STATISTICS',
  MONITOR = 'MONITOR',
  CLEANUP = 'CLEANUP',
}
```

---

## 🎓 أمثلة استخدام

### مثال 1: إنشاء محتوى (EDITOR)

```http
POST /api/v1/activities
Authorization: Bearer {editor_token}
Content-Type: application/json

{
  "name": "New Activity",
  ...
}
```

✅ **النتيجة:** نجاح (EDITOR له صلاحية CREATE على CATALOG)

### مثال 2: حذف محتوى (EDITOR)

```http
DELETE /api/v1/activities/activity_123
Authorization: Bearer {editor_token}
```

❌ **النتيجة:** 403 Forbidden (EDITOR ليس له صلاحية DELETE)

### مثال 3: إنشاء admin (ADMIN)

```http
POST /api/v1/admin
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "email": "new@explorekg.com",
  ...
}
```

❌ **النتيجة:** 403 Forbidden (فقط SUPER_ADMIN يمكنه إنشاء مسؤولين)

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
