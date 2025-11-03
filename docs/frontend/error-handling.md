# 🚨 Error Handling Guide

**دليل شامل للتعامل مع الأخطاء في ExploreKG APIs**

---

## 📋 نظرة عامة

هذا الدليل يوضح كيفية التعامل مع الأخطاء بشكل محترف في Frontend عند استهلاك ExploreKG Server APIs.

---

## 🎯 هيكل الاستجابة للأخطاء

### Standard Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  error: string; // Error message
  message?: string; // Additional details
  statusCode: number; // HTTP status code
  timestamp: string; // ISO timestamp
  path?: string; // API endpoint path
}
```

### مثال على Error Response

```json
{
  "success": false,
  "error": "Guest not found",
  "message": "No guest found with sessionId: invalid-session-id",
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/guests/invalid-session-id"
}
```

---

## 📊 HTTP Status Codes

### Success Codes

| Code  | Meaning | Usage                              |
| ----- | ------- | ---------------------------------- |
| `200` | OK      | Successful GET, PATCH, DELETE      |
| `201` | Created | Successful POST (resource created) |

### Client Error Codes

| Code  | Meaning              | Common Causes                                   |
| ----- | -------------------- | ----------------------------------------------- |
| `400` | Bad Request          | Invalid request body, missing required fields   |
| `401` | Unauthorized         | Invalid or missing authentication               |
| `403` | Forbidden            | Insufficient permissions                        |
| `404` | Not Found            | Resource doesn't exist                          |
| `409` | Conflict             | Duplicate resource (e.g., email already exists) |
| `422` | Unprocessable Entity | Validation errors                               |
| `429` | Too Many Requests    | Rate limit exceeded                             |

### Server Error Codes

| Code  | Meaning               | Common Causes          |
| ----- | --------------------- | ---------------------- |
| `500` | Internal Server Error | Server-side error      |
| `502` | Bad Gateway           | Upstream service error |
| `503` | Service Unavailable   | Server maintenance     |
| `504` | Gateway Timeout       | Request timeout        |

---

## 🛠️ Error Handling Implementation

### Basic Error Handler

```typescript
// utils/errorHandler.ts
export class ApiError extends Error {
  statusCode: number;
  timestamp: string;
  path?: string;

  constructor(message: string, statusCode: number = 500, path?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

export function handleApiError(response: Response, data: any): never {
  const error = new ApiError(
    data.error || 'API request failed',
    response.status,
    data.path
  );

  // Add additional error details
  if (data.message) {
    error.message += `: ${data.message}`;
  }

  throw error;
}
```

### Enhanced API Call with Error Handling

```typescript
// utils/api.ts
import { ApiError, handleApiError } from './errorHandler';

interface ApiCallOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export async function apiCall<T>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout = 10000, retries = 3, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
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
        handleApiError(response, data);
      }

