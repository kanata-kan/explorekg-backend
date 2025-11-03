# 🚀 ExploreKG Server - Frontend Integration Documentation

## 🌟 نظرة عامة

مرحباً بك في وثائق التكامل الشاملة لـ**ExploreKG Server**! هذا الدليل يوفر كل ما تحتاجه لبناء تطبيق Frontend متقدم يتفاعل مع خادم السياحة المتخصص في قيرغيزستان.

## 📚 دليل المحتويات

### 🎯 البداية السريعة

- [**API Quick Reference**](./api-quick-reference.md) - مرجع سريع لجميع API endpoints
- [**Integration Examples**](./integration-examples.tsx) - أمثلة عملية لتطبيق React/Next.js
- [**Project Summary**](./PROJECT-SUMMARY.md) - ملخص شامل للمشروع والميزات

### 🛠️ التطوير والتكامل

- [**TypeScript Interfaces**](./typescript-interfaces.ts) - جميع الـTypes والـInterfaces المطلوبة
- [**React Hooks**](./react-hooks.ts) - Hooks جاهزة للاستخدام مع API
- [**Booking Integration**](./booking-integration.md) - دليل تطبيق نظام الحجوزات
- [**Guest Integration**](./guest-integration.md) - دليل تطبيق نظام الزوار

### 🧪 الاختبار والجودة

- [**Testing Guide**](./testing-guide.md) - دليل شامل لاختبار التطبيق
- [**Error Handling**](./error-handling.md) - معالجة الأخطاء والاستثناءات

## 🎮 البداية السريعة

### 1. إعداد المشروع

```bash
# إنشاء مشروع Next.js جديد
npx create-next-app@latest explorekg-frontend --typescript --tailwind --eslint

# الانتقال للمجلد
cd explorekg-frontend

# تثبيت Dependencies المطلوبة
npm install axios react-query @types/node
```

### 2. إعداد متغيرات البيئة

```bash
# إنشاء ملف .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1" > .env.local
echo "NEXT_PUBLIC_APP_ENV=development" >> .env.local
```

### 3. نسخ الملفات الأساسية

```bash
# نسخ TypeScript interfaces
cp docs/frontend/typescript-interfaces.ts src/types/explorekg.ts

# نسخ React hooks
cp docs/frontend/react-hooks.ts src/hooks/useExploreKG.ts
```

### 4. مثال تطبيق بسيط

```typescript
// pages/index.tsx
import { useExploreKG } from '../hooks/useExploreKG';

export default function HomePage() {
  const { createGuest, getTravelPacks, loading, error } = useExploreKG();

  const handleCreateGuest = async () => {
    try {
      const guest = await createGuest({
        email: 'user@example.com',
        fullName: 'John Doe',
        phone: '+1234567890',
        locale: 'en',
      });
      console.log('Guest created:', guest);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">ExploreKG Demo</h1>

      <button
        onClick={handleCreateGuest}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Guest'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

## 🏗️ بنية المشروع المقترحة

```
src/
├── components/          # React components
│   ├── common/         # مكونات مشتركة
│   ├── forms/          # نماذج (Guest, Booking)
│   ├── catalog/        # عرض المنتجات
│   └── layout/         # تخطيط الصفحة
├── hooks/              # Custom React hooks
│   ├── useExploreKG.ts # Hook رئيسي
│   ├── useGuest.ts     # إدارة الزوار
│   └── useBooking.ts   # إدارة الحجوزات
├── types/              # TypeScript definitions
│   └── explorekg.ts    # ExploreKG types
├── utils/              # Utility functions
│   ├── api.ts          # API client
│   ├── validation.ts   # التحقق من البيانات
│   └── formatting.ts   # تنسيق البيانات
├── pages/              # Next.js pages
│   ├── index.tsx       # الصفحة الرئيسية
│   ├── catalog/        # صفحات الكتالوج
│   ├── booking/        # صفحات الحجز
│   └── guest/          # صفحات الزائر
└── styles/             # CSS/Tailwind styles
```

data?: T;
error?: string;
message?: string;
statusCode?: number;
timestamp?: string;
}

export async function apiCall<T>(
endpoint: string,
options: RequestInit = {}
): Promise<ApiResponse<T>> {
const url = `${BASE_URL}${endpoint}`;

const response = await fetch(url, {
headers: {
'Content-Type': 'application/json',
...options.headers,
},
...options,
});

const data = await response.json();

if (!response.ok) {
throw new Error(data.error || 'API request failed');
}

return data;
}

````

---

## 📚 الأدلة المتخصصة

### 🎯 حسب النظام:

- [**Guest System Guide**](./guest-integration.md) - إدارة الزوار
- [**Booking System Guide**](./booking-integration.md) - نظام الحجوزات
- [**Travel Packs Guide**](./travel-packs-integration.md) - حزم السفر
- [**Activities Guide**](./activities-integration.md) - الأنشطة
- [**Cars Guide**](./cars-integration.md) - السيارات
- [**Pack Relations Guide**](./pack-relations-integration.md) - العلاقات

### 🛠️ حسب التطبيق:

- [**API Quick Reference**](./api-quick-reference.md) - مرجع سريع للـ APIs
- [**TypeScript Interfaces**](./typescript-interfaces.md) - واجهات جاهزة
- [**Error Handling Guide**](./error-handling.md) - التعامل مع الأخطاء
- [**Testing Integration**](./testing-guide.md) - اختبار التكامل

---

## 🔄 User Journey Examples

### 1. Guest Registration Flow

```typescript
// 1. Create guest session
const guest = await createGuest({
  email: 'user@example.com',
  fullName: 'John Doe',
  phone: '+123456789',
  locale: 'en',
});

