# 📅 Complete Booking Flow Guide

## 🎯 نظرة عامة

دليل شامل خطوة بخطوة لعملية الحجز الكاملة من البداية للنهاية في ExploreKG.

---

## 📋 جدول المحتويات

1. [نظرة عامة على التدفق](#نظرة-عامة-على-التدفق)
2. [الخطوة 1: إنشاء Guest Session](#الخطوة-1-إنشاء-guest-session)
3. [الخطوة 2: استعراض الباقات](#الخطوة-2-استعراض-الباقات)
4. [الخطوة 3: عرض تفاصيل الباقة](#الخطوة-3-عرض-تفاصيل-الباقة)
5. [الخطوة 4: اختيار الأنشطة والسيارة](#الخطوة-4-اختيار-الأنشطة-والسيارة)
6. [الخطوة 5: حساب السعر النهائي](#الخطوة-5-حساب-السعر-النهائي)
7. [الخطوة 6: إنشاء الحجز](#الخطوة-6-إنشاء-الحجز)
8. [الخطوة 7: معالجة الدفع](#الخطوة-7-معالجة-الدفع)
9. [الخطوة 8: تتبع الحجز](#الخطوة-8-تتبع-الحجز)
10. [إدارة الحجوزات](#إدارة-الحجوزات)

---

## 🔄 نظرة عامة على التدفق

```
┌─────────────────────────────────────────────────────────────┐
│                     BOOKING FLOW                             │
└─────────────────────────────────────────────────────────────┘

1. CREATE GUEST SESSION
   ↓
2. BROWSE TRAVEL PACKS
   ↓
3. VIEW PACK DETAILS
   ↓
4. SELECT ACTIVITIES & CAR
   ↓
5. CALCULATE TOTAL PRICE
   ↓
6. CREATE BOOKING
   ↓
7. PROCESS PAYMENT
   ↓
8. CONFIRMATION & TRACKING
```

**⏱️ الوقت المتوقع:** 5-10 دقائق  
**💳 طرق الدفع:** Credit Card, PayPal, Bank Transfer  
**🔒 الأمان:** جميع البيانات محمية بـSSL/TLS

---

## 🆕 الخطوة 1: إنشاء Guest Session

### السيناريو

المستخدم يزور الموقع لأول مرة ويريد البدء في عملية الحجز.

### API Call

```http
POST /api/v1/guests
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+996555123456"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123def456",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+996555123456",
    "status": "active",
    "expiresAt": "2025-11-10T12:00:00.000Z",
    "createdAt": "2025-11-03T12:00:00.000Z"
  }
}
```

### Frontend Implementation (React)

```javascript
async function createGuest(guestData) {
  const response = await fetch('/api/v1/guests', {
    method: 'POST',
    credentials: 'include', // Important!
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(guestData),
  });

  const result = await response.json();

  if (result.success) {
    // Session ID stored in cookie automatically
    localStorage.setItem('guestEmail', result.data.email);
    return result.data;
  }

  throw new Error(result.error.message);
}

// Usage
const guest = await createGuest({
  fullName: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '+996555123456',
});
```

---

## 📦 الخطوة 2: استعراض الباقات

### السيناريو

الضيف يتصفح الباقات السياحية المتاحة مع الفلترة والترتيب.

### API Call

```http
GET /api/v1/travel-packs?locale=en&page=1&limit=12&isAvailable=true&sortBy=price&sortOrder=asc
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "pack_123",
      "name": "Kyrgyzstan Adventure Pack",
      "slug": "kyrgyzstan-adventure-pack",
      "localeGroupId": "pack_group_123",
      "price": 850,
      "duration": 7,
      "maxPersons": 4,
      "description": "Experience the beauty of Kyrgyzstan...",
      "highlights": ["..."],
      "images": ["https://..."],
      "isAvailable": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "totalPages": 3
  }
}
```

### Frontend Implementation (React)

```javascript
function TravelPacksList() {
  const [packs, setPacks] = useState([]);
  const [filters, setFilters] = useState({
    locale: 'en',
    page: 1,
    limit: 12,
    isAvailable: true,
    sortBy: 'price',
    sortOrder: 'asc',
  });

  useEffect(() => {
    fetchPacks();
  }, [filters]);

  async function fetchPacks() {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/v1/travel-packs?${params}`);
    const result = await response.json();

    if (result.success) {
      setPacks(result.data);
    }
  }

  return (
    <div className="packs-grid">
      {packs.map(pack => (
        <PackCard key={pack.id} pack={pack} />
      ))}
    </div>
  );
}
```

---

## 🔍 الخطوة 3: عرض تفاصيل الباقة

### السيناريو

الضيف يختار باقة ويريد رؤية التفاصيل الكاملة.

### API Call

```http
GET /api/v1/travel-packs/pack_123/detailed?step=full&locale=en
```

### Response

```json
{
  "success": true,
  "data": {
    "pack": {
      "id": "pack_123",
      "name": "Kyrgyzstan Adventure Pack",
      "price": 850,
      "duration": 7,
      "maxPersons": 4,
      "description": "...",
      "highlights": ["..."],
      "included": ["..."],
      "notIncluded": ["..."],
      "itinerary": [...]
    },
    "availableActivities": [
      {
        "id": "activity_001",
        "name": "Issyk-Kul Lake Tour",
        "localeGroupId": "activity_group_001",
        "price": 120,
        "duration": 1,
        "isAvailable": true
      }
    ],
    "availableCars": [
      {
        "id": "car_001",
        "name": "Toyota Land Cruiser",
        "localeGroupId": "car_group_001",
        "price": 150,
        "capacity": 7,
        "isAvailable": true
      }
    ],
    "pricing": {
      "basePrice": 850,
      "currency": "USD"
    }
  }
}
```

### Frontend Implementation (React)

```javascript
function PackDetails({ packId }) {
  const [packData, setPackData] = useState(null);

  useEffect(() => {
    fetchPackDetails();
  }, [packId]);

  async function fetchPackDetails() {
    const response = await fetch(
      `/api/v1/travel-packs/${packId}/detailed?step=full&locale=en`
    );
    const result = await response.json();

    if (result.success) {
      setPackData(result.data);
    }
  }

  if (!packData) return <Loading />;

  return (
    <div className="pack-details">
      <PackInfo pack={packData.pack} />
      <ActivitiesList activities={packData.availableActivities} />
      <CarsList cars={packData.availableCars} />
    </div>
  );
}
```

---

## 🎯 الخطوة 4: اختيار الأنشطة والسيارة

### السيناريو

الضيف يختار الأنشطة الإضافية والسيارة المفضلة.

### Frontend State Management

```javascript
function BookingBuilder({ pack }) {
  const [selection, setSelection] = useState({
    travelPackLocaleGroupId: pack.localeGroupId,
    numberOfPersons: 2,
    selectedActivities: [],
    selectedCarId: null,
    locale: 'en',
  });

  function handleActivityToggle(activityGroupId) {
    setSelection(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.includes(activityGroupId)
        ? prev.selectedActivities.filter(id => id !== activityGroupId)
        : [...prev.selectedActivities, activityGroupId],
    }));
  }

  function handleCarSelect(carGroupId) {
    setSelection(prev => ({
      ...prev,
      selectedCarId: carGroupId,
    }));
  }

  function handlePersonsChange(number) {
    setSelection(prev => ({
      ...prev,
      numberOfPersons: number,
    }));
  }

  return (
    <div className="booking-builder">
      <PersonsSelector
        value={selection.numberOfPersons}
        onChange={handlePersonsChange}
        max={pack.maxPersons}
      />

      <ActivitiesSelector
        activities={pack.availableActivities}
        selected={selection.selectedActivities}
        onToggle={handleActivityToggle}
      />

      <CarsSelector
        cars={pack.availableCars}
        selected={selection.selectedCarId}
        onSelect={handleCarSelect}
      />

      <PriceCalculator selection={selection} />
    </div>
  );
}
```

---

## 💰 الخطوة 5: حساب السعر النهائي

### السيناريو

بعد اختيار جميع الخيارات، نحسب السعر الكلي.

### API Call

```http
POST /api/v1/pack-relations/calculate-price
Content-Type: application/json

{
  "travelPackLocaleGroupId": "pack_group_123",
  "numberOfPersons": 2,
  "selectedActivities": ["activity_group_001", "activity_group_002"],
  "selectedCarId": "car_group_001",
  "locale": "en"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "breakdown": {
      "packBasePrice": 850,
      "packTotalPrice": 1700,
      "activities": [
        {
          "id": "activity_group_001",
          "name": "Issyk-Kul Lake Tour",
          "pricePerPerson": 120,
          "totalPrice": 240
        }
      ],
      "activitiesTotalPrice": 240,
      "car": {
        "id": "car_group_001",
        "name": "Toyota Land Cruiser",
        "pricePerDay": 150,
        "days": 7,
        "totalPrice": 1050
      }
    },
    "summary": {
      "packPrice": 1700,
      "activitiesPrice": 240,
      "carPrice": 1050,
      "subtotal": 2990,
      "tax": 0,
      "total": 2990,
      "currency": "USD"
    },
    "numberOfPersons": 2
  }
}
```

### Frontend Implementation

```javascript
function PriceCalculator({ selection }) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selection.selectedCarId) {
      calculatePrice();
    }
  }, [selection]);

  async function calculatePrice() {
    setLoading(true);

    try {
      const response = await fetch('/api/v1/pack-relations/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selection),
      });

      const result = await response.json();

      if (result.success) {
        setPricing(result.data);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner />;
  if (!pricing) return <SelectCarMessage />;

  return (
    <div className="price-summary">
      <h3>Price Breakdown</h3>

      <div className="price-item">
        <span>Travel Pack (× {pricing.numberOfPersons})</span>
        <span>${pricing.summary.packPrice}</span>
      </div>

      <div className="price-item">
        <span>Activities</span>
        <span>${pricing.summary.activitiesPrice}</span>
      </div>

      <div className="price-item">
        <span>Car Rental (7 days)</span>
        <span>${pricing.summary.carPrice}</span>
      </div>

      <div className="price-total">
        <span>Total</span>
        <span>
          ${pricing.summary.total} {pricing.summary.currency}
        </span>
      </div>

      <button onClick={() => proceedToBooking(selection, pricing)}>
        Proceed to Booking
      </button>
    </div>
  );
}
```

---

## 📝 الخطوة 6: إنشاء الحجز

### السيناريو

الضيف يؤكد الاختيارات وينشئ الحجز.

### API Call

```http
POST /api/v1/bookings
Cookie: sessionId=guest_abc123def456
Content-Type: application/json

{
  "guestId": "guest_abc123def456",
  "travelPackLocaleGroupId": "pack_group_123",
  "numberOfPersons": 2,
  "selectedActivities": ["activity_group_001"],
  "selectedCarId": "car_group_001",
  "totalPrice": 2990,
  "startDate": "2025-12-01",
  "endDate": "2025-12-08",
  "notes": "Prefer early morning pickup"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK-20251103-A1B2C3",
    "guestId": "guest_abc123def456",
    "travelPackLocaleGroupId": "pack_group_123",
    "packDetails": {
      "name": "Kyrgyzstan Adventure Pack",
      "duration": 7,
      "locale": "en"
    },
    "numberOfPersons": 2,
    "pricing": {
      "totalPrice": 2990,
      "currency": "USD"
    },
    "startDate": "2025-12-01T00:00:00.000Z",
    "endDate": "2025-12-08T23:59:59.000Z",
    "status": "pending",
    "paymentStatus": "unpaid",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "expiresAt": "2025-11-03T18:00:00.000Z"
  },
  "message": "Booking created successfully. Please complete payment within 6 hours."
}
```

### Frontend Implementation

```javascript
async function createBooking(bookingData) {
  try {
    const response = await fetch('/api/v1/bookings', {
      method: 'POST',
      credentials: 'include', // Important!
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();

    if (result.success) {
      // Save booking number
      localStorage.setItem('lastBookingNumber', result.data.bookingNumber);

      // Redirect to payment page
      router.push(`/payment/${result.data.bookingNumber}`);

      return result.data;
    }

    throw new Error(result.error.message);
  } catch (error) {
    console.error('Booking creation failed:', error);
    throw error;
  }
}

// Usage in component
async function handleConfirmBooking() {
  const bookingData = {
    guestId: guest.sessionId,
    travelPackLocaleGroupId: pack.localeGroupId,
    numberOfPersons: selection.numberOfPersons,
    selectedActivities: selection.selectedActivities,
    selectedCarId: selection.selectedCarId,
    totalPrice: pricing.summary.total,
    startDate: dates.startDate,
    endDate: dates.endDate,
    notes: additionalNotes,
  };

  try {
    const booking = await createBooking(bookingData);
    console.log('Booking created:', booking);
  } catch (error) {
    alert('Failed to create booking: ' + error.message);
  }
}
```

---

## 💳 الخطوة 7: معالجة الدفع

### السيناريو

الضيف يقوم بدفع الحجز خلال 6 ساعات من الإنشاء.

### API Call

```http
POST /api/v1/bookings/BK-20251103-A1B2C3/payment
Cookie: sessionId=guest_abc123def456
Content-Type: application/json

{
  "paymentMethod": "credit_card",
  "transactionId": "TXN_stripe_123456789",
  "notes": "Paid via Stripe"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK-20251103-A1B2C3",
    "status": "confirmed",
    "paymentStatus": "paid",
    "paymentMethod": "credit_card",
    "transactionId": "TXN_stripe_123456789",
    "paidAt": "2025-11-03T14:30:00.000Z",
    "totalPrice": 2990
  },
  "message": "Payment processed successfully. Booking confirmed."
}
```

### Frontend Implementation (with Stripe)

```javascript
async function processPayment(bookingNumber, paymentMethod) {
  try {
    // 1. Process payment with Stripe (or other gateway)
    const stripeResponse = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });

    if (stripeResponse.error) {
      throw new Error(stripeResponse.error.message);
    }

    // 2. Mark booking as paid in backend
    const response = await fetch(`/api/v1/bookings/${bookingNumber}/payment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethod: 'credit_card',
        transactionId: stripeResponse.paymentIntent.id,
        notes: 'Paid via Stripe',
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Payment successful!
      router.push(`/booking-confirmation/${bookingNumber}`);
      return result.data;
    }

    throw new Error(result.error.message);
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

// Payment component
function PaymentForm({ bookingNumber, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      await processPayment(bookingNumber, paymentMethod);

      alert('Payment successful! Your booking is confirmed.');
    } catch (error) {
      alert('Payment failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Payment Details</h2>
      <p>Amount: ${amount} USD</p>

      <CardElement />

      <button type="submit" disabled={processing}>
        {processing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
}
```

---

## 📍 الخطوة 8: تتبع الحجز

### السيناريو

الضيف يريد عرض تفاصيل حجزه أو جميع حجوزاته.

### API Call 1: عرض حجز واحد

```http
GET /api/v1/bookings/BK-20251103-A1B2C3
Cookie: sessionId=guest_abc123def456
```

### Response

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK-20251103-A1B2C3",
    "guestDetails": {
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+996555123456"
    },
    "packDetails": {
      "name": "Kyrgyzstan Adventure Pack",
      "duration": 7
    },
    "numberOfPersons": 2,
    "pricing": {
      "totalPrice": 2990,
      "currency": "USD"
    },
    "startDate": "2025-12-01T00:00:00.000Z",
    "endDate": "2025-12-08T23:59:59.000Z",
    "status": "confirmed",
    "paymentStatus": "paid",
    "paidAt": "2025-11-03T14:30:00.000Z"
  }
}
```

### API Call 2: عرض جميع الحجوزات

```http
GET /api/v1/bookings/guest/guest_abc123def456
Cookie: sessionId=guest_abc123def456
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "bookingNumber": "BK-20251103-A1B2C3",
      "travelPackName": "Kyrgyzstan Adventure Pack",
      "numberOfPersons": 2,
      "totalPrice": 2990,
      "startDate": "2025-12-01",
      "status": "confirmed",
      "paymentStatus": "paid"
    }
  ]
}
```

### Frontend Implementation

```javascript
function MyBookings({ guestId }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, [guestId]);

  async function fetchBookings() {
    const response = await fetch(`/api/v1/bookings/guest/${guestId}`, {
      credentials: 'include',
    });

    const result = await response.json();

    if (result.success) {
      setBookings(result.data);
    }
  }

  return (
    <div className="bookings-list">
      <h2>My Bookings</h2>

      {bookings.map(booking => (
        <BookingCard key={booking.bookingNumber} booking={booking} />
      ))}
    </div>
  );
}

