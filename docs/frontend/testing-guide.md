# 🧪 Testing Guide

**دليل شامل لاختبار تكامل ExploreKG APIs في Frontend**

---

## 📋 نظرة عامة

هذا الدليل يغطي كيفية اختبار تكامل APIs بشكل شامل في تطبيقات React/Next.js، من Unit Tests إلى Integration Tests وحتى E2E Testing.

---

## 🛠️ Test Setup

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Jest Setup File

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch for Node.js environment
if (typeof window === 'undefined') {
  global.fetch = require('jest-fetch-mock');
}

// MSW setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 🎯 API Mocking with MSW

### Mock Server Setup

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### API Handlers

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';
import { Guest, TravelPack, Booking } from '../types/api';

const API_BASE_URL = 'http://localhost:4000/api';

export const handlers = [
  // Guest endpoints
  rest.post(`${API_BASE_URL}/v1/guests`, (req, res, ctx) => {
    const guestData = req.body as any;

    const guest: Guest = {
      _id: 'mock-guest-id',
      sessionId: 'mock-session-id',
      email: guestData.email,
      fullName: guestData.fullName,
      phone: guestData.phone,
      locale: guestData.locale,
      metadata: guestData.metadata || {},
      canMigrate: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: guest,
      })
    );
  }),

  rest.get(`${API_BASE_URL}/v1/guests/:sessionId`, (req, res, ctx) => {
    const { sessionId } = req.params;

    if (sessionId === 'not-found') {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Guest not found',
          statusCode: 404,
        })
      );
    }

    const guest: Guest = {
      _id: 'mock-guest-id',
      sessionId: sessionId as string,
      email: 'test@example.com',
      fullName: 'Test User',
      phone: '+123456789',
      locale: 'en',
      metadata: {},
      canMigrate: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: guest,
      })
    );
  }),

  // Travel Packs endpoints
  rest.get(`${API_BASE_URL}/v1/travel-packs`, (req, res, ctx) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const locale = url.searchParams.get('locale') || 'en';

    const mockPacks: TravelPack[] = Array.from({ length: 5 }, (_, i) => ({
      _id: `pack-${i + 1}`,
      localeGroupId: `pack-${i + 1}`,
      name: {
        en: `Travel Pack ${i + 1}`,
        fr: `Pack de Voyage ${i + 1}`,
      },
      description: {
        en: `Amazing travel experience ${i + 1}`,
        fr: `Expérience de voyage incroyable ${i + 1}`,
      },
      slug: `travel-pack-${i + 1}`,
      price: {
        base: 500 + i * 100,
        currency: 'USD',
      },
      duration: {
        days: 3 + i,
        nights: 2 + i,
      },
      capacity: {
        min: 2,
        max: 8,
      },
      images: [
        {
          url: `/images/pack-${i + 1}.jpg`,
          type: 'image',
          isPrimary: true,
        },
      ],
      highlights: [{ en: `Highlight ${i + 1}`, fr: `Point Fort ${i + 1}` }],
      includes: [{ en: `Include ${i + 1}`, fr: `Inclus ${i + 1}` }],
      location: {
        region: `Region ${i + 1}`,
        city: `City ${i + 1}`,
      },
      difficulty: 'medium' as const,
      category: ['adventure'],
      tags: [`tag-${i + 1}`],
      availability: true,
      status: 'published' as const,
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          items: mockPacks,
          pagination: {
            currentPage: page,
            totalPages: 2,
            totalItems: 10,
            hasNext: page < 2,
            hasPrev: page > 1,
            limit,
          },
        },
      })
    );
  }),

  rest.get(`${API_BASE_URL}/v1/travel-packs/:id`, (req, res, ctx) => {
    const { id } = req.params;

    if (id === 'not-found') {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Travel pack not found',
          statusCode: 404,
        })
      );
    }

    const pack: TravelPack = {
      _id: id as string,
      localeGroupId: id as string,
      name: {
        en: 'Desert Adventure',
        fr: 'Aventure du Désert',
      },
      description: {
        en: 'Amazing desert experience',
        fr: 'Expérience incroyable du désert',
      },
      slug: 'desert-adventure',
      price: {
        base: 500,
        currency: 'USD',
      },
      duration: {
        days: 3,
        nights: 2,
      },
      capacity: {
        min: 2,
        max: 8,
      },
      images: [
        {
          url: '/images/desert.jpg',
          type: 'image',
          isPrimary: true,
        },
      ],
      highlights: [
        { en: 'Camel riding', fr: 'Promenade à dos de chameau' },
        { en: 'Desert camping', fr: 'Camping dans le désert' },
      ],
      includes: [
        { en: 'All meals', fr: 'Tous les repas' },
        { en: 'Transportation', fr: 'Transport' },
      ],
      location: {
        region: 'Sahara',
        city: 'Merzouga',
      },
      difficulty: 'medium',
      category: ['adventure', 'desert'],
      tags: ['desert', 'camel', 'camping'],
      availability: true,
      status: 'published',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: pack,
      })
    );
  }),

  // Booking endpoints
  rest.post(`${API_BASE_URL}/v1/bookings`, (req, res, ctx) => {
    const bookingData = req.body as any;

    const booking: Booking = {
      _id: 'mock-booking-id',
      bookingNumber: 'BK-001',
      guestId: bookingData.guestId,
      status: 'pending',
      paymentStatus: 'unpaid',
      bookingType: bookingData.item.type,
      itemSnapshot: {
        itemType: bookingData.item.type,
        itemId: bookingData.item.id,
        title: 'Mock Travel Pack',
        pricePerPerson: 500,
        currency: 'USD',
        locale: bookingData.locale,
      },
      bookingDetails: bookingData.bookingDetails,
      contactInfo: bookingData.contactInfo,
      pricing: {
        subtotal: 500,
        discounts: [],
        total: 500,
        currency: 'USD',
      },
      locale: bookingData.locale,
      source: 'web',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: booking,
      })
    );
  }),

  // Error simulation
  rest.get(`${API_BASE_URL}/v1/error-test`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: 'Internal server error',
        statusCode: 500,
      })
    );
  }),
];
```

---

## 🧪 Unit Tests

### API Service Tests

```typescript
// __tests__/services/guestService.test.ts
import { GuestService } from '../../src/services/guestService';
import { ApiError } from '../../src/utils/errors';

