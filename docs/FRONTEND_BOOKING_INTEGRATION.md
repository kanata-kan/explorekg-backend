# 📘 دليل تكامل Booking Flow مع Frontend

## 📋 المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [كيف يعمل النظام](#-كيف-يعمل-النظام)
- [الاعتماديات (Dependencies)](#-الاعتماديات-dependencies)
- [نقاط النهاية (Endpoints)](#-نقاط-النهاية-endpoints)
- [تدفق العمل الكامل (Complete Flow)](#-تدفق-العمل-الكامل-complete-flow)
- [أمثلة التكامل](#-أمثلة-التكامل)
- [معالجة الأخطاء](#-معالجة-الأخطاء)
- [أفضل الممارسات](#-أفضل-الممارسات)

---

## 🌟 نظرة عامة

نظام Booking في ExploreKG يعتمد على **Guest Session** بدون تسجيل دخول. المستخدم يمر بخطوات متعددة من اختيار الباقة إلى الدفع النهائي.

### البنية الأساسية

```
Frontend (Next.js) → HTTP Client → Backend API (Express/TypeScript)
```

### المكونات الرئيسية

1. **Guest Session Management** - إدارة جلسة الضيف
2. **Booking Context** - إدارة حالة الحجز
3. **API Adapters** - طبقة التكامل مع Backend
4. **Validators** - التحقق من البيانات

---

## 🔄 كيف يعمل النظام

### 1. Guest Session System

النظام يستخدم **Guest Session** بدلاً من تسجيل الدخول التقليدي:

- كل زائر يحصل على **UUID Session ID** فريد
- Session ID يُحفظ في `localStorage`
- Session ينتهي بعد **30 يوم** (قابل للتجديد)
- Session ID يُستخدم لربط جميع الحجوزات بالضيف

**مثال:**
```typescript
// Session ID format: UUID v4
"a7b8f226-48ee-4df9-b2f2-8ca9637e02c8"
```

### 2. Booking Flow Steps

التدفق الكامل للحجز:

```
1. Pack Selection (اختيار الباقة)
   ↓
2. Activities Selection (اختيار الأنشطة)
   ↓
3. Car Selection (اختيار السيارة)
   ↓
4. Details Form (تفاصيل الرحلة)
   ↓
5. Review (مراجعة الحجز)
   ↓
6. Payment (الدفع)
   ↓
7. Success (نجاح الحجز)
```

### 3. Booking States

الحجز يمر بعدة حالات:

- **PENDING** - في انتظار الدفع
- **CONFIRMED** - مؤكد (بعد الدفع)
- **CANCELLED** - ملغى
- **EXPIRED** - منتهي (بعد 24 ساعة بدون دفع)

### 4. Payment Status

حالة الدفع:

- **UNPAID** - غير مدفوع
- **PAID** - مدفوع
- **REFUNDED** - مسترد
- **FAILED** - فشل الدفع

### 5. Booking Number Format

كل حجز يحصل على رقم فريد:

```
BKG-YYYYMMDD-####

مثال: BKG-20251102-0001
```

- **BKG**: بادئة ثابتة
- **YYYYMMDD**: تاريخ اليوم
- **####**: عداد يومي (يبدأ من 0001)

### 6. Snapshot System

النظام يحفظ **Snapshot** (صورة) من البيانات وقت الحجز:

- يحمي من تغيير الأسعار
- يحفظ تاريخي للبيانات
- قابل للتدقيق

**مثال Snapshot:**
```json
{
  "itemType": "travel_pack",
  "itemId": "673abc456789012345678901",
  "title": "Ala-Archa National Park Tour",
  "pricePerPerson": 150,
  "currency": "USD",
  "snapshotAt": "2025-11-02T10:30:00.000Z"
}
```

### 7. Auto-Expiration

الحجوزات **غير المدفوعة** تنتهي تلقائياً بعد **24 ساعة**.

---

## 🔗 الاعتماديات (Dependencies)

### Frontend Dependencies

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "zod": "^3.x",           // للتحقق من البيانات
    "@tanstack/react-query": "^5.x"  // (اختياري) لإدارة API calls
  }
}
```

### Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1

# API Timeout (milliseconds)
NEXT_PUBLIC_API_TIMEOUT=30000

# Default Locale
NEXT_PUBLIC_DEFAULT_LOCALE=en

# Stripe (للدفع)
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

### HTTP Client

Frontend يستخدم HTTP Client مخصص في `lib/http/client.ts`:

- Retry logic تلقائي (3 محاولات)
- Timeout handling
- Headers تلقائية:
  - `Content-Type: application/json`
  - `session-id`: من localStorage
  - `x-locale`: من URL pathname

---

## 📍 نقاط النهاية (Endpoints)

### Base URL

```
http://localhost:4000/api/v1
```

### 1. Guest Endpoints

#### إنشاء Guest Session

```http
POST /api/v1/guests
```

**Request Body:**
```json
{
  "email": "tourist@example.com",
  "fullName": "Ahmed Khan",
  "phone": "+996700123456",
  "locale": "en"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "sessionId": "a7b8f226-48ee-4df9-b2f2-8ca9637e02c8",
    "email": "tourist@example.com",
    "fullName": "Ahmed Khan",
    "phone": "+996700123456",
    "locale": "en",
    "expiresAt": "2025-12-02T10:30:00.000Z",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

#### جلب Guest بالـ Session ID

```http
GET /api/v1/guests/:sessionId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "a7b8f226-48ee-4df9-b2f2-8ca9637e02c8",
    "email": "tourist@example.com",
    "fullName": "Ahmed Khan",
    "expiresAt": "2025-12-02T10:30:00.000Z"
  }
}
```

#### تحديث Guest

```http
PATCH /api/v1/guests/:sessionId
```

**Request Body:**
```json
{
  "fullName": "Ahmed Khan Updated",
  "phone": "+996700999888"
}
```

#### تجديد Session

```http
PATCH /api/v1/guests/:sessionId/extend
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "expiresAt": "2025-12-03T10:30:00.000Z"
  }
}
```

---

### 2. Booking Endpoints

#### إنشاء حجز جديد

```http
POST /api/v1/bookings
```

**Request Body:**
```json
{
  "guestId": "a7b8f226-48ee-4df9-b2f2-8ca9637e02c8",
  "itemType": "travel_pack",
  "itemId": "673abc456789012345678901",
  "numberOfPersons": 2,
  "startDate": "2025-11-10T00:00:00.000Z",
  "endDate": "2025-11-15T00:00:00.000Z",
  "locale": "en",
  "metadata": {
    "travelPackLocaleGroupId": "pack-123",
    "selectedActivities": ["activity-1", "activity-2"],
    "selectedCar": "car-123",
    "numberOfGuests": 2
  }
}
```

**ملاحظات مهمة:**

- `guestId` يمكن أن يكون **UUID** (sessionId) أو **MongoDB ObjectId**
- `itemType` يجب أن يكون: `travel_pack`, `activity`, أو `car`
- `itemId` يجب أن يكون **MongoDB ObjectId** (ليس localeGroupId)
- `startDate` و `endDate` يجب أن يكونا **ISO 8601 datetime format**
- إذا لم يتم تحديد `endDate`، النظام يحسبه تلقائياً من `startDate + numberOfDays`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "bookingNumber": "BKG-20251102-0001",
    "guestId": "673abc123...",
    "snapshot": {
      "itemType": "travel_pack",
      "title": "Ala-Archa National Park Tour",
      "description": "...",
      "pricePerPerson": 150
    },
    "numberOfPersons": 2,
    "numberOfDays": 5,
    "startDate": "2025-11-10T00:00:00.000Z",
    "endDate": "2025-11-15T00:00:00.000Z",
    "subtotal": 300,
    "tax": 30,
    "discount": 0,
    "totalPrice": 330,
    "currency": "USD",
    "status": "pending",
    "paymentStatus": "unpaid",
    "expiresAt": "2025-11-03T10:30:00.000Z",
    "createdAt": "2025-11-02T10:30:00.000Z"
  },
  "message": "Booking created successfully",
  "timestamp": "2025-11-02T10:30:00.000Z"
}
```

#### جلب حجز برقم الحجز

```http
GET /api/v1/bookings/:bookingNumber
```

**مثال:**
```
GET /api/v1/bookings/BKG-20251102-0001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookingNumber": "BKG-20251102-0001",
    "guestId": "673abc123...",
    "snapshot": {
      "itemType": "travel_pack",
      "itemId": "673abc456...",
      "title": "Ala-Archa National Park Tour",
      "description": "...",
      "pricePerPerson": 150,
      "currency": "USD"
    },
    "numberOfPersons": 2,
    "startDate": "2025-11-10T00:00:00.000Z",
    "endDate": "2025-11-15T00:00:00.000Z",
    "subtotal": 300,
    "tax": 30,
    "discount": 0,
    "totalPrice": 330,
    "currency": "USD",
    "status": "pending",
    "paymentStatus": "unpaid",
    "expiresAt": "2025-11-03T10:30:00.000Z",
    "isExpired": false,
    "canBeCancelled": true,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T10:30:00.000Z"
  }
}
```

#### جلب جميع حجوزات الضيف

```http
GET /api/v1/bookings/guest/:guestId
```

**ملاحظة:** `guestId` يمكن أن يكون UUID (sessionId) أو MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "bookingNumber": "BKG-20251102-0001",
        "snapshot": {
          "itemType": "travel_pack",
          "title": "Ala-Archa National Park Tour"
        },
        "totalPrice": 330,
        "currency": "USD",
        "status": "pending",
        "paymentStatus": "unpaid",
        "expiresAt": "2025-11-03T10:30:00.000Z",
        "createdAt": "2025-11-02T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

#### معالجة الدفع

```http
POST /api/v1/bookings/:bookingNumber/payment
```

**Request Body:**
```json
{
  "paymentMethod": "CREDIT_CARD",
  "paymentTransactionId": "TXN-987654321",
  "notes": "Payment processed via Stripe"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookingNumber": "BKG-20251102-0001",
    "status": "confirmed",
    "paymentStatus": "paid",
    "paymentMethod": "CREDIT_CARD",
    "paymentTransactionId": "TXN-987654321",
    "paidAt": "2025-11-02T10:40:00.000Z",
    "totalPrice": 330,
    "currency": "USD"
  },
  "message": "Payment processed successfully",
  "timestamp": "2025-11-02T10:40:00.000Z"
}
```

#### إلغاء حجز

```http
POST /api/v1/bookings/:bookingNumber/cancel
```

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookingNumber": "BKG-20251102-0001",
    "status": "cancelled",
    "paymentStatus": "unpaid",
    "cancelledAt": "2025-11-02T11:00:00.000Z",
    "cancellationReason": "Change of plans"
  },
  "message": "Booking cancelled successfully",
  "timestamp": "2025-11-02T11:00:00.000Z"
}
```

