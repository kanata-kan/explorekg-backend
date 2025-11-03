# 🚀 API Quick Reference

**مرجع سريع لجميع APIs المتاحة في ExploreKG Server**

---

## 🎯 Base Configuration

```typescript
const BASE_URL = 'http://localhost:4000/api';

// Standard Headers
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
```

---

## 🏠 Guest System APIs

### Create Guest

```http
POST /api/v1/guests
```

```typescript
interface CreateGuestRequest {
  email: string;
  fullName: string;
  phone: string;
  locale: 'en' | 'fr';
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    source?: string;
  };
}

// Example
const guest = await fetch(`${BASE_URL}/v1/guests`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    email: 'john@example.com',
    fullName: 'John Doe',
    phone: '+123456789',
    locale: 'en',
  }),
});
```

### Get Guest by Session

```http
GET /api/v1/guests/:sessionId
```

```typescript
const guest = await fetch(`${BASE_URL}/v1/guests/${sessionId}`);
```

### Update Guest

```http
PATCH /api/v1/guests/:sessionId
```

### Get Guest Statistics

```http
GET /api/v1/guests/statistics
```

### Cleanup Expired Guests

```http
POST /api/v1/guests/cleanup-expired
```

---

## 📝 Booking System APIs

### Create Booking

```http
POST /api/v1/bookings
```

```typescript
interface CreateBookingRequest {
  guestId: string;
  item: {
    type: 'travel_pack' | 'activity' | 'car';
    id: string;
    customSelections?: {
      activities?: Array<{
        localeGroupId: string;
        quantity: number;
      }>;
      car?: {
        localeGroupId: string;
        durationDays: number;
      };
    };
  };
  bookingDetails: {
    startDate: string; // ISO date
    endDate: string; // ISO date
    participants: number;
    specialRequests?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact?: string;
  };
  locale: 'en' | 'fr';
}

// Example
const booking = await fetch(`${BASE_URL}/v1/bookings`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    guestId: 'guest-session-id',
    item: {
      type: 'travel_pack',
      id: 'pack-desert-adventure',
    },
    bookingDetails: {
      startDate: '2024-12-15',
      endDate: '2024-12-18',
      participants: 2,
    },
    contactInfo: {
      email: 'john@example.com',
      phone: '+123456789',
    },
    locale: 'en',
  }),
});
```

### Get Booking by Number

```http
GET /api/v1/bookings/:bookingNumber
```

### Get Guest Bookings

```http
GET /api/v1/bookings/guest/:guestId
```

### Get All Active Bookings

```http
GET /api/v1/bookings
```

### Update Booking Status

```http
PATCH /api/v1/bookings/:bookingNumber/status
```

### Cancel Booking

```http
PATCH /api/v1/bookings/:bookingNumber/cancel
```

### Booking Statistics

```http
GET /api/v1/bookings/statistics
```

---

## 🎒 Travel Packs APIs

### List Travel Packs

```http
GET /api/v1/travel-packs?locale=en&page=1&limit=10
```

```typescript
interface TravelPackFilters {
  locale?: 'en' | 'fr';
  page?: number;
  limit?: number;
  status?: 'published' | 'draft' | 'archived';
  q?: string; // Search query
  availability?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number; // days
  maxDuration?: number; // days
  createdBy?: string;
}

// Example
const packs = await fetch(
  `${BASE_URL}/v1/travel-packs?locale=en&page=1&limit=10`
);
```

### Get Travel Pack

```http
GET /api/v1/travel-packs/:id
```

### Get Detailed Travel Pack

```http
GET /api/v1/travel-packs/:id/detailed?step=full&locale=en
```

```typescript
interface DetailedPackQuery {
  step?: 'overview' | 'activities' | 'cars' | 'full';
  locale?: 'en' | 'fr';
}

// Example - Get pack with all details
const detailedPack = await fetch(
  `${BASE_URL}/v1/travel-packs/pack-desert-adventure/detailed?step=full&locale=en`
);

// Example - Get only activities
const activitiesOnly = await fetch(
  `${BASE_URL}/v1/travel-packs/pack-desert-adventure/detailed?step=activities&locale=en`
);
```

### Create Travel Pack (Admin)

```http
POST /api/v1/travel-packs
```

### Update Travel Pack

```http
PATCH /api/v1/travel-packs/:id
```

### Delete Travel Pack

```http
DELETE /api/v1/travel-packs/:id
```

### Travel Pack Statistics

```http
GET /api/v1/travel-packs/statistics
```

---

## 🎯 Activities APIs

### List Activities

```http
GET /api/v1/activities?locale=en&page=1&limit=10
```

```typescript
interface ActivityFilters {
  locale?: 'en' | 'fr';
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number; // hours
  difficulty?: 'easy' | 'medium' | 'hard';
  availability?: boolean;
}

// Example
const activities = await fetch(
  `${BASE_URL}/v1/activities?category=adventure&locale=en`
);
```

### Get Activity

```http
GET /api/v1/activities/:id
```

### Create Activity (Admin)

```http
POST /api/v1/activities
```

### Update Activity

```http
PATCH /api/v1/activities/:id
```

### Delete Activity

```http
DELETE /api/v1/activities/:id
```

