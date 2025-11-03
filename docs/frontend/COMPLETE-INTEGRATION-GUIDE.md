# 🚀 ExploreKG Server - دليل تكامل Frontend الشامل

## 📋 فهرس المحتويات

1. [نظرة عامة](#-نظرة-عامة)
2. [إعداد البيئة](#-إعداد-البيئة)
3. [أساسيات API](#-أساسيات-api)
4. [أنظمة الأمان](#-أنظمة-الأمان)
5. [نظام الضيوف (Guest System)](#-نظام-الضيوف)
6. [نظام الحجوزات (Booking System)](#-نظام-الحجوزات)
7. [أنظمة الكتالوج](#-أنظمة-الكتالوج)
8. [معالجة الأخطاء](#-معالجة-الأخطاء)
9. [أمثلة عملية كاملة](#-أمثلة-عملية-كاملة)
10. [اختبار ومراقبة](#-اختبار-ومراقبة)

---

## 🎯 نظرة عامة

**ExploreKG Server** هو API خلفي محصّن أمنياً لمنصة سياحية في قيرغيزستان. النظام مبني على مفهوم **الضيوف المؤقتين** بدلاً من المستخدمين الدائمين.

### 🔑 المفاهيم الأساسية:

- **Guest-Based System**: ضيوف مؤقتون (24-30 يوم)
- **Session-Based**: جلسات UUID محدودة الوقت
- **Snapshot Architecture**: حماية بيانات الحجوزات من التغيير
- **Multi-language**: دعم العربية والإنجليزية والفرنسية

---

## ⚙️ إعداد البيئة

### **Base URLs**

```javascript
const API_CONFIG = {
  development: 'http://localhost:4000/api/v1',
  staging: 'https://staging-api.explorekg.com/api/v1',
  production: 'https://api.explorekg.com/api/v1',
};
```

### **Headers مطلوبة**

```javascript
const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'Accept-Language': 'en', // or 'fr', 'ar'
  'X-Session-ID': sessionId, // إذا كان متوفراً
};
```

### **Environment Variables للـFrontend**

```env
# Frontend Environment Variables
REACT_APP_API_BASE_URL=http://localhost:4000/api/v1
REACT_APP_ENABLE_DEBUG=true
REACT_APP_SESSION_TIMEOUT=86400000
REACT_APP_SUPPORTED_LANGUAGES=en,fr,ar
```

---

## 🔐 أنظمة الأمان

### **1. Rate Limiting**

**تطبيق rate limiting تلقائي:**

```javascript
// معدلات الطلبات المسموحة
const RATE_LIMITS = {
  general: '100 requests per 15 minutes',
  guestCreation: '5 guests per hour per IP',
  bookingOperations: '10 requests per 15 minutes',
  paymentOperations: '3 requests per 5 minutes'
};

// معالجة خطأ Rate Limit
const handleRateLimit = (error) => {
  if (error.status === 429) {
    const retryAfter = error.headers['retry-after'];
    showNotification(\`Too many requests. Try again after \${retryAfter}\`);
  }
};
```

### **2. Security Headers**

**Headers أمنية تلقائية من السيرفر:**

```javascript
// Headers محمية تلقائياً
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=63072000
Content-Security-Policy: [comprehensive policy]
```

### **3. Input Validation**

**جميع المدخلات محمية تلقائياً ضد:**

- SQL/NoSQL Injection
- XSS Attacks
- Script Injection
- Large Payload Attacks

---

## 👤 نظام الضيوف (Guest System)

### **إنشاء ضيف جديد**

```javascript
// API: POST /api/v1/guests
const createGuest = async (guestData) => {
  try {
    const response = await fetch(\`\${API_BASE}/guests\`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        email: 'user@example.com',
        fullName: 'Ahmed Hassan',
        phone: '+996700123456',
        locale: 'en', // 'en' | 'fr' | 'ar'
        metadata: {
          source: 'web', // 'web' | 'mobile' | 'api'
          userAgent: navigator.userAgent,
          ipAddress: '192.168.1.1' // يُحدد تلقائياً
        }
      })
    });

    const result = await response.json();

    if (result.success) {
      // حفظ sessionId مهم جداً!
      localStorage.setItem('guestSessionId', result.data.sessionId);
      localStorage.setItem('guestEmail', result.data.email);
      localStorage.setItem('guestExpiresAt', result.data.expiresAt);

      return result.data;
    }
  } catch (error) {
    console.error('Guest creation failed:', error);
    throw error;
  }
};
```

### **استرجاع معلومات الضيف**

```javascript
// API: GET /api/v1/guests/:sessionId
const getGuest = async (sessionId) => {
  try {
    const response = await fetch(\`\${API_BASE}/guests/\${sessionId}\`, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        'X-Session-ID': sessionId
      }
    });

    const result = await response.json();

    if (result.success) {
      // تحقق من انتهاء الصلاحية
      if (result.data.isExpired) {
        // الجلسة منتهية - إنشاء ضيف جديد
        localStorage.removeItem('guestSessionId');
        return null;
      }

      return result.data;
    }
  } catch (error) {
    if (error.status === 404) {
      // الضيف غير موجود - إنشاء جديد
      localStorage.removeItem('guestSessionId');
      return null;
    }
    throw error;
  }
};
```

### **تحديث معلومات الضيف**

```javascript
// API: PATCH /api/v1/guests/:sessionId
const updateGuest = async (sessionId, updateData) => {
  const response = await fetch(\`\${API_BASE}/guests/\${sessionId}\`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      'X-Session-ID': sessionId
    },
    body: JSON.stringify(updateData)
  });

  return await response.json();
};
```

---

## 🎫 نظام الحجوزات (Booking System)

### **إنشاء حجز جديد**

```javascript
// API: POST /api/v1/bookings
const createBooking = async (bookingData) => {
  try {
    const response = await fetch(\`\${API_BASE}/bookings\`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'X-Session-ID': guestSessionId
      },
      body: JSON.stringify({
        guestId: guestId, // ObjectId من نظام الضيوف
        itemType: 'travel_pack', // 'travel_pack' | 'activity' | 'car'
        itemId: 'pack_123',
        numberOfPersons: 2, // للحزم والأنشطة
        numberOfDays: 5, // للسيارات
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-06T00:00:00.000Z',
        locale: 'en'
      })
    });

    const result = await response.json();

    if (result.success) {
      // معلومات الحجز مع Snapshot محمي
      console.log('Booking Number:', result.data.bookingNumber);
      console.log('Total Price:', result.data.totalPrice);
      console.log('Expires At:', result.data.expiresAt); // 24 ساعة

      return result.data;
    }
  } catch (error) {
    console.error('Booking creation failed:', error);
    throw error;
  }
};
```

### **استرجاع حجز**

```javascript
// API: GET /api/v1/bookings/:bookingNumber
const getBooking = async (bookingNumber) => {
  const response = await fetch(\`\${API_BASE}/bookings/\${bookingNumber}\`, {
    method: 'GET',
    headers: defaultHeaders
  });

  const result = await response.json();

  if (result.success) {
    return {
      ...result.data,
      isExpired: new Date() > new Date(result.data.expiresAt),
      timeRemaining: new Date(result.data.expiresAt) - new Date()
    };
  }

  return null;
};
```

### **معالجة الدفع**

```javascript
// API: POST /api/v1/bookings/:bookingNumber/payment
const processPayment = async (bookingNumber, paymentData) => {
  try {
    const response = await fetch(\`\${API_BASE}/bookings/\${bookingNumber}/payment\`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'X-Session-ID': guestSessionId
      },
      body: JSON.stringify({
        paymentMethod: 'credit_card', // 'credit_card' | 'bank_transfer' | 'paypal'
        paymentTransactionId: 'txn_123456789',
        // لا تُرسل معلومات الدفع الحساسة هنا!
        // استخدم payment gateway منفصل
      })
    });

    const result = await response.json();

    if (result.success) {
      // الحجز تم دفعه بنجاح
      return result.data;
    }
  } catch (error) {
    if (error.status === 410) {
      // الحجز منتهي الصلاحية
      showError('Booking has expired. Please create a new booking.');
    }
    throw error;
  }
};
```

### **إلغاء حجز**

```javascript
// API: POST /api/v1/bookings/:bookingNumber/cancel
const cancelBooking = async (bookingNumber, reason = '') => {
  const response = await fetch(\`\${API_BASE}/bookings/\${bookingNumber}/cancel\`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'X-Session-ID': guestSessionId
    },
    body: JSON.stringify({ reason })
  });

  return await response.json();
};
```

---

## 📚 أنظمة الكتالوج

### **1. حزم السفر (Travel Packs)**

```javascript
// API: GET /api/v1/travel-packs
const getTravelPacks = async (filters = {}) => {
  const params = new URLSearchParams({
    locale: filters.locale || 'en',
    page: filters.page || 1,
    limit: filters.limit || 20,
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    duration: filters.duration || '',
    search: filters.search || ''
  });

  const response = await fetch(\`\${API_BASE}/travel-packs?\${params}\`, {
    headers: defaultHeaders
  });

  return await response.json();
};

// API: GET /api/v1/travel-packs/:id
const getTravelPack = async (packId, locale = 'en') => {
  const response = await fetch(\`\${API_BASE}/travel-packs/\${packId}?locale=\${locale}\`, {
    headers: defaultHeaders
  });

  return await response.json();
};
```

### **2. الأنشطة (Activities)**

```javascript
// API: GET /api/v1/activities
const getActivities = async (filters = {}) => {
  const params = new URLSearchParams({
    locale: filters.locale || 'en',
    category: filters.category || '', // 'adventure', 'cultural', 'nature'
    location: filters.location || '',
    difficulty: filters.difficulty || '', // 'easy', 'medium', 'hard'
    page: filters.page || 1,
    limit: filters.limit || 20
  });

  const response = await fetch(\`\${API_BASE}/activities?\${params}\`, {
    headers: defaultHeaders
  });

  return await response.json();
};
```

### **3. السيارات (Cars)**

```javascript
// API: GET /api/v1/cars
const getCars = async (filters = {}) => {
  const params = new URLSearchParams({
    locale: filters.locale || 'en',
    type: filters.type || '', // 'SUV', 'sedan', 'hatchback'
    transmission: filters.transmission || '', // 'automatic', 'manual'
    fuelType: filters.fuelType || '', // 'petrol', 'diesel', 'hybrid'
    available: filters.available || true,
    page: filters.page || 1,
    limit: filters.limit || 20
  });

  const response = await fetch(\`\${API_BASE}/cars?\${params}\`, {
    headers: defaultHeaders
  });

  return await response.json();
};
```

---

## ⚠️ معالجة الأخطاء

### **أنواع الأخطاء الشائعة**

```javascript
const handleAPIError = (error, response) => {
  switch (response.status) {
    case 400:
      // خطأ في البيانات المرسلة
      showValidationErrors(response.data.errors);
      break;

    case 401:
      // غير مُصرح - جلسة منتهية
      redirectToLogin();
      break;

    case 403:
      // ممنوع - صلاحيات غير كافية
      showError('Access denied');
      break;

    case 404:
      // غير موجود
      showError('Resource not found');
      break;

    case 409:
      // تضارب - مثل email مُستخدم
      showError('Resource already exists');
      break;

    case 422:
      // خطأ في التحقق من البيانات
      showValidationErrors(response.data.errors);
      break;

    case 429:
      // تجاوز حد الطلبات
      const retryAfter = response.headers['retry-after'];
      showError(\`Too many requests. Try again after \${retryAfter}\`);
      break;

    case 500:
      // خطأ في السيرفر
      showError('Server error. Please try again later.');
      break;

    default:
      showError('An unexpected error occurred');
  }
};
```

### **Validation Errors**

```javascript
const showValidationErrors = errors => {
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      const field = error.field || 'general';
      const message = error.message || error;

      // عرض الخطأ بجانب الحقل المناسب
      displayFieldError(field, message);
    });
  }
};
```

---

## 🛠️ أمثلة عملية كاملة

### **مثال 1: رحلة مستخدم كاملة**

```javascript
class ExploreKGService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
    this.guestSessionId = localStorage.getItem('guestSessionId');
  }

  // 1. إنشاء أو استرجاع ضيف
  async initializeGuest(userData) {
    try {
      // تحقق من وجود جلسة حالية
      if (this.guestSessionId) {
        const guest = await this.getGuest(this.guestSessionId);
        if (guest && !guest.isExpired) {
          return guest;
        }
      }

      // إنشاء ضيف جديد
      return await this.createGuest(userData);
    } catch (error) {
      console.error('Guest initialization failed:', error);
      throw error;
    }
  }

  // 2. تصفح وحجز حزمة سفر
  async bookTravelPack(packId, bookingDetails) {
    try {
      // 1. احصل على تفاصيل الحزمة
      const pack = await this.getTravelPack(packId);

      // 2. تحقق من التوفر
      if (!pack.isActive) {
        throw new Error('Travel pack is not available');
      }

      // 3. إنشاء الحجز
      const booking = await this.createBooking({
        guestId: this.guestId,
        itemType: 'travel_pack',
        itemId: packId,
        ...bookingDetails
      });

      // 4. ابدأ عداد انتهاء الصلاحية (24 ساعة)
      this.startExpirationTimer(booking.bookingNumber, booking.expiresAt);

      return booking;
    } catch (error) {
      console.error('Booking failed:', error);
      throw error;
    }
  }

  // 3. معالجة الدفع الآمن
  async processSecurePayment(bookingNumber, paymentDetails) {
    try {
      // 1. تحقق من صحة الحجز
      const booking = await this.getBooking(bookingNumber);
      if (booking.isExpired) {
        throw new Error('Booking has expired');
      }

      // 2. معالج دفع خارجي (Stripe, PayPal, etc.)
      const paymentResult = await this.processExternalPayment(paymentDetails);

      // 3. تأكيد الدفع مع السيرفر
      return await this.markBookingAsPaid(bookingNumber, {
        paymentMethod: paymentResult.method,
        paymentTransactionId: paymentResult.transactionId
      });
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  // أدوات مساعدة
  startExpirationTimer(bookingNumber, expiresAt) {
    const timeRemaining = new Date(expiresAt) - new Date();

    if (timeRemaining > 0) {
      setTimeout(() => {
        this.showExpirationWarning(bookingNumber);
      }, timeRemaining - 5 * 60 * 1000); // تحذير قبل 5 دقائق
    }
  }

  showExpirationWarning(bookingNumber) {
    showNotification(\`Booking \${bookingNumber} expires in 5 minutes!\`);
  }
}
```

### **مثال 2: React Hook مخصص**

```javascript
// useExploreKG.js
import { useState, useEffect, useCallback } from 'react';

const useExploreKG = () => {
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const service = new ExploreKGService();

  // إنشاء ضيف
  const createGuest = useCallback(async userData => {
    setLoading(true);
    setError(null);

    try {
      const newGuest = await service.createGuest(userData);
      setGuest(newGuest);
      return newGuest;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // حجز عنصر
  const createBooking = useCallback(async bookingData => {
    setLoading(true);
    setError(null);

    try {
      const booking = await service.createBooking(bookingData);
      return booking;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // تحميل ضيف حالي عند بداية التطبيق
  useEffect(() => {
    const savedSessionId = localStorage.getItem('guestSessionId');
    if (savedSessionId) {
      service
        .getGuest(savedSessionId)
        .then(setGuest)
        .catch(() => {
          localStorage.removeItem('guestSessionId');
        });
    }
  }, []);

  return {
    guest,
    loading,
    error,
    createGuest,
    createBooking,
    // ... other methods
  };
};

export default useExploreKG;
```

---

## 🔍 اختبار ومراقبة

### **Security Monitoring**

```javascript
// API: GET /api/v1/security/status
const getSecurityStatus = async () => {
  const response = await fetch(\`\${API_BASE}/security/status\`, {
    headers: {
      ...defaultHeaders,
      'Authorization': 'Admin-Token-Here' // في المستقبل
    }
  });

  const result = await response.json();

  return {
    securityLevel: result.data.securityLevel, // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    alerts: result.data.alerts,
    uptime: result.data.uptime,
    lastUpdate: result.data.timestamp
  };
};
```

### **اختبار الـAPIs**

```javascript
// مجموعة اختبارات بسيطة
const runAPITests = async () => {
  const tests = [
    {
      name: 'Health Check',
      test: () => fetch(\`\${API_BASE}/../health\`),
      expect: response => response.status === 200
    },
    {
      name: 'Rate Limiting',
      test: async () => {
        const requests = Array(6).fill().map(() =>
          fetch(\`\${API_BASE}/travel-packs\`)
        );
        const responses = await Promise.all(requests);
        return responses.some(r => r.status === 429);
      },
      expect: result => result === true
    },
    {
      name: 'Security Headers',
      test: async () => {
        const response = await fetch(\`\${API_BASE}/../health\`);
        return response.headers;
      },
      expect: headers => headers.get('X-Frame-Options') === 'DENY'
    }
  ];

  for (const test of tests) {
    try {
      const result = await test.test();
      const passed = test.expect(result);
      console.log(\`✅ \${test.name}: \${passed ? 'PASSED' : 'FAILED'}\`);
    } catch (error) {
      console.log(\`❌ \${test.name}: ERROR - \${error.message}\`);
    }
  }
};
```

---

## 🎯 نصائح مهمة للفريق

### **✅ أفضل الممارسات:**

1. **إدارة الجلسات:**
   - احفظ `sessionId` في localStorage
   - تحقق من انتهاء الصلاحية قبل كل طلب
   - امسح البيانات المنتهية تلقائياً

2. **معالجة الأخطاء:**
   - تعامل مع جميع حالات HTTP status codes
   - اعرض رسائل واضحة للمستخدم
   - سجل الأخطاء للمراقبة

3. **الأداء:**
   - استخدم caching للبيانات المتكررة
   - احترم rate limiting
   - استخدم pagination للقوائم الطويلة

4. **الأمان:**
   - لا تُخزن بيانات حساسة في localStorage
   - استخدم HTTPS دائماً في production
   - تحقق من صحة البيانات قبل الإرسال

### **⚠️ تجنب هذه الأخطاء:**

1. **لا تُرسل معلومات دفع حساسة مباشرة**
2. **لا تتجاهل rate limiting warnings**
3. **لا تُخزن كلمات المرور في frontend**
4. **لا تثق في البيانات بدون تحقق**

---

## 📞 الدعم والمساعدة

### **مواقع مفيدة:**

- **API Documentation**: `/docs/api/`
- **TypeScript Interfaces**: `/docs/frontend/typescript-interfaces.md`
- **Testing Guide**: `/docs/frontend/testing-guide.md`
- **Security Monitor**: \`\${API_BASE}/security/status\`

### **للحصول على المساعدة:**

1. راجع هذا الدليل أولاً
2. تحقق من console للأخطاء
3. استخدم `/api/health` للتأكد من حالة السيرفر
4. اتصل بفريق Backend لمسائل الأمان

---

**🚀 النظام جاهز 100% للتكامل مع Frontend!**

النظام محصّن أمنياً ومجهز بجميع الأدوات اللازمة لتطوير frontend آمن وفعال.