---

### 3. Travel Packs Endpoints (للحصول على ObjectId)

#### جلب Travel Pack بالـ ObjectId

```http
GET /api/v1/travel-packs/:id
```

**ملاحظة:** للحصول على MongoDB ObjectId من localeGroupId، يمكن استخدام:

```http
GET /api/v1/travel-packs?localeGroupId=pack-123&locale=en
```

---

## 🔄 تدفق العمل الكامل (Complete Flow)

### الخطوة 1: إنشاء Guest Session

```typescript
// في Frontend: hooks/useGuestSession.ts
import { useGuestSession } from '@/hooks/useGuestSession';

function MyComponent() {
  const { guest, sessionId, createSession } = useGuestSession();
  
  // Session يتم إنشاؤه تلقائياً عند أول استخدام
  // أو يمكن إنشاؤه يدوياً:
  useEffect(() => {
    if (!sessionId) {
      createSession({
        email: 'user@example.com',
        fullName: 'John Doe',
        phone: '+996700123456',
        locale: 'en'
      });
    }
  }, []);
}
```

**API Call:**
```http
POST /api/v1/guests
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "+996700123456",
  "locale": "en"
}
```

---

### الخطوة 2: اختيار الباقة والأنشطة والسيارة

```typescript
// في Frontend: contexts/BookingContext.tsx
import { useBooking } from '@/contexts/BookingContext';

function BookingComponent() {
  const {
    selectPack,
    toggleActivity,
    selectCar,
    setTripDetails
  } = useBooking();
  
  // اختيار الباقة
  selectPack(travelPack, packRelations);
  
  // اختيار الأنشطة
  toggleActivity(activity);
  
  // اختيار السيارة
  selectCar(car);
  
  // تحديد تفاصيل الرحلة
  setTripDetails({
    startDate: '2025-11-10',
    endDate: '2025-11-15',
    numberOfGuests: 2
  });
}
```