      return data;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (
        error instanceof ApiError &&
        error.statusCode >= 400 &&
        error.statusCode < 500
      ) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  clearTimeout(timeoutId);
  throw lastError!;
}
```

---

## 🎯 Error Types & Handling Strategies

### 1. Validation Errors (400/422)

```typescript
// Handle validation errors
async function createGuest(data: CreateGuestRequest) {
  try {
    const response = await apiCall('/v1/guests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 400) {
      // Show validation errors to user
      throw new Error(`Validation failed: ${error.message}`);
    }
    throw error;
  }
}
```

### 2. Not Found Errors (404)

```typescript
// Handle not found gracefully
async function getGuest(sessionId: string) {
  try {
    const response = await apiCall(`/v1/guests/${sessionId}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      // Return null or redirect to create guest
      return null;
    }
    throw error;
  }
}
```

### 3. Rate Limiting (429)

```typescript
// Handle rate limiting with retry
async function apiCallWithRateLimit<T>(
  endpoint: string,
  options?: ApiCallOptions
) {
  try {
    return await apiCall<T>(endpoint, options);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 429) {
      // Get retry-after header or use default delay
      const retryAfter = 60; // seconds

      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

      // Retry once after rate limit
      return await apiCall<T>(endpoint, options);
    }
    throw error;
  }
}
```

### 4. Server Errors (5xx)

```typescript
// Handle server errors with fallback
async function getTravelPacksWithFallback(filters: TravelPackFilters) {
  try {
    return await apiCall('/v1/travel-packs', {
      method: 'GET',
      // Add query params
    });
  } catch (error) {
    if (error instanceof ApiError && error.statusCode >= 500) {
      // Log error and return cached data or show offline message
      console.error('Server error:', error);

      // Try to get cached data
      const cached = getCachedTravelPacks();
      if (cached) {
        return { success: true, data: cached, fromCache: true };
      }

      // Show user-friendly message
      throw new Error(
        'Service temporarily unavailable. Please try again later.'
      );
    }
    throw error;
  }
}
```

---

## 🎨 React Error Boundary

### Error Boundary Component

```typescript
// components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Log to error tracking service
    // logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Default error fallback
function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );
}
```

---

## 🪝 React Hooks for Error Handling

### useApiCall Hook

```typescript
// hooks/useApiCall.ts
import { useState, useCallback } from 'react';
import { ApiError } from '../utils/errorHandler';

interface UseApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiCall<T>() {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiCall();
        setState({
          data: response.data || null,
          loading: false,
          error: null,
        });
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : 'An unexpected error occurred';

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
```

### useGuest Hook with Error Handling

```typescript
// hooks/useGuest.ts
import { useEffect } from 'react';
import { useApiCall } from './useApiCall';
import { Guest } from '../types/api';

export function useGuest(sessionId: string) {
  const { data: guest, loading, error, execute } = useApiCall<Guest>();

  useEffect(() => {
    if (sessionId) {
      execute(() => apiCall(`/v1/guests/${sessionId}`));
    }
  }, [sessionId, execute]);

  const updateGuest = async (updates: Partial<Guest>) => {
    return execute(() =>
      apiCall(`/v1/guests/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
    );
  };

  return {
    guest,
    loading,
    error,
    updateGuest,
  };
}
```

---

## 🎯 Context-Specific Error Handling

### Guest System Errors

```typescript
// utils/guestErrors.ts
export function handleGuestError(error: ApiError): string {
  switch (error.statusCode) {
    case 400:
      if (error.message.includes('email')) {
        return 'Please provide a valid email address';
      }
      if (error.message.includes('phone')) {
        return 'Please provide a valid phone number';
      }
      return 'Please check your input and try again';

    case 404:
      return 'Guest session not found. Please create a new session';

    case 409:
      return 'This email is already in use';

    default:
      return 'Unable to process guest request. Please try again';
  }
}
```

### Booking System Errors

```typescript
// utils/bookingErrors.ts
export function handleBookingError(error: ApiError): string {
  switch (error.statusCode) {
    case 400:
      if (error.message.includes('guestId')) {
        return 'Invalid guest session. Please refresh and try again';
      }
      if (error.message.includes('date')) {
        return 'Please select valid dates for your booking';
      }
      return 'Please check your booking details';

    case 404:
      if (error.message.includes('pack')) {
        return 'Travel pack not found';
      }
      return 'Requested resource not found';

    case 409:
      return 'This booking conflicts with existing reservations';

    case 422:
      return 'Booking validation failed. Please check all required fields';

    default:
      return 'Unable to create booking. Please try again';
  }
}
```

---

## 🌐 Network Error Handling

### Offline Detection

```typescript
// hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Network-Aware API Calls

```typescript
// utils/networkAwareApi.ts
export async function networkAwareApiCall<T>(
  endpoint: string,
  options?: ApiCallOptions
): Promise<ApiResponse<T>> {
  if (!navigator.onLine) {
    throw new Error(
      'No internet connection. Please check your network and try again.'
    );
  }

  try {
    return await apiCall<T>(endpoint, options);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Network error. Please check your connection and try again.'
      );
    }
    throw error;
  }
}
```

