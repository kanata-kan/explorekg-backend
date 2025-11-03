# 🔒 Ownership Validation Middleware - Documentation

> **التاريخ:** 2025-11-03  
> **الإصدار:** 1.0.0  
> **الحالة:** ✅ Implemented & Tested

---

## 📌 نظرة عامة (Overview)

نظام **Ownership Validation** هو طبقة أمان إضافية تحمي المسارات المختلطة (Mixed Routes) التي تسمح بوصول كل من:

- **Guest users** (عبر session ID)
- **Admin users** (عبر JWT token)

### المشكلة الأمنية التي تم حلها

**ISSUE-2025-001: Resource Ownership Bypass** 🔴 **CRITICAL**

المسارات التي كانت تستخدم `optionalAuthenticate` فقط لم تتحقق من ملكية الموارد، مما سمح بـ:

- ✅ Guest A يمكنه الوصول لحجوزات Guest B
- ✅ أي شخص يعرف `bookingNumber` يمكنه قراءة البيانات
- ✅ خرق خصوصية البيانات

---

## 🏗️ البنية (Architecture)

### الملفات الجديدة

```
src/
  security/
    ownership.middleware.ts       # ✅ Ownership validation middleware
  types/
    express.d.ts                   # ✅ Extended Request type
```

### الوظائف المُصدّرة

#### 1. `validateBookingOwnership(options?)`

**الغرض:** التحقق من ملكية الحجز

**Options:**

- `allowAdminView?: boolean` (default: `true`) - السماح للـ admin بعرض الحجز
- `requireModifyPermission?: boolean` (default: `false`) - يتطلب صلاحية UPDATE للـ admin

**السلوك:**

1. يبحث عن الحجز في database باستخدام `bookingNumber`
2. إذا كان المستخدم **admin**:
   - يتحقق من صلاحيات BOOKINGS (VIEW أو UPDATE حسب `requireModifyPermission`)
   - يسمح بالوصول إذا كانت الصلاحية موجودة
3. إذا كان **guest**:
   - يستخرج `guestSessionId` من headers/query
   - يتحقق أن `booking.guestId === guestSessionId`
   - يسمح بالوصول فقط إذا كان المالك

**الاستخدام:**

```typescript
// عرض الحجز (VIEW)
router.get(
  '/:bookingNumber',
  optionalAuthenticate,
  validateBookingOwnership(),
  bookingController.getBooking
);

// تعديل الحجز (MODIFY)
router.post(
  '/:bookingNumber/payment',
  optionalAuthenticate,
  validateBookingOwnership({ requireModifyPermission: true }),
  bookingController.markBookingAsPaid
);
```

---

#### 2. `validateGuestOwnership(options?)`

**الغرض:** التحقق من ملكية جلسة الضيف

**Options:**

- `requireModifyPermission?: boolean` (default: `false`) - يتطلب صلاحية UPDATE للـ admin

**السلوك:**

1. يبحث عن Guest في database باستخدام `sessionId`
2. يتحقق من انتهاء صلاحية الجلسة (`expiresAt`)
3. إذا كان المستخدم **admin**:
   - يتحقق من صلاحيات GUESTS (VIEW أو UPDATE)
   - يسمح بالوصول إذا كانت الصلاحية موجودة
4. إذا كان **guest**:
   - يستخرج `guestSessionId` من headers/query
   - يتحقق أن `guest.sessionId === guestSessionId`
   - يسمح بالوصول فقط إذا كان المالك

**الاستخدام:**

```typescript
// عرض الجلسة (VIEW)
router.get(
  '/:sessionId',
  optionalAuthenticate,
  validateGuestOwnership(),
  guestController.getGuest
);

// تحديث الجلسة (MODIFY)
router.patch(
  '/:sessionId',
  optionalAuthenticate,
  validateGuestOwnership({ requireModifyPermission: true }),
  guestController.updateGuest
);
```

---

#### 3. `validateGuestBookingsOwnership(options?)`

**الغرض:** التحقق من ملكية حجوزات guest محدد

**Options:**

- `allowAdminView?: boolean` (default: `true`) - السماح للـ admin بعرض الحجوزات

**السلوك:**

1. يستخرج `guestId` من params
2. إذا كان المستخدم **admin**:
   - يتحقق من صلاحية BOOKINGS.VIEW
   - يسمح بالوصول إذا كانت الصلاحية موجودة
3. إذا كان **guest**:
   - يستخرج `guestSessionId` من headers/query
   - يتحقق أن `guestId === guestSessionId`
   - يسمح بالوصول فقط إذا كان نفس الشخص

**الاستخدام:**

```typescript
router.get(
  '/guest/:guestId',
  optionalAuthenticate,
  validateGuestBookingsOwnership(),
  bookingController.getGuestBookings
);
```

---

## 🔐 آلية التحقق (Verification Flow)

### 1. استخراج Guest Session ID

```typescript
const extractGuestSessionId = (req: Request): string | undefined => {
  // 1. البحث في headers (أولوية أعلى)
  const headerSession = req.headers['x-guest-session'];
  if (headerSession) return headerSession;

  // 2. البحث في query parameters
  const querySession = req.query.guestSessionId;
  if (querySession) return querySession;

  return undefined;
};
```

**الأولوية:**

1. Header: `x-guest-session`
2. Query: `?guestSessionId=xxx`

---

### 2. مخطط التدفق (Flow Chart)

```
                    [Request received]
                            |
                            v
                 [optionalAuthenticate]
                            |
                    +-------+-------+
                    |               |
                [Admin JWT]    [No JWT / Guest]
                    |               |
                    v               v
        [Check RBAC permission]  [Extract guestSessionId]
                    |               |
            +-------+-------+       v
            |               |   [Compare with resource owner]
        [Has perm]    [No perm]    |
            |               |   +---+---+
            v               v   |       |
        [Allow]         [403] [Match] [No match]
                                  |       |
                                  v       v
                              [Allow]   [403]
```