---

### الخطوة 3: حساب السعر

```typescript
// في Frontend: contexts/BookingContext.tsx
const { recalculateWithCustomSelection } = useBooking();

// حساب السعر من Backend
await recalculateWithCustomSelection();
```

**API Call (اختياري - إذا كان Backend يدعم):**
```http
POST /api/v1/pack-relations/calculate-price
Content-Type: application/json

{
  "items": [
    {
      "itemId": "673abc456789012345678901",
      "itemType": "travel_pack",
      "numberOfPersons": 2
    },
    {
      "itemId": "673def456789012345678902",
      "itemType": "activity",
      "numberOfPersons": 2
    },
    {
      "itemId": "673ghi456789012345678903",
      "itemType": "car",
      "numberOfDays": 5
    }
  ],
  "startDate": "2025-11-10T00:00:00.000Z",
  "endDate": "2025-11-15T00:00:00.000Z"
}
```

---

### الخطوة 4: إنشاء الحجز

```typescript
// في Frontend: contexts/BookingContext.tsx
const { createBooking, guestId } = useBooking();

// إنشاء الحجز
try {
  const booking = await createBooking();
  
  console.log('Booking created:', booking.bookingNumber);
  // booking.bookingNumber = "BKG-20251102-0001"
} catch (error) {
  console.error('Failed to create booking:', error);
}
```

