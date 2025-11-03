# 📘 Travel Packs API - مرجع سريع

> دليل مختصر وشامل لـ API حزم السفر مع شرح تدفق البيانات وأمثلة عملية

## 📍 Base URL

```
http://localhost:4000/api/v1/travel-packs
```

---

## 🏗️ هيكل البيانات (Data Structure)

### Travel Pack Object

```typescript
{
  _id: string,                    // MongoDB ObjectId
  slug: string,                   // معرف فريد (test-pack)
  localeGroupId: string,          // معرف مجموعة الترجمات (pack-1)
  status: "draft" | "published",  // حالة النشر
  locale: "en" | "fr",           // اللغة الافتراضية

  // المحتوى متعدد اللغات
  locales: {
    en?: {
      name: string,              // اسم الحزمة
      description: string,       // الوصف
      ctaLabel: string          // نص زر الحجز
    },
    fr?: {
      name: string,
      description: string,
      ctaLabel: string
    }
  },

  coverImage: string,            // رابط صورة الغلاف
  features: string[],            // مميزات الحزمة
  duration: number,              // المدة بالأيام
  basePrice: number,             // السعر الأساسي
  currency: string,              // العملة (EUR, USD, MAD)
  availability: boolean,         // متاح للحجز؟

  createdAt: Date,              // تاريخ الإنشاء
  updatedAt: Date,              // تاريخ آخر تحديث
  deletedAt: Date | null        // تاريخ الحذف (soft delete)
}
```

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
│   (Logic)           │
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
└─────────────────────┘
```

---

## 🎯 Endpoints المتاحة

### 1️⃣ جلب جميع حزم السفر

```http
GET /api/v1/travel-packs
```

**Query Parameters:**

```typescript
{
  q?: string,              // بحث نصي
  localeGroupId?: string,  // فلترة حسب مجموعة الترجمات
  status?: "draft" | "published",
  availability?: boolean,
  minPrice?: number,
  maxPrice?: number,
  minDuration?: number,
  maxDuration?: number,
  page?: number,          // افتراضي: 1
  limit?: number,         // افتراضي: 20 (max: 100)
  sort?: string          // مثال: "basePrice" أو "-createdAt"
}
```

**أمثلة عملية:**

```bash
# جلب جميع الحزم المنشورة
GET /api/v1/travel-packs?status=published

# بحث عن "morocco"
GET /api/v1/travel-packs?q=morocco

# جلب حزمة معينة مع جميع ترجماتها (EN+FR في document واحد)
GET /api/v1/travel-packs?localeGroupId=pack-1

# فلترة حسب السعر
GET /api/v1/travel-packs?minPrice=200&maxPrice=500

# فلترة متعددة مع pagination
GET /api/v1/travel-packs?status=published&availability=true&page=1&limit=10

# ترتيب حسب السعر (من الأقل للأعلى)
GET /api/v1/travel-packs?sort=basePrice

# ترتيب حسب التاريخ (من الأحدث للأقدم)
GET /api/v1/travel-packs?sort=-createdAt
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "slug": "amazing-morocco-tour",
        "status": "published",
        "locale": "en",
        "locales": {
          "en": {
            "name": "Amazing Morocco Tour",
            "description": "Discover Morocco in 7 days",
            "ctaLabel": "Book Now"
          },
          "fr": {
            "name": "Magnifique Tour du Maroc",
            "description": "Découvrez le Maroc en 7 jours",
            "ctaLabel": "Réserver"
          }
        },
        "coverImage": "https://example.com/morocco.jpg",
        "features": ["Hotel 4*", "Guide", "Transport"],
        "duration": 7,
        "basePrice": 599.99,
        "currency": "EUR",
        "availability": true,
        "createdAt": "2025-10-28T10:00:00.000Z",
        "updatedAt": "2025-10-28T10:00:00.000Z"
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
      "status": "published"
    }
  },
  "timestamp": "2025-10-28T15:30:00.000Z"
}
```

---

### 2️⃣ جلب حزمة واحدة

```http
GET /api/v1/travel-packs/:id
```

**Parameters:**

- `id`: يمكن أن يكون MongoDB ObjectId أو slug

**أمثلة:**

```bash
# بـ ObjectId
GET /api/v1/travel-packs/507f1f77bcf86cd799439011

