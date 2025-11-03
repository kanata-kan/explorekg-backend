# 🎯 Pack Relations API - مرجع سريع

> دليل شامل لـ API العلاقات بين الحزم السياحية والأنشطة والسيارات مع حسابات الأسعار الذكية

## 📍 Base URL

```
http://localhost:4000/api/v1/pack-relations
http://localhost:4000/api/v1/travel-packs/:id/detailed
```

---

## 🏗️ هيكل البيانات (Data Structure)

### PackRelation Object

```typescript
{
  _id: string,                            // MongoDB ObjectId
  travelPackLocaleGroupId: string,        // 🔗 معرّف الحزمة السياحية (يربط كل اللغات)

  // العلاقات مع الأنشطة والسيارات
  relations: {
    activities: [
      {
        localeGroupId: string,            // معرّف النشاط
        discount: number,                 // خصم خاص (0-100%)
        optional: boolean,                // هل النشاط اختياري؟
        quantity: number                  // عدد المرات/الأشخاص
      }
    ],
    cars: [
      {
        localeGroupId: string,            // معرّف السيارة
        durationDays: number,             // عدد أيام الإيجار
        discount: number,                 // خصم خاص (0-100%)
        optional: boolean                 // هل السيارة اختيارية؟
      }
    ]
  },

  // استراتيجية التسعير
  pricing: {
    strategy: "sum" | "custom",          // طريقة الحساب
    globalDiscount?: number,             // خصم إضافي على المجموع (0-100%)
    customPrice?: number                 // سعر ثابت محدد (مطلوب عند strategy='custom')
  },

  // إعدادات التخصيص
  settings: {
    allowCustomization: boolean,         // هل يمكن للزبون التخصيص؟
    minActivities?: number,              // الحد الأدنى للأنشطة
    maxActivities?: number               // الحد الأقصى للأنشطة
  },

  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 فهم استراتيجيات التسعير

### Strategy: "sum" - الحساب من العناصر

```typescript
pricing: {
  strategy: "sum",
  globalDiscount: 10    // اختياري
}
```

**كيفية الحساب:**

```
1. حساب كل نشاط مطلوب:
   finalPrice = price × quantity × (1 - discount/100)

2. حساب كل سيارة:
   totalPrice = pricePerDay × durationDays × (1 - discount/100)

3. المجموع الفرعي = مجموع الأنشطة المطلوبة + السيارات

4. تطبيق الخصم العام:
   discountAmount = subtotal × (globalDiscount/100)

5. السعر النهائي = subtotal - discountAmount

6. العمربون (20%):
   deposit = finalTotal × 0.20
```

**مثال عملي:**

```javascript
// Example: حزمة مغامرة الصحراء
{
  relations: {
    activities: [
      { name: "Quad Biking", price: 150, discount: 10 },  // 150 - 10% = 135
      { name: "Camel Ride", price: 80, discount: 5 }      // 80 - 5% = 76
    ],
    cars: [
      { pricePerDay: 50, days: 3, discount: 10 }          // 50×3 - 10% = 135
    ]
  },
  pricing: { strategy: "sum", globalDiscount: 5 }
}