// 2. Browse travel packs
const packs = await getTravelPacks({
  locale: 'en',
  page: 1,
  limit: 10,
});

// 3. Get detailed pack with activities & pricing
const detailedPack = await getDetailedTravelPack(packId, {
  step: 'full',
  locale: 'en',
});
````

### 2. Booking Flow

```typescript
// 1. Calculate custom pricing
const pricing = await calculatePackPrice({
  travelPackLocaleGroupId: 'pack-desert-adventure',
  selectedActivities: [{ localeGroupId: 'quad-biking', quantity: 2 }],
  selectedCar: { localeGroupId: 'suv-4x4', durationDays: 3 },
  locale: 'en',
});

// 2. Create booking
const booking = await createBooking({
  guestId: guest.data._id,
  item: {
    type: 'travel_pack',
    id: 'pack-desert-adventure',
    // ... booking details
  },
});
```

---

## 📖 الاستخدام العملي

### React Hook Example

```typescript
// hooks/useGuest.ts
import { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

export function useGuest(sessionId: string) {
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGuest() {
      try {
        const response = await apiCall(`/v1/guests/${sessionId}`);
        setGuest(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      fetchGuest();
    }
  }, [sessionId]);

  return { guest, loading, error };
}
```

### Next.js API Route Example

```typescript
// pages/api/packs/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    const response = await fetch(
      `${process.env.API_BASE_URL}/v1/travel-packs/${id}`
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
```

---

## 🔧 إعداد TypeScript

```typescript
// types/api.ts
export interface Guest {
  _id: string;
  sessionId: string;
  email: string;
  fullName: string;
  phone: string;
  locale: 'en' | 'fr';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface TravelPack {
  _id: string;
  localeGroupId: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  price: {
    base: number;
    currency: string;
  };
  duration: {
    days: number;
    nights: number;
  };
  availability: boolean;
  status: 'published' | 'draft' | 'archived';
}

// ... المزيد من الواجهات في typescript-interfaces.md
```

---

## ⚡ Performance Tips

### 1. Caching Strategy

```typescript
// utils/cache.ts
const cache = new Map();

export async function cachedApiCall<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });

  return data;
}
```

### 2. Pagination Helper

```typescript
// hooks/usePagination.ts
export function useTravelPacks(filters = {}) {
  const [packs, setPacks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPage = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiCall('/v1/travel-packs', {
        method: 'GET',
        // Add query params for pagination & filters
      });

      setPacks(response.data.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  };

  return { packs, pagination, loading, loadPage };
}
```

---

## 🎨 UI Integration Examples

### Travel Pack Card Component

```typescript
// components/TravelPackCard.tsx
interface Props {
  pack: TravelPack;
  locale: 'en' | 'fr';
  onSelect: (packId: string) => void;
}

export function TravelPackCard({ pack, locale, onSelect }: Props) {
  return (
    <div className="pack-card">
      <h3>{pack.name[locale]}</h3>
      <p>{pack.description[locale]}</p>
      <div className="price">
        {pack.price.base} {pack.price.currency}
      </div>
      <button onClick={() => onSelect(pack._id)}>
        View Details
      </button>
    </div>
  );
}
```

### Booking Form Component

```typescript
// components/BookingForm.tsx
export function BookingForm({ packId, guestId }: Props) {
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [pricing, setPricing] = useState(null);

  // Calculate pricing when selection changes
  useEffect(() => {
    if (selectedActivities.length > 0 || selectedCar) {
      calculatePricing();
    }
  }, [selectedActivities, selectedCar]);

  const calculatePricing = async () => {
    const result = await apiCall('/v1/pack-relations/calculate-price', {
      method: 'POST',
      body: JSON.stringify({
        travelPackLocaleGroupId: packId,
        selectedActivities,
        selectedCar,
        locale: 'en'
      })
    });

    setPricing(result.data);
  };

  const handleBooking = async () => {
    const booking = await apiCall('/v1/bookings', {
      method: 'POST',
      body: JSON.stringify({
        guestId,
        item: {
          type: 'travel_pack',
          id: packId,
          // Include selected activities & car
        }
      })
    });

    // Handle success
  };

  return (
    <form onSubmit={handleBooking}>
      {/* Render activities selection */}
      {/* Render car selection */}
      {/* Show pricing breakdown */}
      {/* Submit button */}
    </form>
  );
}
```

---

## 🚦 Next Steps

1. **اقرأ الأدلة المتخصصة** لكل نظام
2. **راجع TypeScript Interfaces** للبيانات
3. **طبق Error Handling** في مشروعك
4. **اختبر التكامل** باستخدام دليل الاختبار
5. **استخدم الأمثلة العملية** كنقطة بداية

---

## 📞 الدعم والمساعدة

- **API Documentation**: `/docs/api/`
- **Technical Architecture**: `/docs/architecture/`
- **Troubleshooting**: تحقق من [Error Handling Guide](./error-handling.md)

---

**🎯 هدفنا**: جعل تكامل Frontend مع ExploreKG Server سهل ومريح وموثوق!