describe('GuestService', () => {
  describe('createGuest', () => {
    it('should create a guest successfully', async () => {
      const guestData = {
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+123456789',
        locale: 'en' as const,
      };

      const guest = await GuestService.createGuest(guestData);

      expect(guest).toMatchObject({
        email: guestData.email,
        fullName: guestData.fullName,
        phone: guestData.phone,
        locale: guestData.locale,
      });
      expect(guest._id).toBeDefined();
      expect(guest.sessionId).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        email: 'invalid-email',
        fullName: '',
        phone: '',
        locale: 'en' as const,
      };

      await expect(GuestService.createGuest(invalidData)).rejects.toThrow();
    });
  });

  describe('getGuest', () => {
    it('should return guest when found', async () => {
      const guest = await GuestService.getGuest('valid-session-id');

      expect(guest).toBeTruthy();
      expect(guest?.sessionId).toBe('valid-session-id');
    });

    it('should return null when guest not found', async () => {
      const guest = await GuestService.getGuest('not-found');

      expect(guest).toBeNull();
    });
  });
});
```

### Custom Hook Tests

```typescript
// __tests__/hooks/useGuest.test.ts
import { renderHook, act } from '@testing-library/react';
import { useGuest } from '../../src/hooks/useGuest';

describe('useGuest', () => {
  it('should fetch guest on mount', async () => {
    const { result } = renderHook(() => useGuest('test-session-id'));

    expect(result.current.loading).toBe(true);
    expect(result.current.guest).toBeNull();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.guest).toBeTruthy();
    expect(result.current.error).toBeNull();
  });

  it('should handle guest creation', async () => {
    const { result } = renderHook(() => useGuest());

    const guestData = {
      email: 'test@example.com',
      fullName: 'Test User',
      phone: '+123456789',
      locale: 'en' as const,
    };

    await act(async () => {
      await result.current.createGuest(guestData);
    });

    expect(result.current.guest).toMatchObject(guestData);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useGuest('invalid-session'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.guest).toBeNull();
    expect(result.current.error).toBeTruthy();
  });
});
```

---

## 🎨 Component Tests

### Travel Pack Card Test

```typescript
// __tests__/components/TravelPackCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TravelPackCard } from '../../src/components/travel-packs/TravelPackCard';
import { TravelPack } from '../../src/types/api';

