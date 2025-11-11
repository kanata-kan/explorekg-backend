# Business Policy Layer - طبقة قواعد الأعمال

**التاريخ**: 2025-01-27  
**المرحلة**: Phase 7.1 - Business Policy Layer Foundation  
**الحالة**: ✅ مكتمل

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [البنية المعمارية](#البنية-المعمارية)
3. [Booking Policies](#booking-policies)
4. [Pricing Policies](#pricing-policies)
5. [Guest Policies](#guest-policies)
6. [كيفية الاستخدام](#كيفية-الاستخدام)
7. [أمثلة عملية](#أمثلة-عملية)
8. [أفضل الممارسات](#أفضل-الممارسات)

---

## نظرة عامة

### ما هو Business Policy Layer؟

**Business Policy Layer** هي طبقة منفصلة تحتوي على جميع القواعد التجارية (Business Rules) للنظام. هذه الطبقة تفصل القواعد التجارية عن منطق التطبيق، مما يجعل الكود:

- ✅ **أسهل في الصيانة**: القواعد في مكان واحد
- ✅ **أسهل في الاختبار**: يمكن اختبار كل قاعدة على حدة
- ✅ **أوضح**: القواعد مكتوبة بشكل صريح
- ✅ **قابل لإعادة الاستخدام**: نفس القاعدة في أماكن متعددة

### الموقع في البنية المعمارية

```
┌─────────────────────────────────────────┐
│         Controllers Layer                │
│    (HTTP Request Handlers)               │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Services Layer                   │
│    (Business Logic Orchestration)        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      Business Policy Layer ⭐ NEW         │
│    (Business Rules & Policies)            │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Models Layer                     │
│    (Data Access & Validation)            │
└──────────────────────────────────────────┘
```

### الهيكل التنظيمي

```
src/policies/
├── booking/
│   ├── booking.policy.ts      # قواعد الحجز الأساسية
│   ├── state.policy.ts         # State Machine للحجوزات
│   ├── payment.policy.ts       # قواعد الدفع والاسترداد
│   └── snapshot.policy.ts      # قواعد Snapshot
├── pricing/
│   ├── tax.policy.ts           # قواعد الضريبة
│   ├── discount.policy.ts      # قواعد الخصومات
│   └── deposit.policy.ts       # قواعد الدفعة المقدمة
├── guest/
│   └── guest.policy.ts         # قواعد الضيوف
└── index.ts                    # Barrel Export
```

---

## البنية المعمارية

### مبدأ التصميم

كل Policy هو **class** يحتوي على **static methods** فقط. هذا يعني:

- ✅ لا حاجة لإنشاء instances
- ✅ سهولة الاستخدام: `Policy.method()`
- ✅ لا state - كل method مستقل
- ✅ قابل للاختبار بسهولة

### مثال على Policy

```typescript
// src/policies/booking/booking.policy.ts
export class BookingPolicy {
  /**
   * Rule: Guest must be active (not expired) to create booking
   */
  static canCreateBooking(guest: IGuest): boolean {
    return !guest.isExpired();
  }

  /**
   * Rule: Calculate booking expiration date (24 hours from now)
   */
  static calculateExpirationDate(): Date {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);
    return expirationDate;
  }
}
```

### الاستخدام في Services

```typescript
// src/services/booking.service.ts
import { BookingPolicy } from '../policies';

export const createBooking = async (data: CreateBookingData) => {
  const guest = await Guest.findById(data.guestId);
  
  // Use policy instead of inline logic
  if (!BookingPolicy.canCreateBooking(guest)) {
    throw new ValidationError('Guest session has expired');
  }

  // Use policy for expiration
  const expiresAt = BookingPolicy.calculateExpirationDate();
  
  // ... rest of the logic
};
```

---

## Booking Policies

### BookingPolicy

**الموقع**: `src/policies/booking/booking.policy.ts`

#### Methods

##### `canCreateBooking(guest: IGuest): boolean`

**القاعدة**: الضيف يجب أن يكون نشطاً (غير منتهي الصلاحية) لإنشاء حجز

**الاستخدام**:
```typescript
if (!BookingPolicy.canCreateBooking(guest)) {
  throw new ValidationError('Guest session has expired');
}
```

##### `calculateExpirationDate(): Date`

**القاعدة**: حساب تاريخ انتهاء الصلاحية (24 ساعة من الآن)

**الاستخدام**:
```typescript
const expiresAt = BookingPolicy.calculateExpirationDate();
```

##### `validateBookingData(data: CreateBookingData): boolean`

**القاعدة**: التحقق من صحة بيانات الحجز

**التحققات**:
- ✅ guestId موجود
- ✅ itemType موجود
- ✅ itemId موجود
- ✅ startDate < endDate (إن وُجدت)
- ✅ numberOfPersons >= 1 (للأنشطة)
- ✅ numberOfDays >= 1 (للسيارات)

**الاستخدام**:
```typescript
BookingPolicy.validateBookingData(data);
```

---

### BookingStatePolicy

**الموقع**: `src/policies/booking/state.policy.ts`

#### State Machine

**الحالات الصالحة**:
- `PENDING` → `CONFIRMED`, `CANCELLED`, `EXPIRED`
- `CONFIRMED` → `CANCELLED`
- `CANCELLED` → (لا انتقالات)
- `EXPIRED` → (لا انتقالات)

#### Methods

##### `canTransition(from: BookingStatus, to: BookingStatus): boolean`

**القاعدة**: التحقق من إمكانية الانتقال بين الحالات

**الاستخدام**:
```typescript
if (!BookingStatePolicy.canTransition(booking.status, newStatus)) {
  throw new ValidationError('Invalid state transition');
}
```

##### `validateTransition(from: BookingStatus, to: BookingStatus): void`

**القاعدة**: التحقق من الانتقال مع رسالة خطأ واضحة

**الاستخدام**:
```typescript
try {
  BookingStatePolicy.validateTransition(booking.status, newStatus);
} catch (error) {
  throw new ValidationError(error.message);
}
```

##### `canModify(status: BookingStatus): boolean`

**القاعدة**: التحقق من إمكانية تعديل الحجز

**الاستخدام**:
```typescript
if (!BookingStatePolicy.canModify(booking.status)) {
  throw new ValidationError('Cannot modify cancelled or expired booking');
}
```

##### `canCancel(status: BookingStatus): boolean`

**القاعدة**: التحقق من إمكانية إلغاء الحجز

**الاستخدام**:
```typescript
if (!BookingStatePolicy.canCancel(booking.status)) {
  throw new ValidationError('Booking cannot be cancelled');
}
```

##### `getValidNextStatuses(status: BookingStatus): BookingStatus[]`

**القاعدة**: الحصول على الحالات التالية الصالحة

**الاستخدام**:
```typescript
const validStatuses = BookingStatePolicy.getValidNextStatuses(BookingStatus.PENDING);
// Returns: [CONFIRMED, CANCELLED, EXPIRED]
```

##### `getValidTransitions(status: BookingStatus): BookingStatus[]`

**القاعدة**: Alias لـ `getValidNextStatuses()`

**الاستخدام**:
```typescript
const transitions = BookingStatePolicy.getValidTransitions(BookingStatus.PENDING);
// Returns: [CONFIRMED, CANCELLED, EXPIRED]
```

##### `validateTransition(from: BookingStatus, to: BookingStatus): void`

**القاعدة**: التحقق من الانتقال مع رمي `StateTransitionError` إذا كان غير صالح

**الاستخدام**:
```typescript
try {
  BookingStatePolicy.validateTransition(booking.status, newStatus);
} catch (error) {
  // error is StateTransitionError
  // error.currentStatus = 'pending'
  // error.targetStatus = 'confirmed'
  // error.validTransitions = ['confirmed', 'cancelled', 'expired']
}
```

---

### PaymentPolicy

**الموقع**: `src/policies/booking/payment.policy.ts`

#### Methods

##### `canPay(booking: IBooking): boolean`

**القاعدة**: التحقق من إمكانية الدفع

**الشروط**:
- ❌ لا يمكن الدفع إذا كان مدفوعاً بالفعل
- ❌ لا يمكن الدفع إذا كان ملغياً
- ❌ لا يمكن الدفع إذا كان منتهي الصلاحية

**الاستخدام**:
```typescript
if (!PaymentPolicy.canPay(booking)) {
  throw new ValidationError('Cannot pay for this booking');
}
```

##### `validateCanPay(booking: IBooking): void`

**القاعدة**: التحقق من إمكانية الدفع مع رمي `ValidationError` إذا كان غير صالح

**الاستخدام**:
```typescript
PaymentPolicy.validateCanPay(booking);
// Throws ValidationError with specific message if cannot pay
```

##### `getPaymentStatusAfterPayment(): PaymentStatus`

**القاعدة**: الحصول على حالة الدفع بعد الدفع الناجح

**الاستخدام**:
```typescript
booking.paymentStatus = PaymentPolicy.getPaymentStatusAfterPayment();
// Returns: PaymentStatus.PAID
```

##### `getBookingStatusAfterPayment(): BookingStatus`

**القاعدة**: الحصول على حالة الحجز بعد الدفع الناجح

**الاستخدام**:
```typescript
booking.status = PaymentPolicy.getBookingStatusAfterPayment();
// Returns: BookingStatus.CONFIRMED
```

##### `canRefund(paymentStatus: PaymentStatus): boolean`

**القاعدة**: التحقق من إمكانية الاسترداد

**الاستخدام**:
```typescript
if (PaymentPolicy.canRefund(booking.paymentStatus)) {
  // Process refund
}
```

##### `getPaymentStatusAfterCancellation(paymentStatus: PaymentStatus): PaymentStatus`

**القاعدة**: الحصول على حالة الدفع بعد الإلغاء

**القواعد**:
- إذا كان `PAID` → `REFUNDED`
- إذا كان `UNPAID` → `UNPAID` (لا تغيير)
- إذا كان `REFUNDED` → `REFUNDED` (لا تغيير)

**الاستخدام**:
```typescript
booking.paymentStatus = PaymentPolicy.getPaymentStatusAfterCancellation(
  booking.paymentStatus
);
```

---

### BookingSnapshotPolicy

**الموقع**: `src/policies/booking/snapshot.policy.ts`

#### Methods

##### `validateSnapshot(snapshot: BookingSnapshot): boolean`

**القاعدة**: التحقق من صحة Snapshot

**التحققات**:
- ✅ itemType موجود
- ✅ itemId موجود
- ✅ title موجود
- ✅ currency موجود
- ✅ locale موجود
- ✅ snapshotAt موجود
- ✅ pricePerPerson موجود (للأنشطة/الحزم)
- ✅ pricePerDay موجود (للسيارات)

**الاستخدام**:
```typescript
BookingSnapshotPolicy.validateSnapshot(snapshot);
```

##### `isSnapshotComplete(snapshot: BookingSnapshot): boolean`

**القاعدة**: التحقق من اكتمال Snapshot

**الاستخدام**:
```typescript
if (!BookingSnapshotPolicy.isSnapshotComplete(snapshot)) {
  throw new ValidationError('Snapshot is incomplete');
}
```

---

## Pricing Policies

### TaxPolicy

**الموقع**: `src/policies/pricing/tax.policy.ts`

#### Methods

##### `calculateTax(subtotal: number, taxRate?: number): number`

**القاعدة**: حساب الضريبة كنسبة مئوية من المبلغ الفرعي

**القيمة الافتراضية**: 10% (0.1)

**الاستخدام**:
```typescript
// استخدام القيمة الافتراضية (10%)
const tax = TaxPolicy.calculateTax(100); // 10

// استخدام معدل مخصص
const tax = TaxPolicy.calculateTax(100, 0.15); // 15
```

##### `getTaxRate(itemType?: BookingItemType): number`

**القاعدة**: الحصول على معدل الضريبة لنوع العنصر

**الاستخدام**:
```typescript
const taxRate = TaxPolicy.getTaxRate(BookingItemType.ACTIVITY);
const tax = TaxPolicy.calculateTax(subtotal, taxRate);
```

##### `getTaxRateFromConfig(): number`

**القاعدة**: الحصول على معدل الضريبة من متغيرات البيئة

**الاستخدام**:
```typescript
const taxRate = TaxPolicy.getTaxRateFromConfig();
```

---

### DiscountPolicy

**الموقع**: `src/policies/pricing/discount.policy.ts`

#### Methods

##### `applyDiscount(price: number, discountPercent: number): number`

**القاعدة**: تطبيق خصم كنسبة مئوية على السعر

**الاستخدام**:
```typescript
const originalPrice = 100;
const discountedPrice = DiscountPolicy.applyDiscount(originalPrice, 10); // 90
```

##### `calculateDiscountAmount(price: number, discountPercent: number): number`

**القاعدة**: حساب مبلغ الخصم

**الاستخدام**:
```typescript
const discountAmount = DiscountPolicy.calculateDiscountAmount(100, 10); // 10
```

##### `validateDiscount(discount: number): boolean`

**القاعدة**: التحقق من صحة قيمة الخصم (0-100%)

**الاستخدام**:
```typescript
DiscountPolicy.validateDiscount(10); // ✅ Valid
DiscountPolicy.validateDiscount(150); // ❌ Throws error
```

---

### DepositPolicy

**الموقع**: `src/policies/pricing/deposit.policy.ts`

#### Methods

##### `calculateDeposit(total: number, depositRate?: number): number`

**القاعدة**: حساب الدفعة المقدمة كنسبة مئوية من الإجمالي

**القيمة الافتراضية**: 20% (0.2)

**الاستخدام**:
```typescript
// استخدام القيمة الافتراضية (20%)
const deposit = DepositPolicy.calculateDeposit(100); // 20

// استخدام معدل مخصص
const deposit = DepositPolicy.calculateDeposit(100, 0.3); // 30
```

##### `getDepositRate(): number`

**القاعدة**: الحصول على معدل الدفعة المقدمة

**الاستخدام**:
```typescript
const depositRate = DepositPolicy.getDepositRate();
```

---

## Guest Policies

### GuestPolicy

**الموقع**: `src/policies/guest/guest.policy.ts`

#### Methods

##### `canCreateGuest(email: string): boolean`

**القاعدة**: التحقق من صحة البريد الإلكتروني

**الاستخدام**:
```typescript
GuestPolicy.canCreateGuest('test@example.com'); // ✅ Valid
GuestPolicy.canCreateGuest('invalid-email'); // ❌ Throws error
```

##### `canUpdateGuest(guest: IGuest): boolean`

**القاعدة**: التحقق من إمكانية تحديث الضيف

**الشروط**:
- ✅ لا يكون مرتبطاً بمستخدم (userId === null)
- ✅ لا يكون منتهي الصلاحية

**الاستخدام**:
```typescript
if (!GuestPolicy.canUpdateGuest(guest)) {
  throw new ValidationError('Cannot update guest');
}
```

##### `canLinkToUser(guest: IGuest): boolean`

**القاعدة**: التحقق من إمكانية ربط الضيف بمستخدم

**الاستخدام**:
```typescript
if (!GuestPolicy.canLinkToUser(guest)) {
  throw new ValidationError('Guest cannot be linked to user');
}
```

##### `calculateExpirationDate(days?: number): Date`

**القاعدة**: حساب تاريخ انتهاء صلاحية الضيف

**القيمة الافتراضية**: 30 يوم

**الاستخدام**:
```typescript
// استخدام القيمة الافتراضية (30 يوم)
const expiresAt = GuestPolicy.calculateExpirationDate();

// استخدام عدد أيام مخصص
const expiresAt = GuestPolicy.calculateExpirationDate(60);
```

##### `isGuestSessionValid(guest: IGuest): boolean`

**القاعدة**: التحقق من صحة جلسة الضيف

**الاستخدام**:
```typescript
if (!GuestPolicy.isGuestSessionValid(guest)) {
  throw new ValidationError('Guest session has expired');
}
```

---

## كيفية الاستخدام

### 1. Import Policy

```typescript
import { BookingPolicy, BookingStatePolicy } from '../policies';
```

### 2. استخدام Policy في Service

```typescript
export const createBooking = async (data: CreateBookingData) => {
  // Validate using policy
  BookingPolicy.validateBookingData(data);

  // Check guest using policy
  const guest = await Guest.findById(data.guestId);
  if (!BookingPolicy.canCreateBooking(guest)) {
    throw new ValidationError('Guest session has expired');
  }

  // Calculate expiration using policy
  const expiresAt = BookingPolicy.calculateExpirationDate();

  // ... rest of logic
};
```

### 3. استخدام Policy في State Transitions

```typescript
export const updateBookingStatus = async (
  bookingNumber: string,
  status: BookingStatus
) => {
  const booking = await findByBookingNumber(bookingNumber);

  // Validate transition using policy
  try {
    BookingStatePolicy.validateTransition(booking.status, status);
  } catch (error) {
    throw new ValidationError(error.message);
  }

  booking.status = status;
  await booking.save();
};
```

---

## أمثلة عملية

### مثال 1: إنشاء حجز

```typescript
// src/services/booking.service.ts
import { BookingPolicy, BookingSnapshotPolicy } from '../policies';

export const createBooking = async (data: CreateBookingData) => {
  // 1. Validate booking data
  BookingPolicy.validateBookingData(data);

  // 2. Check guest
  const guest = await Guest.findById(data.guestId);
  if (!BookingPolicy.canCreateBooking(guest)) {
    throw new ValidationError('Guest session has expired');
  }

  // 3. Create snapshot
  const snapshot = await createBookingSnapshot(...);
  
  // 4. Validate snapshot
  BookingSnapshotPolicy.validateSnapshot(snapshot);

  // 5. Calculate expiration
  const expiresAt = BookingPolicy.calculateExpirationDate();

  // 6. Create booking
  const booking = new Booking({
    ...data,
    snapshot,
    expiresAt,
  });

  return await booking.save();
};
```

### مثال 2: تحديث حالة الحجز

```typescript
// src/services/booking.service.ts
import { BookingStatePolicy } from '../policies';

export const updateBookingStatus = async (
  bookingNumber: string,
  status: BookingStatus
) => {
  const booking = await findByBookingNumber(bookingNumber);

  // Validate transition
  BookingStatePolicy.validateTransition(booking.status, status);

  booking.status = status;
  return await booking.save();
};
```

### مثال 3: حساب السعر مع الضريبة

```typescript
// src/services/booking.service.ts
import { TaxPolicy } from '../policies';

const calculateBookingPrice = (subtotal: number) => {
  // Calculate tax using policy
  const tax = TaxPolicy.calculateTax(subtotal);
  
  const totalPrice = subtotal + tax;
  
  return { subtotal, tax, totalPrice };
};
```

---

## أفضل الممارسات

### ✅ DO

1. **استخدم Policies دائماً**: لا تكتب القواعد مباشرة في Services
2. **استخدم Policy methods**: استخدم الـ methods الموجودة بدلاً من إعادة كتابة المنطق
3. **اختبر Policies**: اكتب unit tests لكل Policy
4. **وثّق القواعد**: اكتب JSDoc comments لكل method

### ❌ DON'T

1. **لا تكتب قواعد مباشرة في Services**: استخدم Policies
2. **لا تخلط المنطق**: Policies للقواعد، Services للتنسيق
3. **لا تضيف state**: Policies يجب أن تكون stateless
4. **لا تستخدم instance methods**: استخدم static methods فقط

---

## الخلاصة

Business Policy Layer يوفر:

- ✅ **فصل واضح**: القواعد منفصلة عن منطق التطبيق
- ✅ **سهولة الصيانة**: تغيير القواعد في مكان واحد
- ✅ **سهولة الاختبار**: اختبار كل قاعدة على حدة
- ✅ **الوضوح**: القواعد مكتوبة بشكل صريح
- ✅ **إعادة الاستخدام**: نفس القاعدة في أماكن متعددة

---

**تم إعداد هذا التوثيق بواسطة**: AI Assistant  
**التاريخ**: 2025-01-27  
**الإصدار**: 1.0

