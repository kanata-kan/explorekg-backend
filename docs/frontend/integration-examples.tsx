// // 🚀 ExploreKG Server - أمثلة عملية للتطبيق
// // استخدم هذه الأمثلة كنماذج في مشروع React/Next.js

// /**
//  * ⚠️ مُلاحظة مهمة:
//  * تأكد من إضافة React dependencies قبل استخدام الكود:
//  * npm install react react-dom @types/react @types/react-dom
//  */

// // ====================================
// // 📝 مثال 1: صفحة إنشاء Guest
// // ====================================

// /*
// import React, { useState } from 'react';
// import { useExploreKG } from './react-hooks';
// import type { CreateGuestRequest } from './typescript-interfaces';

// export function GuestRegistrationPage() {
//   const { createGuest, loading, error } = useExploreKG();
//   const [formData, setFormData] = useState<CreateGuestRequest>({
//     email: '',
//     fullName: '',
//     phone: '',
//     locale: 'en',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const guest = await createGuest(formData);
//       console.log('Guest created:', guest);
//       // إعادة توجيه للصفحة التالية
//       window.location.href = '/catalog';
//     } catch (err) {
//       console.error('Registration failed:', err);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6 text-center">تسجيل زائر جديد</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
//             الاسم الكامل
//           </label>
//           <input
//             type="text"
//             id="fullName"
//             name="fullName"
//             value={formData.fullName}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//             البريد الإلكتروني
//           </label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//             رقم الهاتف
//           </label>
//           <input
//             type="tel"
//             id="phone"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
//             اللغة المفضلة
//           </label>
//           <select
//             id="locale"
//             name="locale"
//             value={formData.locale}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           >
//             <option value="en">English</option>
//             <option value="fr">Français</option>
//             <option value="ar">العربية</option>
//           </select>
//         </div>

//         {error && (
//           <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
//             {error}
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//         >
//           {loading ? 'جارٍ التسجيل...' : 'تسجيل'}
//         </button>
//       </form>
//     </div>
//   );
// }
// */

// // ====================================
// // 📝 مثال 2: صفحة عرض Travel Packs
// // ====================================

// /*
// import React, { useState, useEffect } from 'react';
// import { useExploreKG } from './react-hooks';
// import type { TravelPack, TravelPackFilters } from './typescript-interfaces';

// export function TravelPacksPage() {
//   const { getTravelPacks, loading, error } = useExploreKG();
//   const [packs, setPacks] = useState<TravelPack[]>([]);
//   const [filters, setFilters] = useState<TravelPackFilters>({
//     locale: 'en',
//     page: 1,
//     limit: 12,
//     isActive: true,
//   });

//   useEffect(() => {
//     async function fetchPacks() {
//       try {
//         const response = await getTravelPacks(filters);
//         setPacks(response.items);
//       } catch (err) {
//         console.error('Failed to fetch travel packs:', err);
//       }
//     }

//     fetchPacks();
//   }, [filters, getTravelPacks]);

//   const handleFilterChange = (newFilters: Partial<TravelPackFilters>) => {
//     setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">باقات السفر</h1>

//       {/* Filters */}
//       <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               السعر الأدنى
//             </label>
//             <input
//               type="number"
//               placeholder="0"
//               onChange={(e) => handleFilterChange({ minPrice: Number(e.target.value) || undefined })}
//               className="w-full rounded-md border-gray-300 shadow-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               السعر الأعلى
//             </label>
//             <input
//               type="number"
//               placeholder="1000"
//               onChange={(e) => handleFilterChange({ maxPrice: Number(e.target.value) || undefined })}
//               className="w-full rounded-md border-gray-300 shadow-sm"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               المدة (أيام)
//             </label>
//             <select
//               onChange={(e) => handleFilterChange({ duration: Number(e.target.value) || undefined })}
//               className="w-full rounded-md border-gray-300 shadow-sm"
//             >
//               <option value="">كل المدد</option>
//               <option value="1">يوم واحد</option>
//               <option value="3">3 أيام</option>
//               <option value="7">أسبوع</option>
//               <option value="14">أسبوعين</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="text-center py-8">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//           <p className="mt-2">جارٍ التحميل...</p>
//         </div>
//       )}

