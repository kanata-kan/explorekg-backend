# 📘 User Frontend API Documentation

## 🎯 نظرة عامة

هذا القسم يحتوي على توثيق كامل لجميع الـAPI endpoints المخصصة لواجهة المستخدم (User Frontend).  
جميع المسارات هنا **عامة (Public)** أو محمية بـ**Ownership Validation** للضيوف.

---

## 📂 محتويات التوثيق

### 1️⃣ [`endpoints.md`](./endpoints.md)

توثيق شامل لجميع الـendpoints مع أمثلة كاملة للطلبات والاستجابات.

**الأقسام:**

- 🏥 Health Check
- 📦 Travel Packs (الباقات السياحية)
- 🎯 Activities (الأنشطة)
- 🚗 Cars (السيارات)
- 🔗 Pack Relations (علاقات الباقات)
- 👤 Guests (إدارة الضيوف)
- 📅 Bookings (الحجوزات)

---

### 2️⃣ [`authentication.md`](./authentication.md)

شرح كامل لنظام المصادقة والحماية للمستخدمين:

- كيفية إنشاء Guest Session
- Session Management
- Ownership Validation
- Cookie-based Authentication

---

### 3️⃣ [`booking-flow.md`](./booking-flow.md)

دليل شامل لتدفق عملية الحجز من البداية للنهاية:

1. إنشاء Guest Session
2. استعراض الباقات
3. حساب السعر
4. إنشاء الحجز
5. الدفع
6. تتبع الحجز

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

## 📋 الميزات الرئيسية

### ✅ Public Access

معظم المسارات متاحة بدون مصادقة:

- استعراض الباقات السياحية والأنشطة والسيارات
- البحث والفلترة
- حساب الأسعار

### 🔒 Ownership Protection

بعض المسارات محمية بنظام Ownership:

- عرض وتعديل بيانات الضيف (Guest)
- عرض وإدارة الحجوزات (Bookings)
- يتطلب `sessionId` في Cookie أو Header

### 🌍 Multi-Language Support

جميع المحتوى متاح بلغتين:

- `locale=en` → English
- `locale=fr` → French

---

## 🚀 البدء السريع

### 1. إنشاء Guest Session

```http
POST /guests
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+996555123456"
}
```

**استجابة:**

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "expiresAt": "2025-11-10T12:00:00.000Z"
  }
}
```

### 2. استعراض الباقات

```http
GET /travel-packs?locale=en
```

### 3. حساب السعر

```http
POST /pack-relations/calculate-price
Content-Type: application/json

{
  "travelPackLocaleGroupId": "pack_123",
  "numberOfPersons": 2,
  "selectedActivities": ["activity_1"],
  "selectedCarId": "car_1",
  "locale": "en"
}
```

### 4. إنشاء حجز

```http
POST /bookings
Content-Type: application/json
Cookie: sessionId=guest_abc123...

{
  "guestId": "guest_abc123...",
  "travelPackLocaleGroupId": "pack_123",
  "numberOfPersons": 2,
  "selectedActivities": ["activity_1"],
  "selectedCarId": "car_1",
  "totalPrice": 850,
  "startDate": "2025-12-01",
  "endDate": "2025-12-10"
}
```

---

## ⚠️ Error Handling

جميع الـendpoints تستخدم نفس بنية الأخطاء:

```json
{
  "success": false,
  "error": {
    "message": "وصف الخطأ",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": {}
  }
}
```

**أكواد الأخطاء الشائعة:**

- `400 Bad Request` → بيانات غير صحيحة
- `401 Unauthorized` → مصادقة مطلوبة
- `403 Forbidden` → ليس لديك صلاحية
- `404 Not Found` → المورد غير موجود
- `409 Conflict` → تعارض في البيانات
- `500 Internal Server Error` → خطأ في الخادم

---

## 📞 الدعم الفني

إذا واجهت أي مشكلة في التوثيق أو الـAPI:

1. راجع قسم الأمثلة في [`examples.http`](./examples.http)
2. تحقق من [`error-handling.md`](../../frontend/error-handling.md)
3. اتصل بفريق التطوير

---

## 📚 مصادر إضافية

- [Frontend Integration Guide](../../frontend/COMPLETE-INTEGRATION-GUIDE.md)
- [TypeScript Interfaces](../../frontend/typescript-interfaces.ts)
- [React Hooks](../../frontend/react-hooks.ts)
- [Testing Guide](../../frontend/testing-guide.md)

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
