# 🔐 User Authentication System

## 🎯 نظرة عامة

نظام المصادقة في ExploreKG مصمم خصيصاً لتجربة سلسة للضيوف (Guests) بدون الحاجة لإنشاء حساب مسبق.  
يعتمد على **Session-based Authentication** باستخدام Cookies آمنة.

---

## 📋 جدول المحتويات

1. [كيف يعمل النظام](#كيف-يعمل-النظام)
2. [إنشاء Guest Session](#إنشاء-guest-session)
3. [استخدام Session ID](#استخدام-session-id)
4. [Ownership Validation](#ownership-validation)
5. [Session Management](#session-management)
6. [Security Best Practices](#security-best-practices)

---

## 🔄 كيف يعمل النظام

### المفاهيم الأساسية

#### 1. Guest Session

- **الضيف (Guest):** مستخدم مؤقت بدون حساب دائم
- **Session ID:** معرّف فريد للضيف (مثل: `guest_abc123def456`)
- **Session Duration:** 7 أيام افتراضياً (قابلة للتمديد)
- **Cookie-based:** يتم تخزين Session ID في Cookie آمن

#### 2. Authentication Flow

```
1. المستخدم يملأ نموذج معلومات الضيف
2. النظام ينشئ Guest Session جديد
3. يتم تخزين Session ID في Cookie تلقائياً
4. المستخدم يستطيع الحجز وإدارة حجوزاته
5. Session ينتهي بعد 7 أيام من آخر نشاط
```

#### 3. Ownership Validation

- النظام يتحقق من ملكية البيانات تلقائياً
- الضيف يمكنه فقط الوصول لبياناته الخاصة
- Admin يمكنه الوصول لجميع البيانات

---

## 🆕 إنشاء Guest Session

### الخطوة 1: إنشاء ضيف جديد

```http
POST /api/v1/guests
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+996555123456"
}
```

### الخطوة 2: استلام Session ID

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123def456ghi789",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+996555123456",
    "status": "active",
    "expiresAt": "2025-11-10T12:00:00.000Z",
    "createdAt": "2025-11-03T12:00:00.000Z"
  },
  "message": "Guest created successfully. Session ID stored in cookie."
}
```

**ملاحظة مهمة:**  
✅ Session ID يتم تخزينه تلقائياً في Cookie باسم `sessionId`  
✅ Cookie محمي بـ `HttpOnly`, `Secure`, `SameSite=Strict`  
✅ لا تحتاج لتخزينه يدوياً في Frontend

---

## 🔑 استخدام Session ID

### طريقة 1: Cookie (موصى بها)

```http
GET /api/v1/guests/guest_abc123def456ghi789
Cookie: sessionId=guest_abc123def456ghi789
```

**المميزات:**

- ✅ آمن (HttpOnly cookie)
- ✅ تلقائي (المتصفح يرسله تلقائياً)
- ✅ محمي ضد XSS

### طريقة 2: Custom Header

```http
GET /api/v1/guests/guest_abc123def456ghi789
X-Session-ID: guest_abc123def456ghi789
```

**متى تستخدمها:**

- عند استخدام API من تطبيق موبايل
- عند عدم القدرة على استخدام Cookies
- في بيئات testing

### طريقة 3: Admin Authentication (لوحة التحكم)

```http
GET /api/v1/guests/guest_abc123def456ghi789
Authorization: Bearer admin_jwt_token_here
```

**الصلاحيات:**

- Admin يمكنه الوصول لجميع بيانات الضيوف
- لا يحتاج Session ID في Cookie

---

## 🛡️ Ownership Validation

### كيف يعمل

النظام يتحقق تلقائياً من ملكية البيانات في المسارات المحمية:

```
1. يستخرج Session ID من Cookie أو Header
2. يتحقق من صحة Session
3. يقارن Session ID مع بيانات المورد المطلوب
4. إذا تطابق → السماح بالوصول ✅
5. إذا لم يتطابق → رفض الطلب ❌ (403 Forbidden)
```

### المسارات المحمية بـOwnership

#### Guest Endpoints

```http
# ✅ يمكن للضيف الوصول لبياناته فقط
GET /api/v1/guests/:sessionId
PATCH /api/v1/guests/:sessionId
PATCH /api/v1/guests/:sessionId/extend
POST /api/v1/guests/:sessionId/link-user
```

#### Booking Endpoints

```http
# ✅ يمكن للضيف الوصول لحجوزاته فقط
GET /api/v1/bookings/:bookingNumber
GET /api/v1/bookings/guest/:guestId
POST /api/v1/bookings/:bookingNumber/payment
POST /api/v1/bookings/:bookingNumber/cancel
```

### أمثلة عملية

#### ✅ مثال صحيح: الوصول لبياناتك

```http
# Session ID في Cookie: guest_abc123
GET /api/v1/guests/guest_abc123
Cookie: sessionId=guest_abc123

→ 200 OK ✅
```

#### ❌ مثال خاطئ: الوصول لبيانات ضيف آخر

```http
# Session ID في Cookie: guest_abc123
# محاولة الوصول لبيانات guest_xyz789
GET /api/v1/guests/guest_xyz789
Cookie: sessionId=guest_abc123

→ 403 Forbidden ❌
{
  "success": false,
  "error": {
    "message": "You do not have permission to access this guest",
    "code": "FORBIDDEN",
    "statusCode": 403
  }
}
```

#### ✅ مثال صحيح: Admin يصل لأي بيانات

```http
# Admin token في Authorization header
GET /api/v1/guests/guest_xyz789
Authorization: Bearer admin_jwt_token

→ 200 OK ✅
```

---

## ⚙️ Session Management

### Session Lifecycle

```
┌─────────────┐
│   Created   │ → Session ينشأ عند إنشاء Guest
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Active    │ → Session نشط (7 أيام)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Expiring   │ → قريب من الانتهاء (يمكن التمديد)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Expired   │ → انتهى ويحتاج إنشاء session جديد
└─────────────┘
```

### التحقق من Session

```http
GET /api/v1/guests/:sessionId
Cookie: sessionId=guest_abc123
```

**الاستجابة:**

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123",
    "status": "active",
    "expiresAt": "2025-11-10T12:00:00.000Z",
    "lastActiveAt": "2025-11-03T14:30:00.000Z"
  }
}
```

### تمديد Session

```http
PATCH /api/v1/guests/:sessionId/extend
Cookie: sessionId=guest_abc123
Content-Type: application/json

{
  "days": 7
}
```

**الاستجابة:**

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123",
    "oldExpiresAt": "2025-11-10T12:00:00.000Z",
    "newExpiresAt": "2025-11-17T12:00:00.000Z"
  },
  "message": "Session extended successfully by 7 days"
}
```

### Session Expiration

**ماذا يحدث عند انتهاء Session:**

1. ✅ البيانات تبقى في Database (لمدة 30 يوم)
2. ❌ لا يمكن الوصول للبيانات بدون إنشاء session جديد
3. ✅ يمكن استرجاع البيانات باستخدام Email:
   ```http
   GET /api/v1/guests/email/john@example.com
   ```

---

## 🔒 Security Best Practices

### ✅ للمطورين (Frontend)

#### 1. لا تخزن Session ID في localStorage

```javascript
// ❌ خطأ - عرضة لـXSS attacks
localStorage.setItem('sessionId', 'guest_abc123');

// ✅ صحيح - استخدم Cookies (تلقائي من Backend)
// لا تحتاج لفعل شيء، Cookie يُرسل تلقائياً
```

#### 2. استخدم HTTPS في Production

```javascript
// ❌ خطأ - غير آمن
const API_URL = 'http://api.explorekg.com';

// ✅ صحيح - آمن
const API_URL = 'https://api.explorekg.com';
```

#### 3. تحقق من Session قبل العمليات الحساسة

```javascript
// ✅ صحيح
async function makeBooking(bookingData) {
  // تحقق من Session أولاً
  const guest = await checkSession();
  if (!guest) {
    return redirectToGuestForm();
  }

  // ثم أكمل الحجز
  return createBooking(bookingData);
}
```

#### 4. معالجة الأخطاء بشكل صحيح

```javascript
// ✅ صحيح
try {
  const response = await fetch('/api/v1/guests/guest_abc123', {
    credentials: 'include', // مهم لإرسال Cookies
  });

  if (response.status === 403) {
    // Session منتهي أو غير صحيح
    redirectToGuestForm();
  } else if (response.status === 401) {
    // Session مفقود
    redirectToGuestForm();
  }
} catch (error) {
  console.error('Error:', error);
}
```

### ✅ للمطورين (Backend Integration)

#### 1. إرسال Credentials

```javascript
// ✅ صحيح - في Fetch API
fetch('/api/v1/bookings', {
  method: 'POST',
  credentials: 'include', // مهم جداً!
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(bookingData),
});

// ✅ صحيح - في Axios
axios.post('/api/v1/bookings', bookingData, {
  withCredentials: true, // مهم جداً!
});
```

#### 2. معالجة CORS

```javascript
// في Backend (Express.js)
app.use(
  cors({
    origin: 'https://your-frontend-domain.com',
    credentials: true, // السماح بإرسال Cookies
  })
);
```

---

## 🧪 Testing Authentication

### اختبار Session في Postman/Insomnia

#### 1. إنشاء Guest

```http
POST http://localhost:5000/api/v1/guests
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "phoneNumber": "+996555000000"
}
```

#### 2. نسخ Session ID من الاستجابة

```json
{
  "data": {
    "sessionId": "guest_test123" // ← نسخ هذا
  }
}
```

#### 3. استخدامه في الطلبات التالية

```http
GET http://localhost:5000/api/v1/guests/guest_test123
Cookie: sessionId=guest_test123
```

---

## 🎓 مثال تكامل كامل (React)

```javascript
// 1. إنشاء Guest Session
async function createGuestSession(guestData) {
  const response = await fetch('/api/v1/guests', {
    method: 'POST',
    credentials: 'include', // مهم!
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(guestData),
  });

  const data = await response.json();
  return data.data.sessionId;
}

// 2. التحقق من Session
async function checkSession(sessionId) {
  const response = await fetch(`/api/v1/guests/${sessionId}`, {
    credentials: 'include', // مهم!
  });

  if (response.status === 403 || response.status === 401) {
    return null; // Session غير صحيح
  }

  const data = await response.json();
  return data.data;
}

// 3. إنشاء حجز
async function createBooking(bookingData) {
  const response = await fetch('/api/v1/bookings', {
    method: 'POST',
    credentials: 'include', // مهم!
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please create a new guest session.');
  }

  return response.json();
}

// 4. استخدام في Component
function BookingFlow() {
  const [sessionId, setSessionId] = useState(null);

  // إنشاء session عند بدء الحجز
  async function handleStartBooking(guestData) {
    const newSessionId = await createGuestSession(guestData);
    setSessionId(newSessionId);
    // Cookie تم تخزينه تلقائياً!
  }

  // إنشاء حجز
  async function handleCreateBooking(bookingData) {
    try {
      const booking = await createBooking(bookingData);
      console.log('Booking created:', booking);
    } catch (error) {
      if (error.message.includes('Session expired')) {
        // إعادة توجيه للنموذج
        setSessionId(null);
      }
    }
  }

  return (
    <div>
      {!sessionId ? (
        <GuestForm onSubmit={handleStartBooking} />
      ) : (
        <BookingForm onSubmit={handleCreateBooking} />
      )}
    </div>
  );
}
```

---

## 📊 حالات الخطأ الشائعة

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "message": "Session ID is required",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}
```

**الحل:** تأكد من إرسال Cookie أو Header `X-Session-ID`

### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "message": "You do not have permission to access this guest",
    "code": "FORBIDDEN",
    "statusCode": 403
  }
}
```

**الحل:** تحاول الوصول لبيانات ضيف آخر، تأكد من Session ID صحيح

### 410 Gone

```json
{
  "success": false,
  "error": {
    "message": "Guest session has expired",
    "code": "SESSION_EXPIRED",
    "statusCode": 410
  }
}
```

**الحل:** Session انتهى، أنشئ session جديد أو استرجع البيانات بالـEmail

---

## 🔄 ربط Guest بحساب مسجل (Future Feature)

```http
POST /api/v1/guests/:sessionId/link-user
Cookie: sessionId=guest_abc123
Content-Type: application/json

{
  "userId": "user_123"
}
```

**الفوائد:**

- ✅ الاحتفاظ بجميع الحجوزات السابقة
- ✅ Session لا ينتهي بعد الربط
- ✅ إمكانية الوصول من أي جهاز

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
