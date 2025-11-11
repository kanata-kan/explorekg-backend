# قواعد الحجز - Booking Business Rules

**التاريخ**: 2025-01-27  
**المرحلة**: Phase 7.1  
**الحالة**: ✅ موثق

---

## 📋 جدول المحتويات

1. [قواعد إنشاء الحجز](#قواعد-إنشاء-الحجز)
2. [قواعد حالة الحجز](#قواعد-حالة-الحجز)
3. [قواعد الدفع](#قواعد-الدفع)
4. [قواعد الإلغاء](#قواعد-الإلغاء)
5. [قواعد انتهاء الصلاحية](#قواعد-انتهاء-الصلاحية)
6. [State Transitions Diagram](#state-transitions-diagram)

---

## قواعد إنشاء الحجز

### BR-001: صلاحية الضيف

**القاعدة**: لا يمكن إنشاء حجز لضيف منتهي الصلاحية

**التنفيذ**: `BookingPolicy.canCreateBooking(guest)`

**الكود**:
```typescript
if (!BookingPolicy.canCreateBooking(guest)) {
  throw new ValidationError('Guest session has expired');
}
```

---

### BR-002: التحقق من بيانات الحجز

**القاعدة**: يجب التحقق من جميع بيانات الحجز قبل الإنشاء

**الشروط**:
- ✅ `guestId` موجود
- ✅ `itemType` موجود وصحيح
- ✅ `itemId` موجود
- ✅ `startDate < endDate` (إن وُجدت)
- ✅ `numberOfPersons >= 1` (للأنشطة/الحزم)
- ✅ `numberOfDays >= 1` (للسيارات)

**التنفيذ**: `BookingPolicy.validateBookingData(data)`

---

### BR-003: Snapshot غير قابل للتعديل

**القاعدة**: يتم حفظ نسخة ثابتة من العنصر المحجوز وقت الحجز

**السبب**: حماية من تغيير الأسعار بعد الحجز

**التنفيذ**: `BookingSnapshotPolicy.validateSnapshot(snapshot)`

---

### BR-004: حساب السعر

**القاعدة**: 
- **TravelPack/Activity**: `pricePerPerson × numberOfPersons`
- **Car**: `pricePerDay × numberOfDays`

**التنفيذ**: في `booking.service.ts:calculateBookingPrice()`

---

### BR-005: الضريبة

**القاعدة**: الضريبة ثابتة 10% من المبلغ الفرعي

**التنفيذ**: `TaxPolicy.calculateTax(subtotal)`

**الكود**:
```typescript
const tax = TaxPolicy.calculateTax(subtotal); // 10% default
```

---

### BR-006: انتهاء الصلاحية

**القاعدة**: الحجوزات غير المدفوعة تنتهي بعد 24 ساعة

**التنفيذ**: `BookingPolicy.calculateExpirationDate()`

**الكود**:
```typescript
const expiresAt = BookingPolicy.calculateExpirationDate(); // 24 hours from now
```

---

## قواعد حالة الحجز

### BR-007: الحالة الأولية

**القاعدة**: الحجز الجديد يكون `PENDING` و `UNPAID`

**التنفيذ**: في `booking.service.ts:createBooking()`

---

### BR-008: State Transitions

**القاعدة**: فقط الانتقالات الصالحة مسموحة

**الانتقالات الصالحة**:
- `PENDING` → `CONFIRMED`, `CANCELLED`, `EXPIRED`
- `CONFIRMED` → `CANCELLED`
- `CANCELLED` → (لا انتقالات)
- `EXPIRED` → (لا انتقالات)

**التنفيذ**: `BookingStatePolicy.canTransition(from, to)`

**الكود**:
```typescript
if (!BookingStatePolicy.canTransition(booking.status, newStatus)) {
  throw new ValidationError('Invalid state transition');
}
```

---

### BR-009: التعديل

**القاعدة**: لا يمكن تعديل حجز ملغي أو منتهي الصلاحية

**التنفيذ**: `BookingStatePolicy.canModify(status)`

**الكود**:
```typescript
if (!BookingStatePolicy.canModify(booking.status)) {
  throw new ValidationError('Cannot modify cancelled or expired booking');
}
```

---

## قواعد الدفع

### BR-010: شروط الدفع

**القاعدة**: لا يمكن الدفع إذا:
- ❌ الحجز ملغي
- ❌ الحجز منتهي الصلاحية
- ❌ الحجز مدفوع بالفعل

**التنفيذ**: `BookingStatePolicy.canPay(status, paymentStatus, isExpired)`

**الكود**:
```typescript
if (!BookingStatePolicy.canPay(
  booking.status,
  booking.paymentStatus,
  booking.isExpired()
)) {
  throw new ValidationError('Cannot pay for this booking');
}
```

---

### BR-011: تحديث الحالة بعد الدفع

**القاعدة**: عند الدفع → `status = CONFIRMED`, `paymentStatus = PAID`

**التنفيذ**: في `booking.service.ts:markAsPaid()`

---

## قواعد الإلغاء

### BR-012: شروط الإلغاء

**القاعدة**: يمكن الإلغاء فقط إذا كانت الحالة `PENDING` أو `CONFIRMED`

**التنفيذ**: `BookingStatePolicy.canCancel(status)`

**الكود**:
```typescript
if (!BookingStatePolicy.canCancel(booking.status)) {
  throw new ValidationError('Booking cannot be cancelled');
}
```

---

### BR-013: الاسترداد التلقائي

**القاعدة**: إذا كان الحجز مدفوعاً وتم إلغاؤه → `paymentStatus = REFUNDED`

**التنفيذ**: في `booking.service.ts:cancelBooking()`

---

## قواعد انتهاء الصلاحية

### BR-014: انتهاء الصلاحية التلقائي

**القاعدة**: الحجوزات غير المدفوعة تنتهي بعد 24 ساعة

**التنفيذ**: TTL index في MongoDB + `cleanExpiredBookings()`

---

### BR-015: تحديث الحجوزات المنتهية

**القاعدة**: لا يمكن تحديث حجز منتهي الصلاحية

**التنفيذ**: `BookingStatePolicy.canModify(status)`

---

## State Transitions Diagram

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

Legend:
- PENDING: Waiting for payment
- CONFIRMED: Paid and confirmed
- CANCELLED: User or system cancelled
- EXPIRED: Unpaid after 24 hours
```

---

## ملخص القواعد

| القاعدة | الوصف | Policy Method |
|---------|-------|---------------|
| BR-001 | صلاحية الضيف | `BookingPolicy.canCreateBooking()` |
| BR-002 | التحقق من البيانات | `BookingPolicy.validateBookingData()` |
| BR-003 | Snapshot | `BookingSnapshotPolicy.validateSnapshot()` |
| BR-005 | الضريبة | `TaxPolicy.calculateTax()` |
| BR-006 | انتهاء الصلاحية | `BookingPolicy.calculateExpirationDate()` |
| BR-008 | State Transitions | `BookingStatePolicy.canTransition()` |
| BR-009 | التعديل | `BookingStatePolicy.canModify()` |
| BR-010 | الدفع | `BookingStatePolicy.canPay()` |
| BR-012 | الإلغاء | `BookingStatePolicy.canCancel()` |

---

**تم إعداد هذا التوثيق بواسطة**: AI Assistant  
**التاريخ**: 2025-01-27  
**الإصدار**: 1.0