const mockPack: TravelPack = {
  _id: 'pack-1',
  localeGroupId: 'pack-1',
  name: { en: 'Desert Adventure', fr: 'Aventure du Désert' },
  description: { en: 'Amazing desert experience', fr: 'Expérience incroyable' },
  slug: 'desert-adventure',
  price: { base: 500, currency: 'USD' },
  duration: { days: 3, nights: 2 },
  capacity: { min: 2, max: 8 },
  images: [{ url: '/test-image.jpg', type: 'image', isPrimary: true }],
  highlights: [{ en: 'Camel riding', fr: 'Promenade à dos de chameau' }],
  includes: [{ en: 'All meals', fr: 'Tous les repas' }],
  location: { region: 'Sahara', city: 'Merzouga' },
  difficulty: 'medium',
  category: ['adventure'],
  tags: ['desert'],
  availability: true,
  status: 'published',
  createdBy: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
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
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('Sahara')).toBeInTheDocument();
  });

  it('displays French content when locale is fr', () => {
    render(
      <TravelPackCard
        pack={mockPack}
        locale="fr"
        onSelect={mockOnSelect}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Aventure du Désert')).toBeInTheDocument();
    expect(screen.getByText('Expérience incroyable')).toBeInTheDocument();
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

  it('calls onViewDetails when view details button is clicked', () => {
    render(
      <TravelPackCard
        pack={mockPack}
        locale="en"
        onSelect={mockOnSelect}
        onViewDetails={mockOnViewDetails}
      />
    );

    fireEvent.click(screen.getByText('View Details'));
    expect(mockOnViewDetails).toHaveBeenCalledWith('pack-1');
  });

  it('disables select button when pack is not available', () => {
    const unavailablePack = { ...mockPack, availability: false };

    render(
      <TravelPackCard
        pack={unavailablePack}
        locale="en"
        onSelect={mockOnSelect}
        onViewDetails={mockOnViewDetails}
      />
    );

    const selectButton = screen.getByText('Not Available');
    expect(selectButton).toBeDisabled();
  });

  it('formats price correctly', () => {
    render(
      <TravelPackCard
        pack={mockPack}
        locale="en"
        onSelect={mockOnSelect}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText(/\$500/)).toBeInTheDocument();
  });

  it('renders highlights when available', () => {
    render(
      <TravelPackCard
        pack={mockPack}
        locale="en"
        onSelect={mockOnSelect}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Highlights:')).toBeInTheDocument();
    expect(screen.getByText('Camel riding')).toBeInTheDocument();
  });
});
```

### Guest Registration Form Test

```typescript
// __tests__/components/GuestRegistrationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestRegistrationForm } from '../../src/components/guest/GuestRegistrationForm';

// Mock the useGuest hook
jest.mock('../../src/hooks/useGuest', () => ({
  useGuest: () => ({
    createGuest: jest.fn().mockResolvedValue({
      _id: 'guest-id',
      sessionId: 'session-id',
      email: 'test@example.com',
      fullName: 'Test User',
      phone: '+123456789',
      locale: 'en',
    }),
    loading: false,
    error: null,
  }),
}));

describe('GuestRegistrationForm', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<GuestRegistrationForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create guest session/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<GuestRegistrationForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /create guest session/i });
    await user.click(submitButton);

    // Check that form validation prevents submission
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<GuestRegistrationForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+123456789');
    await user.selectOptions(screen.getByLabelText(/language/i), 'en');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create guest session/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          fullName: 'Test User',
          phone: '+123456789',
          locale: 'en',
        })
      );
    });
  });

  it('displays initial data when provided', () => {
    const initialData = {
      email: 'initial@example.com',
      fullName: 'Initial User',
      phone: '+987654321',
      locale: 'fr' as const,
    };

    render(
      <GuestRegistrationForm
        onSuccess={mockOnSuccess}
        initialData={initialData}
      />
    );

    expect(screen.getByDisplayValue('initial@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+987654321')).toBeInTheDocument();
    expect(screen.getByDisplayValue('fr')).toBeInTheDocument();
  });
});
```

---

## 🔗 Integration Tests

### API Integration Test

```typescript
// __tests__/integration/api.integration.test.ts
import { apiCall } from '../../src/services/api';
import { server } from '../../src/mocks/server';
import { rest } from 'msw';