### Update Activity Availability

```http
PATCH /api/v1/activities/:id/availability
```

### Associate Activity with Packs

```http
POST /api/v1/activities/:id/packs
```

---

## 🚗 Cars APIs

### List Cars

```http
GET /api/v1/cars?locale=en&page=1&limit=10
```

```typescript
interface CarFilters {
  locale?: 'en' | 'fr';
  page?: number;
  limit?: number;
  type?: 'sedan' | 'suv' | 'van' | 'luxury';
  transmission?: 'manual' | 'automatic';
  fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  capacity?: number; // seats
  minPrice?: number;
  maxPrice?: number;
  availability?: boolean;
}

// Example
const cars = await fetch(`${BASE_URL}/v1/cars?type=suv&capacity=7&locale=en`);
```

### Get Car

```http
GET /api/v1/cars/:id
```

### Create Car (Admin)

```http
POST /api/v1/cars
```

### Update Car

```http
PATCH /api/v1/cars/:id
```

### Delete Car

```http
DELETE /api/v1/cars/:id
```

### Update Car Availability

```http
PATCH /api/v1/cars/:id/availability
```

### Associate Car with Packs

```http
POST /api/v1/cars/:id/packs
```

---

## 🔗 Pack Relations APIs

### List Pack Relations

```http
GET /api/v1/pack-relations
```

### Get Pack Relation

```http
GET /api/v1/pack-relations/:packId
```

### Calculate Custom Price

```http
POST /api/v1/pack-relations/calculate-price
```

```typescript
interface CalculatePriceRequest {
  travelPackLocaleGroupId: string;
  selectedActivities?: Array<{
    localeGroupId: string;
    quantity: number;
  }>;
  selectedCar?: {
    localeGroupId: string;
    durationDays: number;
  } | null;
  carDurationDays?: number | null;
  locale?: 'en' | 'fr';
}

// Example
const pricing = await fetch(`${BASE_URL}/v1/pack-relations/calculate-price`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    travelPackLocaleGroupId: 'pack-desert-adventure',
    selectedActivities: [
      { localeGroupId: 'quad-biking', quantity: 2 },
      { localeGroupId: 'camel-riding', quantity: 2 },
    ],
    selectedCar: {
      localeGroupId: 'suv-4x4',
      durationDays: 3,
    },
    locale: 'en',
  }),
});
```

### Create Pack Relation (Admin)

```http
POST /api/v1/pack-relations
```

### Update Pack Relation

```http
PUT /api/v1/pack-relations/:packId
```

### Delete Pack Relation

```http
DELETE /api/v1/pack-relations/:packId
```

---

## 🩺 Health Check API

### Health Status

```http
GET /api/health
```

```typescript
// Response
interface HealthResponse {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  database: {
    status: 'connected' | 'disconnected';
    name: string;
  };
}
```

---

## 📊 Standard Response Format

### Success Response

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
  timestamp?: string;
}
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}
```

---

## 🔄 Common Query Parameters

### Pagination

```typescript
interface PaginationParams {
  page?: number; // Default: 1
  limit?: number; // Default: 10, Max: 100
  sort?: string; // Field name
  order?: 'asc' | 'desc'; // Default: 'desc'
}
```

### Localization

```typescript
interface LocaleParams {
  locale?: 'en' | 'fr'; // Default: 'en'
}
```

### Filtering

```typescript
interface FilterParams {
  q?: string; // Search query
  status?: string; // Entity status
  availability?: boolean;
  minPrice?: number;
  maxPrice?: number;
  createdBy?: string;
}
```

---

## ⚡ Quick Examples

### Complete Booking Flow

```typescript
// 1. Create guest
const guest = await apiCall('/v1/guests', {
  method: 'POST',
  body: JSON.stringify({
    /* guest data */
  }),
});

// 2. Get travel packs
const packs = await apiCall('/v1/travel-packs?locale=en');

// 3. Get detailed pack
const detailedPack = await apiCall(
  `/v1/travel-packs/${packId}/detailed?step=full&locale=en`
);

// 4. Calculate pricing
const pricing = await apiCall('/v1/pack-relations/calculate-price', {
  method: 'POST',
  body: JSON.stringify({
    /* selections */
  }),
});

// 5. Create booking
const booking = await apiCall('/v1/bookings', {
  method: 'POST',
  body: JSON.stringify({
    /* booking data */
  }),
});
```

### Search & Filter

```typescript
// Search travel packs
const searchResults = await apiCall(
  '/v1/travel-packs?q=desert&minPrice=100&maxPrice=500&locale=en'
);

// Filter activities by category
const adventureActivities = await apiCall(
  '/v1/activities?category=adventure&difficulty=medium&locale=en'
);

// Filter cars by type
const suvCars = await apiCall(
  '/v1/cars?type=suv&capacity=7&availability=true&locale=en'
);
```

---

## 📝 Notes

### Rate Limiting

- **Development**: 1000 requests per 15 minutes
- **Production**: 100 requests per 15 minutes

### Headers to Check

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

---

**🔗 Related Guides:**

- [TypeScript Interfaces](./typescript-interfaces.md)
- [Error Handling](./error-handling.md)
- [Integration Examples](./integration-examples.md)
