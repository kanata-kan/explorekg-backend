# 🚗 Cars API - مرجع سريع

> دليل مختصر وشامل لـ API تأجير السيارات مع شرح تدفق البيانات وأمثلة عملية

## 📍 Base URL

```
http://localhost:4000/api/v1/cars
```

---

## 🏗️ هيكل البيانات (Data Structure)

### Car Object

```typescript
{
  _id: string,                    // MongoDB ObjectId
  name: string,                   // اسم السيارة
  description: string,            // الوصف الكامل
  coverImage: string,             // صورة الغلاف

  // معلومات التسعير
  pricing: {
    amount: number,              // السعر
    currency: string,            // العملة (USD, EUR, KGS)
    unit: string                 // الوحدة (day, hour, week)
  },

  // مواصفات السيارة
  specs: {
    seats: string,               // عدد المقاعد
    transmission: string,        // نوع ناقل السرعة
    drive: string,               // نظام الدفع (4x4, 2WD)
    luggage: string,             // حجم الأمتعة
    fuel: string                 // نوع الوقود
  },

  // بيانات SEO
  metadata: {
    title: string,               // عنوان SEO
    description: string,         // وصف SEO
    path: string,                // المسار (/cars/car-id)
    image: string,               // صورة SEO
    alt: string                  // نص بديل للصورة
  },

  images: string[],              // صور إضافية
  tags: string[],                // كلمات مفتاحية (تلقائية)
  localeGroupId: string,         // 🆕 معرّف يربط كل اللغات (EN/FR) لنفس السيارة
  locale: "en" | "fr",           // اللغة
  status: "active" | "inactive" | "maintenance",
  availabilityStatus: "available" | "reserved" | "unavailable",
  packIds: ObjectId[],           // روابط مع حزم السفر

  createdAt: Date,               // تاريخ الإنشاء
  updatedAt: Date                // تاريخ آخر تحديث
}
```

---

## 🌐 فهم localeGroupId - ربط الترجمات

### ما هو localeGroupId؟

`localeGroupId` هو **معرّف منطقي** يربط جميع الترجمات اللغوية (EN/FR) لنفس السيارة.

### 📊 مثال توضيحي:

```javascript
// النسخة الإنجليزية
{
  "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
  "name": "BMW X7 (2024)",
  "localeGroupId": "car-1",  // ← نفس المعرّف
  "locale": "en",
  "pricing": { "unit": "day" }
}

// النسخة الفرنسية
{
  "_id": "77b2c3d4e5f6g7h8i9j0k1l2",
  "name": "BMW X7 (2024)",
  "localeGroupId": "car-1",  // ← نفس المعرّف
  "locale": "fr",
  "pricing": { "unit": "jour" }
}
```

### 🎯 الفوائد:

| الميزة                  | الشرح                          | المثال                                    |
| ----------------------- | ------------------------------ | ----------------------------------------- |
| **ربط الترجمات**        | جلب كل اللغات لنفس السيارة     | `?localeGroupId=car-1` → يرجع EN + FR     |
| **تبديل اللغة**         | الانتقال بين اللغات بسهولة     | Frontend يستطيع toggle بين الترجمات       |
| **إدارة الحجز الموحدة** | حجز السيارة يؤثر على كل اللغات | Update availability مرة واحدة             |
| **SEO متعدد اللغات**    | `hreflang` tags للـ SEO        | Google يفهم أنهم نفس السيارة بلغات مختلفة |

### 🔍 أمثلة الاستعلامات:

```bash
# جلب كل الترجمات لسيارة معينة
GET /api/v1/cars?localeGroupId=car-1
# Response: 2 items (EN + FR)

# جلب فقط النسخة الإنجليزية
GET /api/v1/cars?localeGroupId=car-1&locale=en
# Response: 1 item (EN only)

# جلب فقط النسخة الفرنسية
GET /api/v1/cars?localeGroupId=car-1&locale=fr
# Response: 1 item (FR only)
```

### 💡 Best Practice للـ Frontend:

