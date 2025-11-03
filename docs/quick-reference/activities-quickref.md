# 🎯 Activities API - مرجع سريع

> دليل مختصر وشامل لـ API الأنشطة والتجارب السياحية مع شرح تدفق البيانات وأمثلة عملية

## 📍 Base URL

```
http://localhost:4000/api/v1/activities
```

---

## 🏗️ هيكل البيانات (Data Structure)

### Activity Object

```typescript
{
  _id: string,                    // MongoDB ObjectId
  name: string,                   // اسم النشاط
  description: string,            // الوصف الكامل
  coverImage: string,             // صورة الغلاف
  images: string[],               // صور إضافية

  // معلومات النشاط
  duration: string,               // المدة الزمنية
  location: string,               // الموقع الجغرافي
  groupSize: string,              // حجم المجموعة الموصى به
  price: number,                  // السعر (0 = مجاني)

  // بيانات SEO
  metadata: {
    title: string,                // عنوان SEO
    description: string,          // وصف SEO
    path: string,                 // المسار (/activities/activity-id)
    image: string,                // صورة SEO
    alt: string                   // نص بديل للصورة
  },

  // ربط الترجمات
  localeGroupId: string,          // 🆕 معرّف يربط كل اللغات (EN/FR) لنفس النشاط
  locale: "en" | "fr",            // اللغة

  tags: string[],                 // كلمات مفتاحية (تُولد تلقائياً)
  status: "active" | "inactive" | "maintenance",
  availabilityStatus: "available" | "unavailable",
  packIds: ObjectId[],            // روابط مع حزم السفر

  createdAt: Date,                // تاريخ الإنشاء
  updatedAt: Date                 // تاريخ آخر تحديث
}
```

---

## 🌐 فهم localeGroupId - ربط الترجمات

### ما هو localeGroupId؟

`localeGroupId` هو **معرّف منطقي** يربط جميع الترجمات اللغوية (EN/FR) لنفس النشاط.

### 📊 مثال توضيحي:

```javascript
// النسخة الإنجليزية
{
  "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Eagle Hunting Show",
  "localeGroupId": "activity-2",  // ← نفس المعرّف
  "locale": "en"
}

// النسخة الفرنسية
{
  "_id": "77b2c3d4e5f6g7h8i9j0k1l2",
  "name": "Spectacle de chasse à l'aigle",
  "localeGroupId": "activity-2",  // ← نفس المعرّف
  "locale": "fr"
}
```

### 🎯 الفوائد:

| الميزة               | الشرح                      | المثال                                     |
| -------------------- | -------------------------- | ------------------------------------------ |
| **ربط الترجمات**     | جلب كل اللغات لنفس النشاط  | `?localeGroupId=activity-2` → يرجع EN + FR |
| **تبديل اللغة**      | الانتقال بين اللغات بسهولة | Frontend يستطيع toggle بين الترجمات        |
| **إدارة موحدة**      | تحديث الأسعار لكل اللغات   | Update price مرة واحدة لكل الترجمات        |
| **SEO متعدد اللغات** | `hreflang` tags للـ SEO    | Google يفهم أنهم نفس المحتوى بلغات مختلفة  |

### 🔍 أمثلة الاستعلامات:

```bash
# جلب كل الترجمات لنشاط معين
GET /api/v1/activities?localeGroupId=activity-2
# Response: 2 items (EN + FR)

# جلب فقط النسخة الإنجليزية
GET /api/v1/activities?localeGroupId=activity-2&locale=en
# Response: 1 item (EN only)

# جلب فقط النسخة الفرنسية
GET /api/v1/activities?localeGroupId=activity-2&locale=fr
# Response: 1 item (FR only)
```

### 💡 Best Practice للـ Frontend:

```javascript
// React/Next.js Example
const ActivityPage = ({ groupId, userLocale }) => {
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    // Fetch all translations
    fetch(`/api/v1/activities?localeGroupId=${groupId}`)
      .then(res => res.json())
      .then(data => {
        const byLocale = data.data.items.reduce((acc, activity) => {
          acc[activity.locale] = activity;
          return acc;
        }, {});
        setTranslations(byLocale);
      });
  }, [groupId]);

  // Display current locale
  const currentActivity = translations[userLocale] || translations['en'];

  return (
    <div>
      <h1>{currentActivity?.name}</h1>
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
"localeGroupId": "activity-{number}"

// Examples:
"activity-1"  // Beshbarmak Cooking Class
"activity-2"  // Eagle Hunting Show
"activity-3"  // 8-Day Horse Adventure
```

