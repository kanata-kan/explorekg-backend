# 💡 Integration Examples

**أمثلة عملية لتكامل ExploreKG APIs مع React/Next.js**

---

## 📋 نظرة عامة

هذا الدليل يحتوي على أمثلة عملية كاملة لكيفية تكامل APIs في تطبيقات React و Next.js الحقيقية.

---

## 🏗️ Project Setup

### Next.js Project Structure

```
src/
├── components/
│   ├── ui/                 # UI components
│   ├── guest/             # Guest-related components
│   ├── booking/           # Booking components
│   ├── travel-packs/      # Travel pack components
│   └── shared/            # Shared components
├── hooks/                 # Custom hooks
├── services/              # API services
├── types/                 # TypeScript types
├── utils/                 # Utilities
└── pages/                 # Next.js pages
    ├── api/               # API routes
    ├── packs/             # Travel pack pages
    └── booking/           # Booking pages
```

### Environment Configuration

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_ENV=development
API_TIMEOUT=10000
```

---

## 🎯 Core Services Setup

### API Service Foundation

```typescript
// services/api.ts
import { ApiError } from '../utils/errors';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

interface ApiCallOptions extends RequestInit {
  timeout?: number;
}

export async function apiCall<T>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'API request failed',
        response.status,
        data.path
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }

    throw new ApiError('Network error', 0);
  }
}
```

### Guest Service

```typescript
// services/guestService.ts
import { apiCall } from './api';
import { Guest, CreateGuestRequest, UpdateGuestRequest } from '../types/api';

