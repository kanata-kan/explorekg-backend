# 🔐 Admin Dashboard API Endpoints

## 🎯 نظرة عامة

توثيق شامل لجميع الـAPI endpoints المخصصة للوحة التحكم (Admin Dashboard).  
**جميع المسارات تتطلب مصادقة Admin + صلاحيات RBAC.**

**Base URL:** `/api/v1`

---

## 📑 جدول المحتويات

1. [Admin Management](#admin-management)
2. [Content Management](#content-management)
   - [Travel Packs](#travel-packs-admin)
   - [Activities](#activities-admin)
   - [Cars](#cars-admin)
   - [Pack Relations](#pack-relations-admin)
3. [Booking Management](#booking-management)
4. [Guest Management](#guest-management-admin)
5. [Security Monitoring](#security-monitoring)

---

# 👥 Admin Management

## POST /admin/login

**الوصف:** تسجيل دخول المسؤول.

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Request

```http
POST /api/v1/admin/login
Content-Type: application/json

{
  "email": "admin@explorekg.com",
  "password": "SecurePassword123!"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "admin_123",
      "email": "admin@explorekg.com",
      "fullName": "Admin User",
      "role": "ADMIN",
      "permissions": [
        {
          "resource": "CATALOG",
          "actions": ["VIEW", "CREATE", "UPDATE", "DELETE"]
        }
      ]
    },
    "expiresAt": "2025-11-04T12:00:00.000Z"
  },
  "message": "Login successful"
}
```

---

## POST /admin/logout

**الوصف:** تسجيل خروج المسؤول.

**الصلاحيات:** Authenticated Admin  
**المصادقة:** Bearer Token

### Request

```http
POST /api/v1/admin/logout
Authorization: Bearer {token}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## GET /admin/me

**الوصف:** جلب معلومات المسؤول الحالي.

**الصلاحيات:** Authenticated Admin  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/admin/me
Authorization: Bearer {token}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "admin_123",
    "email": "admin@explorekg.com",
    "fullName": "Admin User",
    "role": "ADMIN",
    "permissions": [...],
    "createdAt": "2025-10-01T10:00:00.000Z",
    "lastLoginAt": "2025-11-03T12:00:00.000Z"
  }
}
```

---

## POST /admin/change-password

**الوصف:** تغيير كلمة المرور.

**الصلاحيات:** Authenticated Admin  
**المصادقة:** Bearer Token

### Request

```http
POST /api/v1/admin/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## GET /admin/statistics

**الوصف:** جلب إحصائيات النظام.

**الصلاحيات:** SUPER_ADMIN only  
**المصادقة:** Bearer Token + SUPER_ADMIN role

### Request

```http
GET /api/v1/admin/statistics
Authorization: Bearer {token}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "admins": {
      "total": 5,
      "active": 4,
      "byRole": {
        "SUPER_ADMIN": 1,
        "ADMIN": 3,
        "EDITOR": 1
      }
    },
    "content": {
      "travelPacks": 25,
      "activities": 45,
      "cars": 15
    },
    "bookings": {
      "total": 150,
      "confirmed": 120,
      "pending": 20,
      "cancelled": 10
    },
    "guests": {
      "total": 300,
      "active": 250
    },
    "revenue": {
      "total": 125000,
      "thisMonth": 15000,
      "currency": "USD"
    }
  }
}
```

---

## POST /admin

**الوصف:** إنشاء مسؤول جديد.

**الصلاحيات:** SUPER_ADMIN only  
**المصادقة:** Bearer Token + SUPER_ADMIN role

### Request

```http
POST /api/v1/admin
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newadmin@explorekg.com",
  "password": "SecurePassword123!",
  "fullName": "New Admin",
  "role": "ADMIN"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "admin_456",
    "email": "newadmin@explorekg.com",
    "fullName": "New Admin",
    "role": "ADMIN",
    "createdAt": "2025-11-03T12:00:00.000Z"
  },
  "message": "Admin created successfully"
}
```

---

## GET /admin

**الوصف:** جلب جميع المسؤولين.

**الصلاحيات:** ADMIN or higher  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/admin
Authorization: Bearer {token}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "admin_123",
      "email": "admin@explorekg.com",
      "fullName": "Admin User",
      "role": "ADMIN",
      "status": "active",
      "lastLoginAt": "2025-11-03T12:00:00.000Z"
    }
  ]
}
```

---

## GET /admin/:id

**الوصف:** جلب مسؤول واحد حسب ID.

**الصلاحيات:** ADMIN or higher  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/admin/admin_123
Authorization: Bearer {token}
```

---

## PATCH /admin/:id

**الوصف:** تعديل بيانات مسؤول.

**الصلاحيات:** SUPER_ADMIN only  
**المصادقة:** Bearer Token + SUPER_ADMIN role

### Request

```http
PATCH /api/v1/admin/admin_456
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "Updated Admin Name",
  "role": "EDITOR"
}
```

---

## DELETE /admin/:id

**الوصف:** حذف مسؤول (soft delete).

**الصلاحيات:** SUPER_ADMIN only  
**المصادقة:** Bearer Token + SUPER_ADMIN role

### Request

```http
DELETE /api/v1/admin/admin_456
Authorization: Bearer {token}
```

---

## POST /admin/:id/reset-password

**الوصف:** إعادة تعيين كلمة مرور مسؤول.

**الصلاحيات:** SUPER_ADMIN only  
**المصادقة:** Bearer Token + SUPER_ADMIN role

### Request

```http
POST /api/v1/admin/admin_456/reset-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "newPassword": "NewSecurePassword123!"
}
```

---

# 📦 Content Management

## Travel Packs (Admin)

### GET /travel-packs/statistics

**الوصف:** جلب إحصائيات الباقات السياحية.

**الصلاحيات:** Admin + STATISTICS permission  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/travel-packs/statistics
Authorization: Bearer {token}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 25,
    "available": 20,
    "unavailable": 5,
    "byLocale": {
      "en": 25,
      "fr": 25
    },
    "averagePrice": 750,
    "priceRange": {
      "min": 300,
      "max": 1500
    }
  }
}
```

---

### POST /travel-packs

**الوصف:** إنشاء باقة سياحية جديدة.

**الصلاحيات:** Admin + CREATE permission  
**المصادقة:** Bearer Token

### Request

```http
POST /api/v1/travel-packs
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Silk Road Explorer",
  "locale": "en",
  "slug": "silk-road-explorer",
  "localeGroupId": "pack_group_456",
  "price": 1200,
  "duration": 10,
  "maxPersons": 6,
  "description": "Explore the ancient Silk Road...",
  "highlights": [
    "Visit historic cities",
    "Traditional crafts",
    "Local cuisine"
  ],
  "included": [
    "Accommodation",
    "Meals",
    "Transport",
    "Guide"
  ],
  "notIncluded": [
    "International flights",
    "Personal expenses"
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival in Bishkek",
      "description": "Transfer and city tour",
      "activities": ["City tour"],
      "meals": ["Dinner"],
      "accommodation": "Hotel"
    }
  ],
  "images": ["https://..."],
  "metadata": {
    "difficulty": "moderate",
    "season": "all-year"
  },
  "isAvailable": true
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "pack_789",
    "name": "Silk Road Explorer",
    "slug": "silk-road-explorer",
    "localeGroupId": "pack_group_456",
    "price": 1200,
    "isAvailable": true,
    "createdAt": "2025-11-03T12:00:00.000Z"
  },
  "message": "Travel pack created successfully"
}
```

---

### PATCH /travel-packs/:id

**الوصف:** تعديل باقة سياحية.

**الصلاحيات:** Admin + UPDATE permission  
**المصادقة:** Bearer Token

### Request

```http
PATCH /api/v1/travel-packs/pack_789
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 1150,
  "isAvailable": false
}
```

---

### DELETE /travel-packs/:id

**الوصف:** حذف (أرشفة) باقة سياحية.

**الصلاحيات:** Admin + DELETE permission  
**المصادقة:** Bearer Token

### Request

```http
DELETE /api/v1/travel-packs/pack_789
Authorization: Bearer {token}
```

---

## Activities (Admin)

### GET /activities/statistics

**الوصف:** جلب إحصائيات الأنشطة.

**الصلاحيات:** Admin + STATISTICS permission  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/activities/statistics
Authorization: Bearer {token}
```

---

### POST /activities

**الوصف:** إنشاء نشاط جديد.

**الصلاحيات:** Admin + CREATE permission  
**المصادقة:** Bearer Token

### Request

```http
POST /api/v1/activities
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mountain Hiking",
  "locale": "en",
  "slug": "mountain-hiking",
  "localeGroupId": "activity_group_789",
  "price": 150,
  "duration": 1,
  "description": "Full day hiking in the mountains",
  "highlights": ["Scenic views", "Professional guide"],
  "included": ["Transport", "Lunch", "Equipment"],
  "images": ["https://..."],
  "difficulty": "moderate",
  "minPersons": 2,
  "maxPersons": 8,
  "isAvailable": true
}
```

---

### PATCH /activities/:id

**الوصف:** تعديل نشاط.

**الصلاحيات:** Admin + UPDATE permission  
**المصادقة:** Bearer Token

---

### DELETE /activities/:id

**الوصف:** حذف (أرشفة) نشاط.

**الصلاحيات:** Admin + DELETE permission  
**المصادقة:** Bearer Token

---

### PATCH /activities/:id/availability

**الوصف:** تحديث توفر النشاط.

**الصلاحيات:** Admin + UPDATE permission  
**المصادقة:** Bearer Token

### Request

```http
PATCH /api/v1/activities/activity_789/availability
Authorization: Bearer {token}
Content-Type: application/json

{
  "isAvailable": false
}
```

---

### POST /activities/:id/packs

**الوصف:** ربط النشاط بباقات سياحية.

**الصلاحيات:** Admin + UPDATE permission  
**المصادقة:** Bearer Token

### Request

```http
POST /api/v1/activities/activity_789/packs
Authorization: Bearer {token}
Content-Type: application/json

{
  "packIds": ["pack_group_123", "pack_group_456"]
}
```

---

## Cars (Admin)

### GET /cars/statistics

**الوصف:** جلب إحصائيات السيارات.

**الصلاحيات:** Admin + STATISTICS permission  
**المصادقة:** Bearer Token

---

### POST /cars

**الوصف:** إنشاء سيارة جديدة.

**الصلاحيات:** Admin + CREATE permission  
**المصادقة:** Bearer Token

### Request

```http
POST /api/v1/cars
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mercedes-Benz Sprinter",
  "locale": "en",
  "slug": "mercedes-sprinter",
  "localeGroupId": "car_group_789",
  "price": 200,
  "type": "van",
  "capacity": 12,
  "transmission": "automatic",
  "fuelType": "diesel",
  "description": "Spacious van perfect for large groups",
  "features": ["AC", "GPS", "WiFi"],
  "specifications": {
    "year": 2023,
    "color": "Silver",
    "doors": 4,
    "luggage": "Extra Large"
  },
  "images": ["https://..."],
  "pricePerDay": 200,
  "isAvailable": true
}
```

---

### PATCH /cars/:id

**الوصف:** تعديل سيارة.

**الصلاحيات:** Admin + UPDATE permission  
**المصادقة:** Bearer Token

---

### DELETE /cars/:id

**الوصف:** حذف (أرشفة) سيارة.

**الصلاحيات:** Admin + DELETE permission  
**المصادقة:** Bearer Token

---

### PATCH /cars/:id/availability

**الوصف:** تحديث توفر السيارة.

**الصلاحيات:** Admin + UPDATE permission  
**المصادقة:** Bearer Token

---

### POST /cars/:id/packs

**الوصف:** ربط السيارة بباقات سياحية.

**الصلاحيات:** Admin + UPDATE permission  
**المصادقة:** Bearer Token

---

## Pack Relations (Admin)

### GET /pack-relations

**الوصف:** جلب جميع علاقات الباقات.

**الصلاحيات:** Admin + VIEW permission  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/pack-relations
Authorization: Bearer {token}
```

---

### POST /pack-relations

**الوصف:** إنشاء علاقة باقة جديدة.

**الصلاحيات:** Admin + CREATE permission  
**المصادقة:** Bearer Token

### Request

```http
POST /api/v1/pack-relations
Authorization: Bearer {token}
Content-Type: application/json

{
  "travelPackLocaleGroupId": "pack_group_789",
  "availableActivities": [
    {
      "localeGroupId": "activity_group_001",
      "isOptional": true
    }
  ],
  "availableCars": [
    {
      "localeGroupId": "car_group_001"
    }
  ]
}
```

---

### PUT /pack-relations/:packId

**الوصف:** تحديث علاقة باقة.

**الصلاحيات:** Admin + UPDATE permission  
**المصادقة:** Bearer Token

---

### DELETE /pack-relations/:packId

**الوصف:** حذف علاقة باقة.

**الصلاحيات:** Admin + DELETE permission  
**المصادقة:** Bearer Token

---

# 📅 Booking Management

## GET /bookings

**الوصف:** جلب جميع الحجوزات النشطة.

**الصلاحيات:** Admin + VIEW permission  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/bookings
Authorization: Bearer {token}
```

---

## GET /bookings/statistics

**الوصف:** جلب إحصائيات الحجوزات.

**الصلاحيات:** Admin + STATISTICS permission  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/bookings/statistics
Authorization: Bearer {token}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 150,
    "confirmed": 120,
    "pending": 20,
    "cancelled": 10,
    "expired": 5,
    "revenue": {
      "total": 125000,
      "thisMonth": 15000,
      "currency": "USD"
    },
    "byStatus": {
      "pending": 20,
      "confirmed": 120,
      "cancelled": 10
    }
  }
}
```

---

## POST /bookings/cleanup-expired

**الوصف:** تنظيف الحجوزات المنتهية يدوياً.

**الصلاحيات:** Admin + CLEANUP permission  
**المصادقة:** Bearer Token

### Request

```http
POST /api/v1/bookings/cleanup-expired
Authorization: Bearer {token}
```

---

## PATCH /bookings/:bookingNumber/status

**الوصف:** تحديث حالة الحجز.

**الصلاحيات:** Admin + UPDATE permission  
**المصادقة:** Bearer Token

### Request

```http
PATCH /api/v1/bookings/BK-20251103-A1B2C3/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Manual confirmation by admin"
}
```

---

# 👤 Guest Management (Admin)

## GET /guests

**الوصف:** جلب جميع الضيوف النشطين.

**الصلاحيات:** Admin + VIEW permission  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/guests
Authorization: Bearer {token}
```

---

## GET /guests/statistics

**الوصف:** جلب إحصائيات الضيوف.

**الصلاحيات:** Admin + STATISTICS permission  
**المصادقة:** Bearer Token

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 300,
    "active": 250,
    "expired": 50,
    "withBookings": 200,
    "totalBookings": 150
  }
}
```

---

## POST /guests/cleanup-expired

**الوصف:** تنظيف الضيوف المنتهيين يدوياً.

**الصلاحيات:** Admin + CLEANUP permission  
**المصادقة:** Bearer Token

---

## DELETE /guests/:sessionId

**الوصف:** حذف ضيف.

**الصلاحيات:** Admin + DELETE permission  
**المصادقة:** Bearer Token

---

# 🔒 Security Monitoring

## GET /security/status

**الوصف:** جلب حالة الأمان الحالية.

**الصلاحيات:** Admin + VIEW permission  
**المصادقة:** Bearer Token

### Request

```http
GET /api/v1/security/status
Authorization: Bearer {token}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "securityLevel": "NORMAL",
    "alerts": [],
    "last5Minutes": {
      "requests": 1234,
      "attacks": 0,
      "failedAuth": 2
    },
    "uptime": 123456.789,
    "timestamp": "2025-11-03T12:00:00.000Z"
  }
}
```

---

## GET /security/metrics

**الوصف:** جلب مقاييس الأمان التفصيلية.

**الصلاحيات:** Admin + MONITOR permission  
**المصادقة:** Bearer Token

---

## GET /security/health

**الوصف:** جلب حالة النظام الصحية.

**الصلاحيات:** Admin + VIEW permission  
**المصادقة:** Bearer Token

---

## POST /security/test-alert (Dev Only)

**الوصف:** اختبار نظام التنبيهات الأمنية.

**الصلاحيات:** Admin + MANAGE permission  
**المصادقة:** Bearer Token  
**البيئة:** Development only

### Request

```http
POST /api/v1/security/test-alert
Authorization: Bearer {token}
Content-Type: application/json

{
  "alertType": "sql-injection"
}
```

---

## 📝 ملاحظات مهمة

### 🔐 Authentication

- جميع المسارات تتطلب `Authorization: Bearer {token}`
- Token صالح لـ24 ساعة
- يجب تجديد Token بشكل دوري

### 🛡️ RBAC Permissions

- تحقق من صلاحياتك قبل الاستخدام
- راجع [`roles-and-permissions.md`](./roles-and-permissions.md)

### 📊 Audit Logging

- جميع العمليات يتم تسجيلها
- Audit logs متاحة للـSUPER_ADMIN فقط

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