describe('API Integration', () => {
  it('should handle successful API calls', async () => {
    const response = await apiCall('/v1/guests/test-session-id');

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.sessionId).toBe('test-session-id');
  });

  it('should handle API errors correctly', async () => {
    await expect(apiCall('/v1/guests/not-found')).rejects.toThrow(
      'Guest not found'
    );
  });

  it('should handle network errors', async () => {
    server.use(
      rest.get('*', (req, res, ctx) => {
        return res.networkError('Failed to connect');
      })
    );

    await expect(apiCall('/v1/guests/test')).rejects.toThrow('Network error');
  });

  it('should handle timeout errors', async () => {
    server.use(
      rest.get('*', (req, res, ctx) => {
        return res(ctx.delay('infinite'));
      })
    );

    await expect(apiCall('/v1/guests/test', { timeout: 100 })).rejects.toThrow(
      'Request timeout'
    );
  });

  it('should retry on server errors', async () => {
    let attempts = 0;
    server.use(
      rest.get('*', (req, res, ctx) => {
        attempts++;
        if (attempts < 3) {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }));
        }
        return res(ctx.json({ success: true, data: { test: true } }));
      })
    );

    const response = await apiCall('/v1/test', { retries: 3 });
    expect(response.success).toBe(true);
    expect(attempts).toBe(3);
  });
});
```

### Complete User Journey Test

```typescript
// __tests__/integration/userJourney.integration.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingJourney } from '../../src/components/booking/BookingJourney';

