# 🚀 Pack Relations API - دليل Postman

> دليل سريع لاختبار Pack Relations API في Postman مع ترتيب منهجي

---

## 📍 إعداد Environment

### 1. إنشاء Environment جديد

```
Environment Name: ExploreKG Local
```

**Variables:**

| Variable        | Initial Value           | Current Value           |
| --------------- | ----------------------- | ----------------------- |
| `base_url`      | `http://localhost:4000` | `http://localhost:4000` |
| `pack_id`       |                         | _(يتم ملؤه تلقائياً)_   |
| `activity_id_1` |                         |                         |
| `activity_id_2` |                         |                         |
| `car_id`        |                         |                         |

---

## 🗺️ خارطة الطريق (Roadmap)

```
المرحلة 1: الإعداد الأولي
  ├─ 1.1 إنشاء نشاط أول (Activity)
  ├─ 1.2 إنشاء نشاط ثاني (Activity)
  └─ 1.3 إنشاء سيارة (Car)

المرحلة 2: إنشاء الحزمة
  ├─ 2.1 إنشاء Travel Pack
  └─ 2.2 إنشاء Pack Relation

المرحلة 3: الاستعلام والعرض
  ├─ 3.1 جلب جميع Pack Relations
  ├─ 3.2 جلب Pack Relation واحدة
  ├─ 3.3 Detailed Pack (Overview)
  ├─ 3.4 Detailed Pack (Activities)
  ├─ 3.5 Detailed Pack (Cars)
  └─ 3.6 Detailed Pack (Full)

المرحلة 4: حساب الأسعار
  ├─ 4.1 سعر افتراضي (كل الأنشطة)
  ├─ 4.2 سعر مخصص (اختيار معين)
  └─ 4.3 اختبار القيود (min/max)

المرحلة 5: التحديث والحذف
  ├─ 5.1 تحديث Pack Relation
  └─ 5.2 حذف Pack Relation
```

---

## 📦 Collection Structure

```
Pack Relations API
├── 📁 Setup (الإعداد)
│   ├── Create Activity 1
│   ├── Create Activity 2
│   ├── Create Car
│   └── Create Travel Pack
│
├── 📁 Pack Relations CRUD
│   ├── Create Pack Relation
│   ├── Get All Pack Relations
│   ├── Get Pack Relation by ID
│   ├── Update Pack Relation
│   └── Delete Pack Relation
│
├── 📁 Detailed Pack (Multi-step)
│   ├── Get Overview
│   ├── Get Activities
│   ├── Get Cars
│   └── Get Full Details
│
└── 📁 Price Calculation
    ├── Calculate Default Price
    ├── Calculate Custom Price
    └── Test Constraints
```

---

## 🎯 المرحلة 1: الإعداد الأولي

### 1.1 إنشاء نشاط أول

```http
POST {{base_url}}/api/v1/activities
Content-Type: application/json
```

**Body:**

```json
{
  "localeGroupId": "quad-biking-test",
  "locale": "en",
  "locales": {
    "en": {
      "name": "Quad Biking Adventure",
      "description": "Thrilling desert experience"
    }
  },
  "price": 150,
  "duration": "2 hours",
  "status": "active",
  "metadata": {
    "difficulty": "moderate"
  },
  "coverImage": "https://example.com/quad.jpg",
  "location": {
    "type": "Point",
    "coordinates": [31.6295, -7.9811]
  },
  "groupSize": {
    "min": 1,
    "max": 10
  }
}
```

**Tests Script:**

```javascript
// حفظ ID النشاط
if (pm.response.code === 200 || pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set('activity_id_1', response.data.localeGroupId);
  console.log('✅ Activity 1 created:', response.data.localeGroupId);
}
```

---

### 1.2 إنشاء نشاط ثاني

```http
POST {{base_url}}/api/v1/activities
```

**Body:**

