# 🔧 TypeScript Interfaces

**واجهات TypeScript جاهزة للاستخدام في Frontend**

---

## 📋 Common Types

```typescript
// Common language support
export interface LanguageSupport {
  en: string;
  fr: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
  timestamp?: string;
}

// Error response
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// Pagination metadata
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

// Query parameters for pagination
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Locale type
export type Locale = 'en' | 'fr';

// Common status types
export type EntityStatus = 'published' | 'draft' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';
```

---

## 🏠 Guest System Types

```typescript
// Guest entity
export interface Guest {
  _id: string;
  sessionId: string;
  email: string;
  fullName: string;
  phone: string;
  locale: Locale;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    source?: string;
  };
  canMigrate: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

// Create guest request
export interface CreateGuestRequest {
  email: string;
  fullName: string;
  phone: string;
  locale: Locale;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    source?: string;
  };
}

// Update guest request
export interface UpdateGuestRequest {
  email?: string;
  fullName?: string;
  phone?: string;
  locale?: Locale;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    source?: string;
  };
}

// Guest statistics
export interface GuestStatistics {
  total: number;
  active: number;
  expired: number;
  canMigrate: number;
  byLocale: {
    en: number;
    fr: number;
  };
  recentRegistrations: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}
```

---

## 🎒 Travel Pack Types

```typescript
// Travel pack entity
export interface TravelPack {
  _id: string;
  localeGroupId: string;
  name: LanguageSupport;
  description: LanguageSupport;
  slug: string;
  price: {
    base: number;
    currency: string;
  };
  duration: {
    days: number;
    nights: number;
  };
  capacity: {
    min: number;
    max: number;
  };
  images: MediaFile[];
  highlights: LanguageSupport[];
  includes: LanguageSupport[];
  excludes?: LanguageSupport[];
  itinerary?: TravelPackItinerary[];
  location: {
    region: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  difficulty: 'easy' | 'medium' | 'hard';
  category: string[];
  tags: string[];
  availability: boolean;
  status: EntityStatus;
  seo?: {
    metaTitle?: LanguageSupport;
    metaDescription?: LanguageSupport;
    keywords?: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Travel pack itinerary item
export interface TravelPackItinerary {
  day: number;
  title: LanguageSupport;
  description: LanguageSupport;
  activities: string[];
  accommodation?: LanguageSupport;
  meals: string[];
}

// Media file
export interface MediaFile {
  url: string;
  type: 'image' | 'video' | 'document';
  description?: LanguageSupport;
  isPrimary?: boolean;
}

// Travel pack filters
export interface TravelPackFilters extends PaginationQuery {
  locale?: Locale;
  status?: EntityStatus;
  q?: string;
  availability?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  createdBy?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  region?: string;
}

// Create travel pack request
export interface CreateTravelPackRequest {
  localeGroupId: string;
  name: LanguageSupport;
  description: LanguageSupport;
  price: {
    base: number;
    currency: string;
  };
  duration: {
    days: number;
    nights: number;
  };
  capacity: {
    min: number;
    max: number;
  };
  images?: MediaFile[];
  highlights?: LanguageSupport[];
  includes?: LanguageSupport[];
  excludes?: LanguageSupport[];
  location: {
    region: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  difficulty: 'easy' | 'medium' | 'hard';
  category: string[];
  tags?: string[];
  itinerary?: TravelPackItinerary[];
  availability?: boolean;
  status?: EntityStatus;
  seo?: {
    metaTitle?: LanguageSupport;
    metaDescription?: LanguageSupport;
    keywords?: string[];
  };
}

// Update travel pack request
export interface UpdateTravelPackRequest
  extends Partial<CreateTravelPackRequest> {}
```

---

## 🎯 Activity Types

```typescript
// Activity entity
export interface Activity {
  _id: string;
  localeGroupId: string;
  name: LanguageSupport;
  description: LanguageSupport;
  slug: string;
  price: {
    base: number;
    currency: string;
    priceType: 'per_person' | 'per_group' | 'per_hour';
  };
  duration: {
    hours: number;
    minutes?: number;
  };
  capacity: {
    min: number;
    max: number;
  };
  images: MediaFile[];
  category: string;
  tags: string[];
  location: {
    name: LanguageSupport;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  difficulty: 'easy' | 'medium' | 'hard';
  ageRestriction?: {
    min?: number;
    max?: number;
  };
  requirements?: LanguageSupport[];
  equipment?: LanguageSupport[];
  includes: LanguageSupport[];
  excludes?: LanguageSupport[];
  availability: boolean;
  status: EntityStatus;
  seasonality?: {
    available: boolean;
    months: number[];
  };
  weather?: {
    conditions: string[];
    minTemperature?: number;
    maxTemperature?: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Activity filters
export interface ActivityFilters extends PaginationQuery {
  locale?: Locale;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  availability?: boolean;
  status?: EntityStatus;
  tags?: string[];
}

// Create activity request
export interface CreateActivityRequest {
  localeGroupId: string;
  name: LanguageSupport;
  description: LanguageSupport;
  price: {
    base: number;
    currency: string;
    priceType: 'per_person' | 'per_group' | 'per_hour';
  };
  duration: {
    hours: number;
    minutes?: number;
  };
  capacity: {
    min: number;
    max: number;
  };
  images?: MediaFile[];
  category: string;
  tags?: string[];
  location: {
    name: LanguageSupport;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  difficulty: 'easy' | 'medium' | 'hard';
  ageRestriction?: {
    min?: number;
    max?: number;
  };
  requirements?: LanguageSupport[];
  equipment?: LanguageSupport[];
  includes: LanguageSupport[];
  excludes?: LanguageSupport[];
  availability?: boolean;
  status?: EntityStatus;
}

// Update activity request
export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {}
```