**⚠️ القواعد:**

- ✅ يجب أن يكون **فريد** لكل نشاط
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
│   (ActivityService) │
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
│ activities collection│
└─────────────────────┘
```

---

## 🎯 Endpoints المتاحة

### 1️⃣ جلب جميع الأنشطة

```http
GET /api/v1/activities
```

**Query Parameters:**

```typescript
{
  locale?: "en" | "fr",
  localeGroupId?: string,        // 🆕 جلب كل اللغات لنفس النشاط
  status?: "active" | "inactive" | "maintenance",
  availabilityStatus?: "available" | "unavailable",
  q?: string,                    // بحث نصي
  minPrice?: number,
  maxPrice?: number,
  location?: string,             // فلترة حسب الموقع
  isFree?: boolean,              // أنشطة مجانية فقط
  page?: number,                 // افتراضي: 1
  limit?: number,                // افتراضي: 20 (max: 100)
  sort?: string                  // مثال: "price" أو "-createdAt"
}
```

**أمثلة عملية:**

```bash
# جلب جميع الأنشطة النشطة
GET /api/v1/activities?status=active

# 🆕 جلب كل الترجمات (EN/FR) لنفس النشاط
GET /api/v1/activities?localeGroupId=activity-2

# 🆕 جلب فقط النسخة الإنجليزية من نشاط معين
GET /api/v1/activities?localeGroupId=activity-2&locale=en

# بحث عن أنشطة
GET /api/v1/activities?q=eagle+hunting

# فلترة حسب السعر
GET /api/v1/activities?minPrice=0&maxPrice=50

# أنشطة مجانية فقط
GET /api/v1/activities?isFree=true

# فلترة حسب الموقع
GET /api/v1/activities?location=Naryn

# أنشطة متاحة للحجز
GET /api/v1/activities?availabilityStatus=available

# ترتيب حسب السعر (من الأقل للأعلى)
GET /api/v1/activities?sort=price

# pagination مع ترتيب
GET /api/v1/activities?page=1&limit=10&sort=-createdAt
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Eagle Hunting Show – With a World Champion",
        "description": "Witness one of Kyrgyzstan's most breathtaking traditions",
        "coverImage": "/images/activities/eagle-hunting-show/EHS-cover-img.webp",
        "images": ["/images/activities/eagle-hunting-show/EHS-img-1.webp"],
        "duration": "1–2 hours",
        "location": "Alysh village, near the Salkyn Tor mountains",
        "groupSize": "Any",
        "price": 0,
        "metadata": {
          "title": "Eagle Hunting Show – With a World Champion",
          "description": "See a live eagle hunting performance",
          "path": "/activities/eagle-hunting-show",
          "image": "/images/activities/eagle-hunting-show/EHS-cover-img.webp",
          "alt": "Eagle hunter performing in Kyrgyz mountains"
        },
        "localeGroupId": "activity-1",
        "tags": ["eagle", "hunting", "show", "champion"],
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
      "total": 25,
      "pages": 2,
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

### 2️⃣ جلب نشاط واحد

```http
GET /api/v1/activities/:id
```

**Parameters:**

- `id`: يمكن أن يكون MongoDB ObjectId أو slug (من metadata.path)

**أمثلة:**