```json
{
  "localeGroupId": "camel-ride-test",
  "locale": "en",
  "locales": {
    "en": {
      "name": "Camel Ride Experience",
      "description": "Traditional desert transport"
    }
  },
  "price": 80,
  "duration": "1 hour",
  "status": "active",
  "metadata": {
    "difficulty": "easy"
  },
  "coverImage": "https://example.com/camel.jpg",
  "location": {
    "type": "Point",
    "coordinates": [31.6295, -7.9811]
  },
  "groupSize": {
    "min": 1,
    "max": 20
  }
}
```

**Tests Script:**

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set('activity_id_2', response.data.localeGroupId);
  console.log('✅ Activity 2 created:', response.data.localeGroupId);
}
```

---

### 1.3 إنشاء سيارة

```http
POST {{base_url}}/api/v1/cars
```

**Body:**

```json
{
  "localeGroupId": "suv-4x4-test",
  "locale": "en",
  "locales": {
    "en": {
      "name": "4x4 SUV",
      "description": "Comfortable desert vehicle"
    }
  },
  "pricing": {
    "amount": 50,
    "currency": "USD"
  },
  "specs": {
    "type": "SUV",
    "transmission": "automatic",
    "fuelType": "diesel",
    "seats": 5
  },
  "status": "available"
}
```

**Tests Script:**

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set('car_id', response.data.localeGroupId);
  console.log('✅ Car created:', response.data.localeGroupId);
}
```

---

### 1.4 إنشاء Travel Pack

```http
POST {{base_url}}/api/v1/travel-packs
```

**Body:**

```json
{
  "localeGroupId": "desert-pack-test",
  "locale": "en",
  "locales": {
    "en": {
      "name": "Desert Adventure Pack",
      "description": "Complete desert experience"
    }
  },
  "basePrice": 350,
  "currency": "USD",
  "duration": 5,
  "status": "published"
}
```

