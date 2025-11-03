// // 🎣 ExploreKG Server - React Hooks للتكامل السهل
// // استخدم هذه الـHooks في مكونات React للتفاعل مع API

// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   Guest,
//   Booking,
//   TravelPack,
//   Activity,
//   Car,
//   CreateGuestRequest,
//   UpdateGuestRequest,
//   CreateBookingRequest,
//   PaymentRequest,
//   TravelPackFilters,
//   ActivityFilters,
//   CarFilters,
//   PaginatedResponse,
//   APIResponse,
//   SecurityStatus,
//   SystemHealth,
//   UseExploreKGReturn,
// } from './typescript-interfaces';

// // ====================================
// // 🌐 API Configuration
// // ====================================

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
// const API_TIMEOUT = 10000; // 10 seconds

// interface APIClientConfig {
//   baseURL: string;
//   timeout: number;
//   headers: Record<string, string>;
// }

// class APIClient {
//   private config: APIClientConfig;

//   constructor(config: Partial<APIClientConfig> = {}) {
//     this.config = {
//       baseURL: API_BASE_URL,
//       timeout: API_TIMEOUT,
//       headers: {
//         'Content-Type': 'application/json',
//         ...config.headers,
//       },
//       ...config,
//     };
//   }

//   async request<T>(
//     endpoint: string,
//     options: RequestInit = {}
//   ): Promise<APIResponse<T>> {
//     const url = `${this.config.baseURL}${endpoint}`;
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