---

## 📱 User-Friendly Error Messages

### Error Message Mapping

```typescript
// utils/userFriendlyErrors.ts
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  NetworkError: 'Please check your internet connection',
  TimeoutError: 'Request timed out. Please try again',

  // Validation errors
  ValidationError: 'Please check your input',
  'Required field missing': 'Please fill in all required fields',

  // Authentication errors
  Unauthorized: 'Please log in to continue',
  Forbidden: "You don't have permission to perform this action",

  // Resource errors
  'Not found': 'The requested item could not be found',
  'Already exists': 'This item already exists',

  // Server errors
  'Server error': 'Something went wrong on our end. Please try again',
  'Service unavailable': 'Service is temporarily unavailable',
};

export function getUserFriendlyMessage(error: Error | ApiError): string {
  if (error instanceof ApiError) {
    // Check for specific error patterns
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
        return message;
      }
    }

    // Default messages by status code
    switch (error.statusCode) {
      case 400:
        return 'Please check your input and try again';
      case 404:
        return 'The requested item was not found';
      case 429:
        return 'Too many requests. Please wait a moment and try again';
      case 500:
        return 'Something went wrong. Please try again later';
      default:
        return error.message;
    }
  }

  return ERROR_MESSAGES[error.message] || 'An unexpected error occurred';
}
```

---

## 🧪 Error Handling Components

### Error Alert Component

```typescript
// components/ErrorAlert.tsx
interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorAlert({ error, onDismiss, variant = 'error' }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className={`alert alert-${variant}`}>
      <span>{error}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="alert-close">
          ×
        </button>
      )}
    </div>
  );
}
```

### Loading State with Error

```typescript
// components/LoadingState.tsx
interface LoadingStateProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
  onRetry?: () => void;
}

export function LoadingState({ loading, error, children, onRetry }: LoadingStateProps) {
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        {onRetry && (
          <button onClick={onRetry}>Try Again</button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## 📊 Error Logging & Monitoring

### Error Logger

```typescript
// utils/errorLogger.ts
interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];

  log(
    level: ErrorLogEntry['level'],
    message: string,
    error?: Error,
    context?: Record<string, any>
  ) {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      stack: error?.stack,
      context,
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
    };

    this.logs.push(entry);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(entry);
    } else {
      console[level]('Error logged:', entry);
    }
  }

  private async sendToMonitoring(entry: ErrorLogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send error log:', error);
    }
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();
```

---

## 📋 Error Handling Checklist

### ✅ Development Phase

- [ ] Implement basic error handling for all API calls
- [ ] Create user-friendly error messages
- [ ] Add loading states and error boundaries
- [ ] Test error scenarios (network failures, validation errors)
- [ ] Implement retry logic for transient errors

### ✅ Testing Phase

- [ ] Test all error status codes (400, 404, 500, etc.)
- [ ] Verify error messages are user-friendly
- [ ] Test offline/online scenarios
- [ ] Verify error logging works correctly
- [ ] Test error recovery mechanisms

### ✅ Production Phase

- [ ] Set up error monitoring service
- [ ] Configure error alerting
- [ ] Monitor error rates and patterns
- [ ] Review and improve error messages based on user feedback
- [ ] Implement gradual error recovery

---

## 🔗 Related Resources

- [API Quick Reference](./api-quick-reference.md)
- [TypeScript Interfaces](./typescript-interfaces.md)
- [Integration Examples](./integration-examples.md)
- [Testing Guide](./testing-guide.md)

---

**💡 Best Practices:**

1. Always handle errors gracefully
2. Provide clear, actionable error messages
3. Implement proper retry logic
4. Log errors for debugging
5. Test error scenarios thoroughly