---

## 🚗 Car Types

```typescript
// Car entity
export interface Car {
  _id: string;
  localeGroupId: string;
  name: LanguageSupport;
  description: LanguageSupport;
  slug: string;
  type: 'sedan' | 'suv' | 'van' | 'luxury' | 'economy' | 'compact';
  brand: string;
  model: string;
  year: number;
  capacity: {
    seats: number;
    luggage: number;
  };
  transmission: 'manual' | 'automatic';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  features: LanguageSupport[];
  images: MediaFile[];
  pricing: {
    daily: number;
    weekly?: number;
    monthly?: number;
    currency: string;
  };
  insurance: {
    included: boolean;
    coverage?: LanguageSupport[];
  };
  requirements: {
    minAge: number;
    license: LanguageSupport;
    deposit: number;
  };
  availability: boolean;
  status: EntityStatus;
  location: {
    pickupLocations: string[];
    deliveryAvailable: boolean;
  };
  mileage?: {
    city: number;
    highway: number;
    unit: 'km/l' | 'mpg';
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Car filters
export interface CarFilters extends PaginationQuery {
  locale?: Locale;
  type?: 'sedan' | 'suv' | 'van' | 'luxury' | 'economy' | 'compact';
  brand?: string;
  transmission?: 'manual' | 'automatic';
  fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  availability?: boolean;
  status?: EntityStatus;
}

// Create car request
export interface CreateCarRequest {
  localeGroupId: string;
  name: LanguageSupport;
  description: LanguageSupport;
  type: 'sedan' | 'suv' | 'van' | 'luxury' | 'economy' | 'compact';
  brand: string;
  model: string;
  year: number;
  capacity: {
    seats: number;
    luggage: number;
  };
  transmission: 'manual' | 'automatic';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  features: LanguageSupport[];
  images?: MediaFile[];
  pricing: {
    daily: number;
    weekly?: number;
    monthly?: number;
    currency: string;
  };
  insurance: {
    included: boolean;
    coverage?: LanguageSupport[];
  };
  requirements: {
    minAge: number;
    license: LanguageSupport;
    deposit: number;
  };
  availability?: boolean;
  status?: EntityStatus;
  location: {
    pickupLocations: string[];
    deliveryAvailable: boolean;
  };
}

// Update car request
export interface UpdateCarRequest extends Partial<CreateCarRequest> {}
```

---

## 📝 Booking Types

```typescript
// Booking entity
export interface Booking {
  _id: string;
  bookingNumber: string;
  guestId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingType: 'travel_pack' | 'activity' | 'car';

  // Item snapshot (immutable at booking time)
  itemSnapshot: BookingItemSnapshot;

  // Booking details
  bookingDetails: {
    startDate: string;
    endDate: string;
    participants: number;
    specialRequests?: string;
  };

  // Contact information
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact?: string;
  };

  // Pricing breakdown
  pricing: BookingPricing;

  // Payment information
  payment?: {
    method?: string;
    transactionId?: string;
    paidAt?: string;
    amount: number;
    currency: string;
  };

  // Metadata
  locale: Locale;
  source: string;
  userAgent?: string;

  // Lifecycle
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  expiresAt: string;
}

// Booking item snapshot
export interface BookingItemSnapshot {
  itemType: 'travel_pack' | 'activity' | 'car';
  itemId: string;
  title: string;
  description?: string;
  pricePerPerson?: number;
  pricePerUnit?: number;
  currency: string;
  locale: string;

  // Custom selections for travel packs
  customSelections?: {
    activities?: Array<{
      localeGroupId: string;
      name: string;
      quantity: number;
      pricePerPerson: number;
      discount: number;
    }>;
    car?: {
      localeGroupId: string;
      name: string;
      durationDays: number;
      pricePerDay: number;
      discount: number;
    };
  };
}

// Booking pricing
export interface BookingPricing {
  subtotal: number;
  discounts: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  taxes?: Array<{
    type: string;
    rate: number;
    amount: number;
  }>;
  fees?: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  total: number;
  currency: string;
}

// Create booking request
export interface CreateBookingRequest {
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
    startDate: string;
    endDate: string;
    participants: number;
    specialRequests?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact?: string;
  };
  locale: Locale;
}

// Update booking status request
export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  payment?: {
    method: string;
    transactionId: string;
    amount: number;
    currency: string;
  };
}

// Cancel booking request
export interface CancelBookingRequest {
  reason?: string;
  refundRequested?: boolean;
}

// Booking filters
export interface BookingFilters extends PaginationQuery {
  guestId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  bookingType?: 'travel_pack' | 'activity' | 'car';
  startDate?: string;
  endDate?: string;
  locale?: Locale;
}
```