```bash
# بـ ObjectId
GET /api/v1/activities/507f1f77bcf86cd799439011

# بـ slug
GET /api/v1/activities/eagle-hunting-show
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Eagle Hunting Show – With a World Champion",
    "duration": "1–2 hours",
    "location": "Alysh village",
    "price": 0
    // ... باقي البيانات
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 3️⃣ إنشاء نشاط جديد

```http
POST /api/v1/activities
Content-Type: application/json
```

**Body (مطلوب):**

```json
{
  "name": "Beshbarmak Cooking Class",
  "description": "Discover Kyrgyzstan's most iconic dish in an immersive cooking experience",
  "coverImage": "https://example.com/beshbarmak.webp",
  "images": ["https://example.com/beshbarmak-1.webp"],
  "duration": "1.5 hours",
  "location": "Naryn Museum or local guest house",
  "groupSize": "Small and intimate (ideal for families)",
  "price": 0,
  "metadata": {
    "title": "Authentic Kyrgyz Beshbarmak Cooking Class",
    "description": "Cook and share Beshbarmak — Kyrgyzstan's national dish",
    "path": "/activities/beshbarmak-cooking-class",
    "image": "https://example.com/beshbarmak.webp",
    "alt": "Guests learning to cook Beshbarmak in Kyrgyzstan"
  },
  "localeGroupId": "activity-3",
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
    "name": "Beshbarmak Cooking Class",
    "localeGroupId": "activity-3",
    "tags": ["beshbarmak", "cooking", "class"] // تم إنشاؤها تلقائياً
    // ... باقي البيانات
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 4️⃣ تحديث نشاط

```http
PATCH /api/v1/activities/:id
Content-Type: application/json
```

**Body (اختياري - أرسل فقط ما تريد تحديثه):**

```json
{
  "price": 25,
  "availabilityStatus": "unavailable"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "price": 25,
    "availabilityStatus": "unavailable"
    // ... البيانات المحدثة
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 5️⃣ حذف (أرشفة) نشاط

```http
DELETE /api/v1/activities/:id
```

> **ملاحظة:** هذا حذف ناعم (soft delete) - يتم تغيير status إلى inactive

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Activity archived successfully"
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 6️⃣ الحصول على إحصائيات

```http
GET /api/v1/activities/statistics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 25,
    "byStatus": {
      "active": 22,
      "inactive": 2,
      "maintenance": 1
    },
    "byAvailability": {
      "available": 20,
      "unavailable": 5
    },
    "pricing": {
      "averagePrice": 35.5,
      "minPrice": 0,
      "maxPrice": 150,
      "freeActivitiesCount": 8
    }
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 7️⃣ جلب الأنشطة المتاحة

```http
GET /api/v1/activities/available
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
      "name": "Eagle Hunting Show",
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
PATCH /api/v1/activities/:id/availability
Content-Type: application/json
```

**Body:**

```json
{
  "availabilityStatus": "unavailable"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "availabilityStatus": "unavailable"
    // ... باقي البيانات
  },
  "timestamp": "2025-10-29T15:30:00.000Z"
}
```

---

### 9️⃣ ربط النشاط بحزم السفر

```http
POST /api/v1/activities/:id/packs
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

### مثال 1: جلب وعرض الأنشطة

```javascript
async function fetchActivities() {
  try {
    const response = await fetch(
      'http://localhost:4000/api/v1/activities?status=active&limit=10'
    );
    const data = await response.json();

    if (data.success) {
      data.data.items.forEach(activity => {
        console.log(`${activity.name} - ${activity.location}`);
        console.log(
          `Price: $${activity.price} ${activity.price === 0 ? '(FREE)' : ''}`
        );
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### مثال 2: بحث عن أنشطة مجانية

```javascript
async function findFreeActivities() {
  const response = await fetch(
    'http://localhost:4000/api/v1/activities?isFree=true'
  );
  const data = await response.json();

  return data.data.items;
}

// استخدام
const freeActivities = await findFreeActivities();
console.log(`Found ${freeActivities.length} free activities`);
```

### مثال 3: React Hook

```jsx
import { useState, useEffect } from 'react';

const useActivities = (filters = {}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          status: 'active',
          ...filters,
        });

        const response = await fetch(
          `http://localhost:4000/api/v1/activities?${params}`
        );
        const data = await response.json();

        if (data.success) {
          setActivities(data.data.items);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [JSON.stringify(filters)]);

  return { activities, loading, error };
};

// Component
const ActivitiesList = () => {
  const { activities, loading, error } = useActivities({
    availabilityStatus: 'available',
    limit: 12,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="activities-grid">
      {activities.map(activity => (
        <div key={activity._id} className="activity-card">
          <img src={activity.coverImage} alt={activity.metadata.alt} />
          <h3>{activity.name}</h3>
          <p>{activity.description}</p>
          <div className="details">
            <span>📍 {activity.location}</span>
            <span>⏱️ {activity.duration}</span>
            <span>👥 {activity.groupSize}</span>
          </div>
          <div className="price">
            {activity.price === 0 ? 'FREE' : `$${activity.price}`}
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## ⚠️ قواعد التحقق (Validation Rules)

| الحقل                  | النوع        | مطلوب | القيود                        |
| ---------------------- | ------------ | ----- | ----------------------------- |
| `name`                 | string       | ✅    | 3-200 حرف                     |
| `description`          | string       | ✅    | 10-2000 حرف                   |
| `coverImage`           | string (URL) | ✅    | jpg, jpeg, png, webp          |
| `images`               | array        | ❌    | URLs فقط                      |
| `duration`             | string       | ✅    | -                             |
| `location`             | string       | ✅    | -                             |
| `groupSize`            | string       | ✅    | -                             |
| `price`                | number       | ❌    | >= 0, max 100,000             |
| `metadata.title`       | string       | ✅    | 10-150 حرف                    |
| `metadata.description` | string       | ✅    | 20-300 حرف                    |
| `metadata.path`        | string       | ✅    | /activities/activity-id       |
| `metadata.image`       | string (URL) | ✅    | -                             |
| `metadata.alt`         | string       | ✅    | 5-200 حرف                     |
| `localeGroupId`        | string       | ✅    | 3-100 حرف (يربط الترجمات)     |
| `tags`                 | array        | ❌    | يتم إنشاؤها تلقائياً          |
| `locale`               | enum         | ✅    | en, fr                        |
| `status`               | enum         | ❌    | active, inactive, maintenance |
| `availabilityStatus`   | enum         | ❌    | available, unavailable        |
| `packIds`              | array        | ❌    | ObjectIds صالحة               |

---

## 🔐 رموز الحالة (Status Codes)

| الكود | المعنى       | متى يظهر                  |
| ----- | ------------ | ------------------------- |
| 200   | OK           | طلب ناجح                  |
| 201   | Created      | تم إنشاء نشاط جديد        |
| 400   | Bad Request  | خطأ في التحقق من البيانات |
| 404   | Not Found    | النشاط غير موجود          |
| 500   | Server Error | خطأ داخلي في السيرفر      |

---

## 💡 نصائح الاستخدام

### ✅ أفضل الممارسات

1. **استخدم pagination** للقوائم الطويلة (limit: 20-50)
2. **استخدم الفلاتر** لتحسين الأداء
3. **استخدم availabilityStatus** لمعرفة الأنشطة المتاحة للحجز
4. **استخدم البحث النصي** (`q` parameter) للبحث السريع
5. **استخدم isFree** للبحث عن الأنشطة المجانية
6. **تحقق من `success`** في الاستجابة قبل معالجة البيانات

### ❌ تجنب

1. **لا تحذف نهائياً** - استخدم soft delete المدمج
2. **لا تطلب جميع البيانات** - استخدم pagination
3. **لا ترسل بيانات غير مطلوبة** في PATCH requests

---

## 📊 أمثلة سيناريوهات شائعة

### سيناريو 1: صفحة عرض الأنشطة

```javascript
// جلب الأنشطة المتاحة مرتبة حسب السعر
GET /api/v1/activities?status=active&availabilityStatus=available&sort=price&limit=12
```

### سيناريو 2: صفحة الأنشطة المجانية

```javascript
// جلب جميع الأنشطة المجانية
GET /api/v1/activities?isFree=true&status=active
```

### سيناريو 3: لوحة تحكم Admin

```javascript
// إحصائيات عامة
GET /api/v1/activities/statistics

// جميع الأنشطة
GET /api/v1/activities?page=1&limit=50

// تحديث حالة نشاط
PATCH /api/v1/activities/:id
Body: { "status": "maintenance" }
```

### سيناريو 4: نظام الحجز

```javascript
// التحقق من توفر النشاط
GET /api/v1/activities/:id

// حجز النشاط
PATCH /api/v1/activities/:id/availability
Body: { "availabilityStatus": "unavailable" }

// إلغاء الحجز
PATCH /api/v1/activities/:id/availability
Body: { "availabilityStatus": "available" }
```

---

## � البيانات الجاهزة للاستيراد

### 🎯 ملف البيانات المحولة

لقد تم تحويل جميع الأنشطة من JSON إلى البنية الجديدة في:

**📄 [`docs/activities-data.md`](./activities-data.md)**

هذا الملف يحتوي على:

- ✅ **10 أنشطة** (5 EN + 5 FR) جاهزة للاستيراد
- ✅ كل نشاط محول للبنية الجديدة مع `localeGroupId`
- ✅ بيانات جاهزة للنسخ واللصق في Postman
- ✅ نصائح وتوجيهات للاستخدام الأمثل

### 🚀 طريقتان للاستيراد:

#### الطريقة 1️⃣: استيراد يدوي (موصى به للتجربة)

```bash
# 1. افتح Postman
# 2. POST http://localhost:4000/api/v1/activities
# 3. انسخ أي activity من activities-data.md
# 4. الصق في Body → raw → JSON
# 5. Send
```

**مثال:**

```json
POST /api/v1/activities
{
  "name": "Eagle Hunting Show – With a World Champion",
  "description": "Witness one of Kyrgyzstan's most breathtaking...",
  "localeGroupId": "activity-2",
  "locale": "en",
  // ... باقي الحقول (موجودة في activities-data.md)
}
```

#### الطريقة 2️⃣: استيراد تلقائي (للكل مرة واحدة)

```bash
# تشغيل Migration Script
npm run migrate:activities

# يقرأ من:
# - data/content/en/activities.json
# - data/content/fr/activities.json

# يحول البيانات تلقائياً ويضيف:
# - localeGroupId
# - status: "active"
# - availabilityStatus: "available"
```

### 📊 نظرة على البيانات المتاحة:

| ID         | Activity Name (EN)       | Activity Name (FR)            | Duration | Type     |
| ---------- | ------------------------ | ----------------------------- | -------- | -------- |
| activity-1 | Beshbarmak Cooking Class | Cours de cuisine Beshbarmak   | 1.5h     | Cultural |
| activity-2 | Eagle Hunting Show       | Spectacle de chasse à l'aigle | 1-2h     | Cultural |
| activity-3 | 8-Day Horse Adventure    | Aventure équestre 8 jours     | 8 days   | Trekking |
| activity-4 | Shaar Waterfall Trek     | Randonnée cascade Shaar       | 1 day    | Trekking |
| activity-5 | Mountain Camping         | Camping en montagne           | Custom   | Outdoor  |

### 🎓 بعد الاستيراد:

```bash
# 1. تحقق من عدد الأنشطة
GET /api/v1/activities/statistics

# 2. جرب البحث بـ localeGroupId
GET /api/v1/activities?localeGroupId=activity-2

# 3. اختبر التبديل بين اللغات
GET /api/v1/activities?localeGroupId=activity-2&locale=en
GET /api/v1/activities?localeGroupId=activity-2&locale=fr
```

### 💡 نصائح مهمة:

1. **ابدأ بـ 2-3 أنشطة فقط** للتجربة
2. **جرّب كل الـ endpoints** قبل الاستيراد الكامل
3. **راجع `activities-data.md`** للنصائح التفصيلية
4. **تأكد من `localeGroupId`** متطابق للترجمات

---

## �🔗 روابط مفيدة

- **📄 [البيانات الجاهزة - activities-data.md](./activities-data.md)** - جميع الأنشطة محولة وجاهزة
- **📚 [شرح localeGroupId](./localeGroupId-implementation.md)** - فهم عميق للترجمات
- **🎒 [Travel Packs API](./travel-packs-quickref.md)** - للربط مع حزم السفر
- **🚗 [Cars API](./cars-quickref.md)** - لتأجير السيارات
- **⚙️ [Migration Script](../scripts/migrateActivitiesFromJson.ts)** - لنقل البيانات من JSON

---

## 📞 الدعم

لأي استفسارات أو مشاكل:

1. راجع هذا المرجع أولاً
2. تحقق من أكواد الأخطاء والتحقق
3. راجع أمثلة الاستخدام في `activities-data.md`
4. تأكد من صحة البيانات المرسلة

---

_آخر تحديث: أكتوبر 2025 | الإصدار: v1.0.0 | مع دعم localeGroupId 🌐_