// الحساب:
// activitiesTotal = 135 + 76 = 211
// carsTotal = 135
// subtotal = 211 + 135 = 346
// discountAmount = 346 × 0.05 = 17.3
// finalTotal = 346 - 17.3 = 328.70
// deposit = 328.70 × 0.20 = 65.74
```

### Strategy: "custom" - سعر ثابت

```typescript
pricing: {
  strategy: "custom",
  customPrice: 999.99    // مطلوب
}
```

**كيفية الحساب:**

```
السعر النهائي = customPrice
العمربون = customPrice × 0.20
```

**متى نستعمله:**

- ✅ عروض خاصة (VIP packages)
- ✅ أسعار الموسم
- ✅ حزم الشركات
- ✅ عروض لفترة محدودة

---

## 🎯 أنواع العناصر (Required vs Optional)

### الأنشطة المطلوبة (Required Activities)

```typescript
{
  localeGroupId: "quad-biking",
  discount: 10,
  optional: false,          // ✅ إجباري
  quantity: 1
}
```

**الخصائص:**

- ✅ يدخل في حساب السعر الأساسي
- ❌ الزبون لا يستطيع حذفه
- ✅ يظهر في `activitiesTotal`

### الأنشطة الاختيارية (Optional Activities)

```typescript
{
  localeGroupId: "camel-ride",
  discount: 5,
  optional: true,           // ✅ اختياري
  quantity: 1
}
```

**الخصائص:**

- ❌ لا يدخل في حساب السعر الأساسي
- ✅ الزبون يستطيع إضافته
- ✅ يظهر في `optionalActivitiesTotal` (منفصل)

---

## 🔄 تدفق البيانات (Data Flow)

```
┌──────────────────┐
│   Frontend UI    │
│ (Multi-step     │
│  Wizard)        │
└────────┬─────────┘
         │
         │ Step 1: GET /detailed?step=overview
         ▼
┌──────────────────────────────┐
│   Overview                   │
│ - Pack info                  │
│ - Total price                │
│ - Settings                   │
└────────┬─────────────────────┘
         │
         │ Step 2: GET /detailed?step=activities
         ▼
┌──────────────────────────────┐
│   Activities Selection       │
│ - List all activities        │
│ - Mark required/optional     │
│ - Show prices & discounts    │
└────────┬─────────────────────┘
         │
         │ Step 3: GET /detailed?step=cars
         ▼
┌──────────────────────────────┐
│   Cars Selection             │
│ - List available cars        │
│ - Duration options           │
│ - Prices per day             │
└────────┬─────────────────────┘
         │
         │ Step 4: POST /calculate-price
         │ { selectedActivities, selectedCar }
         ▼
┌──────────────────────────────┐
│   Price Calculation          │
│ - Apply all discounts        │
│ - Calculate total            │
│ - Show deposit               │
└────────┬─────────────────────┘
         │
         │ Confirm & Book
         ▼
┌──────────────────────────────┐
│   Booking System             │
└──────────────────────────────┘
```

---

## 🎯 Endpoints المتاحة

### 1️⃣ إنشاء PackRelation

```http
POST /api/v1/pack-relations
Content-Type: application/json
```

**Request Body:**

```typescript
{
  travelPackLocaleGroupId: string,    // مطلوب
  relations: {
    activities: [
      {
        localeGroupId: string,        // مطلوب
        discount: number,             // 0-100 (افتراضي: 0)
        optional: boolean,            // افتراضي: false
        quantity: number              // min: 1 (افتراضي: 1)
      }
    ],
    cars: [
      {
        localeGroupId: string,        // مطلوب
        durationDays: number,         // min: 1
        discount: number,             // 0-100 (افتراضي: 0)
        optional: boolean             // افتراضي: false
      }
    ]
  },
  pricing: {
    strategy: "sum" | "custom",       // مطلوب
    globalDiscount?: number,          // 0-100 (اختياري)
    customPrice?: number              // مطلوب إذا strategy='custom'
  },
  settings: {
    allowCustomization: boolean,      // مطلوب
    minActivities?: number,           // min: 0
    maxActivities?: number            // يجب أن يكون >= minActivities
  }
}
```

**مثال:**

```bash
curl -X POST http://localhost:4000/api/v1/pack-relations \
  -H "Content-Type: application/json" \
  -d '{
    "travelPackLocaleGroupId": "pack-desert-adventure",
    "relations": {
      "activities": [
        {
          "localeGroupId": "quad-biking",
          "discount": 10,
          "optional": false,
          "quantity": 1
        },
        {
          "localeGroupId": "camel-ride",
          "discount": 5,
          "optional": true,
          "quantity": 1
        }
      ],
      "cars": [
        {
          "localeGroupId": "4x4-suv",
          "durationDays": 3,
          "discount": 15,
          "optional": false
        }
      ]
    },
    "pricing": {
      "strategy": "sum",
      "globalDiscount": 5
    },
    "settings": {
      "allowCustomization": true,
      "minActivities": 1,
      "maxActivities": 3
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "672a1b2c3d4e5f6a7b8c9d0e",
    "travelPackLocaleGroupId": "pack-desert-adventure",
    "relations": { ... },
    "pricing": { ... },
    "settings": { ... },
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T10:00:00.000Z"
  },
  "message": "PackRelation created successfully"
}
```

**Validation Errors:**

```json
// مثال: خصم فوق 100%
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "relations.activities.0.discount",
      "message": "Discount must be between 0 and 100"
    }
  ]
}