describe('Complete Booking Journey', () => {
  it('should complete full booking flow', async () => {
    const user = userEvent.setup();
    render(<BookingJourney />);

    // Step 1: Create guest session
    expect(screen.getByText(/create guest session/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+123456789');
    await user.click(screen.getByRole('button', { name: /create guest session/i }));

    // Wait for guest creation
    await waitFor(() => {
      expect(screen.getByText(/travel packs/i)).toBeInTheDocument();
    });

    // Step 2: Select travel pack
    const packCards = screen.getAllByText(/select pack/i);
    await user.click(packCards[0]);

    // Wait for pack details
    await waitFor(() => {
      expect(screen.getByText(/book now/i)).toBeInTheDocument();
    });

    // Step 3: Fill booking details
    await user.type(screen.getByLabelText(/start date/i), '2024-12-15');
    await user.type(screen.getByLabelText(/end date/i), '2024-12-18');
    await user.type(screen.getByLabelText(/participants/i), '2');

    // Step 4: Submit booking
    await user.click(screen.getByRole('button', { name: /book now/i }));

    // Wait for booking confirmation
    await waitFor(() => {
      expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument();
    });

    // Verify booking number is displayed
    expect(screen.getByText(/BK-001/)).toBeInTheDocument();
  });

  it('should handle booking errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock booking failure
    server.use(
      rest.post('*/v1/bookings', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            success: false,
            error: 'Invalid booking data',
            statusCode: 400,
          })
        );
      })
    );

    render(<BookingJourney />);

    // Complete steps leading to booking
    // ... (same steps as above)

    // Submit booking
    await user.click(screen.getByRole('button', { name: /book now/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid booking data/i)).toBeInTheDocument();
    });

    // Verify user can retry
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
```

---

## 🌐 E2E Tests with Playwright

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example

```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should complete booking successfully', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Create guest session
    await page.click('text=Get Started');
    await page.fill('[data-testid=fullName]', 'John Doe');
    await page.fill('[data-testid=email]', 'john@example.com');
    await page.fill('[data-testid=phone]', '+123456789');
    await page.click('button:text("Create Guest Session")');

    // Wait for travel packs page
    await expect(page.locator('h1:text("Travel Packs")')).toBeVisible();

    // Select first travel pack
    await page.click('[data-testid=pack-card]:first-child >> text=Select Pack');

    // Verify pack details page
    await expect(page.locator('[data-testid=pack-details]')).toBeVisible();

    // Fill booking form
    await page.fill('[data-testid=startDate]', '2024-12-15');
    await page.fill('[data-testid=endDate]', '2024-12-18');
    await page.fill('[data-testid=participants]', '2');
    await page.fill('[data-testid=specialRequests]', 'Vegetarian meals');

    // Submit booking
    await page.click('button:text("Book Now")');

    // Wait for confirmation
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();
    await expect(page.locator('[data-testid=booking-number]')).toBeVisible();

    // Verify booking details
    const bookingNumber = await page.textContent(
      '[data-testid=booking-number]'
    );
    expect(bookingNumber).toMatch(/BK-\d+/);
  });

  test('should handle validation errors', async ({ page }) => {
    await page.goto('/booking');

    // Try to submit without required fields
    await page.click('button:text("Create Booking")');

    // Check for validation messages
    await expect(page.locator('text=Full name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Phone is required')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/v1/bookings', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Server error',
          statusCode: 500,
        }),
      });
    });

    await page.goto('/booking');

    // Fill form and submit
    await page.fill('[data-testid=fullName]', 'John Doe');
    await page.fill('[data-testid=email]', 'john@example.com');
    await page.fill('[data-testid=phone]', '+123456789');
    await page.click('button:text("Create Booking")');

    // Check error handling
    await expect(page.locator('text=Server error')).toBeVisible();
    await expect(page.locator('button:text("Try Again")')).toBeVisible();
  });
});
```

---

## 🎯 Performance Testing

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: 'Guest Creation Flow'
    weight: 40
    flow:
      - post:
          url: '/api/v1/guests'
          json:
            email: 'test{{ $randomString() }}@example.com'
            fullName: 'Test User {{ $randomString() }}'
            phone: '+123456789'
            locale: 'en'
      - get:
          url: '/api/v1/travel-packs?locale=en&limit=10'

  - name: 'Travel Pack Browse'
    weight: 60
    flow:
      - get:
          url: '/api/v1/travel-packs?locale=en&page={{ $randomInt(1, 5) }}'
      - get:
          url: '/api/v1/travel-packs/pack-{{ $randomInt(1, 10) }}'
```

### React Component Performance Test

```typescript
// __tests__/performance/travelPackList.perf.test.tsx
import { render } from '@testing-library/react';
import { TravelPackList } from '../../src/components/travel-packs/TravelPackList';

describe('TravelPackList Performance', () => {
  it('should render large list efficiently', () => {
    const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
      _id: `pack-${i}`,
      name: { en: `Pack ${i}`, fr: `Pack ${i}` },
      // ... other pack properties
    }));

    const startTime = performance.now();

    render(
      <TravelPackList
        packs={largeMockData}
        locale="en"
        onPackSelect={jest.fn()}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Expect render time to be under 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('should handle frequent re-renders efficiently', () => {
    const { rerender } = render(
      <TravelPackList
        packs={[]}
        locale="en"
        onPackSelect={jest.fn()}
      />
    );

    const startTime = performance.now();

    // Simulate 100 rapid re-renders
    for (let i = 0; i < 100; i++) {
      rerender(
        <TravelPackList
          packs={[]}
          locale="en"
          onPackSelect={jest.fn()}
        />
      );
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Expect total time for 100 re-renders to be under 200ms
    expect(totalTime).toBeLessThan(200);
  });
});
```