function BookingCard({ booking }) {
  return (
    <div className="booking-card">
      <h3>{booking.travelPackName}</h3>
      <p>Booking Number: {booking.bookingNumber}</p>
      <p>Status: {booking.status}</p>
      <p>Payment: {booking.paymentStatus}</p>
      <p>Start Date: {new Date(booking.startDate).toLocaleDateString()}</p>
      <p>Total: ${booking.totalPrice}</p>

      <Link href={`/bookings/${booking.bookingNumber}`}>View Details</Link>
    </div>
  );
}
```

---

## 🛠️ إدارة الحجوزات

### إلغاء الحجز

```http
POST /api/v1/bookings/BK-20251103-A1B2C3/cancel
Cookie: sessionId=guest_abc123def456
Content-Type: application/json

{
  "reason": "Changed travel plans"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK-20251103-A1B2C3",
    "status": "cancelled",
    "cancelledAt": "2025-11-03T16:00:00.000Z",
    "cancellationReason": "Changed travel plans",
    "refundEligible": true,
    "refundAmount": 2990
  },
  "message": "Booking cancelled successfully. Refund will be processed within 5-7 business days."
}
```

---

## ⏱️ Booking Expiration Timeline

```
┌─────────────────────────────────────────┐
│   BOOKING CREATED (Pending)             │
│   Status: pending                        │
│   Payment: unpaid                        │
│   ⏰ Expires in: 6 hours                │
└────────────┬────────────────────────────┘
             │
             ↓
    [Within 6 hours]
             │
     ┌───────┴───────┐
     │               │
     ↓               ↓