// مثال: minActivities > maxActivities
{
  "success": false,
  "error": "minActivities (5) must be less than or equal to maxActivities (2)"
}

// مثال: strategy='custom' بدون customPrice
{
  "success": false,
  "error": "customPrice is required when strategy is 'custom'"
}
```

---

### 2️⃣ جلب جميع PackRelations

```http
GET /api/v1/pack-relations
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "672a1b2c3d4e5f6a7b8c9d0e",
        "travelPackLocaleGroupId": "pack-desert-adventure",
        "relations": { ... },
        "pricing": { ... },
        "settings": { ... }
      }
    ],
    "count": 10
  }
}
```

---

### 3️⃣ جلب PackRelation واحدة

```http
GET /api/v1/pack-relations/:packId
```

**Parameters:**

- `packId`: travelPackLocaleGroupId

**مثال:**

```bash
GET /api/v1/pack-relations/pack-desert-adventure
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "672a1b2c3d4e5f6a7b8c9d0e",
    "travelPackLocaleGroupId": "pack-desert-adventure",
    "relations": {
      "activities": [
        {
          "localeGroupId": "quad-biking",
          "discount": 10,
          "optional": false,
          "quantity": 1
        }
      ],
      "cars": [ ... ]
    },
    "pricing": {
      "strategy": "sum",
      "globalDiscount": 5
    },
    "settings": {
      "allowCustomization": true,
      "minActivities": 1,
      "maxActivities": 3
    }
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": "PackRelation not found",
  "statusCode": 404
}
```

---

### 4️⃣ تحديث PackRelation

```http
PUT /api/v1/pack-relations/:packId
Content-Type: application/json
```

**Request Body:** (جميع الحقول اختيارية - partial update)

```typescript
{
  relations?: {
    activities?: [...],
    cars?: [...]
  },
  pricing?: {
    strategy?: "sum" | "custom",
    globalDiscount?: number,
    customPrice?: number
  },
  settings?: {
    allowCustomization?: boolean,
    minActivities?: number,
    maxActivities?: number
  }
}
```

**مثال:**

```bash
curl -X PUT http://localhost:4000/api/v1/pack-relations/pack-desert-adventure \
  -H "Content-Type: application/json" \
  -d '{
    "pricing": {
      "strategy": "custom",
      "customPrice": 500
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "672a1b2c3d4e5f6a7b8c9d0e",
    "travelPackLocaleGroupId": "pack-desert-adventure",
    "pricing": {
      "strategy": "custom",
      "customPrice": 500
    },
    ...
  }
}
```

---

### 5️⃣ حذف PackRelation

```http
DELETE /api/v1/pack-relations/:packId
```

**مثال:**

```bash
curl -X DELETE http://localhost:4000/api/v1/pack-relations/pack-desert-adventure
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "PackRelation deleted successfully"
  }
}
```

---

### 6️⃣ حساب السعر المخصص (Custom Price Calculation)

```http
POST /api/v1/pack-relations/calculate-price
Content-Type: application/json
```

> 🎯 **الاستخدام:** عندما يختار الزبون أنشطة معينة من الأنشطة الاختيارية

**Request Body:**

```typescript
{
  travelPackLocaleGroupId: string,     // مطلوب
  selectedActivities: string[],        // array من localeGroupIds
  selectedCar?: string,                // localeGroupId (اختياري)
  carDurationDays?: number,            // عدد أيام السيارة (اختياري)
  locale: "en" | "fr"                  // افتراضي: "en"
}
```

**مثال:**

```bash
curl -X POST http://localhost:4000/api/v1/pack-relations/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "travelPackLocaleGroupId": "pack-desert-adventure",
    "selectedActivities": ["quad-biking", "camel-ride"],
    "selectedCar": "4x4-suv",
    "carDurationDays": 3,
    "locale": "en"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "breakdown": {
      "activitiesTotal": 211,
      "optionalActivitiesTotal": 76,
      "carsTotal": 135,
      "subtotal": 346,
      "globalDiscount": 5,
      "discountAmount": 17.3,
      "finalTotal": 328.7,
      "deposit": 65.74
    },
    "selectedItems": {
      "activities": [
        {
          "_id": "671a2b3c4d5e6f7a8b9c0d1e",
          "localeGroupId": "quad-biking",
          "name": "Quad Biking Adventure",
          "price": 150,
          "discount": 10,
          "finalPrice": 135,
          "optional": false,
          "quantity": 1
        },
        {
          "_id": "681b2c3d4e5f6a7b8c9d0e2f",
          "localeGroupId": "camel-ride",
          "name": "Camel Ride Experience",
          "price": 80,
          "discount": 5,
          "finalPrice": 76,
          "optional": true,
          "quantity": 1
        }
      ],
      "car": {
        "_id": "691c2d3e4f5a6b7c8d9e0f3a",
        "localeGroupId": "4x4-suv",
        "name": "4x4 SUV",
        "pricePerDay": 50,
        "durationDays": 3,
        "discount": 15,
        "totalPrice": 127.5
      }
    }
  }
}
```

**Validation - Enforce minActivities:**

```bash
# Settings: minActivities = 1
# Request: selectedActivities = []