**Tests Script:**

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set('pack_id', response.data.localeGroupId);
  console.log('✅ Travel Pack created:', response.data.localeGroupId);
}
```

---

## 🎯 المرحلة 2: إنشاء Pack Relation

### 2.1 Create Pack Relation

```http
POST {{base_url}}/api/v1/pack-relations
```

**Body:**

```json
{
  "travelPackLocaleGroupId": "{{pack_id}}",
  "relations": {
    "activities": [
      {
        "localeGroupId": "{{activity_id_1}}",
        "discount": 10,
        "optional": false,
        "quantity": 1
      },
      {
        "localeGroupId": "{{activity_id_2}}",
        "discount": 5,
        "optional": true,
        "quantity": 1
      }
    ],
    "cars": [
      {
        "localeGroupId": "{{car_id}}",
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
}
```

**Tests Script:**

```javascript
pm.test('Pack Relation created', function () {
  pm.response.to.have.status(201);
});

pm.test('Has correct structure', function () {
  const json = pm.response.json();
  pm.expect(json.data).to.have.property('travelPackLocaleGroupId');
  pm.expect(json.data.relations).to.have.property('activities');
  pm.expect(json.data.relations).to.have.property('cars');
});
```

**ملاحظات:**

- ✅ Activity 1 إجباري (optional: false)
- ✅ Activity 2 اختياري (optional: true)
- ✅ خصم 10% على النشاط الأول
- ✅ خصم عام 5% على المجموع

---

## 🎯 المرحلة 3: الاستعلام والعرض

### 3.1 Get All Pack Relations

```http
GET {{base_url}}/api/v1/pack-relations
```

**Tests:**

```javascript
pm.test('Status is 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Returns array', function () {
  const json = pm.response.json();
  pm.expect(json.data.items).to.be.an('array');
});
```

---

### 3.2 Get Pack Relation by ID

```http
GET {{base_url}}/api/v1/pack-relations/{{pack_id}}
```

---

### 3.3 Detailed Pack - Overview

```http
GET {{base_url}}/api/v1/travel-packs/{{pack_id}}/detailed?step=overview&locale=en
```

**Response Preview:**

```json
{
  "pack": { ... },
  "pricing": {
    "activitiesTotal": 135,
    "carsTotal": 127.5,
    "finalTotal": 249.37
  },
  "settings": { ... }
}
```

**ملاحظة:** يظهر فقط معلومات الحزمة والسعر الإجمالي

---

### 3.4 Detailed Pack - Activities

```http
GET {{base_url}}/api/v1/travel-packs/{{pack_id}}/detailed?step=activities&locale=en
```

**Response Preview:**

```json
{
  "activities": [
    {
      "name": "Quad Biking Adventure",
      "price": 150,
      "discount": 10,
      "finalPrice": 135,
      "optional": false
    },
    {
      "name": "Camel Ride Experience",
      "price": 80,
      "discount": 5,
      "finalPrice": 76,
      "optional": true
    }
  ],
  "pricing": {
    "activitiesTotal": 135,
    "optionalActivitiesTotal": 76
  }
}
```

---

### 3.5 Detailed Pack - Cars

```http
GET {{base_url}}/api/v1/travel-packs/{{pack_id}}/detailed?step=cars&locale=en
```

---

### 3.6 Detailed Pack - Full

```http
GET {{base_url}}/api/v1/travel-packs/{{pack_id}}/detailed?step=full&locale=en
```

**ملاحظة:** يرجع كل التفاصيل (activities + cars + pricing)

---

## 🎯 المرحلة 4: حساب الأسعار

### 4.1 Calculate Default Price (كل الأنشطة)

```http
POST {{base_url}}/api/v1/pack-relations/calculate-price
```

**Body:**

```json
{
  "travelPackLocaleGroupId": "{{pack_id}}",
  "selectedActivities": ["{{activity_id_1}}", "{{activity_id_2}}"],
  "selectedCar": "{{car_id}}",
  "carDurationDays": 3,
  "locale": "en"
}
```

**Tests:**

```javascript
pm.test('Price calculated', function () {
  const json = pm.response.json();
  pm.expect(json.data.breakdown).to.have.property('finalTotal');
  pm.expect(json.data.breakdown).to.have.property('deposit');
});

pm.test('Deposit is 20%', function () {
  const json = pm.response.json();
  const finalTotal = json.data.breakdown.finalTotal;
  const deposit = json.data.breakdown.deposit;
  pm.expect(deposit).to.eql(finalTotal * 0.2);
});
```

---

### 4.2 Calculate Custom Price (نشاط واحد فقط)

```http
POST {{base_url}}/api/v1/pack-relations/calculate-price
```

**Body:**

```json
{
  "travelPackLocaleGroupId": "{{pack_id}}",
  "selectedActivities": ["{{activity_id_1}}"],
  "selectedCar": "{{car_id}}",
  "carDurationDays": 2,
  "locale": "en"
}
```

**ملاحظة:** النشاط الاختياري (camel-ride) لم يتم اختياره، فالسعر أقل

---

### 4.3 Test Constraints - Too Few Activities

```http
POST {{base_url}}/api/v1/pack-relations/calculate-price
```

**Body:**

```json
{
  "travelPackLocaleGroupId": "{{pack_id}}",
  "selectedActivities": [],
  "locale": "en"
}
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Minimum 1 activities required, but 0 selected"
}
```

---

### 4.4 Test Constraints - Too Many Activities

```http
POST {{base_url}}/api/v1/pack-relations/calculate-price
```

**Body:**

```json
{
  "travelPackLocaleGroupId": "{{pack_id}}",
  "selectedActivities": ["act1", "act2", "act3", "act4"],
  "locale": "en"
}
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Maximum 3 activities allowed, but 4 selected"
}
```

---

## 🎯 المرحلة 5: التحديث والحذف

### 5.1 Update Pack Relation

```http
PUT {{base_url}}/api/v1/pack-relations/{{pack_id}}
```

**Body (تغيير الاستراتيجية):**

```json
{
  "pricing": {
    "strategy": "custom",
    "customPrice": 500
  }
}
```

**Tests:**

```javascript
pm.test('Updated successfully', function () {
  pm.response.to.have.status(200);
  const json = pm.response.json();
  pm.expect(json.data.pricing.strategy).to.eql('custom');
  pm.expect(json.data.pricing.customPrice).to.eql(500);
});
```

---

### 5.2 Delete Pack Relation

```http
DELETE {{base_url}}/api/v1/pack-relations/{{pack_id}}
```

**Tests:**

```javascript
pm.test('Deleted successfully', function () {
  pm.response.to.have.status(200);
});
```

---

## 📊 سيناريوهات اختبار إضافية

### Scenario 1: حزمة VIP (سعر ثابت)

```json
{
  "travelPackLocaleGroupId": "vip-pack",
  "relations": {
    "activities": [{ "localeGroupId": "private-chef", "optional": false }],
    "cars": [{ "localeGroupId": "luxury-sedan", "durationDays": 7 }]
  },
  "pricing": {
    "strategy": "custom",
    "customPrice": 2999.99
  },
  "settings": {
    "allowCustomization": false
  }
}
```

---

### Scenario 2: حزمة مرنة (خصومات متعددة)

```json
{
  "travelPackLocaleGroupId": "summer-special",
  "relations": {
    "activities": [
      {
        "localeGroupId": "beach-activities",
        "discount": 20,
        "optional": false
      },
      { "localeGroupId": "water-sports", "discount": 15, "optional": true }
    ],
    "cars": [
      { "localeGroupId": "convertible", "durationDays": 5, "discount": 25 }
    ]
  },
  "pricing": {
    "strategy": "sum",
    "globalDiscount": 10
  },
  "settings": {
    "allowCustomization": true,
    "minActivities": 1,
    "maxActivities": 5
  }
}
```

---

## 🔍 نصائح الاختبار

### ✅ Checklist

- [ ] تأكد من تشغيل السيرفر على `localhost:4000`
- [ ] قم بإنشاء الـ Activities والـ Cars أولاً
- [ ] احفظ الـ IDs في Environment Variables
- [ ] اختبر الـ Required Activities قبل Optional
- [ ] تحقق من حسابات الخصومات
- [ ] جرب سيناريوهات min/max constraints
- [ ] اختبر strategy='sum' و strategy='custom'

---

### 🎯 ترتيب التنفيذ المثالي

```
1. Run Setup Folder → ينشئ Activities, Cars, Pack
2. Create Pack Relation → يربط الحزمة بالعناصر
3. Get Detailed Pack → يعرض التفاصيل step by step
4. Calculate Price → يحسب الأسعار حسب الاختيار
5. Update & Test → تجربة التحديث والقيود
6. Delete → التنظيف
```

---

## 🐛 أخطاء شائعة

### Error 1: "Pack relation already exists"

**السبب:** تم إنشاء Pack Relation من قبل بنفس الـ `travelPackLocaleGroupId`

**الحل:** احذف القديم أو استخدم UPDATE

---

### Error 2: "customPrice is required"

**السبب:** strategy='custom' بدون customPrice

**الحل:**

```json
{
  "pricing": {
    "strategy": "custom",
    "customPrice": 999.99
  }
}
```

---

### Error 3: "Minimum X activities required"

**السبب:** عدد الأنشطة المختارة أقل من minActivities

**الحل:** اختر المزيد من الأنشطة

---

## 📈 مؤشرات الأداء

| Endpoint             | متوسط الوقت | الملاحظات         |
| -------------------- | ----------- | ----------------- |
| Create Pack Relation | ~100ms      | سريع              |
| Get All              | ~50ms       | جيد مع pagination |
| Get Detailed (full)  | ~150ms      | يحمل كل العناصر   |
| Calculate Price      | ~80ms       | حسابات معقدة      |
| Update               | ~90ms       | سريع              |

---

## 🎓 Best Practices

1. **استخدم Environment Variables** لتسهيل التبديل بين Environments
2. **أضف Tests Scripts** للتحقق من النتائج تلقائياً
3. **رتب الـ Requests** في Folders منطقية
4. **احفظ IDs تلقائياً** باستخدام Scripts
5. **جرب Scenarios مختلفة** (required/optional, sum/custom)

---

## 📦 Export Collection

```bash
# تصدير Collection
Collection → Export → Collection v2.1 → Save as pack-relations.postman_collection.json

# تصدير Environment
Environment → Export → Save as explorekg-local.postman_environment.json
```

---

**آخر تحديث:** 2025-10-31  
**الحالة:** ✅ جاهز للاستخدام
