# 🔐 Authentication Flow

## 🎯 نظرة عامة

شرح تفصيلي لجميع أنواع المصادقة المستخدمة في ExploreKG API.

---

## 🔄 نوعان من المصادقة

### 1️⃣ Guest Authentication (Session-Based)

**للمستخدمين العاديين (Guests)**

### 2️⃣ Admin Authentication (JWT-Based)

**للمسؤولين (Admins)**

---

## 👤 Guest Authentication Flow

### المفهوم

- نظام مبني على Sessions
- لا يتطلب تسجيل حساب دائم
- Session ينتهي بعد 7 أيام (قابل للتمديد)
- Cookie-based authentication

### التدفق الكامل

```
┌─────────────────────────────────────────────────────────────┐
│               GUEST AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. USER VISITS WEBSITE
   ↓
2. FILLS GUEST FORM
   - Full Name
   - Email
   - Phone Number
   ↓
3. POST /api/v1/guests
   {
     "fullName": "John Doe",
     "email": "john@example.com",
     "phoneNumber": "+996555123456"
   }
   ↓
4. BACKEND CREATES GUEST SESSION
   - Generate unique sessionId
   - Hash sensitive data
   - Set expiration (7 days)
   - Store in database
   ↓
5. RESPONSE WITH SESSION
   {
     "sessionId": "guest_abc123...",
     "expiresAt": "2025-11-10T12:00:00.000Z"
   }
   + Set Cookie: sessionId=guest_abc123...
   ↓
6. USER MAKES REQUESTS
   - Cookie sent automatically
   - Backend validates sessionId
   - Checks ownership
   ↓
7. SESSION MANAGEMENT
   - Auto-refresh on activity
   - Can extend manually
   - Expires after 7 days
```

### مثال عملي

```javascript
// Step 1: Create Guest Session
const response = await fetch('/api/v1/guests', {
  method: 'POST',
  credentials: 'include', // Important!
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+996555123456',
  }),
});

const { data } = await response.json();
console.log('Session ID:', data.sessionId);
// Cookie stored automatically!

// Step 2: Use Session (Automatic)
const booking = await fetch('/api/v1/bookings/BK-123', {
  credentials: 'include', // Cookie sent automatically
});
```

---

## 🔐 Admin Authentication Flow

### المفهوم

- نظام مبني على JWT (JSON Web Tokens)
- يتطلب تسجيل دخول
- Token صالح لـ24 ساعة
- Bearer authentication

### التدفق الكامل

```
┌─────────────────────────────────────────────────────────────┐
│               ADMIN AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. ADMIN OPENS DASHBOARD
   ↓
2. LOGIN FORM
   - Email
   - Password
   ↓
3. POST /api/v1/admin/login
   {
     "email": "admin@explorekg.com",
     "password": "SecurePassword123!"
   }
   ↓
4. BACKEND VALIDATES
   - Check email exists
   - Verify password hash
   - Check admin status (active/inactive)
   ↓
5. GENERATE JWT TOKEN
   - Include admin ID, role, permissions
   - Set expiration (24 hours)
   - Sign with secret key
   ↓
6. RESPONSE WITH TOKEN
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "admin": { "id": "...", "role": "ADMIN" },
     "expiresAt": "2025-11-04T12:00:00.000Z"
   }
   ↓
7. CLIENT STORES TOKEN
   - Secure storage (httpOnly cookie recommended)
   - Or in-memory (for SPA)
   ↓
8. ADMIN MAKES REQUESTS
   Authorization: Bearer {token}
   ↓
9. BACKEND VALIDATES TOKEN
   - Verify signature
   - Check expiration
   - Extract admin info
   - Verify permissions (RBAC)
   ↓
10. RESPONSE OR 401/403
```

### مثال عملي