# Response:
{
  "success": false,
  "error": "Minimum 1 activities required, but 0 selected",
  "statusCode": 400
}
```

**Validation - Enforce maxActivities:**

```bash
# Settings: maxActivities = 3
# Request: selectedActivities = ["act1", "act2", "act3", "act4"]

# Response:
{
  "success": false,
  "error": "Maximum 3 activities allowed, but 4 selected",
  "statusCode": 400
}
```

**Handling Missing Activities:**

```json
// لو نشاط مش موجود في قاعدة البيانات
{
  "success": true,
  "data": {
    "breakdown": { ... },
    "selectedItems": {
      "activities": [
        {
          "localeGroupId": "valid-activity",
          "name": "Valid Activity",
          "price": 100,
          "missing": false
        },
        {
          "localeGroupId": "non-existent-activity",
          "name": "Missing Activity",
          "price": 0,
          "finalPrice": 0,
          "missing": true        // ✅ علامة المفقود
        }
      ]
    }
  }
}
```

---

### 7️⃣ جلب Detailed Pack (Multi-step Wizard)

```http
GET /api/v1/travel-packs/:packId/detailed
```

**Query Parameters:**

```typescript
{
  step: "overview" | "activities" | "cars" | "full",  // افتراضي: "full"
  locale: "en" | "fr"                                  // افتراضي: "en"
}
```

#### Step 1: Overview (نظرة عامة)

```bash
GET /api/v1/travel-packs/pack-desert-adventure/detailed?step=overview&locale=en
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pack": {
      "_id": "661a2b3c4d5e6f7a8b9c0d1e",
      "localeGroupId": "pack-desert-adventure",
      "locale": "en",
      "locales": {
        "en": {
          "name": "Desert Adventure Pack",
          "description": "Experience the magic of the desert"
        }
      },
      "basePrice": 350,
      "currency": "USD",
      "duration": 5,
      "status": "published"
    },
    "pricing": {
      "activitiesTotal": 211,
      "carsTotal": 135,
      "subtotal": 346,
      "globalDiscount": 5,
      "discountAmount": 17.3,
      "finalTotal": 328.7,
      "deposit": 65.74
    },
    "settings": {
      "allowCustomization": true,
      "minActivities": 1,
      "maxActivities": 3
    }
  }
}
```

#### Step 2: Activities (اختيار الأنشطة)

```bash
GET /api/v1/travel-packs/pack-desert-adventure/detailed?step=activities&locale=en
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pack": { ... },
    "activities": [
      {
        "_id": "671a2b3c4d5e6f7a8b9c0d1e",
        "localeGroupId": "quad-biking",
        "locale": "en",
        "name": "Quad Biking Adventure",
        "description": "Thrilling quad bike experience",
        "price": 150,
        "duration": "2 hours",
        "discount": 10,
        "finalPrice": 135,
        "optional": false,
        "quantity": 1,
        "missing": false
      },
      {
        "_id": "681b2c3d4e5f6a7b8c9d0e2f",
        "localeGroupId": "camel-ride",
        "locale": "en",
        "name": "Camel Ride Experience",
        "price": 80,
        "discount": 5,
        "finalPrice": 76,
        "optional": true,
        "quantity": 1,
        "missing": false
      }
    ],
    "pricing": {
      "activitiesTotal": 135,          // فقط المطلوبة
      "optionalActivitiesTotal": 76    // الاختيارية منفصلة
    },
    "settings": { ... }
  }
}
```

#### Step 3: Cars (اختيار السيارة)

```bash
GET /api/v1/travel-packs/pack-desert-adventure/detailed?step=cars&locale=en
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pack": { ... },
    "cars": [
      {
        "_id": "691c2d3e4f5a6b7c8d9e0f3a",
        "localeGroupId": "4x4-suv",
        "locale": "en",
        "name": "4x4 SUV",
        "description": "Comfortable 4x4 for desert terrain",
        "pricePerDay": 50,
        "durationDays": 3,
        "discount": 15,
        "totalPrice": 127.5,
        "optional": false,
        "missing": false
      }
    ],
    "pricing": {
      "carsTotal": 127.5
    },
    "settings": { ... }
  }
}
```

#### Step 4: Full (كل شيء)

```bash
GET /api/v1/travel-packs/pack-desert-adventure/detailed?step=full&locale=en
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pack": { ... },
    "relations": {
      "activities": [ ... ],
      "cars": [ ... ]
    },
    "pricing": {
      "activitiesTotal": 135,
      "optionalActivitiesTotal": 76,
      "carsTotal": 127.5,
      "subtotal": 262.5,
      "globalDiscount": 5,
      "discountAmount": 13.13,
      "finalTotal": 249.37,
      "deposit": 49.87
    },
    "settings": { ... }
  }
}
```

---

## 🌐 دعم اللغات (Multi-language Support)

### استراتيجية localeGroupId

PackRelation يستخدم `travelPackLocaleGroupId` للربط مع الحزم السياحية بكل اللغات.

**مثال:**

```javascript
// PackRelation واحد يخدم كل اللغات
{
  "travelPackLocaleGroupId": "pack-desert-adventure",  // ← نفس المعرّف
  "relations": {
    "activities": [
      { "localeGroupId": "quad-biking" },    // ← كيربط مع كل لغات النشاط
      { "localeGroupId": "camel-ride" }
    ]
  }
}