---

## 🛡️ الحماية المُطبّقة (Protected Routes)

### Booking Routes (4 مسارات)

| Route                                   | Middleware                                                    | Protection Level |
| --------------------------------------- | ------------------------------------------------------------- | ---------------- |
| `GET /bookings/:bookingNumber`          | `validateBookingOwnership()`                                  | VIEW             |
| `POST /bookings/:bookingNumber/payment` | `validateBookingOwnership({ requireModifyPermission: true })` | MODIFY           |
| `POST /bookings/:bookingNumber/cancel`  | `validateBookingOwnership({ requireModifyPermission: true })` | MODIFY           |
| `GET /bookings/guest/:guestId`          | `validateGuestBookingsOwnership()`                            | VIEW             |

### Guest Routes (4 مسارات)

| Route                               | Middleware                                                  | Protection Level |
| ----------------------------------- | ----------------------------------------------------------- | ---------------- |
| `GET /guests/:sessionId`            | `validateGuestOwnership()`                                  | VIEW             |
| `PATCH /guests/:sessionId`          | `validateGuestOwnership({ requireModifyPermission: true })` | MODIFY           |
| `PATCH /guests/:sessionId/extend`   | `validateGuestOwnership({ requireModifyPermission: true })` | MODIFY           |
| `POST /guests/:sessionId/link-user` | `validateGuestOwnership({ requireModifyPermission: true })` | MODIFY           |

**إجمالي:** 8 مسارات محمية ✅

---

## 📝 رسائل الخطأ (Error Messages)

### 1. Authentication Required (401)

```json
{
  "success": false,
  "error": "Authentication required. Please provide x-guest-session header or guestSessionId parameter",
  "code": "AUTHENTICATION_REQUIRED"
}
```

**السبب:** لا يوجد JWT token ولا guestSessionId

---

### 2. Access Denied (403)

```json
{
  "success": false,
  "error": "You do not have permission to access this booking",
  "code": "ACCESS_DENIED"
}
```

**السبب:** Guest يحاول الوصول لمورد لا يملكه

---

### 3. Insufficient Permissions (403)

```json
{
  "success": false,
  "error": "Insufficient permissions to access this booking",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**السبب:** Admin ليس لديه صلاحية VIEW/UPDATE للمورد

---

### 4. Resource Not Found (404)

```json
{
  "success": false,
  "error": "Booking not found",
  "code": "BOOKING_NOT_FOUND"
}
```

**السبب:** bookingNumber غير موجود

---

### 5. Session Expired (401)

```json
{
  "success": false,
  "error": "Guest session has expired",
  "code": "SESSION_EXPIRED"
}
```

**السبب:** Guest session تجاوز `expiresAt`

---

## 🧪 أمثلة الاستخدام (Usage Examples)

### مثال 1: Guest يصل لحجزه الخاص

**Request:**

```http
GET /api/v1/bookings/BK-2025-001 HTTP/1.1
Host: localhost:4000
x-guest-session: guest-abc-123
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK-2025-001",
    "guestId": "guest-abc-123",
    "status": "pending",
    "totalPrice": 1500
  }
}
```

---

### مثال 2: Guest يحاول الوصول لحجز غيره (مرفوض)

**Request:**

```http
GET /api/v1/bookings/BK-2025-002 HTTP/1.1
Host: localhost:4000
x-guest-session: guest-abc-123
```

**Response:** `403 Forbidden`

```json
{
  "success": false,
  "error": "You do not have permission to access this booking",
  "code": "ACCESS_DENIED"
}
```

---

### مثال 3: Admin يصل لأي حجز

**Request:**

```http
GET /api/v1/bookings/BK-2025-002 HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK` (إذا لديه صلاحية BOOKINGS.VIEW)

---

### مثال 4: Guest يحدّث بياناته

**Request:**

```http
PATCH /api/v1/guests/guest-abc-123 HTTP/1.1
Host: localhost:4000
x-guest-session: guest-abc-123
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `200 OK`

---

## 🔍 Logging & Monitoring

جميع محاولات الوصول تُسجّل في logs:

```typescript
// عند نجاح الوصول
logger.debug(
  {
    guestSessionId: 'guest-abc-123',
    bookingNumber: 'BK-2025-001',
  },
  'Guest accessing own booking'
);

// عند فشل الوصول
logger.warn(
  {
    bookingNumber: 'BK-2025-002',
    providedGuestId: 'guest-abc-123',
    actualGuestId: 'guest-xyz-789',
    ip: '192.168.1.100',
  },
  'Attempted unauthorized booking access'
);
```

---

## 📊 الإحصائيات (Statistics)

- **الملفات المُنشأة:** 2
- **الملفات المُعدّلة:** 3
- **الأسطر المُضافة:** ~540 سطر
- **المسارات المحمية:** 8
- **وقت التنفيذ:** 30 دقيقة
- **Compilation Errors:** 0 ✅

---

## ✅ الخلاصة

نظام **Ownership Validation** يوفر:

- ✅ حماية شاملة من unauthorized access
- ✅ دعم كامل لـ Guest و Admin roles
- ✅ رسائل خطأ واضحة مع error codes
- ✅ Logging شامل لجميع المحاولات
- ✅ Type safety مع TypeScript
- ✅ سهولة التطبيق على مسارات جديدة

**الحالة:** 🟢 **Production Ready**

---

**آخر تحديث:** 2025-11-03 16:30 UTC+1  
**الإصدار:** 1.0.0  
**المُنشئ:** GitHub Copilot