**API Call:**
```http
POST /api/v1/bookings
Content-Type: application/json
session-id: a7b8f226-48ee-4df9-b2f2-8ca9637e02c8
x-locale: en

{
  "guestId": "a7b8f226-48ee-4df9-b2f2-8ca9637e02c8",
  "itemType": "travel_pack",
  "itemId": "673abc456789012345678901",
  "numberOfPersons": 2,
  "startDate": "2025-11-10T00:00:00.000Z",
  "endDate": "2025-11-15T00:00:00.000Z",
  "locale": "en",
  "metadata": {
    "travelPackLocaleGroupId": "pack-123",
    "selectedActivities": ["activity-1"],
    "selectedCar": "car-123",
    "numberOfGuests": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingNumber": "BKG-20251102-0001",
    "status": "pending",
    "paymentStatus": "unpaid",
    "totalPrice": 330,
    "expiresAt": "2025-11-03T10:30:00.000Z"
  }
}
```

---

### الخطوة 5: معالجة الدفع

```typescript
// في Frontend: lib/api/bookings.adapter.ts
import { markBookingAsPaid } from '@/lib/api/bookings.adapter';

// بعد نجاح الدفع (مثلاً من Stripe)
await markBookingAsPaid('BKG-20251102-0001', {
  paymentMethod: 'CREDIT_CARD',
  paymentTransactionId: 'TXN-987654321'
});
```

**API Call:**
```http
POST /api/v1/bookings/BKG-20251102-0001/payment
Content-Type: application/json
session-id: a7b8f226-48ee-4df9-b2f2-8ca9637e02c8

{
  "paymentMethod": "CREDIT_CARD",
  "paymentTransactionId": "TXN-987654321"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingNumber": "BKG-20251102-0001",
    "status": "confirmed",
    "paymentStatus": "paid",
    "paidAt": "2025-11-02T10:40:00.000Z"
  }
}
```

---

### الخطوة 6: جلب الحجز للتحقق

```typescript
// في Frontend: lib/api/bookings.adapter.ts
import { getBookingByNumber } from '@/lib/api/bookings.adapter';

const booking = await getBookingByNumber('BKG-20251102-0001');
console.log('Booking status:', booking.status);
console.log('Payment status:', booking.paymentStatus);
```

**API Call:**
```http
GET /api/v1/bookings/BKG-20251102-0001
session-id: a7b8f226-48ee-4df9-b2f2-8ca9637e02c8
```

---

## 💻 أمثلة التكامل

### مثال 1: إنشاء Guest Session تلقائياً

```typescript
// hooks/useGuestSession.ts
import { useGuestSession } from '@/hooks/useGuestSession';

export function BookingPage() {
  const { guest, sessionId, isLoading, error } = useGuestSession();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!guest) return <div>No guest session</div>;
  
  return (
    <div>
      <p>Guest: {guest.fullName}</p>
      <p>Session ID: {sessionId}</p>
    </div>
  );
}
```

---

### مثال 2: استخدام Booking Context

```typescript
// components/BookingFlow.tsx
'use client';

import { useBooking } from '@/contexts/BookingContext';
import { useGuestSession } from '@/hooks/useGuestSession';

export function BookingFlow() {
  const { sessionId } = useGuestSession();
  const {
    selectedPack,
    selectedActivities,
    selectedCar,
    guestDetails,
    startDate,
    endDate,
    numberOfGuests,
    pricing,
    createBooking,
    isLoading,
    error
  } = useBooking();
  
  // ربط Guest Session مع Booking Context
  useEffect(() => {
    if (sessionId) {
      setGuestId(sessionId);
    }
  }, [sessionId]);
  
  const handleCreateBooking = async () => {
    try {
      const booking = await createBooking();
      // Redirect to success page
      router.push(`/booking/success?bookingNumber=${booking.bookingNumber}`);
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };
  
  return (
    <div>
      {/* Booking form */}
      <button onClick={handleCreateBooking} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Booking'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

---

### مثال 3: معالجة الدفع

```typescript
// components/PaymentForm.tsx
'use client';