// TravelPack English
{
  "_id": "661a2b3c...",
  "localeGroupId": "pack-desert-adventure",
  "locale": "en",
  "locales": {
    "en": { "name": "Desert Adventure Pack" }
  }
}

// TravelPack Français
{
  "_id": "771b3c4d...",
  "localeGroupId": "pack-desert-adventure",  // ← نفس المعرّف!
  "locale": "fr",
  "locales": {
    "fr": { "name": "Pack Aventure Désert" }
  }
}
```

### جلب بلغات مختلفة

```bash
# English version
GET /api/v1/travel-packs/pack-desert-adventure/detailed?locale=en

# Version française
GET /api/v1/travel-packs/pack-desert-adventure/detailed?locale=fr
```

---

## 💡 أمثلة الاستخدام (Use Cases)

### Use Case 1: حزمة ثابتة (Fixed Package)

```json
{
  "travelPackLocaleGroupId": "pack-city-tour",
  "relations": {
    "activities": [
      { "localeGroupId": "museum-visit", "optional": false },
      { "localeGroupId": "city-walk", "optional": false }
    ],
    "cars": []
  },
  "pricing": {
    "strategy": "custom",
    "customPrice": 99.99
  },
  "settings": {
    "allowCustomization": false // ✅ حزمة ثابتة - لا تخصيص
  }
}
```

**الفوائد:**

- سعر ثابت واضح
- لا تعقيدات في الحسابات
- مثالي للعروض الترويجية

---

### Use Case 2: حزمة مرنة (Flexible Package)

```json
{
  "travelPackLocaleGroupId": "pack-adventure",
  "relations": {
    "activities": [
      { "localeGroupId": "hiking", "optional": false }, // إجباري
      { "localeGroupId": "rafting", "optional": true }, // اختياري
      { "localeGroupId": "camping", "optional": true } // اختياري
    ],
    "cars": [{ "localeGroupId": "suv", "optional": false }]
  },
  "pricing": {
    "strategy": "sum",
    "globalDiscount": 10
  },
  "settings": {
    "allowCustomization": true, // ✅ تخصيص مسموح
    "minActivities": 1,
    "maxActivities": 3
  }
}
```

**الفوائد:**

- الزبون يختار ما يناسبه
- سعر ديناميكي حسب الاختيار
- زيادة معدل التحويل

---

### Use Case 3: عرض VIP (VIP Offer)

```json
{
  "travelPackLocaleGroupId": "pack-vip-luxury",
  "relations": {
    "activities": [
      { "localeGroupId": "private-chef", "discount": 0 },
      { "localeGroupId": "spa-treatment", "discount": 0 },
      { "localeGroupId": "helicopter-tour", "discount": 0 }
    ],
    "cars": [
      { "localeGroupId": "luxury-sedan", "durationDays": 7, "discount": 0 }
    ]
  },
  "pricing": {
    "strategy": "custom",
    "customPrice": 2999.99 // سعر VIP خاص
  },
  "settings": {
    "allowCustomization": false
  }
}
```

---

### Use Case 4: عرض موسمي (Seasonal Promotion)

```json
{
  "travelPackLocaleGroupId": "pack-summer-special",
  "relations": {
    "activities": [
      { "localeGroupId": "beach-activities", "discount": 20 }, // 20% OFF
      { "localeGroupId": "water-sports", "discount": 15 } // 15% OFF
    ],
    "cars": [
      { "localeGroupId": "convertible", "discount": 25 } // 25% OFF
    ]
  },
  "pricing": {
    "strategy": "sum",
    "globalDiscount": 10 // خصم إضافي 10%
  },
  "settings": {
    "allowCustomization": true,
    "minActivities": 1,
    "maxActivities": 5
  }
}
```

**الخصومات المتراكمة:**

- خصم فردي على كل عنصر
- خصم عام إضافي
- خصومات قوية لجذب الزبائن

---

## 🔒 Validation Rules (قواعد التحقق)

### PackRelation Validation

| الحقل                     | القاعدة                           | مثال خطأ                    |
| ------------------------- | --------------------------------- | --------------------------- |
| `travelPackLocaleGroupId` | 3-100 حرف، فريد                   | "ab" ❌ (قصير جداً)         |
| `discount`                | 0-100                             | 150 ❌ (فوق 100)            |
| `quantity`                | >= 1                              | 0 ❌ (أقل من 1)             |
| `durationDays`            | >= 1                              | 0 ❌ (أقل من 1)             |
| `strategy`                | "sum" أو "custom"                 | "average" ❌ (غير مدعوم)    |
| `customPrice`             | مطلوب عند strategy='custom', >= 0 | undefined ❌ (مطلوب)        |
| `minActivities`           | >= 0                              | -1 ❌ (سالب)                |
| `maxActivities`           | >= minActivities                  | min=5, max=2 ❌ (منطق خاطئ) |

### CalculatePrice Validation

| الحقل                       | القاعدة                              | مثال خطأ                 |
| --------------------------- | ------------------------------------ | ------------------------ |
| `selectedActivities`        | array من strings                     | "activity-1" ❌ (string) |
| `selectedActivities.length` | >= minActivities && <= maxActivities | [a1] ❌ (min=2)          |
| `locale`                    | "en" أو "fr"                         | "ar" ❌ (غير مدعوم)      |

---

## ⚡ Performance Tips

### 1. Caching Strategy

```javascript
// Redis cache للـ detailed packs
const cacheKey = `detailed-pack:${packId}:${locale}:${step}`;