---

## 📊 Test Coverage & Reporting

### Coverage Configuration

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Coverage Report Script

```typescript
// scripts/test-report.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface CoverageReport {
  total: {
    lines: { pct: number };
    functions: { pct: number };
    statements: { pct: number };
    branches: { pct: number };
  };
}

function generateTestReport() {
  console.log('🧪 Running test suite...');

  // Run tests with coverage
  execSync('npm run test:ci', { stdio: 'inherit' });

  // Read coverage report
  const coveragePath = path.join(
    __dirname,
    '../coverage/coverage-summary.json'
  );
  const coverage: CoverageReport = JSON.parse(
    fs.readFileSync(coveragePath, 'utf8')
  );

  console.log('\n📊 Coverage Report:');
  console.log(`Lines: ${coverage.total.lines.pct}%`);
  console.log(`Functions: ${coverage.total.functions.pct}%`);
  console.log(`Statements: ${coverage.total.statements.pct}%`);
  console.log(`Branches: ${coverage.total.branches.pct}%`);

  // Check if coverage meets thresholds
  const thresholds = { lines: 80, functions: 80, statements: 80, branches: 80 };
  const failures = [];

  Object.entries(thresholds).forEach(([key, threshold]) => {
    const actual = coverage.total[key as keyof typeof coverage.total].pct;
    if (actual < threshold) {
      failures.push(`${key}: ${actual}% < ${threshold}%`);
    }
  });

  if (failures.length > 0) {
    console.error('\n❌ Coverage thresholds not met:');
    failures.forEach(failure => console.error(`  - ${failure}`));
    process.exit(1);
  } else {
    console.log('\n✅ All coverage thresholds met!');
  }
}

generateTestReport();
```

---

## 📋 Testing Checklist

### ✅ Unit Tests

- [ ] All API service functions tested
- [ ] Custom hooks tested with various scenarios
- [ ] Utility functions tested with edge cases
- [ ] Error handling tested thoroughly
- [ ] TypeScript types validated

### ✅ Component Tests

- [ ] All components render correctly
- [ ] User interactions work as expected
- [ ] Props are handled properly
- [ ] Error states are displayed correctly
- [ ] Accessibility requirements met

### ✅ Integration Tests

- [ ] API integration works end-to-end
- [ ] User journeys complete successfully
- [ ] Error scenarios handled gracefully
- [ ] State management works correctly
- [ ] Navigation flows tested

### ✅ E2E Tests

- [ ] Critical user paths tested
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness tested
- [ ] Performance benchmarks met
- [ ] Accessibility standards verified

### ✅ Performance Tests

- [ ] API response times acceptable
- [ ] Component render times optimized
- [ ] Memory leaks identified and fixed
- [ ] Bundle size within limits
- [ ] Load testing completed

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:ci

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            test-results/
```

---

**🔗 Related Resources:**

- [API Quick Reference](./api-quick-reference.md)
- [TypeScript Interfaces](./typescript-interfaces.md)
- [Integration Examples](./integration-examples.md)
- [Error Handling Guide](./error-handling.md)

---

**💡 Testing Best Practices:**

1. Write tests before implementing features (TDD)
2. Keep tests focused and isolated
3. Mock external dependencies
4. Test error scenarios thoroughly
5. Maintain high test coverage (>80%)
6. Run tests in CI/CD pipeline
7. Use descriptive test names
8. Test user journeys, not just units
