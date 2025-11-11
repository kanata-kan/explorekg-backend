# State Management - إدارة حالات الحجز

**التاريخ**: 2025-01-27  
**المرحلة**: Phase 7.3 - State Management  
**الحالة**: ✅ موثق

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [State Machine](#state-machine)
3. [BookingStatePolicy](#bookingstatepolicy)
4. [PaymentPolicy](#paymentpolicy)
5. [StateTransitionError](#statetransitionerror)
6. [أمثلة الاستخدام](#أمثلة-الاستخدام)

---

## نظرة عامة

تم تحسين نظام إدارة حالات الحجز في Phase 7.3 من خلال:

- ✅ **State Machine كامل**: جميع الانتقالات محمية ومتحقق منها
- ✅ **Payment Policy منفصل**: قواعد الدفع منفصلة وواضحة
- ✅ **StateTransitionError**: رسائل خطأ واضحة ومفيدة
- ✅ **Instance Methods**: سهولة الاستخدام من Booking Model

### المكونات الرئيسية

1. **BookingStatePolicy** (`src/policies/booking/state.policy.ts`) - إدارة انتقالات الحالة
2. **PaymentPolicy** (`src/policies/booking/payment.policy.ts`) - قواعد الدفع والاسترداد
3. **StateTransitionError** (`src/utils/AppError.ts`) - خطأ مخصص للانتقالات

---

## State Machine

### الحالات (BookingStatus)

```typescript
enum BookingStatus {
  PENDING = 'pending',      // بانتظار الدفع
  CONFIRMED = 'confirmed', // مؤكد ومدفوع
  CANCELLED = 'cancelled', // ملغي
  EXPIRED = 'expired',     // منتهي الصلاحية
}
```

### الانتقالات الصالحة

```
PENDING → CONFIRMED, CANCELLED, EXPIRED
CONFIRMED → CANCELLED
CANCELLED → (لا انتقالات - حالة نهائية)
EXPIRED → (لا انتقالات - حالة نهائية)
```

### Diagram

```
                    ┌─────────┐
                    │ PENDING │
                    └────┬────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐    ┌──────────┐    ┌─────────┐
   │CONFIRMED│    │CANCELLED │    │ EXPIRED │
   └────┬────┘    └──────────┘    └─────────┘
        │
        ▼
   ┌──────────┐
   │CANCELLED │
   └──────────┘
```

---

## BookingStatePolicy

### الوظائف الرئيسية

#### `canTransition(from, to): boolean`

التحقق من إمكانية الانتقال بين الحالات.

```typescript
const canTransition = BookingStatePolicy.canTransition(
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED
); // true
```

#### `validateTransition(from, to): void`

التحقق من الانتقال مع رمي `StateTransitionError` إذا كان غير صالح.

```typescript
try {
  BookingStatePolicy.validateTransition(
    BookingStatus.CANCELLED,
    BookingStatus.CONFIRMED
  );
} catch (error) {
  // error is StateTransitionError
  // error.currentStatus = 'cancelled'
  // error.targetStatus = 'confirmed'
  // error.validTransitions = []
}
```

#### `getValidNextStatuses(status): BookingStatus[]`

الحصول على الحالات التالية الصالحة.

```typescript
const validStatuses = BookingStatePolicy.getValidNextStatuses(
  BookingStatus.PENDING
);
// Returns: [CONFIRMED, CANCELLED, EXPIRED]
```

#### `getValidTransitions(status): BookingStatus[]`

Alias لـ `getValidNextStatuses()`.

```typescript
const transitions = BookingStatePolicy.getValidTransitions(
  BookingStatus.PENDING
);
// Returns: [CONFIRMED, CANCELLED, EXPIRED]
```

#### `canModify(status): boolean`

التحقق من إمكانية تعديل الحجز.

```typescript
const canModify = BookingStatePolicy.canModify(BookingStatus.PENDING); // true
const cannotModify = BookingStatePolicy.canModify(BookingStatus.CANCELLED); // false
```

#### `canCancel(status): boolean`

التحقق من إمكانية إلغاء الحجز.

```typescript
const canCancel = BookingStatePolicy.canCancel(BookingStatus.PENDING); // true
const cannotCancel = BookingStatePolicy.canCancel(BookingStatus.EXPIRED); // false
```

---

## PaymentPolicy

### الوظائف الرئيسية

#### `canPay(booking): boolean`

التحقق من إمكانية الدفع.

```typescript
const canPay = PaymentPolicy.canPay({
  status: BookingStatus.PENDING,
  paymentStatus: PaymentStatus.UNPAID,
  isExpired: () => false,
}); // true
```

**الشروط**:
- ❌ لا يمكن الدفع إذا كان مدفوعاً بالفعل
- ❌ لا يمكن الدفع إذا كان ملغياً
- ❌ لا يمكن الدفع إذا كان منتهي الصلاحية

#### `validateCanPay(booking): void`

التحقق من إمكانية الدفع مع رمي `ValidationError` إذا كان غير صالح.

```typescript
try {
  PaymentPolicy.validateCanPay(booking);
} catch (error) {
  // error.message = 'Booking already paid' | 'Cannot pay for cancelled booking' | etc.
}
```

#### `getPaymentStatusAfterPayment(): PaymentStatus`

الحصول على حالة الدفع بعد الدفع الناجح.

```typescript
const paymentStatus = PaymentPolicy.getPaymentStatusAfterPayment();
// Returns: PaymentStatus.PAID
```

#### `getBookingStatusAfterPayment(): BookingStatus`

الحصول على حالة الحجز بعد الدفع الناجح.

```typescript
const bookingStatus = PaymentPolicy.getBookingStatusAfterPayment();
// Returns: BookingStatus.CONFIRMED
```

#### `canRefund(paymentStatus): boolean`

التحقق من إمكانية الاسترداد.

```typescript
const canRefund = PaymentPolicy.canRefund(PaymentStatus.PAID); // true
const cannotRefund = PaymentPolicy.canRefund(PaymentStatus.UNPAID); // false
```

#### `getPaymentStatusAfterCancellation(paymentStatus): PaymentStatus`

الحصول على حالة الدفع بعد الإلغاء.

```typescript
// إذا كان مدفوعاً → REFUNDED
const status1 = PaymentPolicy.getPaymentStatusAfterCancellation(PaymentStatus.PAID);
// Returns: PaymentStatus.REFUNDED

// إذا كان غير مدفوع → يبقى كما هو
const status2 = PaymentPolicy.getPaymentStatusAfterCancellation(PaymentStatus.UNPAID);
// Returns: PaymentStatus.UNPAID
```

---

## StateTransitionError

### الوصف

خطأ مخصص للانتقالات غير الصالحة. يوفر معلومات مفصلة عن الخطأ.

### الخصائص

```typescript
class StateTransitionError extends ValidationError {
  currentStatus?: string;      // الحالة الحالية
  targetStatus?: string;       // الحالة المطلوبة
  validTransitions?: string[]; // الانتقالات الصالحة
}
```

### الاستخدام

```typescript
try {
  BookingStatePolicy.validateTransition(
    BookingStatus.CANCELLED,
    BookingStatus.CONFIRMED
  );
} catch (error) {
  if (error instanceof StateTransitionError) {
    console.log('Current:', error.currentStatus); // 'cancelled'
    console.log('Target:', error.targetStatus); // 'confirmed'
    console.log('Valid:', error.validTransitions); // []
  }
}
```

---

## أمثلة الاستخدام

### مثال 1: تحديث حالة الحجز

```typescript
import { updateBookingStatus } from '../services/booking.service';
import { BookingStatus } from '../models/booking.model';

// ✅ Valid transition
await updateBookingStatus('BKG-123', BookingStatus.CONFIRMED);

// ❌ Invalid transition - throws StateTransitionError
try {
  await updateBookingStatus('BKG-123', BookingStatus.PENDING);
} catch (error) {
  // error.currentStatus = 'confirmed'
  // error.targetStatus = 'pending'
  // error.validTransitions = ['cancelled']
}
```

### مثال 2: دفع الحجز

```typescript
import { markAsPaid } from '../services/booking.service';
import { PaymentPolicy } from '../policies';

// PaymentPolicy.validateCanPay() is called internally
// PaymentPolicy.getPaymentStatusAfterPayment() is used
// PaymentPolicy.getBookingStatusAfterPayment() is used

await markAsPaid('BKG-123', {
  paymentMethod: 'credit_card',
  paymentTransactionId: 'TXN-456',
});
```

### مثال 3: إلغاء الحجز

```typescript
import { cancelBooking } from '../services/booking.service';
import { PaymentPolicy } from '../policies';

// PaymentPolicy.getPaymentStatusAfterCancellation() is used
await cancelBooking('BKG-123', 'Changed plans');

// If booking was paid → paymentStatus becomes REFUNDED
// If booking was unpaid → paymentStatus stays UNPAID
```

### مثال 4: استخدام Instance Methods

```typescript
const booking = await Booking.findByBookingNumber('BKG-123');

// Check if can transition
const canTransition = booking.canTransitionTo(BookingStatus.CONFIRMED);

// Get valid next statuses
const validStatuses = booking.getValidNextStatuses();
// Returns: ['confirmed', 'cancelled', 'expired']

// Check if can be cancelled
const canCancel = booking.canBeCancelled();
```

---

## التكامل مع الخدمات

### Booking Service

```typescript
// src/services/booking.service.ts

// Update status
export const updateBookingStatus = async (
  bookingNumber: string,
  status: BookingStatus
): Promise<IBooking> => {
  const booking = await findByBookingNumber(bookingNumber);
  
  // Validate transition
  BookingStatePolicy.validateTransition(booking.status, status);
  
  booking.status = status;
  await booking.save();
  
  return booking;
};

// Mark as paid
export const markAsPaid = async (
  bookingNumber: string,
  paymentData: { paymentMethod: string; paymentTransactionId: string }
): Promise<IBooking> => {
  const booking = await findByBookingNumber(bookingNumber);
  
  // Validate can pay
  PaymentPolicy.validateCanPay(booking);
  
  // Get correct statuses
  booking.paymentStatus = PaymentPolicy.getPaymentStatusAfterPayment();
  booking.status = PaymentPolicy.getBookingStatusAfterPayment();
  
  await booking.save();
  return booking;
};

// Cancel booking
export const cancelBooking = async (
  bookingNumber: string,
  reason?: string
): Promise<IBooking> => {
  const booking = await findByBookingNumber(bookingNumber);
  
  // Validate can cancel
  if (!BookingStatePolicy.canCancel(booking.status)) {
    throw new ValidationError('Cannot cancel booking');
  }
  
  // Validate transition
  BookingStatePolicy.validateTransition(booking.status, BookingStatus.CANCELLED);
  
  booking.status = BookingStatus.CANCELLED;
  booking.paymentStatus = PaymentPolicy.getPaymentStatusAfterCancellation(
    booking.paymentStatus
  );
  
  await booking.save();
  return booking;
};
```

---

## ملخص

| الوظيفة | الوصف | الاستخدام |
|---------|-------|-----------|
| `canTransition` | فحص إمكانية الانتقال | BookingService |
| `validateTransition` | التحقق مع خطأ واضح | BookingService |
| `getValidNextStatuses` | الحصول على الحالات التالية | BookingService, BookingModel |
| `canModify` | فحص إمكانية التعديل | BookingService |
| `canCancel` | فحص إمكانية الإلغاء | BookingService |
| `canPay` | فحص إمكانية الدفع | PaymentPolicy |
| `validateCanPay` | التحقق من الدفع | BookingService |
| `getPaymentStatusAfterPayment` | الحالة بعد الدفع | BookingService |
| `getBookingStatusAfterCancellation` | الحالة بعد الإلغاء | BookingService |

---

**تم إعداد هذا التوثيق بواسطة**: AI Assistant  
**التاريخ**: 2025-01-27  
**الإصدار**: 1.0