---

## 🔗 Pack Relation Types

```typescript
// Pack relation entity
export interface PackRelation {
  _id: string;
  travelPackLocaleGroupId: string;
  relations: {
    activities: ActivityRelation[];
    cars: CarRelation[];
  };
  pricing: PackRelationPricing;
  settings: PackRelationSettings;
  createdAt: string;
  updatedAt: string;
}

// Activity relation
export interface ActivityRelation {
  localeGroupId: string;
  discount: number; // percentage
  optional: boolean;
  quantity: number;
  maxQuantity?: number;
  order?: number;
}

// Car relation
export interface CarRelation {
  localeGroupId: string;
  discount: number; // percentage
  optional: boolean;
  maxDurationDays?: number;
  order?: number;
}

// Pack relation pricing
export interface PackRelationPricing {
  currency: string;
  baseDiscount: number; // percentage discount on pack base price
  bundleDiscount?: number; // additional discount when selecting multiple items
  minimumSpend?: number; // minimum total to qualify for discounts
}

// Pack relation settings
export interface PackRelationSettings {
  allowCustomSelection: boolean;
  requiresAllActivities: boolean;
  requiresCar: boolean;
  maxParticipants?: number;
  bookingWindow?: {
    advanceDays: number;
    cutoffHours: number;
  };
}

// Detailed pack response
export interface DetailedPackResponse {
  pack: TravelPack;
  relations: {
    activities: DetailedActivity[];
    cars: DetailedCar[];
  };
  pricing: PricingBreakdown;
  settings: PackRelationSettings;
}

// Detailed activity with relation data
export interface DetailedActivity extends Activity {
  relationData: {
    discount: number;
    optional: boolean;
    quantity: number;
    maxQuantity?: number;
    finalPrice: number;
    discountAmount: number;
  };
}

// Detailed car with relation data
export interface DetailedCar extends Car {
  relationData: {
    discount: number;
    optional: boolean;
    maxDurationDays?: number;
    pricePerDay: number;
    discountAmount: number;
  };
}

// Pricing breakdown
export interface PricingBreakdown {
  packBasePrice: number;
  activitiesTotal: number;
  carsTotal: number;
  subtotal: number;
  discounts: Array<{
    type: string;
    amount: number;
    percentage?: number;
  }>;
  total: number;
  currency: string;
}

// Calculate price request
export interface CalculatePriceRequest {
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
  locale?: Locale;
}

// Calculate price response
export interface CalculatePriceResponse {
  packBasePrice: number;
  selectedActivities: Array<{
    localeGroupId: string;
    name: string;
    quantity: number;
    pricePerPerson: number;
    discount: number;
    subtotal: number;
    finalPrice: number;
  }>;
  selectedCar?: {
    localeGroupId: string;
    name: string;
    durationDays: number;
    pricePerDay: number;
    discount: number;
    subtotal: number;
    finalPrice: number;
  };
  breakdown: PricingBreakdown;
}
```

---

## 🩺 Health Check Types

```typescript
// Health response
export interface HealthResponse {
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

## 🔧 Utility Types

```typescript
// API call options
export interface ApiCallOptions extends RequestInit {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

// Filter builder utility
export type FilterBuilder<T> = {
  [K in keyof T]?: T[K] | { $in: T[K][] } | { $gte: T[K] } | { $lte: T[K] };
};

// Partial update type
export type PartialUpdate<T> = Partial<
  Omit<T, '_id' | 'createdAt' | 'updatedAt'>
>;

// Entity with timestamps
export interface TimestampedEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// Paginated list response
export interface PaginatedList<T> {
  items: T[];
  pagination: PaginationMeta;
}
```

---

## 📚 Usage Examples

```typescript
// Example: Type-safe API call
async function getTravelPacks(
  filters: TravelPackFilters
): Promise<ApiResponse<PaginatedList<TravelPack>>> {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      query.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/v1/travel-packs?${query}`);
  return response.json();
}

// Example: Type-safe booking creation
async function createBooking(
  request: CreateBookingRequest
): Promise<ApiResponse<Booking>> {
  const response = await fetch('/api/v1/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return response.json();
}

// Example: Type-safe guest management
const useGuest = (sessionId: string) => {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        const response: ApiResponse<Guest> = await apiCall(
          `/v1/guests/${sessionId}`
        );
        if (response.success && response.data) {
          setGuest(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, [sessionId]);

  return { guest, loading, error };
};
```

---

**🔗 Related Files:**

- [API Quick Reference](./api-quick-reference.md)
- [Error Handling Guide](./error-handling.md)
- [Integration Examples](./integration-examples.md)