export class GuestService {
  static async createGuest(data: CreateGuestRequest): Promise<Guest> {
    const response = await apiCall<Guest>('/v1/guests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  static async getGuest(sessionId: string): Promise<Guest | null> {
    try {
      const response = await apiCall<Guest>(`/v1/guests/${sessionId}`);
      return response.data!;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  static async updateGuest(
    sessionId: string,
    data: UpdateGuestRequest
  ): Promise<Guest> {
    const response = await apiCall<Guest>(`/v1/guests/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  static async getStatistics() {
    const response = await apiCall('/v1/guests/statistics');
    return response.data;
  }
}
```

### Travel Pack Service

```typescript
// services/travelPackService.ts
import { apiCall } from './api';
import {
  TravelPack,
  TravelPackFilters,
  DetailedPackResponse,
  PaginatedList,
} from '../types/api';

export class TravelPackService {
  static async getTravelPacks(
    filters: TravelPackFilters = {}
  ): Promise<PaginatedList<TravelPack>> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiCall<PaginatedList<TravelPack>>(
      `/v1/travel-packs?${queryParams.toString()}`
    );
    return response.data!;
  }

  static async getTravelPack(id: string): Promise<TravelPack> {
    const response = await apiCall<TravelPack>(`/v1/travel-packs/${id}`);
    return response.data!;
  }

  static async getDetailedTravelPack(
    id: string,
    options: { step?: string; locale?: string } = {}
  ): Promise<DetailedPackResponse> {
    const { step = 'full', locale = 'en' } = options;
    const queryParams = new URLSearchParams({ step, locale });

    const response = await apiCall<DetailedPackResponse>(
      `/v1/travel-packs/${id}/detailed?${queryParams.toString()}`
    );
    return response.data!;
  }
}
```

---

## 🪝 Custom Hooks

### useGuest Hook

```typescript
// hooks/useGuest.ts
import { useState, useEffect, useCallback } from 'react';
import { GuestService } from '../services/guestService';
import { Guest, CreateGuestRequest } from '../types/api';

interface UseGuestOptions {
  autoCreate?: boolean;
  guestData?: CreateGuestRequest;
}

export function useGuest(sessionId?: string, options: UseGuestOptions = {}) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuest = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const guestData = await GuestService.getGuest(id);
        setGuest(guestData);

        // Auto-create if guest not found and option enabled
        if (!guestData && options.autoCreate && options.guestData) {
          const newGuest = await GuestService.createGuest(options.guestData);
          setGuest(newGuest);

          // Store session ID for future use
          localStorage.setItem('guestSessionId', newGuest.sessionId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch guest');
      } finally {
        setLoading(false);
      }
    },
    [options.autoCreate, options.guestData]
  );

  const createGuest = useCallback(async (data: CreateGuestRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newGuest = await GuestService.createGuest(data);
      setGuest(newGuest);

      // Store session ID
      localStorage.setItem('guestSessionId', newGuest.sessionId);

      return newGuest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guest');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGuest = useCallback(
    async (updates: Partial<Guest>) => {
      if (!guest) return;

      setLoading(true);
      setError(null);

      try {
        const updatedGuest = await GuestService.updateGuest(
          guest.sessionId,
          updates
        );
        setGuest(updatedGuest);
        return updatedGuest;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update guest');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [guest]
  );

  useEffect(() => {
    if (sessionId) {
      fetchGuest(sessionId);
    }
  }, [sessionId, fetchGuest]);

  return {
    guest,
    loading,
    error,
    createGuest,
    updateGuest,
    refetch: sessionId ? () => fetchGuest(sessionId) : undefined,
  };
}
```

### useTravelPacks Hook

```typescript
// hooks/useTravelPacks.ts
import { useState, useEffect, useCallback } from 'react';
import { TravelPackService } from '../services/travelPackService';
import { TravelPack, TravelPackFilters, PaginatedList } from '../types/api';

export function useTravelPacks(initialFilters: TravelPackFilters = {}) {
  const [data, setData] = useState<PaginatedList<TravelPack> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TravelPackFilters>(initialFilters);

  const fetchPacks = useCallback(
    async (newFilters?: TravelPackFilters) => {
      setLoading(true);
      setError(null);

      const searchFilters = newFilters || filters;

      try {
        const result = await TravelPackService.getTravelPacks(searchFilters);
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch travel packs'
        );
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<TravelPackFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      fetchPacks(updatedFilters);
    },
    [filters, fetchPacks]
  );

  const loadMore = useCallback(async () => {
    if (!data?.pagination.hasNext || loading) return;

    const nextPage = data.pagination.currentPage + 1;
    const newFilters = { ...filters, page: nextPage };

    try {
      const result = await TravelPackService.getTravelPacks(newFilters);
      setData(prev => ({
        ...result,
        items: [...(prev?.items || []), ...result.items],
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load more packs'
      );
    }
  }, [data, filters, loading]);

  useEffect(() => {
    fetchPacks();
  }, []);

  return {
    packs: data?.items || [],
    pagination: data?.pagination || null,
    loading,
    error,
    filters,
    updateFilters,
    loadMore,
    refetch: fetchPacks,
  };
}
```

---

## 🎨 React Components

### Guest Registration Form

```typescript
// components/guest/GuestRegistrationForm.tsx
import React, { useState } from 'react';
import { useGuest } from '../../hooks/useGuest';
import { CreateGuestRequest } from '../../types/api';

interface GuestRegistrationFormProps {
  onSuccess: (guest: Guest) => void;
  initialData?: Partial<CreateGuestRequest>;
}

export function GuestRegistrationForm({ onSuccess, initialData }: GuestRegistrationFormProps) {
  const [formData, setFormData] = useState<CreateGuestRequest>({
    email: initialData?.email || '',
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    locale: initialData?.locale || 'en',
    metadata: {
      source: 'web',
      userAgent: navigator.userAgent,
    },
  });

  const { createGuest, loading, error } = useGuest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const guest = await createGuest(formData);
      onSuccess(guest);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleChange = (field: keyof CreateGuestRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="guest-registration-form">
      <div className="form-group">
        <label htmlFor="fullName">Full Name *</label>
        <input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone *</label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="locale">Language</label>
        <select
          id="locale"
          value={formData.locale}
          onChange={(e) => handleChange('locale', e.target.value as 'en' | 'fr')}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Guest Session'}
      </button>
    </form>
  );
}
```

### Travel Pack Card

```typescript
// components/travel-packs/TravelPackCard.tsx
import React from 'react';
import { TravelPack } from '../../types/api';

interface TravelPackCardProps {
  pack: TravelPack;
  locale: 'en' | 'fr';
  onSelect: (packId: string) => void;
  onViewDetails: (packId: string) => void;
}

export function TravelPackCard({ pack, locale, onSelect, onViewDetails }: TravelPackCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div className="travel-pack-card">
      {pack.images?.[0] && (
        <div className="pack-image">
          <img
            src={pack.images[0].url}
            alt={pack.name[locale]}
          />
        </div>
      )}

      <div className="pack-content">
        <h3 className="pack-title">{pack.name[locale]}</h3>
        <p className="pack-description">{pack.description[locale]}</p>

        <div className="pack-details">
          <div className="duration">
            <span className="icon">📅</span>
            {pack.duration.days} days / {pack.duration.nights} nights
          </div>

          <div className="capacity">
            <span className="icon">👥</span>
            {pack.capacity.min}-{pack.capacity.max} people
          </div>

          <div className="difficulty">
            <span className="icon">⭐</span>
            {pack.difficulty}
          </div>

          <div className="location">
            <span className="icon">📍</span>
            {pack.location.region}
          </div>
        </div>

        {pack.highlights && pack.highlights.length > 0 && (
          <div className="pack-highlights">
            <h4>Highlights:</h4>
            <ul>
              {pack.highlights.slice(0, 3).map((highlight, index) => (
                <li key={index}>{highlight[locale]}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pack-footer">
          <div className="price">
            <span className="price-label">Starting from</span>
            <span className="price-value">
              {formatPrice(pack.price.base, pack.price.currency)}
            </span>
          </div>

          <div className="actions">
            <button
              className="btn btn-secondary"
              onClick={() => onViewDetails(pack._id)}
            >
              View Details
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onSelect(pack._id)}
              disabled={!pack.availability}
            >
              {pack.availability ? 'Select Pack' : 'Not Available'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Travel Pack List with Filters

```typescript
// components/travel-packs/TravelPackList.tsx
import React, { useState } from 'react';
import { useTravelPacks } from '../../hooks/useTravelPacks';
import { TravelPackCard } from './TravelPackCard';
import { TravelPackFilters } from './TravelPackFilters';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorAlert } from '../ui/ErrorAlert';

interface TravelPackListProps {
  locale: 'en' | 'fr';
  onPackSelect: (packId: string) => void;
}

export function TravelPackList({ locale, onPackSelect }: TravelPackListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const {
    packs,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    loadMore,
    refetch
  } = useTravelPacks({ locale, limit: 9 });

  const handleViewDetails = (packId: string) => {
    // Navigate to pack details page
    window.open(`/packs/${packId}`, '_blank');
  };

  if (loading && packs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="travel-pack-list">
      <div className="list-header">
        <div className="results-info">
          {pagination && (
            <p>
              Showing {packs.length} of {pagination.totalItems} travel packs
            </p>
          )}
        </div>

        <div className="list-controls">
          <button
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {showFilters && (
        <TravelPackFilters
          filters={filters}
          onFiltersChange={updateFilters}
          locale={locale}
        />
      )}

      {error && (
        <ErrorAlert
          error={error}
          onDismiss={() => refetch()}
        />
      )}

      {packs.length > 0 ? (
        <>
          <div className="pack-grid">
            {packs.map((pack) => (
              <TravelPackCard
                key={pack._id}
                pack={pack}
                locale={locale}
                onSelect={onPackSelect}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {pagination?.hasNext && (
            <div className="load-more">
              <button
                className="btn btn-outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <div className="no-results">
            <p>No travel packs found matching your criteria.</p>
            <button className="btn btn-primary" onClick={refetch}>
              Try Again
            </button>
          </div>
        )
      )}
    </div>
  );
}
```

---

## 📱 Next.js Pages

### Travel Packs Listing Page

```typescript
// pages/packs/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { TravelPackList } from '../../components/travel-packs/TravelPackList';
import { GuestSessionProvider } from '../../components/providers/GuestSessionProvider';

export default function TravelPacksPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<'en' | 'fr'>('en');

  useEffect(() => {
    // Get locale from URL or user preference
    const urlLocale = router.query.locale as string;
    if (urlLocale === 'fr' || urlLocale === 'en') {
      setLocale(urlLocale);
    }
  }, [router.query.locale]);

  const handlePackSelect = (packId: string) => {
    // Navigate to pack details or booking flow
    router.push(`/packs/${packId}/book`);
  };

  return (
    <>
      <Head>
        <title>Travel Packs - ExploreKG</title>
        <meta name="description" content="Discover amazing travel packages" />
      </Head>

      <GuestSessionProvider>
        <div className="packs-page">
          <header className="page-header">
            <h1>Travel Packs</h1>
            <div className="locale-switcher">
              <button
                className={locale === 'en' ? 'active' : ''}
                onClick={() => setLocale('en')}
              >
                English
              </button>
              <button
                className={locale === 'fr' ? 'active' : ''}
                onClick={() => setLocale('fr')}
              >
                Français
              </button>
            </div>
          </header>

          <main>
            <TravelPackList
              locale={locale}
              onPackSelect={handlePackSelect}
            />
          </main>
        </div>
      </GuestSessionProvider>
    </>
  );
}
```

### Travel Pack Details Page

```typescript
// pages/packs/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { TravelPackService } from '../../services/travelPackService';
import { DetailedPackResponse } from '../../types/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';

export default function TravelPackDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [pack, setPack] = useState<DetailedPackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<'en' | 'fr'>('en');

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPackDetails(id);
    }
  }, [id, locale]);

  const fetchPackDetails = async (packId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await TravelPackService.getDetailedTravelPack(packId, {
        step: 'full',
        locale,
      });
      setPack(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pack details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    router.push(`/packs/${id}/book`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-page">
        <ErrorAlert error={error} />
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="not-found">
        <h1>Travel Pack Not Found</h1>
        <button onClick={() => router.push('/packs')}>
          Browse All Packs
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pack.pack.name[locale]} - ExploreKG</title>
        <meta name="description" content={pack.pack.description[locale]} />
      </Head>

      <div className="pack-details-page">
        <div className="pack-hero">
          {pack.pack.images?.[0] && (
            <img
              src={pack.pack.images[0].url}
              alt={pack.pack.name[locale]}
              className="hero-image"
            />
          )}

          <div className="hero-content">
            <h1>{pack.pack.name[locale]}</h1>
            <p className="description">{pack.pack.description[locale]}</p>

            <div className="quick-info">
              <span>📅 {pack.pack.duration.days} days</span>
              <span>👥 {pack.pack.capacity.min}-{pack.pack.capacity.max} people</span>
              <span>⭐ {pack.pack.difficulty}</span>
              <span>📍 {pack.pack.location.region}</span>
            </div>
          </div>
        </div>

        <div className="pack-content">
          <div className="main-content">
            {/* Pack highlights */}
            {pack.pack.highlights && (
              <section className="highlights">
                <h2>Highlights</h2>
                <ul>
                  {pack.pack.highlights.map((highlight, index) => (
                    <li key={index}>{highlight[locale]}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Activities */}
            {pack.relations.activities.length > 0 && (
              <section className="activities">
                <h2>Included Activities</h2>
                <div className="activity-grid">
                  {pack.relations.activities.map((activity) => (
                    <div key={activity._id} className="activity-card">
                      <h3>{activity.name[locale]}</h3>
                      <p>{activity.description[locale]}</p>
                      <div className="activity-details">
                        <span>Duration: {activity.duration.hours}h</span>
                        <span>Difficulty: {activity.difficulty}</span>
                        {activity.relationData.discount > 0 && (
                          <span className="discount">
                            {activity.relationData.discount}% off
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cars */}
            {pack.relations.cars.length > 0 && (
              <section className="cars">
                <h2>Transportation Options</h2>
                <div className="car-grid">
                  {pack.relations.cars.map((car) => (
                    <div key={car._id} className="car-card">
                      <h3>{car.name[locale]}</h3>
                      <p>{car.description[locale]}</p>
                      <div className="car-details">
                        <span>Type: {car.type}</span>
                        <span>Seats: {car.capacity.seats}</span>
                        <span>Transmission: {car.transmission}</span>
                        {car.relationData.discount > 0 && (
                          <span className="discount">
                            {car.relationData.discount}% off
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="sidebar">
            <div className="pricing-card">
              <h3>Pricing</h3>
              <div className="price-breakdown">
                <div className="base-price">
                  <span>Base Price</span>
                  <span>${pack.pricing.packBasePrice}</span>
                </div>

                {pack.pricing.activitiesTotal > 0 && (
                  <div className="activities-price">
                    <span>Activities</span>
                    <span>${pack.pricing.activitiesTotal}</span>
                  </div>
                )}

                {pack.pricing.carsTotal > 0 && (
                  <div className="cars-price">
                    <span>Transportation</span>
                    <span>${pack.pricing.carsTotal}</span>
                  </div>
                )}

                {pack.pricing.discounts.length > 0 && (
                  <div className="discounts">
                    {pack.pricing.discounts.map((discount, index) => (
                      <div key={index} className="discount-item">
                        <span>{discount.type}</span>
                        <span className="discount-amount">
                          -${discount.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="total-price">
                  <span>Total</span>
                  <span>${pack.pricing.total} {pack.pricing.currency}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-large"
                onClick={handleBookNow}
                disabled={!pack.pack.availability}
              >
                {pack.pack.availability ? 'Book Now' : 'Not Available'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

---

## 🌐 Next.js API Routes

### Guest API Route

```typescript
// pages/api/guests/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GuestService } from '../../../services/guestService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'POST':
        const guest = await GuestService.createGuest(req.body);
        res.status(201).json({ success: true, data: guest });
        break;

      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        statusCode: 500,
      });
    }
  }
}
```

### Travel Packs API Route

```typescript
// pages/api/travel-packs/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { TravelPackService } from '../../../services/travelPackService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const filters = req.query;
        const packs = await TravelPackService.getTravelPacks(filters);
        res.status(200).json({ success: true, data: packs });
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch travel packs',
      statusCode: 500,
    });
  }
}
```

---

## 🔧 Context Providers

### Guest Session Provider

```typescript
// components/providers/GuestSessionProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGuest } from '../../hooks/useGuest';
import { Guest } from '../../types/api';

interface GuestSessionContextType {
  guest: Guest | null;
  loading: boolean;
  error: string | null;
  createGuestSession: (data: CreateGuestRequest) => Promise<Guest>;
  updateGuest: (updates: Partial<Guest>) => Promise<Guest | undefined>;
}

const GuestSessionContext = createContext<GuestSessionContextType | undefined>(undefined);

export function useGuestSession() {
  const context = useContext(GuestSessionContext);
  if (!context) {
    throw new Error('useGuestSession must be used within a GuestSessionProvider');
  }
  return context;
}

interface GuestSessionProviderProps {
  children: React.ReactNode;
}

export function GuestSessionProvider({ children }: GuestSessionProviderProps) {
  const [sessionId, setSessionId] = useState<string | undefined>();

  const { guest, loading, error, createGuest, updateGuest } = useGuest(sessionId);

  useEffect(() => {
    // Try to get existing session ID from localStorage
    const storedSessionId = localStorage.getItem('guestSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  const createGuestSession = async (data: CreateGuestRequest) => {
    const newGuest = await createGuest(data);
    setSessionId(newGuest.sessionId);
    return newGuest;
  };

  const value: GuestSessionContextType = {
    guest,
    loading,
    error,
    createGuestSession,
    updateGuest,
  };

  return (
    <GuestSessionContext.Provider value={value}>
      {children}
    </GuestSessionContext.Provider>
  );
}
```

---

## 📊 Performance Optimizations

### API Cache Hook

```typescript
// hooks/useApiCache.ts
import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (force = false) => {
      // Check cache first
      if (!force) {
        const cached = cache.get(key);
        if (cached && Date.now() < cached.expiry) {
          setData(cached.data);
          return cached.data;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();

        // Cache the result
        cache.set(key, {
          data: result,
          timestamp: Date.now(),
          expiry: Date.now() + ttl,
        });

        setData(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fetch failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [key, fetcher, ttl]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    clearCache: () => cache.delete(key),
  };
}
```

---

## 🧪 Testing Examples

### Service Testing

```typescript
// __tests__/services/guestService.test.ts
import { GuestService } from '../../services/guestService';
import { apiCall } from '../../services/api';

jest.mock('../../services/api');
const mockApiCall = apiCall as jest.MockedFunction<typeof apiCall>;

describe('GuestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGuest', () => {
    it('should create a guest successfully', async () => {
      const mockGuest = {
        _id: 'guest-id',
        sessionId: 'session-id',
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+123456789',
        locale: 'en' as const,
      };

      mockApiCall.mockResolvedValue({
        success: true,
        data: mockGuest,
      });

      const guestData = {
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+123456789',
        locale: 'en' as const,
      };

      const result = await GuestService.createGuest(guestData);

      expect(mockApiCall).toHaveBeenCalledWith('/v1/guests', {
        method: 'POST',
        body: JSON.stringify(guestData),
      });
      expect(result).toEqual(mockGuest);
    });
  });
});
```

### Component Testing

```typescript
// __tests__/components/TravelPackCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TravelPackCard } from '../../components/travel-packs/TravelPackCard';

const mockPack = {
  _id: 'pack-1',
  name: { en: 'Desert Adventure', fr: 'Aventure du Désert' },
  description: { en: 'Amazing desert experience', fr: 'Expérience incroyable du désert' },
  price: { base: 500, currency: 'USD' },
  duration: { days: 3, nights: 2 },
  capacity: { min: 2, max: 8 },
  difficulty: 'medium' as const,
  location: { region: 'Sahara' },
  availability: true,
  images: [{ url: '/test-image.jpg', type: 'image' as const }],
};

describe('TravelPackCard', () => {
  const mockOnSelect = jest.fn();
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pack information correctly', () => {
    render(
      <TravelPackCard
        pack={mockPack}
        locale="en"
        onSelect={mockOnSelect}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Desert Adventure')).toBeInTheDocument();
    expect(screen.getByText('Amazing desert experience')).toBeInTheDocument();
    expect(screen.getByText('3 days / 2 nights')).toBeInTheDocument();
    expect(screen.getByText('2-8 people')).toBeInTheDocument();
  });

  it('calls onSelect when select button is clicked', () => {
    render(
      <TravelPackCard
        pack={mockPack}
        locale="en"
        onSelect={mockOnSelect}
        onViewDetails={mockOnViewDetails}
      />
    );

    fireEvent.click(screen.getByText('Select Pack'));
    expect(mockOnSelect).toHaveBeenCalledWith('pack-1');
  });
});
```

---

## 📋 Best Practices Summary

### ✅ API Integration

- [ ] Use consistent error handling across all API calls
- [ ] Implement proper loading states
- [ ] Cache frequently requested data
- [ ] Handle network failures gracefully
- [ ] Use TypeScript for type safety

### ✅ React Components

- [ ] Keep components focused and reusable
- [ ] Use custom hooks for complex state logic
- [ ] Implement proper error boundaries
- [ ] Test components thoroughly
- [ ] Follow accessibility guidelines

### ✅ Performance

- [ ] Implement data caching where appropriate
- [ ] Use lazy loading for large lists
- [ ] Optimize images and assets
- [ ] Minimize unnecessary re-renders
- [ ] Use React.memo for expensive components

---

**🔗 Related Resources:**

- [API Quick Reference](./api-quick-reference.md)
- [TypeScript Interfaces](./typescript-interfaces.md)
- [Error Handling Guide](./error-handling.md)
- [Testing Guide](./testing-guide.md)
