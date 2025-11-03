# 📝 Content Management Guide

## 🎯 نظرة عامة

دليل شامل لإدارة المحتوى في ExploreKG Admin Dashboard.

---

## 📦 إدارة الباقات السياحية (Travel Packs)

### إنشاء باقة جديدة

```http
POST /api/v1/travel-packs
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Kyrgyzstan Adventure",
  "locale": "en",
  "slug": "kyrgyzstan-adventure",
  "localeGroupId": "pack_group_new",
  "price": 850,
  "duration": 7,
  "maxPersons": 4,
  "description": "...",
  "highlights": [...],
  "included": [...],
  "notIncluded": [...],
  "itinerary": [...],
  "images": [...],
  "isAvailable": true
}
```

### Workflow

1. إنشاء النسخة الإنجليزية (`locale: en`)
2. استخدام نفس `localeGroupId` للنسخة الفرنسية
3. ربط الباقة بالأنشطة والسيارات في Pack Relations
4. نشر الباقة (`isAvailable: true`)

---

## 🎯 إدارة الأنشطة (Activities)

### إنشاء نشاط جديد

```http
POST /api/v1/activities
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Horse Riding",
  "locale": "en",
  "slug": "horse-riding",
  "localeGroupId": "activity_group_new",
  "price": 80,
  "duration": 0.5,
  "description": "...",
  "difficulty": "moderate",
  "minPersons": 1,
  "maxPersons": 6,
  "isAvailable": true
}
```

### ربط النشاط بباقات

```http
POST /api/v1/activities/activity_new/packs
Authorization: Bearer {token}
Content-Type: application/json

{
  "packIds": ["pack_group_123", "pack_group_456"]
}
```

---

## 🚗 إدارة السيارات (Cars)

### إنشاء سيارة جديدة

```http
POST /api/v1/cars
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Toyota Land Cruiser",
  "locale": "en",
  "slug": "toyota-land-cruiser",
  "localeGroupId": "car_group_new",
  "price": 150,
  "type": "suv",
  "capacity": 7,
  "transmission": "automatic",
  "fuelType": "diesel",
  "pricePerDay": 150,
  "isAvailable": true
}
```

---

## 🔗 إدارة علاقات الباقات (Pack Relations)

### إنشاء علاقة جديدة

```http
POST /api/v1/pack-relations
Authorization: Bearer {token}
Content-Type: application/json

{
  "travelPackLocaleGroupId": "pack_group_new",
  "availableActivities": [
    {
      "localeGroupId": "activity_group_001",
      "isOptional": true
    },
    {
      "localeGroupId": "activity_group_002",
      "isOptional": true
    }
  ],
  "availableCars": [
    {
      "localeGroupId": "car_group_001"
    },
    {
      "localeGroupId": "car_group_002"
    }
  ]
}
```

---

## 📊 Best Practices

### 1. Localization

- أنشئ نسخة `en` و `fr` لكل محتوى
- استخدم نفس `localeGroupId` للنسخ المترجمة
- تأكد من ترجمة جميع النصوص

### 2. Images

- استخدم روابط CDN
- حجم الصور: أقل من 2MB
- أبعاد موصى بها: 1200x800px

### 3. Pricing

- راجع الأسعار بشكل دوري
- حدّث أسعار الأنشطة والسيارات معاً

### 4. Availability

- استخدم `isAvailable` للتحكم في النشر
- لا تحذف المحتوى، فقط اجعله غير متاح

---

**آخر تحديث:** November 3, 2025
