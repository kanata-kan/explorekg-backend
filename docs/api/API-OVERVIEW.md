# 🔌 نظرة عامة على APIs

## 📋 المحتويات

- [مقدمة](#-مقدمة)
- [Base URL](#-base-url)
- [المصادقة](#-المصادقة)
- [نقاط النهاية المتاحة](#-نقاط-النهاية-المتاحة)
- [أنماط الاستجابة](#-أنماط-الاستجابة)
- [رموز الحالة](#-رموز-الحالة)
- [معالجة الأخطاء](#-معالجة-الأخطاء)

---

## 🌟 مقدمة

ExploreKG Server يوفر **RESTful API** متكامل لإدارة النظام السياحي بالكامل. جميع الـ APIs تستخدم JSON للطلبات والاستجابات.

---

## 🌐 Base URL

```
Development: http://localhost:4000
Production:  https://api.explorekg.com (قريباً)
```

### API Versioning

```
/api/v1/*
```

---

## 🔐 المصادقة

### نظام الضيوف (Guest System)

- استخدام **UUID Session ID** في كل طلب
- الجلسات تنتهي بعد 24 ساعة
- لا حاجة لـ Authentication headers

**مثال**:

```http
GET /api/v1/guests/{sessionId}
```

---

## 📍 نقاط النهاية المتاحة

### 1️⃣ Guest API (10 endpoints)

```
POST   /api/v1/guests                    # إنشاء ضيف جديد
GET    /api/v1/guests/:sessionId         # جلب ضيف بالـ session
GET    /api/v1/guests/:sessionId/profile # الملف الشخصي
PATCH  /api/v1/guests/:sessionId/profile # تحديث الملف
POST   /api/v1/guests/:sessionId/renew   # تجديد الجلسة
DELETE /api/v1/guests/:sessionId         # حذف ضيف
GET    /api/v1/guests/:sessionId/verify  # التحقق من الجلسة
GET    /api/v1/guests                    # قائمة الضيوف (Admin)
GET    /api/v1/guests/:sessionId/bookings# حجوزات الضيف
POST   /api/v1/guests/cleanup            # تنظيف الجلسات المنتهية
```

[📖 التوثيق الكامل](./GUEST-API.md)

---

### 2️⃣ Booking API (9 endpoints)

```
POST   /api/v1/bookings                      # إنشاء حجز
GET    /api/v1/bookings/:bookingNumber       # جلب حجز
GET    /api/v1/bookings/guest/:guestId       # حجوزات الضيف
GET    /api/v1/bookings                      # قائمة جميع الحجوزات
POST   /api/v1/bookings/:bookingNumber/payment   # معالجة الدفع
POST   /api/v1/bookings/:bookingNumber/cancel    # إلغاء حجز
GET    /api/v1/bookings/:bookingNumber/details   # تفاصيل الحجز
GET    /api/v1/bookings/statistics               # إحصائيات
DELETE /api/v1/bookings/cleanup                  # حذف المنتهية
```

[📖 التوثيق الكامل](./BOOKING-API.md)

---

### 3️⃣ Travel Packs API (6+ endpoints)

```
GET    /api/v1/travel-packs              # قائمة الحزم
GET    /api/v1/travel-packs/:id          # تفاصيل حزمة
POST   /api/v1/travel-packs              # إنشاء حزمة (Admin)
PATCH  /api/v1/travel-packs/:id          # تحديث حزمة
DELETE /api/v1/travel-packs/:id          # حذف حزمة
GET    /api/v1/travel-packs/search       # بحث متقدم
```

[📖 التوثيق الكامل](./TRAVEL-PACKS-API.md)

---

### 4️⃣ Activities API (6+ endpoints)

```
GET    /api/v1/activities                # قائمة الأنشطة
GET    /api/v1/activities/:id            # تفاصيل نشاط
POST   /api/v1/activities                # إنشاء نشاط
PATCH  /api/v1/activities/:id            # تحديث نشاط
DELETE /api/v1/activities/:id            # حذف نشاط
GET    /api/v1/activities/search         # بحث
```

[📖 التوثيق الكامل](./ACTIVITIES-API.md)

---

### 5️⃣ Cars API (6+ endpoints)

```
GET    /api/v1/cars                      # قائمة السيارات
GET    /api/v1/cars/:id                  # تفاصيل سيارة
POST   /api/v1/cars                      # إضافة سيارة
PATCH  /api/v1/cars/:id                  # تحديث سيارة
DELETE /api/v1/cars/:id                  # حذف سيارة
GET    /api/v1/cars/search               # بحث
```

[📖 التوثيق الكامل](./CARS-API.md)

---

### 6️⃣ Pack Relations API (4+ endpoints)

```
POST   /api/v1/pack-relations            # ربط حزم
GET    /api/v1/pack-relations/:packId    # علاقات حزمة
DELETE /api/v1/pack-relations/:id        # حذف علاقة
GET    /api/v1/pack-relations/suggestions # توصيات
```

[📖 التوثيق الكامل](./PACK-RELATIONS-API.md)

---

### 7️⃣ Health Check API

```
GET    /health                           # فحص صحة النظام
```

---

## 📦 أنماط الاستجابة

### استجابة ناجحة

```json
{
  "success": true,
  "data": {
    "sessionId": "a7b8f226-48ee-4df9-b2f2-8ca9637e02c8",
    "email": "user@example.com",
    "name": "Ahmed Khan"
  },
  "message": "Guest created successfully" // اختياري
}
```

### استجابة قائمة مع Pagination

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### استجابة خطأ

```json
{
  "success": false,
  "message": "Guest not found",
  "errors": [
    {
      "field": "sessionId",
      "message": "Invalid UUID format"
    }
  ]
}
```

---

## 🔢 رموز الحالة

| Code | الوصف                 | متى يُستخدم              |
| ---- | --------------------- | ------------------------ |
| 200  | OK                    | عملية ناجحة (GET, PATCH) |
| 201  | Created               | تم الإنشاء بنجاح (POST)  |
| 204  | No Content            | حذف ناجح (DELETE)        |
| 400  | Bad Request           | خطأ في البيانات المُرسلة |
| 404  | Not Found             | المورد غير موجود         |
| 409  | Conflict              | تعارض (مثل: email مكرر)  |
| 500  | Internal Server Error | خطأ في الخادم            |

---

## ⚠️ معالجة الأخطاء

### Validation Errors (Zod)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "numberOfPersons",
      "message": "Must be at least 1"
    }
  ]
}
```

### Business Logic Errors

```json
{
  "success": false,
  "message": "Cannot cancel paid booking"
}
```

### Not Found Errors

```json
{
  "success": false,
  "message": "Guest with session ID 'xxx' not found"
}
```

---

## 🚀 أمثلة استخدام

### Create Guest

```bash
curl -X POST http://localhost:4000/api/v1/guests \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tourist@example.com",
    "name": "Ahmed Khan",
    "phone": "+996700123456"
  }'
```

### Create Booking

```bash
curl -X POST http://localhost:4000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "a7b8f226-48ee-4df9-b2f2-8ca9637e02c8",
    "itemType": "TRAVEL_PACK",
    "itemId": "673abc456...",
    "startDate": "2025-11-10T00:00:00.000Z",
    "endDate": "2025-11-15T00:00:00.000Z",
    "numberOfPersons": 2
  }'
```

---

## 📊 Rate Limiting

```
1000 requests per 15 minutes per IP
```

### Response Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699012345
```

---

## 🌍 Multi-Language Support

### Query Parameter

```
GET /api/v1/travel-packs?language=en
GET /api/v1/travel-packs?language=fr
```

### Supported Languages

- `en` - English
- `fr` - Français
- `ar` - العربية (قريباً)

---

## 📚 مراجع إضافية

- [Guest API](./GUEST-API.md)
- [Booking API](./BOOKING-API.md)
- [Travel Packs API](./TRAVEL-PACKS-API.md)
- [Activities API](./ACTIVITIES-API.md)
- [Cars API](./CARS-API.md)
- [Pack Relations API](./PACK-RELATIONS-API.md)

---

_📘 Auto-generated by Copilot Documentation Architect — ExploreKG Server Project_