```javascript
// Step 1: Login
const response = await fetch('/api/v1/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@explorekg.com',
    password: 'SecurePassword123!',
  }),
});

const { data } = await response.json();
const token = data.token;

// Store token securely
localStorage.setItem('adminToken', token); // Simple way
// OR use httpOnly cookie (better)

// Step 2: Use Token in Requests
const admins = await fetch('/api/v1/admin', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Step 3: Logout
await fetch('/api/v1/admin/logout', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Clear token
localStorage.removeItem('adminToken');
```

---

## 🆚 المقارنة بين النظامين

| Feature          | Guest (Session)            | Admin (JWT)                 |
| ---------------- | -------------------------- | --------------------------- |
| **نوع المصادقة** | Cookie-based               | Token-based (Bearer)        |
| **مدة الصلاحية** | 7 أيام                     | 24 ساعة                     |
| **التخزين**      | Cookie (httpOnly)          | localStorage أو Cookie      |
| **الإرسال**      | تلقائي (Cookie)            | يدوي (Authorization header) |
| **الأمان**       | ✅ High (httpOnly, Secure) | ⚠️ Depends on storage       |
| **Use Case**     | المستخدمين العاديين        | المسؤولين                   |
| **الصلاحيات**    | Ownership validation       | RBAC (Role-Based)           |
| **التمديد**      | ممكن (extend endpoint)     | يجب تسجيل دخول جديد         |

---

## 🛡️ Security Measures

### Guest Session Security

1. ✅ **Unique Session IDs:** Crypto-random generation
2. ✅ **HttpOnly Cookies:** Protection against XSS
3. ✅ **Secure Flag:** HTTPS only (in production)
4. ✅ **SameSite:** Protection against CSRF
5. ✅ **Expiration:** Auto-expire after 7 days
6. ✅ **Ownership Validation:** Can't access other guests' data

### Admin Token Security

1. ✅ **JWT Signing:** HMAC-SHA256
2. ✅ **Token Expiration:** 24 hours
3. ✅ **Role-Based Access:** RBAC system
4. ✅ **Permission Checks:** Fine-grained control
5. ✅ **Audit Logging:** All actions logged
6. ✅ **Password Hashing:** bcrypt (cost factor 12)

---

## 🔄 Token Refresh Strategy

### Guest Sessions

```javascript
// Automatic refresh on activity
// Session extended automatically when:
// - Making requests
// - Creating bookings
// - Updating profile

// Manual extension
await fetch(`/api/v1/guests/${sessionId}/extend`, {
  method: 'PATCH',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ days: 7 }),
});
```

### Admin Tokens

```javascript
// No automatic refresh
// Must login again after 24 hours

// Check token expiration
function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
}

// Re-login if expired
if (isTokenExpired(token)) {
  // Redirect to login page
  router.push('/admin/login');
}
```

---

## ⚠️ حالات الخطأ الشائعة

### Guest Session Errors

#### 401 Unauthorized

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

**الحل:** تأكد من إرسال Cookie

#### 403 Forbidden

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

**الحل:** تحاول الوصول لبيانات ضيف آخر

#### 410 Gone

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

**الحل:** أنشئ session جديد

---

### Admin Token Errors

#### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}
```

**الحل:** أضف Authorization header أو سجّل دخول

#### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions",
    "code": "FORBIDDEN",
    "statusCode": 403,
    "details": {
      "required": "SUPER_ADMIN",
      "current": "ADMIN"
    }
  }
}
```

**الحل:** ليس لديك صلاحية، اطلب من SUPER_ADMIN

---

## 🎓 Best Practices

### For Guest Authentication

1. ✅ Always use `credentials: 'include'` in fetch
2. ✅ Store sessionId only for reference, rely on Cookie
3. ✅ Handle 410 Gone by creating new session
4. ✅ Implement session check before critical operations
5. ✅ Show session expiration warnings to users

### For Admin Authentication

1. ✅ Store token securely (httpOnly cookie preferred)
2. ✅ Never log token in console (production)
3. ✅ Implement token expiration checks
4. ✅ Clear token on logout
5. ✅ Use HTTPS in production
6. ✅ Implement auto-logout on 401 errors

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