import { usePayment } from '@/hooks/usePayment';
import { useBooking } from '@/contexts/BookingContext';

export function PaymentForm() {
  const { bookingNumber, totalPrice } = useBooking();
  const {
    initiateStripePayment,
    confirmStripePayment,
    isProcessing,
    error
  } = usePayment();
  
  const handleStripePayment = async () => {
    try {
      // Step 1: Create payment intent
      const { clientSecret } = await initiateStripePayment(bookingNumber);
      
      // Step 2: Use Stripe Elements to collect payment
      // (Stripe Elements integration code here)
      
      // Step 3: Confirm payment
      await confirmStripePayment(bookingNumber, paymentIntentId);
      
      // Success!
      router.push('/booking/success');
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };
  
  return (
    <div>
      <button onClick={handleStripePayment} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </div>
  );
}
```

---

### مثال 4: جلب حجوزات الضيف

```typescript
// pages/MyBookings.tsx
'use client';

import { useGuestSession } from '@/hooks/useGuestSession';
import { getBookingsByGuest } from '@/lib/api/bookings.adapter';
import { useState, useEffect } from 'react';

export function MyBookings() {
  const { sessionId } = useGuestSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (sessionId) {
      loadBookings();
    }
  }, [sessionId]);
  
  const loadBookings = async () => {
    try {
      const data = await getBookingsByGuest(sessionId);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>My Bookings</h1>
      {bookings.map(booking => (
        <div key={booking.bookingNumber}>
          <h2>{booking.bookingNumber}</h2>
          <p>Status: {booking.status}</p>
          <p>Total: {booking.totalPrice} {booking.currency}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## ⚠️ معالجة الأخطاء

### أخطاء شائعة وحلولها

#### 1. Guest Session منتهي

```typescript
// Error: "Guest session has expired"
// Solution: إنشاء session جديد
const { createSession } = useGuestSession();
await createSession({
  email: 'user@example.com',
  fullName: 'John Doe',
  phone: '+996700123456'
});
```

#### 2. Booking منتهي (Expired)

```typescript
// Error: "Booking expired"
// Solution: التحقق من expiresAt قبل إنشاء الحجز
const booking = await getBookingByNumber(bookingNumber);
if (booking.isExpired) {
  // Booking expired, create new one
}
```

#### 3. Dates Overlap (تعارض التواريخ)

```typescript
// Error: "The selected dates overlap with an existing booking"
// Solution: Backend يعيد alternative dates
try {
  await createBooking();
} catch (error) {
  if (error.type === 'DATES_OVERLAP') {
    // Show alternative dates to user
    const alternatives = error.alternativeDates;
  }
}
```

#### 4. Invalid Item ID

```typescript
// Error: "TravelPack with id 'xxx' not found"
// Solution: التأكد من استخدام MongoDB ObjectId وليس localeGroupId
// استخدام getTravelPackObjectId() للحصول على ObjectId
const packObjectId = await getTravelPackObjectId(
  localeGroupId,
  locale
);
```

#### 5. Payment Failed

```typescript
// Error: "Payment failed"
// Solution: التحقق من payment status وإعادة المحاولة
const booking = await getBookingByNumber(bookingNumber);
if (booking.paymentStatus === 'FAILED') {
  // Retry payment
  await processPayment(bookingNumber, paymentData);
}
```

---

## ✅ أفضل الممارسات

### 1. Guest Session Management

- ✅ **احفظ Session ID في localStorage** تلقائياً
- ✅ **تحقق من انتهاء Session** قبل كل عملية
- ✅ **جدد Session** قبل انتهائه بـ 30 دقيقة
- ✅ **أنشئ Session جديد** إذا انتهى

### 2. Booking Creation

- ✅ **تحقق من Guest Session** قبل إنشاء الحجز
- ✅ **استخدم MongoDB ObjectId** وليس localeGroupId
- ✅ **احول التواريخ إلى ISO 8601** format
- ✅ **احفظ bookingNumber** فوراً بعد الإنشاء

### 3. Error Handling

- ✅ **استخدم try-catch** لكل API call
- ✅ **عرض رسائل خطأ واضحة** للمستخدم
- ✅ **سجل الأخطاء** في console/Sentry
- ✅ **أعد المحاولة** للأخطاء المؤقتة

### 4. State Management

- ✅ **استخدم BookingContext** لإدارة حالة الحجز
- ✅ **احفظ البيانات في localStorage** للاستمرارية
- ✅ **نظف State** بعد نجاح الحجز
- ✅ **تحديث State** بعد كل API call

### 5. Performance

- ✅ **استخدم React Query** (اختياري) للـ caching
- ✅ **Lazy load** Booking components
- ✅ **Optimize images** في Booking flow
- ✅ **Monitor API response times**

### 6. Security

- ✅ **لا تحفظ معلومات حساسة** في localStorage
- ✅ **استخدم HTTPS** في production
- ✅ **تحقق من Session ownership** قبل كل عملية
- ✅ **Sanitize user input** قبل الإرسال

---

## 📝 ملاحظات مهمة

### 1. Date Format

**مهم جداً:** التواريخ يجب أن تكون **ISO 8601 datetime format**:

```typescript
// ✅ صحيح
"2025-11-10T00:00:00.000Z"

// ❌ خطأ
"2025-11-10"
"10/11/2025"
```

### 2. Item ID vs LocaleGroupId

**مهم:** Backend يتوقع **MongoDB ObjectId** وليس `localeGroupId`:

```typescript
// ❌ خطأ
itemId: "pack-123"  // localeGroupId

// ✅ صحيح
itemId: "673abc456789012345678901"  // MongoDB ObjectId
```

**الحل:** استخدام `getTravelPackObjectId()`:

```typescript
const packObjectId = await getTravelPackObjectId(
  localeGroupId,
  locale
);
```

### 3. Guest ID Format

Backend يدعم **UUID** (sessionId) و **MongoDB ObjectId**:

```typescript
// ✅ صحيح - UUID
guestId: "a7b8f226-48ee-4df9-b2f2-8ca9637e02c8"

// ✅ صحيح - MongoDB ObjectId
guestId: "673abc123789012345678901"
```

### 4. Auto-Calculation of End Date

إذا لم يتم تحديد `endDate`، النظام يحسبه تلقائياً:

```typescript
// إذا numberOfDays = 5 و startDate = "2025-11-10"
// النظام يحسب endDate = "2025-11-15" تلقائياً
```

### 5. Booking Expiration

الحجوزات **غير المدفوعة** تنتهي بعد **24 ساعة**:

```typescript
// التحقق من انتهاء الحجز
const booking = await getBookingByNumber(bookingNumber);
if (booking.isExpired) {
  // Booking expired
}
```

---

## 🔧 Troubleshooting

### المشكلة: Guest Session لا يُنشأ تلقائياً

**الحل:**
```typescript
// تأكد من أن useGuestSession() يُستدعى في component
const { guest, createSession } = useGuestSession();

useEffect(() => {
  if (!guest) {
    createSession();
  }
}, []);
```

### المشكلة: Booking creation يفشل

**الحل:**
1. تحقق من Guest Session موجود
2. تحقق من Item ID صحيح (MongoDB ObjectId)
3. تحقق من Date format (ISO 8601)
4. تحقق من Network tab في DevTools

### المشكلة: Payment لا يعمل

**الحل:**
1. تحقق من Booking status = "pending"
2. تحقق من Payment status = "unpaid"
3. تحقق من Booking لم ينتهِ (expired)
4. تحقق من Stripe keys صحيحة

---

## 📚 مراجع إضافية

- [Booking API Documentation](./api/BOOKING-API.md)
- [Guest API Documentation](./api/GUEST-API.md)
- [Frontend Integration Guide](../explorekg-frontend/INTEGRATION-GUIDE.md)
- [Backend API Overview](./api/API_OVERVIEW.md)

---

## 🎯 الخلاصة

هذا الدليل يغطي التكامل الكامل بين Frontend و Backend لنظام Booking. أهم النقاط:

1. ✅ **Guest Session** ضروري قبل أي عملية
2. ✅ **Booking Number** فريد لكل حجز
3. ✅ **Snapshot System** يحمي من تغيير الأسعار
4. ✅ **Auto-Expiration** بعد 24 ساعة
5. ✅ **Payment Processing** منفصل عن Booking Creation

لأي استفسارات أو مشاكل، راجع ملفات التوثيق الأخرى أو تواصل مع فريق التطوير.

---

_📘 تم إنشاء هذا الدليل بواسطة ExploreKG Development Team_