//       {/* Error */}
//       {error && (
//         <div className="text-center py-8 text-red-600">
//           <p>خطأ في تحميل البيانات: {error}</p>
//         </div>
//       )}

//       {/* Travel Packs Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {packs.map((pack) => (
//           <div key={pack._id} className="bg-white rounded-lg shadow-md overflow-hidden">
//             {pack.images[0] && (
//               <img
//                 src={pack.images[0].url}
//                 alt={pack.images[0].altText || pack.title.en}
//                 className="w-full h-48 object-cover"
//               />
//             )}

//             <div className="p-4">
//               <h3 className="text-lg font-semibold mb-2">
//                 {pack.title[filters.locale || 'en']}
//               </h3>

//               <p className="text-gray-600 text-sm mb-3 line-clamp-2">
//                 {pack.shortDescription?.[filters.locale || 'en'] || pack.description[filters.locale || 'en']}
//               </p>

//               <div className="flex justify-between items-center mb-3">
//                 <span className="text-2xl font-bold text-indigo-600">
//                   ${pack.pricing.amount}
//                 </span>
//                 <span className="text-sm text-gray-500">
//                   {pack.duration} أيام
//                 </span>
//               </div>

//               <div className="flex flex-wrap gap-1 mb-3">
//                 {pack.destinations.slice(0, 3).map((dest, index) => (
//                   <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
//                     {dest}
//                   </span>
//                 ))}
//               </div>