# بـ slug
GET /api/v1/travel-packs/amazing-morocco-tour
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "slug": "amazing-morocco-tour",
    "status": "published",
    "locales": {
      /* ... */
    },
    "basePrice": 599.99
    // ... باقي البيانات
  },
  "timestamp": "2025-10-28T15:30:00.000Z"
}
```

**أخطاء محتملة:**

```json
// 404 - Not Found
{
  "success": false,
  "error": "Travel pack not found",
  "statusCode": 404,
  "timestamp": "2025-10-28T15:30:00.000Z"
}
```

---

### 3️⃣ إنشاء حزمة جديدة

```http
POST /api/v1/travel-packs
Content-Type: application/json
```

**Body (مطلوب):**

```json
{
  "status": "published",
  "locale": "en",
  "locales": {
    "en": {
      "name": "Paris City Break",
      "description": "5 days in the city of lights",
      "ctaLabel": "Book Now"
    }
  },
  "coverImage": "https://example.com/paris.jpg",
  "features": ["Hotel 5*", "Breakfast", "Tour Guide"],
  "duration": 5,
  "basePrice": 899.99,
  "currency": "EUR",
  "availability": true
}
```

**مثال cURL:**

```bash
curl -X POST http://localhost:4000/api/v1/travel-packs \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published",
    "locale": "en",
    "locales": {
      "en": {
        "name": "Paris City Break",
        "description": "5 days in the city of lights",
        "ctaLabel": "Book Now"
      }
    },
    "coverImage": "https://example.com/paris.jpg",
    "features": ["Hotel 5*", "Breakfast"],
    "duration": 5,
    "basePrice": 899.99,
    "currency": "EUR",
    "availability": true
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "slug": "paris-city-break" // تم إنشاؤه تلقائياً
    // ... باقي البيانات
  },
  "timestamp": "2025-10-28T15:30:00.000Z"
}
```

**أخطاء التحقق:**

```json
// 400 - Validation Error
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "basePrice",
      "message": "Number must be greater than 0",
      "code": "too_small"
    },
    {
      "field": "locales",
      "message": "At least one locale (en or fr) is required",
      "code": "custom"
    }
  ],
  "timestamp": "2025-10-28T15:30:00.000Z"
}
```

---

### 4️⃣ تحديث حزمة

```http
PATCH /api/v1/travel-packs/:id
Content-Type: application/json
```

**Body (اختياري - أرسل فقط ما تريد تحديثه):**

```json
{
  "basePrice": 799.99,
  "availability": false,
  "locales": {
    "en": {
      "description": "Updated description"
    }
  }
}
```

**مثال:**

```bash
# تحديث السعر والتوفر
curl -X PATCH http://localhost:4000/api/v1/travel-packs/paris-city-break \
  -H "Content-Type: application/json" \
  -d '{
    "basePrice": 799.99,
    "availability": false
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "basePrice": 799.99,
    "availability": false
    // ... البيانات المحدثة
  },
  "timestamp": "2025-10-28T15:30:00.000Z"
}
```

---

### 5️⃣ حذف (أرشفة) حزمة

```http
DELETE /api/v1/travel-packs/:id
```

> **ملاحظة:** هذا حذف ناعم (soft delete) - البيانات تبقى في قاعدة البيانات ولكن لا تظهر في الاستعلامات العادية

**مثال:**

```bash
curl -X DELETE http://localhost:4000/api/v1/travel-packs/paris-city-break
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Travel pack archived successfully"
  },
  "timestamp": "2025-10-28T15:30:00.000Z"
}
```

---

### 6️⃣ الحصول على إحصائيات

```http
GET /api/v1/travel-packs/statistics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 156,
    "published": 120,
    "draft": 36,
    "available": 98,
    "unavailable": 58,
    "averagePrice": 645.5,
    "minPrice": 199.99,
    "maxPrice": 2499.99,
    "averageDuration": 6.5,
    "totalRevenue": 100632.0
  },
  "timestamp": "2025-10-28T15:30:00.000Z"
}
```

---

## 🎨 أمثلة استخدام JavaScript

### مثال 1: جلب وعرض الحزم

```javascript
async function fetchTravelPacks() {
  try {
    const response = await fetch(
      'http://localhost:4000/api/v1/travel-packs?status=published&limit=10'
    );
    const data = await response.json();

    if (data.success) {
      data.data.items.forEach(pack => {
        console.log(`${pack.locales.en.name} - €${pack.basePrice}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### مثال 2: إنشاء حزمة جديدة

```javascript
async function createTravelPack(packData) {
  try {
    const response = await fetch('http://localhost:4000/api/v1/travel-packs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(packData),
    });

    const data = await response.json();

    if (data.success) {
      console.log('Created:', data.data.slug);
    } else {
      console.error('Validation errors:', data.details);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// استخدام
createTravelPack({
  status: 'published',
  locale: 'en',
  locales: {
    en: {
      name: 'Tokyo Adventure',
      description: '10 days in Japan',
      ctaLabel: 'Book Now',
    },
  },
  duration: 10,
  basePrice: 1499.99,
  currency: 'EUR',
  availability: true,
});
```

### مثال 3: بحث متقدم

```javascript
async function searchTravelPacks(filters) {
  const params = new URLSearchParams({
    status: 'published',
    availability: true,
    minPrice: filters.minPrice || 0,
    maxPrice: filters.maxPrice || 10000,
    sort: 'basePrice',
    limit: 20,
  });

  const response = await fetch(
    `http://localhost:4000/api/v1/travel-packs?${params}`
  );
  const data = await response.json();

  return data.data.items;
}

// استخدام
const affordablePacks = await searchTravelPacks({
  minPrice: 200,
  maxPrice: 500,
});
```

---

## ⚠️ قواعد التحقق (Validation Rules)

| الحقل                   | النوع   | مطلوب | القيود                                           |
| ----------------------- | ------- | ----- | ------------------------------------------------ |
| `status`                | string  | ✅    | "draft" أو "published"                           |
| `locale`                | string  | ✅    | "en" أو "fr"                                     |
| `locales`               | object  | ✅    | يجب وجود en أو fr على الأقل                      |
| `locales.*.name`        | string  | ✅    | 3-200 حرف                                        |
| `locales.*.description` | string  | ✅    | 10-2000 حرف                                      |
| `locales.*.ctaLabel`    | string  | ❌    | 1-50 حرف                                         |
| `slug`                  | string  | ❌    | يتم إنشاؤه تلقائياً، صيغة: lowercase-with-dashes |
| `coverImage`            | string  | ❌    | URL صالح                                         |
| `features`              | array   | ❌    | قائمة strings                                    |
| `duration`              | number  | ✅    | >= 1 يوم                                         |
| `basePrice`             | number  | ✅    | > 0                                              |
| `currency`              | string  | ✅    | 3 أحرف (EUR, USD, MAD)                           |
| `availability`          | boolean | ❌    | افتراضي: true                                    |

---

## 🔐 رموز الحالة (Status Codes)

| الكود | المعنى       | متى يظهر                  |
| ----- | ------------ | ------------------------- |
| 200   | OK           | طلب ناجح                  |
| 201   | Created      | تم إنشاء حزمة جديدة       |
| 400   | Bad Request  | خطأ في التحقق من البيانات |
| 404   | Not Found    | الحزمة غير موجودة         |
| 500   | Server Error | خطأ داخلي في السيرفر      |

---

## 💡 نصائح الاستخدام

### ✅ أفضل الممارسات

1. **استخدم pagination** للقوائم الطويلة (limit: 20-50)
2. **استخدم slug** بدلاً من ID في URLs للـ SEO
3. **استخدم البحث النصي** (`q` parameter) للأداء الأفضل
4. **تحقق من `success`** في الاستجابة قبل معالجة البيانات

### ❌ تجنب

1. **لا تحذف نهائياً** - استخدم soft delete المدمج
2. **لا تطلب جميع البيانات** - استخدم pagination
3. **لا ترسل بيانات غير مطلوبة** في PATCH requests

---

## 📊 أمثلة سيناريوهات شائعة

### سيناريو 1: صفحة عرض حزم السفر

```javascript
// جلب الحزم المتاحة للحجز
GET /api/v1/travel-packs?status=published&availability=true&sort=-createdAt&limit=12

// للصفحة التالية
GET /api/v1/travel-packs?status=published&availability=true&sort=-createdAt&page=2&limit=12
```

### سيناريو 2: صفحة تفاصيل حزمة

```javascript
// جلب حزمة معينة
GET / api / v1 / travel - packs / amazing - morocco - tour;
```

### سيناريو 3: لوحة تحكم Admin

```javascript
// إحصائيات عامة
GET /api/v1/travel-packs/statistics

// جميع الحزم (بما فيها المسودات)
GET /api/v1/travel-packs?page=1&limit=50

// تحديث حالة نشر
PATCH /api/v1/travel-packs/:id
Body: { "status": "published" }
```

### سيناريو 4: بحث المستخدمين

```javascript
// بحث عن وجهة معينة
GET /api/v1/travel-packs?q=paris&status=published

// فلترة حسب الميزانية
GET /api/v1/travel-packs?minPrice=300&maxPrice=800&status=published&availability=true
```

---

## 🌐 localeGroupId - ربط الترجمات

### ما هو localeGroupId؟

`localeGroupId` هو معرف منطقي يربط جميع ترجمات نفس الحزمة. في حالة Travel Packs، كل document يحتوي على جميع الترجمات (`en`, `fr`) **في نفس الـ document** تحت حقل `locales`.

### الفرق بين Travel Packs و Activities/Cars

| Aspect             | Activities/Cars                          | Travel Packs                           |
| ------------------ | ---------------------------------------- | -------------------------------------- |
| **البنية**         | Documents منفصلة لكل لغة                 | Document واحد مع nested locales        |
| **localeGroupId**  | يربط documents منفصلة                    | معرف الحزمة (تحتوي كل الترجمات)        |
| **Query Pattern**  | `?localeGroupId=X` يرجع documents متعددة | `?localeGroupId=X` يرجع document واحد  |
| **الوصول للترجمة** | `_id` مختلف لكل ترجمة                    | `pack.locales.en` أو `pack.locales.fr` |

### مثال: هيكل Travel Pack

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "slug": "rent-a-car-and-go",
  "localeGroupId": "pack-1",
  "status": "published",
  "locale": "en",
  "locales": {
    "en": {
      "name": "Rent a Car & Go",
      "description": "Live the adventure...",
      "ctaLabel": "See Details"
    },
    "fr": {
      "name": "Louez une Voiture & Partez",
      "description": "Vivez l'aventure...",
      "ctaLabel": "Voir les détails"
    }
  },
  "coverImage": "/images/travel-packs/rent_car_go.svg",
  "features": ["4x4 car rental", "Freedom to choose route"],
  "availability": true
}
```

### استخدام localeGroupId

#### 1️⃣ جلب حزمة معينة مع جميع ترجماتها

```bash
# يرجع document واحد يحتوي على EN و FR
GET /api/v1/travel-packs?localeGroupId=pack-1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "...",
        "localeGroupId": "pack-1",
        "locales": {
          "en": { "name": "Rent a Car & Go", ... },
          "fr": { "name": "Louez une Voiture & Partez", ... }
        }
      }
    ],
    "pagination": { "total": 1, "page": 1, ... }
  }
}
```

#### 2️⃣ إنشاء حزمة جديدة مع ترجمات

```bash
POST /api/v1/travel-packs
Content-Type: application/json

{
  "slug": "new-adventure-pack",
  "localeGroupId": "pack-4",
  "status": "published",
  "locale": "en",
  "locales": {
    "en": {
      "name": "New Adventure Pack",
      "description": "Explore new horizons...",
      "ctaLabel": "Book Now"
    },
    "fr": {
      "name": "Nouveau Pack d'Aventure",
      "description": "Explorez de nouveaux horizons...",
      "ctaLabel": "Réserver"
    }
  },
  "features": ["Feature 1", "Feature 2"],
  "availability": true
}
```

#### 3️⃣ التكامل مع Frontend (React/Next.js)

```typescript
// جلب حزمة مع جميع الترجمات
const fetchTravelPack = async (localeGroupId: string) => {
  const response = await fetch(
    `/api/v1/travel-packs?localeGroupId=${localeGroupId}`
  );
  const { data } = await response.json();
  return data.items[0]; // Document واحد مع nested translations
};

// استخدام في Component
function TravelPackDetail({ localeGroupId, currentLocale }) {
  const [pack, setPack] = useState(null);

  useEffect(() => {
    fetchTravelPack(localeGroupId).then(setPack);
  }, [localeGroupId]);

  if (!pack) return <div>Loading...</div>;

  // الوصول للترجمة الحالية
  const currentTranslation = pack.locales[currentLocale];

  return (
    <div>
      <h1>{currentTranslation.name}</h1>
      <p>{currentTranslation.description}</p>
      <button>{currentTranslation.ctaLabel}</button>

      {/* التبديل بين اللغات */}
      <LanguageToggle
        languages={Object.keys(pack.locales)}
        current={currentLocale}
      />
    </div>
  );
}

// مثال: عرض جميع الحزم مع اللغة المفضلة
function TravelPacksList({ locale = 'en' }) {
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    fetch('/api/v1/travel-packs?status=published')
      .then(res => res.json())
      .then(({ data }) => setPacks(data.items));
  }, []);

  return (
    <div className="packs-grid">
      {packs.map(pack => {
        const translation = pack.locales[locale];
        return (
          <PackCard
            key={pack._id}
            title={translation?.name}
            description={translation?.description}
            image={pack.coverImage}
            features={pack.features}
          />
        );
      })}
    </div>
  );
}
```

#### 4️⃣ فلترة متقدمة مع localeGroupId

```bash
# جلب حزمة معينة + فلترة بالحالة
GET /api/v1/travel-packs?localeGroupId=pack-1&status=published

# جلب حزمة + التأكد من التوفر
GET /api/v1/travel-packs?localeGroupId=pack-2&availability=true
```

### أفضل الممارسات

1. **تنسيق localeGroupId**: استخدم `pack-{number}` (مثل: `pack-1`, `pack-2`)
2. **Uniqueness**: تأكد أن `localeGroupId` فريد لكل حزمة سفر
3. **Indexing**: الحقل مفهرس - استعلامات سريعة ✅
4. **Validation**: يجب أن يكون بين 3-100 حرف
5. **Frontend**: استخدم `localeGroupId` للتنقل بين اللغات

### مثال: Language Switcher Component

```typescript
interface LanguageSwitcherProps {
  pack: TravelPack;
  currentLocale: 'en' | 'fr';
  onLocaleChange: (locale: string) => void;
}

function LanguageSwitcher({ pack, currentLocale, onLocaleChange }: LanguageSwitcherProps) {
  const availableLocales = Object.keys(pack.locales);

  return (
    <div className="language-switcher">
      {availableLocales.map(locale => (
        <button
          key={locale}
          onClick={() => onLocaleChange(locale)}
          className={locale === currentLocale ? 'active' : ''}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// الاستخدام
<LanguageSwitcher
  pack={currentPack}
  currentLocale={userLanguage}
  onLocaleChange={(locale) => setUserLanguage(locale)}
/>
```

---

## 🔗 روابط مفيدة

- **[API Documentation الكاملة](./travel-packs-api.md)** - تفاصيل تقنية أكثر
- **[Travel Packs Data](./travel-packs-data.md)** - بيانات جاهزة للاستيراد
- **[localeGroupId Implementation](./localeGroupId-implementation.md)** - دليل شامل
- **[أمثلة متقدمة](./travel-packs-examples.md)** - أمثلة React، Node.js
- **[دليل التطوير](./travel-packs-migration.md)** - للمطورين

---

## 📞 الدعم

لأي استفسارات أو مشاكل:

1. راجع هذا المرجع أولاً
2. تحقق من أكواد الأخطاء والتحقق
3. راجع أمثلة الاستخدام
4. تأكد من صحة البيانات المرسلة

---

_آخر تحديث: أكتوبر 2025 | الإصدار: v2.1.0_