```javascript
// React/Next.js Example
const CarDetailsPage = ({ groupId, userLocale }) => {
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    // Fetch all translations
    fetch(`/api/v1/cars?localeGroupId=${groupId}`)
      .then(res => res.json())
      .then(data => {
        const byLocale = data.data.items.reduce((acc, car) => {
          acc[car.locale] = car;
          return acc;
        }, {});
        setTranslations(byLocale);
      });
  }, [groupId]);

  // Display current locale
  const currentCar = translations[userLocale] || translations['en'];

  return (
    <div>
      <h1>{currentCar?.name}</h1>
      <p>
        {currentCar?.pricing.amount} {currentCar?.pricing.currency}/
        {currentCar?.pricing.unit}
      </p>

      {/* Language switcher */}
      <button onClick={() => switchLocale('en')}>English</button>
      <button onClick={() => switchLocale('fr')}>Français</button>
    </div>
  );
};
```

### 🆔 تسمية localeGroupId:

**التنسيق الموصى به:**

```javascript
"localeGroupId": "car-{number}"

// Examples:
"car-1"  // BMW X7
"car-2"  // Mercedes Sprinter
"car-3"  // Jeep Wrangler
```

**⚠️ القواعد:**

- ✅ يجب أن يكون **فريد** لكل سيارة
- ✅ يجب أن يكون **نفس القيمة** لكل الترجمات
- ✅ طول 3-100 حرف
- ❌ لا تغيره بعد النشر (يكسر الروابط)

---

## 🔄 تدفق البيانات (Data Flow)

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────┐
│   Validation        │ ◄── Zod Schemas
│   (Middleware)      │
└──────┬──────────────┘
       │ Validated Data
       ▼
┌─────────────────────┐
│   Controller        │ ◄── Error Handling
│   (Route Handler)   │
└──────┬──────────────┘
       │ Business Logic Call
       ▼
┌─────────────────────┐
│   Service Layer     │ ◄── Business Rules
│   (CarService)      │
└──────┬──────────────┘
       │ Database Query
       ▼
┌─────────────────────┐
│   Model (Schema)    │ ◄── Mongoose
└──────┬──────────────┘
       │ MongoDB Query
       ▼
┌─────────────────────┐
│   MongoDB           │
│   cars collection   │
└─────────────────────┘
```

---

## 🎯 Endpoints المتاحة

### 1️⃣ جلب جميع السيارات

```http
GET /api/v1/cars
```

**Query Parameters:**

```typescript
{
  locale?: "en" | "fr",
  localeGroupId?: string,        // 🆕 جلب كل اللغات لنفس السيارة
  status?: "active" | "inactive" | "maintenance",
  availabilityStatus?: "available" | "reserved" | "unavailable",
  q?: string,                    // بحث نصي
  minPrice?: number,
  maxPrice?: number,
  transmission?: "Automatic" | "Manual",
  fuel?: "Petrol" | "Diesel" | "Electric" | "Hybrid",
  drive?: string,                // مثال: "4x4", "2WD"
  seats?: string,                // مثال: "7", "5-7"
  page?: number,                 // افتراضي: 1
  limit?: number,                // افتراضي: 20 (max: 100)
  sort?: string                  // مثال: "pricing.amount" أو "-createdAt"
}
```

**أمثلة عملية:**

```bash
# جلب جميع السيارات النشطة
GET /api/v1/cars?status=active

# 🆕 جلب كل الترجمات (EN/FR) لنفس السيارة
GET /api/v1/cars?localeGroupId=car-1

# 🆕 جلب فقط النسخة الإنجليزية من سيارة معينة
GET /api/v1/cars?localeGroupId=car-1&locale=en

# بحث عن سيارات BMW
GET /api/v1/cars?q=bmw

# فلترة حسب السعر
GET /api/v1/cars?minPrice=100&maxPrice=200

# سيارات أوتوماتيك متاحة
GET /api/v1/cars?transmission=Automatic&availabilityStatus=available

# سيارات 4x4 بنزين
GET /api/v1/cars?drive=4x4&fuel=Petrol