//     try {
//       const response = await fetch(url, {
//         ...options,
//         headers: {
//           ...this.config.headers,
//           ...options.headers,
//         },
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw {
//           status: response.status,
//           statusText: response.statusText,
//           message: errorData.message || 'API request failed',
//           ...errorData,
//         };
//       }

//       return await response.json();
//     } catch (error: any) {
//       clearTimeout(timeoutId);
//       if (error.name === 'AbortError') {
//         throw { message: 'Request timeout', status: 408 };
//       }
//       throw error;
//     }
//   }

//   async get<T>(endpoint: string): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, { method: 'GET' });
//   }

//   async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, {
//       method: 'POST',
//       body: data ? JSON.stringify(data) : undefined,
//     });
//   }

//   async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, {
//       method: 'PUT',
//       body: data ? JSON.stringify(data) : undefined,
//     });
//   }

//   async patch<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, {
//       method: 'PATCH',
//       body: data ? JSON.stringify(data) : undefined,
//     });
//   }

//   async delete<T>(endpoint: string): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, { method: 'DELETE' });
//   }
// }

// // Global API client instance
// const apiClient = new APIClient();

// // ====================================
// // 🎣 Main ExploreKG Hook
// // ====================================

// export function useExploreKG(): UseExploreKGReturn {
//   const [guest, setGuest] = useState<Guest | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Clear error helper
//   const clearError = useCallback(() => {
//     setError(null);
//   }, []);

//   // Error handler
//   const handleError = useCallback((err: any) => {
//     console.error('ExploreKG API Error:', err);
//     setError(err.message || 'An unexpected error occurred');
//     setLoading(false);
//   }, []);

//   // ====================================
//   // 👤 Guest Operations
//   // ====================================

//   const createGuest = useCallback(
//     async (data: CreateGuestRequest): Promise<Guest> => {
//       try {
//         setLoading(true);
//         clearError();

//         const response = await apiClient.post<Guest>('/guests', data);

//         if (response.success && response.data) {
//           setGuest(response.data);
//           // Store session ID in localStorage for persistence
//           localStorage.setItem('explorekg_session_id', response.data.sessionId);
//           return response.data;
//         } else {
//           throw new Error(response.error || 'Failed to create guest');
//         }
//       } catch (err: any) {
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [clearError, handleError]
//   );

//   const getGuest = useCallback(
//     async (sessionId: string): Promise<Guest | null> => {
//       try {
//         setLoading(true);
//         clearError();

//         const response = await apiClient.get<Guest>(`/guests/${sessionId}`);

//         if (response.success && response.data) {
//           setGuest(response.data);
//           return response.data;
//         }

//         return null;
//       } catch (err: any) {
//         if (err.status === 404) {
//           setGuest(null);
//           localStorage.removeItem('explorekg_session_id');
//           return null;
//         }
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [clearError, handleError]
//   );

//   const updateGuest = useCallback(
//     async (data: UpdateGuestRequest): Promise<Guest> => {
//       if (!guest) {
//         throw new Error('No active guest session');
//       }

//       try {
//         setLoading(true);
//         clearError();

//         const response = await apiClient.patch<Guest>(
//           `/guests/${guest.sessionId}`,
//           data
//         );

//         if (response.success && response.data) {
//           setGuest(response.data);
//           return response.data;
//         } else {
//           throw new Error(response.error || 'Failed to update guest');
//         }
//       } catch (err: any) {
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [guest, clearError, handleError]
//   );

//   // ====================================
//   // 🎫 Booking Operations
//   // ====================================

//   const createBooking = useCallback(
//     async (data: CreateBookingRequest): Promise<Booking> => {
//       try {
//         setLoading(true);
//         clearError();

//         const response = await apiClient.post<Booking>('/bookings', data);

//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.error || 'Failed to create booking');
//         }
//       } catch (err: any) {
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [clearError, handleError]
//   );

//   const getBooking = useCallback(
//     async (bookingNumber: string): Promise<Booking | null> => {
//       try {
//         setLoading(true);
//         clearError();

//         const response = await apiClient.get<Booking>(
//           `/bookings/${bookingNumber}`
//         );

//         if (response.success && response.data) {
//           return response.data;
//         }

//         return null;
//       } catch (err: any) {
//         if (err.status === 404) {
//           return null;
//         }
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [clearError, handleError]
//   );

//   const processPayment = useCallback(
//     async (bookingNumber: string, data: PaymentRequest): Promise<Booking> => {
//       try {
//         setLoading(true);
//         clearError();

//         const response = await apiClient.post<Booking>(
//           `/bookings/${bookingNumber}/payment`,
//           data
//         );

//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.error || 'Payment processing failed');
//         }
//       } catch (err: any) {
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [clearError, handleError]
//   );

//   const cancelBooking = useCallback(
//     async (bookingNumber: string, reason?: string): Promise<Booking> => {
//       try {
//         setLoading(true);
//         clearError();

//         const response = await apiClient.post<Booking>(
//           `/bookings/${bookingNumber}/cancel`,
//           reason ? { reason } : undefined
//         );

//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.error || 'Failed to cancel booking');
//         }
//       } catch (err: any) {
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [clearError, handleError]
//   );

//   // ====================================
//   // 🏞️ Catalog Operations
//   // ====================================

//   const getTravelPacks = useCallback(
//     async (
//       filters?: TravelPackFilters
//     ): Promise<PaginatedResponse<TravelPack>> => {
//       try {
//         setLoading(true);
//         clearError();

//         const params = new URLSearchParams();
//         if (filters) {
//           Object.entries(filters).forEach(([key, value]) => {
//             if (value !== undefined && value !== null) {
//               if (Array.isArray(value)) {
//                 value.forEach(v => params.append(key, v.toString()));
//               } else {
//                 params.append(key, value.toString());
//               }
//             }
//           });
//         }

//         const response = await apiClient.get<PaginatedResponse<TravelPack>>(
//           `/travel-packs?${params.toString()}`
//         );

//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.error || 'Failed to fetch travel packs');
//         }
//       } catch (err: any) {
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [clearError, handleError]
//   );

//   const getActivities = useCallback(
//     async (filters?: ActivityFilters): Promise<PaginatedResponse<Activity>> => {
//       try {
//         setLoading(true);
//         clearError();

//         const params = new URLSearchParams();
//         if (filters) {
//           Object.entries(filters).forEach(([key, value]) => {
//             if (value !== undefined && value !== null) {
//               if (Array.isArray(value)) {
//                 value.forEach(v => params.append(key, v.toString()));
//               } else {
//                 params.append(key, value.toString());
//               }
//             }
//           });
//         }

//         const response = await apiClient.get<PaginatedResponse<Activity>>(
//           `/activities?${params.toString()}`
//         );

//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.error || 'Failed to fetch activities');
//         }
//       } catch (err: any) {
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [clearError, handleError]
//   );

//   const getCars = useCallback(
//     async (filters?: CarFilters): Promise<PaginatedResponse<Car>> => {
//       try {
//         setLoading(true);
//         clearError();

//         const params = new URLSearchParams();
//         if (filters) {
//           Object.entries(filters).forEach(([key, value]) => {
//             if (value !== undefined && value !== null) {
//               if (Array.isArray(value)) {
//                 value.forEach(v => params.append(key, v.toString()));
//               } else {
//                 params.append(key, value.toString());
//               }
//             }
//           });
//         }

//         const response = await apiClient.get<PaginatedResponse<Car>>(
//           `/cars?${params.toString()}`
//         );

//         if (response.success && response.data) {
//           return response.data;
//         } else {
//           throw new Error(response.error || 'Failed to fetch cars');
//         }
//       } catch (err: any) {
//         handleError(err);
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [clearError, handleError]
//   );

//   // ====================================
//   // 🔄 Utility Functions
//   // ====================================

//   const refreshData = useCallback(() => {
//     const sessionId = localStorage.getItem('explorekg_session_id');
//     if (sessionId) {
//       getGuest(sessionId).catch(() => {
//         // Silently handle refresh errors
//       });
//     }
//   }, [getGuest]);

//   // Initialize guest from localStorage on mount
//   useEffect(() => {
//     const sessionId = localStorage.getItem('explorekg_session_id');
//     if (sessionId && !guest) {
//       getGuest(sessionId).catch(() => {
//         // Remove invalid session ID
//         localStorage.removeItem('explorekg_session_id');
//       });
//     }
//   }, [guest, getGuest]);

//   return {
//     // State
//     guest,
//     loading,
//     error,

//     // Guest operations
//     createGuest,
//     updateGuest,
//     getGuest,

//     // Booking operations
//     createBooking,
//     getBooking,
//     processPayment,
//     cancelBooking,

//     // Catalog operations
//     getTravelPacks,
//     getActivities,
//     getCars,

//     // Utility
//     refreshData,
//     clearError,
//   };
// }

// // ====================================
// // 🎣 Individual Entity Hooks
// // ====================================

// // Hook for single Travel Pack
// export function useTravelPack(packId: string) {
//   const [pack, setPack] = useState<TravelPack | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchPack() {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await apiClient.get<TravelPack>(
//           `/travel-packs/${packId}`
//         );

//         if (response.success && response.data) {
//           setPack(response.data);
//         } else {
//           setError(response.error || 'Travel pack not found');
//         }
//       } catch (err: any) {
//         setError(err.message || 'Failed to fetch travel pack');
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (packId) {
//       fetchPack();
//     }
//   }, [packId]);

//   return { pack, loading, error };
// }

// // Hook for single Activity
// export function useActivity(activityId: string) {
//   const [activity, setActivity] = useState<Activity | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchActivity() {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await apiClient.get<Activity>(
//           `/activities/${activityId}`
//         );

//         if (response.success && response.data) {
//           setActivity(response.data);
//         } else {
//           setError(response.error || 'Activity not found');
//         }
//       } catch (err: any) {
//         setError(err.message || 'Failed to fetch activity');
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (activityId) {
//       fetchActivity();
//     }
//   }, [activityId]);

//   return { activity, loading, error };
// }

// // Hook for single Car
// export function useCar(carId: string) {
//   const [car, setCar] = useState<Car | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchCar() {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await apiClient.get<Car>(`/cars/${carId}`);

//         if (response.success && response.data) {
//           setCar(response.data);
//         } else {
//           setError(response.error || 'Car not found');
//         }
//       } catch (err: any) {
//         setError(err.message || 'Failed to fetch car');
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (carId) {
//       fetchCar();
//     }
//   }, [carId]);

//   return { car, loading, error };
// }

// // ====================================
// // 🛡️ Security & Monitoring Hooks
// // ====================================

// // Hook for Security Status
// export function useSecurityStatus() {
//   const [status, setStatus] = useState<SecurityStatus | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchStatus = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await apiClient.get<SecurityStatus>('/security/status');

//       if (response.success && response.data) {
//         setStatus(response.data);
//       } else {
//         setError(response.error || 'Failed to fetch security status');
//       }
//     } catch (err: any) {
//       setError(err.message || 'Failed to fetch security status');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStatus();
//     // Auto-refresh every 30 seconds
//     const interval = setInterval(fetchStatus, 30000);
//     return () => clearInterval(interval);
//   }, [fetchStatus]);

//   return { status, loading, error, refresh: fetchStatus };
// }

// // Hook for System Health
// export function useSystemHealth() {
//   const [health, setHealth] = useState<SystemHealth | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchHealth = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await apiClient.get<SystemHealth>('/security/health');

//       if (response.success && response.data) {
//         setHealth(response.data);
//       } else {
//         setError(response.error || 'Failed to fetch system health');
//       }
//     } catch (err: any) {
//       setError(err.message || 'Failed to fetch system health');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchHealth();
//     // Auto-refresh every 60 seconds
//     const interval = setInterval(fetchHealth, 60000);
//     return () => clearInterval(interval);
//   }, [fetchHealth]);

//   return { health, loading, error, refresh: fetchHealth };
// }

// // ====================================
// // 📊 Statistics Hook
// // ====================================

// export function useStatistics() {
//   const [stats, setStats] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchStats = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const [guestStats, bookingStats] = await Promise.all([
//         apiClient.get('/guests/statistics'),
//         apiClient.get('/bookings/statistics'),
//       ]);

//       setStats({
//         guests: guestStats.data,
//         bookings: bookingStats.data,
//       });
//     } catch (err: any) {
//       setError(err.message || 'Failed to fetch statistics');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);

//   return { stats, loading, error, refresh: fetchStats };
// }

// // ====================================
// // 🔧 Utility Hooks
// // ====================================

// // Hook for debounced search
// export function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// // Hook for local storage
// export function useLocalStorage<T>(key: string, initialValue: T) {
//   const [storedValue, setStoredValue] = useState<T>(() => {
//     try {
//       const item = window.localStorage.getItem(key);
//       return item ? JSON.parse(item) : initialValue;
//     } catch (error) {
//       return initialValue;
//     }
//   });

//   const setValue = (value: T | ((val: T) => T)) => {
//     try {
//       const valueToStore =
//         value instanceof Function ? value(storedValue) : value;
//       setStoredValue(valueToStore);
//       window.localStorage.setItem(key, JSON.stringify(valueToStore));
//     } catch (error) {
//       console.error('Error saving to localStorage:', error);
//     }
//   };

//   return [storedValue, setValue] as const;
// }

// // Export API client for advanced usage
// export { apiClient };