//               <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
//                 عرض التفاصيل
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {packs.length === 0 && !loading && !error && (
//         <div className="text-center py-8 text-gray-500">
//           <p>لا توجد باقات سفر متطابقة مع المعايير المحددة</p>
//         </div>
//       )}
//     </div>
//   );
// }
// */

// // ====================================
// // 📝 مثال 3: مكون Booking Cart
// // ====================================

// /*
// import React, { useState } from 'react';
// import { useExploreKG } from './react-hooks';
// import type { CreateBookingRequest, Guest } from './typescript-interfaces';

// interface CartItem {
//   id: string;
//   type: 'travel_pack' | 'activity' | 'car';
//   title: string;
//   price: number;
//   currency: string;
//   numberOfPersons?: number;
//   numberOfDays?: number;
//   startDate?: string;
//   endDate?: string;
// }

// interface BookingCartProps {
//   guest: Guest;
//   items: CartItem[];
//   onItemRemove: (itemId: string) => void;
//   onCheckout: () => void;
// }

// export function BookingCart({ guest, items, onItemRemove, onCheckout }: BookingCartProps) {
//   const { createBooking, loading, error } = useExploreKG();
//   const [bookingInProgress, setBookingInProgress] = useState(false);

//   const total = items.reduce((sum, item) => {
//     const basePrice = item.price;
//     const persons = item.numberOfPersons || 1;
//     const days = item.numberOfDays || 1;

//     if (item.type === 'car') {
//       return sum + (basePrice * days);
//     } else {
//       return sum + (basePrice * persons);
//     }
//   }, 0);

//   const handleCheckout = async () => {
//     if (items.length === 0) return;

//     setBookingInProgress(true);

//     try {
//       const bookingPromises = items.map(async (item) => {
//         const bookingData: CreateBookingRequest = {
//           guestId: guest.sessionId,
//           itemType: item.type,
//           itemId: item.id,
//           numberOfPersons: item.numberOfPersons,
//           numberOfDays: item.numberOfDays,
//           startDate: item.startDate,
//           endDate: item.endDate,
//           locale: guest.locale,
//         };

//         return await createBooking(bookingData);
//       });

//       const bookings = await Promise.all(bookingPromises);
//       console.log('Bookings created:', bookings);

//       // إعادة توجيه للدفع
//       onCheckout();

//     } catch (err) {
//       console.error('Checkout failed:', err);
//     } finally {
//       setBookingInProgress(false);
//     }
//   };

//   if (items.length === 0) {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-6 text-center">
//         <p className="text-gray-500">السلة فارغة</p>
//         <p className="text-sm text-gray-400 mt-2">أضف بعض العناصر للمتابعة</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-bold mb-4">سلة الحجوزات</h2>

//       <div className="space-y-4 mb-6">
//         {items.map((item) => (
//           <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
//             <div className="flex-1">
//               <h3 className="font-medium">{item.title}</h3>
//               <div className="text-sm text-gray-500 mt-1">
//                 {item.type === 'travel_pack' && (
//                   <span>باقة سفر • {item.numberOfPersons} أشخاص</span>
//                 )}
//                 {item.type === 'activity' && (
//                   <span>نشاط • {item.numberOfPersons} أشخاص</span>
//                 )}
//                 {item.type === 'car' && (
//                   <span>سيارة • {item.numberOfDays} أيام</span>
//                 )}
//               </div>
//               {item.startDate && (
//                 <div className="text-sm text-gray-500">
//                   من: {new Date(item.startDate).toLocaleDateString('ar')}
//                   {item.endDate && ` إلى: ${new Date(item.endDate).toLocaleDateString('ar')}`}
//                 </div>
//               )}
//             </div>

//             <div className="text-right ml-4">
//               <div className="font-bold">
//                 ${item.price * (item.numberOfPersons || item.numberOfDays || 1)}
//               </div>
//               <button
//                 onClick={() => onItemRemove(item.id)}
//                 className="text-red-500 text-sm hover:text-red-700 mt-1"
//               >
//                 إزالة
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="border-t pt-4">
//         <div className="flex justify-between items-center mb-4">
//           <span className="text-lg font-medium">المجموع:</span>
//           <span className="text-2xl font-bold text-indigo-600">${total.toFixed(2)}</span>
//         </div>

//         {error && (
//           <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
//             {error}
//           </div>
//         )}

//         <button
//           onClick={handleCheckout}
//           disabled={loading || bookingInProgress}
//           className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
//         >
//           {bookingInProgress ? 'جارٍ إنشاء الحجوزات...' : 'متابعة للدفع'}
//         </button>
//       </div>
//     </div>
//   );
// }
// */

// // ====================================
// // 📝 مثال 4: صفحة إدارة الأمان (Admin)
// // ====================================

// /*
// import React from 'react';
// import { useSecurityStatus, useSystemHealth } from './react-hooks';

// export function SecurityDashboard() {
//   const { status: securityStatus, loading: securityLoading, error: securityError } = useSecurityStatus();
//   const { health: systemHealth, loading: healthLoading, error: healthError } = useSystemHealth();

//   const getStatusColor = (level: string) => {
//     switch (level) {
//       case 'LOW': return 'text-green-600 bg-green-100';
//       case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
//       case 'HIGH': return 'text-orange-600 bg-orange-100';
//       case 'CRITICAL': return 'text-red-600 bg-red-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const getHealthColor = (score: string) => {
//     switch (score) {
//       case 'HEALTHY': return 'text-green-600 bg-green-100';
//       case 'WARNING': return 'text-yellow-600 bg-yellow-100';
//       case 'CRITICAL': return 'text-red-600 bg-red-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">لوحة مراقبة الأمان</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Security Status */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-bold mb-4">حالة الأمان</h2>

//           {securityLoading && <p>جارٍ التحميل...</p>}
//           {securityError && <p className="text-red-600">خطأ: {securityError}</p>}

//           {securityStatus && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span>مستوى الأمان:</span>
//                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(securityStatus.securityLevel)}`}>
//                   {securityStatus.securityLevel}
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-3 bg-gray-50 rounded">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {securityStatus.last5Minutes.requests.total}
//                   </div>
//                   <div className="text-sm text-gray-600">طلبات (5 دقائق)</div>
//                 </div>

//                 <div className="text-center p-3 bg-gray-50 rounded">
//                   <div className="text-2xl font-bold text-red-600">
//                     {securityStatus.last5Minutes.requests.blocked}
//                   </div>
//                   <div className="text-sm text-gray-600">طلبات محجوبة</div>
//                 </div>
//               </div>

//               {securityStatus.alerts.length > 0 && (
//                 <div className="mt-4">
//                   <h3 className="font-medium mb-2">تنبيهات:</h3>
//                   <ul className="space-y-1">
//                     {securityStatus.alerts.map((alert, index) => (
//                       <li key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
//                         {alert}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* System Health */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-bold mb-4">صحة النظام</h2>

//           {healthLoading && <p>جارٍ التحميل...</p>}
//           {healthError && <p className="text-red-600">خطأ: {healthError}</p>}

//           {systemHealth && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span>حالة النظام:</span>
//                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(systemHealth.healthScore)}`}>
//                   {systemHealth.healthScore}
//                 </span>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span>وقت التشغيل:</span>
//                   <span>{Math.floor(systemHealth.uptime / 3600)} ساعة</span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span>استخدام الذاكرة:</span>
//                   <span>{systemHealth.memory.usage}</span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span>البيئة:</span>
//                   <span className="capitalize">{systemHealth.environment}</span>
//                 </div>
//               </div>

//               <div className="mt-4 pt-4 border-t">
//                 <h3 className="font-medium mb-2">ميزات الأمان:</h3>
//                 <div className="space-y-1">
//                   <div className="flex justify-between text-sm">
//                     <span>التشفير:</span>
//                     <span className={systemHealth.securityFeatures.encryptionAtRest ? 'text-green-600' : 'text-red-600'}>
//                       {systemHealth.securityFeatures.encryptionAtRest ? 'مُفعل' : 'غير مُفعل'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span>السجلات المتقدمة:</span>
//                     <span className={systemHealth.securityFeatures.advancedLogging ? 'text-green-600' : 'text-red-600'}>
//                       {systemHealth.securityFeatures.advancedLogging ? 'مُفعل' : 'غير مُفعل'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span>رؤوس الأمان:</span>
//                     <span className={systemHealth.securityFeatures.securityHeaders ? 'text-green-600' : 'text-red-600'}>
//                       {systemHealth.securityFeatures.securityHeaders ? 'مُفعل' : 'غير مُفعل'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// */

// // ====================================
// // 🎯 نصائح للتطبيق العملي
// // ====================================

// export const IMPLEMENTATION_TIPS = {
//   // 1. معلومات إضافية للـFrontend
//   ENVIRONMENT_SETUP: `
//     // في ملف .env.local
//     NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
//     NEXT_PUBLIC_APP_ENV=development

//     // في ملف .env.production
//     NEXT_PUBLIC_API_URL=https://api.explorekg.com/api/v1
//     NEXT_PUBLIC_APP_ENV=production
//   `,

//   // 2. إعداد Error Boundary
//   ERROR_BOUNDARY: `
//     // مكون Error Boundary للتعامل مع الأخطاء
//     import React from 'react';

//     interface ErrorBoundaryState {
//       hasError: boolean;
//       error: Error | null;
//     }

//     export class ErrorBoundary extends React.Component<
//       React.PropsWithChildren<{}>,
//       ErrorBoundaryState
//     > {
//       constructor(props: React.PropsWithChildren<{}>) {
//         super(props);
//         this.state = { hasError: false, error: null };
//       }

//       static getDerivedStateFromError(error: Error): ErrorBoundaryState {
//         return { hasError: true, error };
//       }

//       componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
//         console.error('ExploreKG Error:', error, errorInfo);
//       }

//       render() {
//         if (this.state.hasError) {
//           return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//               <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
//                 <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في التطبيق</h2>
//                 <p className="text-gray-600 mb-4">عذراً، حدث خطأ غير متوقع</p>
//                 <button
//                   onClick={() => window.location.reload()}
//                   className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//                 >
//                   إعادة تحميل الصفحة
//                 </button>
//               </div>
//             </div>
//           );
//         }

//         return this.props.children;
//       }
//     }
//   `,

//   // 3. إعداد Context Provider
//   CONTEXT_PROVIDER: `
//     // مكون Context للحالة العامة
//     import React, { createContext, useContext, useReducer } from 'react';
//     import type { Guest, Booking } from './typescript-interfaces';

//     interface AppState {
//       guest: Guest | null;
//       currentBooking: Booking | null;
//       locale: 'en' | 'fr' | 'ar';
//       currency: 'USD' | 'KGS' | 'EUR';
//     }

//     type AppAction =
//       | { type: 'SET_GUEST'; payload: Guest | null }
//       | { type: 'SET_BOOKING'; payload: Booking | null }
//       | { type: 'SET_LOCALE'; payload: 'en' | 'fr' | 'ar' }
//       | { type: 'SET_CURRENCY'; payload: 'USD' | 'KGS' | 'EUR' };

//     const AppContext = createContext<{
//       state: AppState;
//       dispatch: React.Dispatch<AppAction>;
//     } | null>(null);

//     function appReducer(state: AppState, action: AppAction): AppState {
//       switch (action.type) {
//         case 'SET_GUEST':
//           return { ...state, guest: action.payload };
//         case 'SET_BOOKING':
//           return { ...state, currentBooking: action.payload };
//         case 'SET_LOCALE':
//           return { ...state, locale: action.payload };
//         case 'SET_CURRENCY':
//           return { ...state, currency: action.payload };
//         default:
//           return state;
//       }
//     }

//     export function AppProvider({ children }: { children: React.ReactNode }) {
//       const [state, dispatch] = useReducer(appReducer, {
//         guest: null,
//         currentBooking: null,
//         locale: 'en',
//         currency: 'USD',
//       });

//       return (
//         <AppContext.Provider value={{ state, dispatch }}>
//           {children}
//         </AppContext.Provider>
//       );
//     }

//     export function useAppContext() {
//       const context = useContext(AppContext);
//       if (!context) {
//         throw new Error('useAppContext must be used within AppProvider');
//       }
//       return context;
//     }
//   `,

//   // 4. معالجة الأخطاء
//   ERROR_HANDLING: `
//     // دالة مساعدة لمعالجة أخطاء API
//     export function handleAPIError(error: any): string {
//       if (error.status === 400) {
//         return 'بيانات غير صحيحة. يرجى التحقق من المعلومات المدخلة.';
//       }
//       if (error.status === 401) {
//         return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
//       }
//       if (error.status === 403) {
//         return 'غير مسموح بهذا الإجراء.';
//       }
//       if (error.status === 404) {
//         return 'العنصر المطلوب غير موجود.';
//       }
//       if (error.status === 429) {
//         return 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً.';
//       }
//       if (error.status >= 500) {
//         return 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
//       }
//       return error.message || 'حدث خطأ غير متوقع.';
//     }
//   `,

//   // 5. تحسين الأداء
//   PERFORMANCE_OPTIMIZATION: `
//     // مكون Loading Skeleton
//     export function LoadingSkeleton() {
//       return (
//         <div className="animate-pulse">
//           <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
//           <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
//           <div className="h-4 bg-gray-300 rounded w-full"></div>
//         </div>
//       );
//     }

//     // Hook للتحميل التدريجي للصور
//     import { useState, useRef, useEffect } from 'react';

//     export function useLazyLoading(threshold = 0.1) {
//       const [isVisible, setIsVisible] = useState(false);
//       const ref = useRef<HTMLDivElement>(null);

//       useEffect(() => {
//         const observer = new IntersectionObserver(
//           ([entry]) => {
//             if (entry.isIntersecting) {
//               setIsVisible(true);
//               observer.disconnect();
//             }
//           },
//           { threshold }
//         );

//         if (ref.current) {
//           observer.observe(ref.current);
//         }

//         return () => observer.disconnect();
//       }, [threshold]);

//       return [ref, isVisible] as const;
//     }
//   `,
// };

// // ====================================
// // 📋 قائمة التحقق للتطبيق
// // ====================================

// export const IMPLEMENTATION_CHECKLIST = [
//   '✅ إعداد متغيرات البيئة (Environment Variables)',
//   '✅ تثبيت Dependencies المطلوبة',
//   '✅ إعداد TypeScript Interfaces',
//   '✅ إضافة React Hooks للAPI',
//   '✅ إنشاء Error Boundary',
//   '✅ إعداد Context Provider للحالة العامة',
//   '✅ إضافة معالجة الأخطاء',
//   '✅ إضافة Loading States',
//   '✅ تطبيق أمان Frontend (تشفير البيانات الحساسة)',
//   '✅ اختبار التكامل مع API',
//   '✅ إضافة Offline Support (اختياري)',
//   '✅ تحسين الأداء (Lazy Loading, Caching)',
//   '✅ إضافة Analytics و Monitoring',
//   '✅ اختبار على أجهزة مختلفة',
//   '✅ إعداد Production Build',
// ];

// console.log('🚀 ExploreKG Frontend Integration Examples loaded successfully!');
// console.log('📚 See IMPLEMENTATION_TIPS and IMPLEMENTATION_CHECKLIST for more details.');