# ترتيب حسب السعر (من الأقل للأعلى)
GET /api/v1/cars?sort=pricing.amount

# pagination مع ترتيب
GET /api/v1/cars?page=1&limit=10&sort=-createdAt
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "BMW X7 (2024)",
        "description": "A luxury SUV that blends elegance and power",
        "coverImage": "/images/cars/BMW-X7.jpg",
        "pricing": {
          "amount": 180,
          "currency": "USD",
          "unit": "day"
        },
        "specs": {
          "seats": "7",
          "transmission": "Automatic",
          "drive": "4x4 xDrive",
          "luggage": "Large",
          "fuel": "Petrol"
        },
        "metadata": {
          "title": "BMW X7 (2024) — Luxury SUV Rental",
          "description": "Experience elegance with BMW X7",
          "path": "/cars/bmw-x7-2024",
          "image": "/images/cars/BMW-X7.jpg",
          "alt": "BMW X7 2024 luxury SUV"
        },
        "images": ["/images/cars/BMW-X7-1.jpg", "/images/cars/BMW-X7-2.jpg"],
        "tags": ["bmw", "luxury", "suv"],
        "localeGroupId": "car-1",
        "locale": "en",
        "status": "active",
        "availabilityStatus": "available",
        "createdAt": "2025-10-29T10:00:00.000Z",
        "updatedAt": "2025-10-29T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "status": "active"
    }
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 2️⃣ جلب سيارة واحدة

```http
GET /api/v1/cars/:id
```

**Parameters:**

- `id`: يمكن أن يكون MongoDB ObjectId أو slug (من metadata.path)

**أمثلة:**