// Cache for 1 hour
redis.setex(cacheKey, 3600, JSON.stringify(detailedPack));
```

### 2. Database Indexes

```javascript
// Indexes مطلوبة:
// - travelPackLocaleGroupId (unique)
// - relations.activities.localeGroupId
// - relations.cars.localeGroupId
```

### 3. Pagination

```javascript
// للحزم الكبيرة
GET /api/v1/pack-relations?page=1&limit=20
```

---

## 🐛 Common Errors & Solutions

### Error 1: Duplicate Pack Relation

```json
{
  "success": false,
  "error": "Pack relation already exists for this travelPackLocaleGroupId",
  "statusCode": 400
}
```

**الحل:** استخدم UPDATE بدلاً من CREATE

---

### Error 2: Missing customPrice

```json
{
  "success": false,
  "error": "customPrice is required when strategy is 'custom'",
  "statusCode": 400
}
```

**الحل:** أضف customPrice عند استخدام strategy='custom'

---

### Error 3: Invalid minActivities/maxActivities

```json
{
  "success": false,
  "error": "minActivities must be less than or equal to maxActivities",
  "statusCode": 400
}
```

**الحل:** تأكد أن min <= max

---

### Error 4: Too Many Activities Selected

```json
{
  "success": false,
  "error": "Maximum 3 activities allowed, but 5 selected",
  "statusCode": 400
}
```

**الحل:** قلل عدد الأنشطة المختارة

---

## 📚 Related Endpoints

| Endpoint               | Description          |
| ---------------------- | -------------------- |
| `/api/v1/travel-packs` | إدارة الحزم السياحية |
| `/api/v1/activities`   | إدارة الأنشطة        |
| `/api/v1/cars`         | إدارة السيارات       |

---

## 🎓 Best Practices

### ✅ DO

1. **استخدم localeGroupId للربط** بدلاً من ObjectId
2. **اختبر الحسابات** قبل النشر
3. **استخدم customPrice** للعروض الخاصة
4. **احترم min/max constraints** في التخصيص
5. **وفر fallback** للعناصر المفقودة

### ❌ DON'T

1. **لا تغير localeGroupId** بعد النشر
2. **لا تستخدم discounts فوق 100%**
3. **لا تسمح بـ minActivities > maxActivities**
4. **لا تنسى customPrice** مع strategy='custom'
5. **لا تهمل الـ validation** في Frontend

---

## 🔗 External Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [Express.js Guide](https://expressjs.com/)
- [Zod Validation](https://zod.dev/)

---

## 📞 Support

لأي استفسارات أو مشاكل:

- 📧 Email: support@explorekg.com
- 📚 Documentation: https://docs.explorekg.com
- 🐛 Issues: https://github.com/your-repo/issues

---

**آخر تحديث:** 2025-10-31  
**الإصدار:** 1.0.0  
**الحالة:** ✅ Production Ready