┌─────────┐    ┌─────────┐
│  PAID   │    │ EXPIRED │
└─────────┘    └─────────┘
Status: confirmed  Status: expired
Payment: paid     Auto-deleted
```

---

## 📊 حالات الحجز (Booking States)

| Status      | Payment Status | Description                      |
| ----------- | -------------- | -------------------------------- |
| `pending`   | `unpaid`       | حجز جديد بانتظار الدفع (6 ساعات) |
| `confirmed` | `paid`         | حجز مؤكد ومدفوع ✅               |
| `cancelled` | `refunded`     | حجز ملغي مع استرجاع المبلغ       |
| `expired`   | `unpaid`       | حجز منتهي (لم يتم الدفع)         |
| `completed` | `paid`         | رحلة مكتملة                      |

---

## 🎓 مثال تكامل كامل

```javascript
// Complete booking flow example
class BookingService {
  async startBookingFlow(guestData, packId, selection) {
    try {
      // Step 1: Create guest session
      const guest = await this.createGuest(guestData);

      // Step 2: Calculate price
      const pricing = await this.calculatePrice({
        ...selection,
        travelPackLocaleGroupId: packId,
      });

      // Step 3: Create booking
      const booking = await this.createBooking({
        guestId: guest.sessionId,
        travelPackLocaleGroupId: packId,
        ...selection,
        totalPrice: pricing.summary.total,
      });

      // Step 4: Process payment
      const payment = await this.processPayment(
        booking.bookingNumber,
        paymentDetails
      );

      return {
        guest,
        booking,
        payment,
      };
    } catch (error) {
      console.error('Booking flow failed:', error);
      throw error;
    }
  }

  async createGuest(data) {
    const response = await fetch('/api/v1/guests', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return (await response.json()).data;
  }

  async calculatePrice(selection) {
    const response = await fetch('/api/v1/pack-relations/calculate-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selection),
    });
    return (await response.json()).data;
  }

  async createBooking(bookingData) {
    const response = await fetch('/api/v1/bookings', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return (await response.json()).data;
  }

  async processPayment(bookingNumber, paymentDetails) {
    const response = await fetch(`/api/v1/bookings/${bookingNumber}/payment`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentDetails),
    });
    return (await response.json()).data;
  }
}

// Usage
const bookingService = new BookingService();

const result = await bookingService.startBookingFlow(
  {
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+996555123456',
  },
  'pack_group_123',
  { numberOfPersons: 2, selectedActivities: [], selectedCarId: 'car_group_001' }
);
```

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