```bash
# بـ ObjectId
GET /api/v1/cars/507f1f77bcf86cd799439011

# بـ slug
GET /api/v1/cars/bmw-x7-2024
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "BMW X7 (2024)",
    "pricing": {
      "amount": 180,
      "currency": "USD",
      "unit": "day"
    }
    // ... باقي البيانات
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 3️⃣ إنشاء سيارة جديدة

```http
POST /api/v1/cars
Content-Type: application/json
```

**Body (مطلوب):**

```json
{
  "name": "Mercedes-Benz Sprinter",
  "description": "Spacious minibus perfect for group travel",
  "coverImage": "https://example.com/sprinter.jpg",
  "pricing": {
    "amount": 140,
    "currency": "USD",
    "unit": "day"
  },
  "specs": {
    "seats": "15-20",
    "transmission": "Manual",
    "drive": "2WD Diesel",
    "luggage": "Extra Large",
    "fuel": "Diesel"
  },
  "metadata": {
    "title": "Mercedes-Benz Sprinter — Group Minibus Rental",
    "description": "Travel together with Mercedes-Benz Sprinter",
    "path": "/cars/mercedes-sprinter",
    "image": "https://example.com/sprinter.jpg",
    "alt": "Mercedes-Benz Sprinter Minibus"
  },
  "images": [
    "https://example.com/sprinter-1.jpg",
    "https://example.com/sprinter-2.jpg"
  ],
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Mercedes-Benz Sprinter",
    "tags": ["mercedes-benz", "sprinter"] // تم إنشاؤها تلقائياً
    // ... باقي البيانات
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 4️⃣ تحديث سيارة

```http
PATCH /api/v1/cars/:id
Content-Type: application/json
```

**Body (اختياري - أرسل فقط ما تريد تحديثه):**

```json
{
  "pricing": {
    "amount": 120
  },
  "availabilityStatus": "reserved"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "pricing": {
      "amount": 120,
      "currency": "USD",
      "unit": "day"
    },
    "availabilityStatus": "reserved"
    // ... البيانات المحدثة
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 5️⃣ حذف (أرشفة) سيارة

```http
DELETE /api/v1/cars/:id
```

> **ملاحظة:** هذا حذف ناعم (soft delete) - يتم تغيير status إلى inactive

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Car archived successfully"
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 6️⃣ الحصول على إحصائيات

```http
GET /api/v1/cars/statistics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 45,
    "byStatus": {
      "active": 38,
      "inactive": 5,
      "maintenance": 2
    },
    "byAvailability": {
      "available": 30,
      "reserved": 8,
      "unavailable": 7
    },
    "pricing": {
      "averagePrice": 145.5,
      "minPrice": 80,
      "maxPrice": 250
    }
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 7️⃣ جلب السيارات المتاحة

```http
GET /api/v1/cars/available
```

**Query Parameters:**

```typescript
{
  locale?: "en" | "fr"    // اختياري - فلترة حسب اللغة
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "BMW X7 (2024)",
      "status": "active",
      "availabilityStatus": "available"
      // ... باقي البيانات
    }
  ],
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 8️⃣ تحديث حالة التوفر

```http
PATCH /api/v1/cars/:id/availability
Content-Type: application/json
```

**Body:**

```json
{
  "availabilityStatus": "reserved"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "availabilityStatus": "reserved"
    // ... باقي البيانات
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 9️⃣ ربط السيارة بحزم السفر

```http
POST /api/v1/cars/:id/packs
Content-Type: application/json
```

**Body:**

```json
{
  "packIds": ["507f1f77bcf86cd799439020", "507f1f77bcf86cd799439021"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "packIds": ["507f1f77bcf86cd799439020", "507f1f77bcf86cd799439021"]
    // ... باقي البيانات
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

## 🎨 أمثلة استخدام JavaScript

### مثال 1: جلب وعرض السيارات

```javascript
async function fetchCars() {
  try {
    const response = await fetch(
      'http://localhost:4000/api/v1/cars?status=active&limit=10'
    );
    const data = await response.json();

    if (data.success) {
      data.data.items.forEach(car => {
        console.log(`${car.name} - $${car.pricing.amount}/${car.pricing.unit}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### مثال 2: إنشاء سيارة جديدة

```javascript
async function createCar(carData) {
  try {
    const response = await fetch('http://localhost:4000/api/v1/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carData),
    });

    const data = await response.json();

    if (data.success) {
      console.log('Created:', data.data.name);
    } else {
      console.error('Validation errors:', data.details);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### مثال 3: بحث متقدم

```javascript
async function searchCars(filters) {
  const params = new URLSearchParams({
    status: 'active',
    availabilityStatus: 'available',
    ...filters,
  });

  const response = await fetch(`http://localhost:4000/api/v1/cars?${params}`);
  const data = await response.json();

  return data.data.items;
}

// استخدام
const luxuryCars = await searchCars({
  q: 'luxury',
  minPrice: 150,
  transmission: 'Automatic',
});
```

### مثال 4: React Hook

```jsx
import { useState, useEffect } from 'react';

const useCars = (filters = {}) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          status: 'active',
          ...filters,
        });

        const response = await fetch(
          `http://localhost:4000/api/v1/cars?${params}`
        );
        const data = await response.json();

        if (data.success) {
          setCars(data.data.items);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [JSON.stringify(filters)]);

  return { cars, loading, error };
};

// Component
const CarsList = () => {
  const { cars, loading, error } = useCars({
    availabilityStatus: 'available',
    limit: 12,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="cars-grid">
      {cars.map(car => (
        <div key={car._id} className="car-card">
          <img src={car.coverImage} alt={car.metadata.alt} />
          <h3>{car.name}</h3>
          <p>{car.description}</p>
          <div className="specs">
            <span>🪑 {car.specs.seats}</span>
            <span>⚙️ {car.specs.transmission}</span>
            <span>⛽ {car.specs.fuel}</span>
          </div>
          <div className="price">
            ${car.pricing.amount}/{car.pricing.unit}
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## ⚠️ قواعد التحقق (Validation Rules)

| الحقل                  | النوع        | مطلوب | القيود                                    |
| ---------------------- | ------------ | ----- | ----------------------------------------- |
| `name`                 | string       | ✅    | 3-200 حرف                                 |
| `description`          | string       | ✅    | 10-2000 حرف                               |
| `coverImage`           | string (URL) | ✅    | jpg, jpeg, png, webp                      |
| `pricing.amount`       | number       | ✅    | >= 0, max 10,000                          |
| `pricing.currency`     | enum         | ✅    | USD, EUR, KGS                             |
| `pricing.unit`         | enum         | ✅    | day, jour, hour, heure, week, semaine     |
| `specs.seats`          | string       | ✅    | -                                         |
| `specs.transmission`   | enum         | ✅    | Automatic, Manual, Automatique, Manuelle  |
| `specs.drive`          | string       | ✅    | -                                         |
| `specs.luggage`        | string       | ✅    | -                                         |
| `specs.fuel`           | enum         | ✅    | Petrol, Diesel, Electric, Hybrid, Essence |
| `metadata.title`       | string       | ✅    | 10-150 حرف                                |
| `metadata.description` | string       | ✅    | 20-300 حرف                                |
| `metadata.path`        | string       | ✅    | /cars/car-id                              |
| `metadata.image`       | string (URL) | ✅    | -                                         |
| `metadata.alt`         | string       | ✅    | 5-200 حرف                                 |
| `images`               | array        | ❌    | URLs فقط                                  |
| `tags`                 | array        | ❌    | يتم إنشاؤها تلقائياً                      |
| `localeGroupId`        | string       | ✅    | 3-100 حرف (يربط الترجمات)                 |
| `locale`               | enum         | ✅    | en, fr                                    |
| `status`               | enum         | ❌    | active, inactive, maintenance             |
| `availabilityStatus`   | enum         | ❌    | available, reserved, unavailable          |
| `packIds`              | array        | ❌    | ObjectIds صالحة                           |

---

## 🔐 رموز الحالة (Status Codes)

| الكود | المعنى       | متى يظهر                  |
| ----- | ------------ | ------------------------- |
| 200   | OK           | طلب ناجح                  |
| 201   | Created      | تم إنشاء سيارة جديدة      |
| 400   | Bad Request  | خطأ في التحقق من البيانات |
| 404   | Not Found    | السيارة غير موجودة        |
| 500   | Server Error | خطأ داخلي في السيرفر      |

---

## 💡 نصائح الاستخدام

### ✅ أفضل الممارسات

1. **استخدم pagination** للقوائم الطويلة (limit: 20-50)
2. **استخدم الفلاتر** لتحسين الأداء
3. **استخدم availabilityStatus** لمعرفة السيارات المتاحة للحجز
4. **استخدم البحث النصي** (`q` parameter) للبحث السريع
5. **تحقق من `success`** في الاستجابة قبل معالجة البيانات

### ❌ تجنب

1. **لا تحذف نهائياً** - استخدم soft delete المدمج
2. **لا تطلب جميع البيانات** - استخدم pagination
3. **لا ترسل بيانات غير مطلوبة** في PATCH requests

---

## 📊 أمثلة سيناريوهات شائعة

### سيناريو 1: صفحة عرض السيارات

```javascript
// جلب السيارات المتاحة مرتبة حسب السعر
GET /api/v1/cars?status=active&availabilityStatus=available&sort=pricing.amount&limit=12
```

### سيناريو 2: صفحة تفاصيل سيارة

```javascript
// جلب سيارة معينة
GET / api / v1 / cars / bmw - x7 - 2024;
```

### سيناريو 3: لوحة تحكم Admin

```javascript
// إحصائيات عامة
GET /api/v1/cars/statistics

// جميع السيارات
GET /api/v1/cars?page=1&limit=50

// تحديث حالة سيارة
PATCH /api/v1/cars/:id
Body: { "status": "maintenance" }
```

### سيناريو 4: نظام الحجز

```javascript
// التحقق من توفر السيارة
GET /api/v1/cars/:id

// حجز السيارة
PATCH /api/v1/cars/:id/availability
Body: { "availabilityStatus": "reserved" }

// إلغاء الحجز
PATCH /api/v1/cars/:id/availability
Body: { "availabilityStatus": "available" }
```

---

## � البيانات الجاهزة للاستيراد

### 🎯 ملف البيانات المحولة

لقد تم تحويل جميع السيارات من JSON إلى البنية الجديدة في:

**📄 [`docs/cars-data.md`](./cars-data.md)**

هذا الملف يحتوي على:

- ✅ **10 سيارات** (5 EN + 5 FR) جاهزة للاستيراد
- ✅ كل سيارة محولة للبنية الجديدة مع `localeGroupId`
- ✅ بيانات جاهزة للنسخ واللصق في Postman
- ✅ نصائح وتوجيهات للاستخدام الأمثل

### 🚀 طريقتان للاستيراد:

#### الطريقة 1️⃣: استيراد يدوي (موصى به للتجربة)

```bash
# 1. افتح Postman
# 2. POST http://localhost:4000/api/v1/cars
# 3. انسخ أي car من cars-data.md
# 4. الصق في Body → raw → JSON
# 5. Send
```

**مثال:**

```json
POST /api/v1/cars
{
  "name": "BMW X7 (2024)",
  "description": "A luxury SUV that blends elegance...",
  "localeGroupId": "car-1",
  "locale": "en",
  "pricing": { "amount": 180, "currency": "USD", "unit": "day" },
  // ... باقي الحقول (موجودة في cars-data.md)
}
```

#### الطريقة 2️⃣: استيراد تلقائي (للكل مرة واحدة)

```bash
# تشغيل Migration Script
npm run migrate:cars

# يقرأ من:
# - data/content/en/cars.json
# - data/content/fr/cars.json

# يحول البيانات تلقائياً ويضيف:
# - localeGroupId
# - status: "active"
# - availabilityStatus: "available"
```

### 📊 نظرة على البيانات المتاحة:

| ID    | Car Name            | Type       | Seats | Price/Day | Fuel   |
| ----- | ------------------- | ---------- | ----- | --------- | ------ |
| car-1 | BMW X7              | Luxury SUV | 7     | $180      | Petrol |
| car-2 | Mercedes Sprinter   | Minibus    | 15-20 | $140      | Diesel |
| car-3 | Jeep Wrangler       | Off-Road   | 4     | $120      | Petrol |
| car-4 | Toyota Land Cruiser | 4x4 SUV    | 5-7   | $100      | Diesel |
| car-5 | Toyota Sequoia      | Family SUV | 7     | $90       | Petrol |

### 🎓 بعد الاستيراد:

```bash
# 1. تحقق من عدد السيارات
GET /api/v1/cars/statistics

# 2. جرب البحث بـ localeGroupId
GET /api/v1/cars?localeGroupId=car-1

# 3. اختبر التبديل بين اللغات
GET /api/v1/cars?localeGroupId=car-1&locale=en
GET /api/v1/cars?localeGroupId=car-1&locale=fr
```

### 💡 نصائح مهمة:

1. **ابدأ بـ 2 سيارات فقط** للتجربة (مثلاً BMW X7 EN + FR)
2. **جرّب كل الـ filters** قبل الاستيراد الكامل
3. **راجع `cars-data.md`** للنصائح التفصيلية
4. **تأكد من `localeGroupId`** متطابق للترجمات

---

## �🔗 روابط مفيدة

- **📄 [البيانات الجاهزة - cars-data.md](./cars-data.md)** - جميع السيارات محولة وجاهزة
- **📚 [Activities API](./activities-quickref.md)** - API الأنشطة السياحية
- **🎒 [Travel Packs API](./travel-packs-quickref.md)** - للربط مع حزم السفر
- **⚙️ [Migration Script](../scripts/migrateCarsFromJson.ts)** - لنقل البيانات من JSON

---

## 📞 الدعم

لأي استفسارات أو مشاكل:

1. راجع هذا المرجع أولاً
2. تحقق من أكواد الأخطاء والتحقق
3. راجع أمثلة الاستخدام في `cars-data.md`
4. تأكد من صحة البيانات المرسلة

---

_آخر تحديث: أكتوبر 2025 | الإصدار: v1.0.0 | مع دعم localeGroupId 🌐_ 3. راجع أمثلة الاستخدام 4. تأكد من صحة البيانات المرسلة

---

_آخر تحديث: أكتوبر 2025 | الإصدار: v1.0.0_
