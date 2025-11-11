# خطة تنفيذ إعادة هيكلة منطق الأعمال - Business Logic Refactor Implementation Plan

**المشروع**: ExploreKG Backend  
**التاريخ**: 2025-01-27  
**المرحلة**: Phase 7 - Implementation Planning  
**الحالة**: Planning Complete - Ready for Phase 8 Execution

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [استراتيجية التنفيذ](#استراتيجية-التنفيذ)
3. [المراحل التفصيلية](#المراحل-التفصيلية)
4. [إدارة المخاطر](#إدارة-المخاطر)
5. [استراتيجية الاختبار](#استراتيجية-الاختبار)
6. [التوثيق](#التوثيق)
7. [الجدول الزمني المقترح](#الجدول-الزمني-المقترح)
8. [نقاط التحقق والنجاح](#نقاط-التحقق-والنجاح)

---

## نظرة عامة

### 1.1 الهدف من الخطة

تحويل طبقة منطق الأعمال الحالية من:
- ❌ قواعد مبعثرة في الخدمات
- ❌ تكرار في المنطق
- ❌ عدم اتساق في المعالجة
- ❌ صعوبة في الصيانة

إلى:
- ✅ Business Policy Layer منظم
- ✅ منطق موحد وقابل لإعادة الاستخدام
- ✅ اتساق كامل في المعالجة
- ✅ سهولة الصيانة والاختبار

### 1.2 المبادئ التوجيهية

1. **التكامل التدريجي**: لا تغييرات جذرية دفعة واحدة
2. **التوافق مع الإصدارات السابقة**: النظام يعمل في كل مرحلة
3. **الاختبار أولاً**: اختبار كل مرحلة قبل الانتقال للتالية
4. **الوثائق المتزامنة**: توثيق كل تغيير فوراً
5. **إدارة المخاطر**: تقليل المخاطر في كل خطوة

### 1.3 نطاق العمل

**يشمل**:
- إنشاء Business Policy Layer
- توحيد نظام التسعير
- State Management للحجوزات
- Availability & Validation Services
- توحيد الحذف الناعم
- Notification Service
- الاختبارات الشاملة

**لا يشمل**:
- تغييرات في واجهة API (Controllers/Routes)
- تغييرات في قاعدة البيانات (Schemas)
- تغييرات في البنية التحتية

---

## استراتيجية التنفيذ

### 2.1 النهج العام

```
Phase 7.1: Foundation (Policies Infrastructure)
    ↓
Phase 7.2: Pricing Unification
    ↓
Phase 7.3: State Management
    ↓
Phase 7.4: Availability & Validation
    ↓
Phase 7.5: Soft Delete & Catalog Consistency
    ↓
Phase 7.6: Notification Service
    ↓
Phase 7.7: Testing & Documentation
```

### 2.2 مبدأ التكامل التدريجي

**الاستراتيجية**: 
1. إنشاء Policy جديد بجانب الكود القديم
2. تحديث Service لاستخدام Policy (مع الاحتفاظ بالكود القديم)
3. اختبار شامل
4. إزالة الكود القديم
5. الانتقال للمرحلة التالية

**مثال**:
```typescript
// Before: booking.service.ts
const tax = subtotal * 0.1; // Old logic

// During transition:
import { TaxPolicy } from '../policies/pricing/tax.policy';
const tax = TaxPolicy.calculateTax(subtotal); // New logic
// Old logic kept as comment for reference

// After: Old logic removed
```

### 2.3 إدارة التبعيات

**التبعيات الرئيسية**:
- Phase 7.1 (Foundation) → يجب أن يكتمل أولاً
- Phase 7.2 (Pricing) → يعتمد على 7.1
- Phase 7.3 (State) → يعتمد على 7.1
- Phase 7.4 (Availability) → يعتمد على 7.1
- Phase 7.5 (Soft Delete) → مستقل نسبياً
- Phase 7.6 (Notification) → مستقل نسبياً
- Phase 7.7 (Testing) → يعتمد على جميع المراحل

---

## المراحل التفصيلية

## Phase 7.1: Business Policy Layer Foundation

### الهدف
إنشاء البنية التحتية لـ Business Policy Layer وإنشاء أول مجموعة من Policies.

### الأولوية
🔴 **عالية** - أساسي لجميع المراحل التالية

### النطاق
- إنشاء هيكل `policies/` directory
- إنشاء Policies أساسية للحجز
- إنشاء Policies أساسية للتسعير
- تحديث `booking.service.ts` لاستخدام Policies الجديدة

### المهام التفصيلية

#### Task 1.1: إنشاء هيكل المجلدات
- [ ] إنشاء `src/policies/` directory
- [ ] إنشاء `src/policies/booking/`
- [ ] إنشاء `src/policies/pricing/`
- [ ] إنشاء `src/policies/guest/`
- [ ] إنشاء `src/policies/catalog/`
- [ ] إنشاء `src/policies/index.ts` (barrel export)

#### Task 1.2: Booking Policies الأساسية
- [ ] إنشاء `src/policies/booking/booking.policy.ts`
  - [ ] `canCreateBooking(guest)` - فحص صلاحية الضيف
  - [ ] `calculateExpirationDate()` - حساب تاريخ انتهاء الصلاحية
  - [ ] `validateBookingData(data)` - التحقق من بيانات الحجز
- [ ] إنشاء `src/policies/booking/state.policy.ts`
  - [ ] `canTransition(from, to)` - فحص الانتقال بين الحالات
  - [ ] `canModify(status)` - فحص إمكانية التعديل
  - [ ] `canCancel(status)` - فحص إمكانية الإلغاء
  - [ ] `canPay(status, paymentStatus)` - فحص إمكانية الدفع
- [ ] إنشاء `src/policies/booking/snapshot.policy.ts`
  - [ ] `createSnapshot(itemType, itemId, locale)` - إنشاء snapshot
  - [ ] `validateSnapshot(snapshot)` - التحقق من snapshot

#### Task 1.3: Pricing Policies الأساسية
- [ ] إنشاء `src/policies/pricing/tax.policy.ts`
  - [ ] `calculateTax(subtotal, taxRate?)` - حساب الضريبة
  - [ ] `getTaxRate(itemType?)` - الحصول على معدل الضريبة
- [ ] إنشاء `src/policies/pricing/discount.policy.ts`
  - [ ] `applyDiscount(price, discountPercent)` - تطبيق خصم
  - [ ] `validateDiscount(discount)` - التحقق من الخصم
- [ ] إنشاء `src/policies/pricing/deposit.policy.ts`
  - [ ] `calculateDeposit(total, depositRate?)` - حساب الدفعة المقدمة
  - [ ] `getDepositRate()` - الحصول على معدل الدفعة

#### Task 1.4: Guest Policies الأساسية
- [ ] إنشاء `src/policies/guest/guest.policy.ts`
  - [ ] `canCreateGuest(email)` - فحص إمكانية إنشاء ضيف
  - [ ] `canUpdateGuest(guest)` - فحص إمكانية التحديث
  - [ ] `canLinkToUser(guest)` - فحص إمكانية الربط
  - [ ] `calculateExpirationDate(days?)` - حساب تاريخ انتهاء الصلاحية

#### Task 1.5: التكامل مع Booking Service
- [ ] تحديث `booking.service.ts:createBooking()`
  - [ ] استبدال `guest.isExpired()` بـ `BookingPolicy.canCreateBooking()`
  - [ ] استبدال حساب `expiresAt` بـ `BookingPolicy.calculateExpirationDate()`
- [ ] تحديث `booking.service.ts:updateBookingStatus()`
  - [ ] إضافة فحص `BookingStatePolicy.canTransition()`
- [ ] تحديث `booking.service.ts:markAsPaid()`
  - [ ] إضافة فحص `BookingStatePolicy.canPay()`
- [ ] تحديث `booking.service.ts:cancelBooking()`
  - [ ] إضافة فحص `BookingStatePolicy.canCancel()`

#### Task 1.6: التكامل مع Guest Service
- [ ] تحديث `guest.service.ts:createGuest()`
  - [ ] استخدام `GuestPolicy.canCreateGuest()`
  - [ ] استخدام `GuestPolicy.calculateExpirationDate()`
- [ ] تحديث `guest.service.ts:updateGuest()`
  - [ ] استخدام `GuestPolicy.canUpdateGuest()`
- [ ] تحديث `guest.service.ts:linkToUser()`
  - [ ] استخدام `GuestPolicy.canLinkToUser()`

### الملفات المتأثرة

**ملفات جديدة**:
- `src/policies/booking/booking.policy.ts`
- `src/policies/booking/state.policy.ts`
- `src/policies/booking/snapshot.policy.ts`
- `src/policies/pricing/tax.policy.ts`
- `src/policies/pricing/discount.policy.ts`
- `src/policies/pricing/deposit.policy.ts`
- `src/policies/guest/guest.policy.ts`
- `src/policies/index.ts`

**ملفات معدلة**:
- `src/services/booking.service.ts`
- `src/services/guest.service.ts`

### معايير النجاح

✅ **الاكتمال**:
- جميع Policies الأساسية موجودة
- جميع Services تستخدم Policies
- لا توجد أخطاء في التجميع

✅ **الوظيفية**:
- جميع الاختبارات الحالية تمر
- لا توجد regressions
- السلوك مطابق للكود القديم

✅ **الجودة**:
- كل Policy له JSDoc comments
- TypeScript types صحيحة
- لا توجد linter errors

### الاختبارات المطلوبة

- [ ] Unit tests لكل Policy function
- [ ] Integration tests للـ Services المحدثة
- [ ] Regression tests للتأكد من عدم كسر الوظائف الحالية

### المدة المقدرة
**3-4 أيام عمل**

---

## Phase 7.2: Pricing Unification

### الهدف
توحيد نظام التسعير وإنشاء Pricing Service موحد.

### الأولوية
🔴 **عالية** - يحل مشكلة عدم الاتساق في الضريبة والخصومات

### النطاق
- إنشاء `PricingService` موحد
- توحيد حساب الضريبة في جميع الخدمات
- توحيد حساب الخصومات
- تحديث `booking.service.ts` و `packRelation.service.ts`

### المهام التفصيلية

#### Task 2.1: إنشاء Pricing Service
- [ ] إنشاء `src/services/pricing.service.ts`
  - [ ] `calculatePrice()` - حساب السعر الموحد
  - [ ] `calculateSubtotal()` - حساب المبلغ الفرعي
  - [ ] `applyTax()` - تطبيق الضريبة
  - [ ] `applyDiscount()` - تطبيق الخصم
  - [ ] `calculateTotal()` - حساب الإجمالي
- [ ] دعم أنواع مختلفة من العناصر (TravelPack, Activity, Car)
- [ ] دعم خيارات متعددة (taxRate, discount, depositRate)

#### Task 2.2: تحديث Tax Policy
- [ ] تحديث `src/policies/pricing/tax.policy.ts`
  - [ ] جعل معدل الضريبة قابلاً للتكوين (env variable أو config)
  - [ ] دعم معدلات ضريبة مختلفة حسب نوع العنصر
  - [ ] إضافة `getTaxRateForItemType(itemType)`

#### Task 2.3: تحديث Booking Service
- [ ] تحديث `booking.service.ts:calculateBookingPrice()`
  - [ ] استخدام `PricingService.calculatePrice()` بدلاً من المنطق المباشر
  - [ ] استخدام `TaxPolicy.calculateTax()` للضريبة
  - [ ] إزالة الكود القديم بعد التأكد من العمل

#### Task 2.4: تحديث PackRelation Service
- [ ] تحديث `packRelation.service.ts:calculateTotalPrice()`
  - [ ] استخدام `PricingService` للعمليات المشتركة
  - [ ] الحفاظ على منطق الخصومات المتعددة المستويات
  - [ ] إضافة دعم الضريبة (اختياري في هذه المرحلة)

#### Task 2.5: Configuration Management
- [ ] إنشاء `src/config/pricing.config.ts`
  - [ ] معدلات الضريبة الافتراضية
  - [ ] معدلات الدفعة المقدمة
  - [ ] إعدادات الخصومات
- [ ] دعم قراءة من environment variables

### الملفات المتأثرة

**ملفات جديدة**:
- `src/services/pricing.service.ts`
- `src/config/pricing.config.ts`

**ملفات معدلة**:
- `src/policies/pricing/tax.policy.ts`
- `src/services/booking.service.ts`
- `src/services/packRelation.service.ts`

### معايير النجاح

✅ **الاتساق**:
- نفس منطق التسعير في جميع الخدمات
- الضريبة محسوبة بنفس الطريقة
- الخصومات موحدة

✅ **الوظيفية**:
- جميع الاختبارات تمر
- الأسعار صحيحة في جميع السيناريوهات
- لا توجد regressions

✅ **المرونة**:
- معدلات الضريبة قابلة للتكوين
- سهولة إضافة خصومات جديدة

### الاختبارات المطلوبة

- [ ] Unit tests لـ `PricingService`
- [ ] Unit tests لـ `TaxPolicy` مع معدلات مختلفة
- [ ] Integration tests للتسعير في Booking و PackRelation
- [ ] Comparison tests للتأكد من تطابق النتائج مع الكود القديم

### المدة المقدرة
**4-5 أيام عمل**

---

## Phase 7.3: State Management

### الهدف
تنفيذ State Machine للحجوزات لمنع الانتقالات غير الصالحة.

### الأولوية
🔴 **عالية** - يحل مشكلة تحديث الحالة غير المحمي

### النطاق
- تحسين `BookingStatePolicy` ليكون State Machine كامل
- تحديث جميع دوال تحديث الحالة
- إضافة validation للانتقالات

### المهام التفصيلية

#### Task 3.1: تحسين State Policy
- [ ] تحديث `src/policies/booking/state.policy.ts`
  - [ ] تعريف `VALID_TRANSITIONS` كامل
  - [ ] إضافة `getValidTransitions(status)` - الحصول على الانتقالات الصالحة
  - [ ] إضافة `validateTransition(from, to)` - التحقق مع رسالة خطأ واضحة
  - [ ] إضافة `getNextStatuses(status)` - الحصول على الحالات التالية الممكنة

#### Task 3.2: Payment State Policy
- [ ] إنشاء `src/policies/booking/payment.policy.ts`
  - [ ] `canPay(booking)` - فحص إمكانية الدفع
  - [ ] `getPaymentStatusAfterPayment()` - الحالة بعد الدفع
  - [ ] `canRefund(paymentStatus)` - فحص إمكانية الاسترداد
  - [ ] `getPaymentStatusAfterCancellation(paymentStatus)` - الحالة بعد الإلغاء

#### Task 3.3: تحديث Booking Service
- [ ] تحديث `booking.service.ts:updateBookingStatus()`
  - [ ] استخدام `BookingStatePolicy.validateTransition()`
  - [ ] إضافة رسائل خطأ واضحة
  - [ ] إزالة الفحوصات اليدوية القديمة
- [ ] تحديث `booking.service.ts:markAsPaid()`
  - [ ] استخدام `PaymentPolicy.canPay()`
  - [ ] استخدام `PaymentPolicy.getPaymentStatusAfterPayment()`
- [ ] تحديث `booking.service.ts:cancelBooking()`
  - [ ] استخدام `PaymentPolicy.getPaymentStatusAfterCancellation()`

#### Task 3.4: تحديث Booking Model
- [ ] إضافة instance method `canTransitionTo(status)` في `booking.model.ts`
- [ ] إضافة instance method `getValidNextStatuses()` في `booking.model.ts`
- [ ] استخدام Policies في instance methods

#### Task 3.5: Error Handling
- [ ] إنشاء `StateTransitionError` في `src/utils/AppError.ts`
- [ ] استخدام `StateTransitionError` في State Policy
- [ ] إضافة context للخطأ (الحالة الحالية، الحالة المطلوبة، الانتقالات الصالحة)

### الملفات المتأثرة

**ملفات جديدة**:
- `src/policies/booking/payment.policy.ts`

**ملفات معدلة**:
- `src/policies/booking/state.policy.ts`
- `src/services/booking.service.ts`
- `src/models/booking.model.ts`
- `src/utils/AppError.ts`

### معايير النجاح

✅ **الأمان**:
- لا يمكن إجراء انتقالات غير صالحة
- رسائل خطأ واضحة ومفيدة
- جميع الانتقالات موثقة

✅ **الوظيفية**:
- جميع الاختبارات تمر
- السلوك مطابق للمتوقع
- لا توجد regressions

✅ **الوضوح**:
- State Machine واضح ومفهوم
- سهولة إضافة حالات جديدة
- توثيق كامل للانتقالات

### الاختبارات المطلوبة

- [ ] Unit tests لجميع الانتقالات الصالحة
- [ ] Unit tests لجميع الانتقالات غير الصالحة
- [ ] Integration tests لـ `updateBookingStatus()`
- [ ] Integration tests لـ `markAsPaid()`
- [ ] Integration tests لـ `cancelBooking()`
- [ ] Edge case tests (حالات خاصة)

### المدة المقدرة
**3-4 أيام عمل**

---

## Phase 7.4: Availability & Validation Services

### الهدف
إنشاء خدمات للتحقق من التوفر والتحقق من صحة البيانات.

### الأولوية
🔴 **عالية** - يحل مشكلة عدم فحص التوفر والتداخل

### النطاق
- إنشاء `AvailabilityService`
- إنشاء `ValidationService`
- تحديث `booking.service.ts` لاستخدام الخدمات الجديدة

### المهام التفصيلية

#### Task 4.1: إنشاء Availability Service
- [ ] إنشاء `src/services/availability.service.ts`
  - [ ] `checkItemAvailability(itemType, itemId)` - فحص توفر العنصر
  - [ ] `checkDateAvailability(itemType, itemId, startDate, endDate)` - فحص التوفر في التواريخ
  - [ ] `checkOverlappingBookings(itemType, itemId, startDate, endDate)` - فحص التداخل
  - [ ] `reserveItem(itemType, itemId, bookingId)` - حجز العنصر (للمستقبل)

#### Task 4.2: Availability Policies
- [ ] إنشاء `src/policies/catalog/availability.policy.ts`
  - [ ] `isItemAvailable(item)` - فحص حالة العنصر
  - [ ] `canBookItem(item, dates?)` - فحص إمكانية الحجز
  - [ ] `getAvailabilityStatus(item)` - الحصول على حالة التوفر

#### Task 4.3: Date Validation Service
- [ ] إنشاء `src/services/dateValidation.service.ts`
  - [ ] `validateDateRange(startDate, endDate)` - التحقق من نطاق التاريخ
  - [ ] `validateFutureDate(date)` - التحقق من أن التاريخ في المستقبل
  - [ ] `validateMinimumDuration(startDate, endDate, minDays)` - التحقق من الحد الأدنى للمدة
  - [ ] `validateMaximumDuration(startDate, endDate, maxDays)` - التحقق من الحد الأقصى للمدة

#### Task 4.4: تحديث Booking Service
- [ ] تحديث `booking.service.ts:createBooking()`
  - [ ] إضافة `AvailabilityService.checkItemAvailability()` قبل الحجز
  - [ ] إضافة `AvailabilityService.checkDateAvailability()` إذا كانت هناك تواريخ
  - [ ] إضافة `DateValidationService.validateDateRange()` إذا كانت هناك تواريخ
  - [ ] إضافة `DateValidationService.validateFutureDate()` للتواريخ

#### Task 4.5: تحديث Catalog Services
- [ ] تحديث `car.service.ts:findAvailable()`
  - [ ] استخدام `AvailabilityPolicy.isItemAvailable()`
- [ ] تحديث `activity.service.ts:findAvailable()`
  - [ ] استخدام `AvailabilityPolicy.isItemAvailable()`

### الملفات المتأثرة

**ملفات جديدة**:
- `src/services/availability.service.ts`
- `src/services/dateValidation.service.ts`
- `src/policies/catalog/availability.policy.ts`

**ملفات معدلة**:
- `src/services/booking.service.ts`
- `src/services/car.service.ts`
- `src/services/activity.service.ts`

### معايير النجاح

✅ **الأمان**:
- لا يمكن حجز عناصر غير متاحة
- لا يمكن حجز تواريخ متداخلة
- جميع التواريخ صحيحة

✅ **الوظيفية**:
- جميع الاختبارات تمر
- فحص التوفر يعمل بشكل صحيح
- لا توجد regressions

✅ **الأداء**:
- فحص التوفر سريع
- استعلامات قاعدة البيانات محسنة
- لا تأثير على الأداء العام

### الاختبارات المطلوبة

- [ ] Unit tests لـ `AvailabilityService`
- [ ] Unit tests لـ `DateValidationService`
- [ ] Integration tests لفحص التوفر في Booking
- [ ] Integration tests لفحص التداخل
- [ ] Performance tests للاستعلامات

### المدة المقدرة
**4-5 أيام عمل**

---

## Phase 7.5: Soft Delete & Catalog Consistency

### الهدف
توحيد طريقة الحذف الناعم في جميع كيانات الكتالوج.

### الأولوية
🟡 **متوسطة** - يحسن الاتساق لكن ليس حرجاً

### النطاق
- إضافة `deletedAt` للأنشطة والسيارات
- تحديث جميع الاستعلامات لاستخدام `deletedAt`
- توحيد منطق الحذف الناعم

### المهام التفصيلية

#### Task 5.1: تحديث Activity Model
- [ ] إضافة `deletedAt: Date?` إلى `activity.model.ts`
- [ ] إضافة index على `deletedAt`
- [ ] تحديث `find()` queries لاستبعاد المحذوفة
- [ ] تحديث `findById()` لاستبعاد المحذوفة

#### Task 5.2: تحديث Car Model
- [ ] إضافة `deletedAt: Date?` إلى `car.model.ts`
- [ ] إضافة index على `deletedAt`
- [ ] تحديث `find()` queries لاستبعاد المحذوفة
- [ ] تحديث `findById()` لاستبعاد المحذوفة
- [ ] إزالة استخدام `status = 'inactive'` للحذف

#### Task 5.3: تحديث Activity Service
- [ ] تحديث `activity.service.ts:remove()`
  - [ ] استخدام `deletedAt` بدلاً من `status = 'inactive'`
- [ ] تحديث جميع `find()` queries
  - [ ] إضافة `deletedAt: { $exists: false }` في جميع الاستعلامات

#### Task 5.4: تحديث Car Service
- [ ] تحديث `car.service.ts:remove()`
  - [ ] استخدام `deletedAt` بدلاً من `status = 'inactive'`
- [ ] تحديث جميع `find()` queries
  - [ ] إضافة `deletedAt: { $exists: false }` في جميع الاستعلامات

#### Task 5.5: إنشاء Soft Delete Utility
- [ ] إنشاء `src/utils/softDelete.util.ts`
  - [ ] `buildSoftDeleteFilter()` - بناء filter للحذف الناعم
  - [ ] `excludeDeleted(query)` - إضافة filter للاستعلام
- [ ] استخدام Utility في جميع Services

#### Task 5.6: Migration Script (اختياري)
- [ ] إنشاء migration script لتحويل `status = 'inactive'` إلى `deletedAt`
- [ ] تشغيل Migration على بيانات الاختبار أولاً

### الملفات المتأثرة

**ملفات جديدة**:
- `src/utils/softDelete.util.ts`

**ملفات معدلة**:
- `src/models/activity.model.ts`
- `src/models/car.model.ts`
- `src/services/activity.service.ts`
- `src/services/car.service.ts`

### معايير النجاح

✅ **الاتساق**:
- جميع الكيانات تستخدم `deletedAt`
- جميع الاستعلامات تستبعد المحذوفة
- لا توجد استثناءات

✅ **الوظيفية**:
- جميع الاختبارات تمر
- الحذف الناعم يعمل بشكل صحيح
- لا توجد regressions

✅ **الأداء**:
- Indexes على `deletedAt` تعمل بشكل صحيح
- لا تأثير على الأداء

### الاختبارات المطلوبة

- [ ] Unit tests للحذف الناعم
- [ ] Integration tests للاستعلامات
- [ ] Tests للتأكد من استبعاد المحذوفة

### المدة المقدرة
**2-3 أيام عمل**

---

## Phase 7.6: Notification Service

### الهدف
إنشاء خدمة موحدة للإشعارات (Email, SMS, Push).

### الأولوية
🟡 **متوسطة** - يحسن النظام لكن ليس حرجاً

### النطاق
- إنشاء `NotificationService`
- استبدال console.log بالإشعارات الحقيقية
- دعم أنواع إشعارات متعددة

### المهام التفصيلية

#### Task 6.1: إنشاء Notification Service
- [ ] إنشاء `src/services/notification.service.ts`
  - [ ] `sendBookingConfirmation(booking)` - إرسال تأكيد الحجز
  - [ ] `sendPaymentConfirmation(booking)` - إرسال تأكيد الدفع
  - [ ] `sendCancellationNotice(booking)` - إرسال إشعار الإلغاء
  - [ ] `sendExpirationNotice(booking)` - إرسال إشعار انتهاء الصلاحية
- [ ] دعم Email (SendGrid أو AWS SES)
- [ ] دعم Template-based emails

#### Task 6.2: إنشاء Email Templates
- [ ] إنشاء `src/templates/email/booking-confirmation.hbs`
- [ ] إنشاء `src/templates/email/payment-confirmation.hbs`
- [ ] إنشاء `src/templates/email/cancellation-notice.hbs`
- [ ] إنشاء `src/templates/email/expiration-notice.hbs`

#### Task 6.3: تحديث Booking Service
- [ ] تحديث `booking.service.ts:createBooking()`
  - [ ] استبدال `console.log` بـ `NotificationService.sendBookingConfirmation()`
- [ ] تحديث `booking.service.ts:markAsPaid()`
  - [ ] استبدال `console.log` بـ `NotificationService.sendPaymentConfirmation()`
- [ ] تحديث `booking.service.ts:cancelBooking()`
  - [ ] استبدال `console.log` بـ `NotificationService.sendCancellationNotice()`
- [ ] تحديث `booking.service.ts:cleanExpiredBookings()`
  - [ ] استبدال `console.log` بـ `NotificationService.sendExpirationNotice()`

#### Task 6.4: Configuration
- [ ] إضافة environment variables للإشعارات
  - [ ] `EMAIL_SERVICE_PROVIDER` (sendgrid, ses, etc.)
  - [ ] `EMAIL_API_KEY`
  - [ ] `EMAIL_FROM_ADDRESS`
- [ ] إنشاء `src/config/notification.config.ts`

#### Task 6.5: Error Handling
- [ ] معالجة أخطاء الإشعارات (لا يجب أن تفشل الحجز)
- [ ] Logging للأخطاء
- [ ] Retry mechanism (اختياري)

### الملفات المتأثرة

**ملفات جديدة**:
- `src/services/notification.service.ts`
- `src/templates/email/booking-confirmation.hbs`
- `src/templates/email/payment-confirmation.hbs`
- `src/templates/email/cancellation-notice.hbs`
- `src/templates/email/expiration-notice.hbs`
- `src/config/notification.config.ts`

**ملفات معدلة**:
- `src/services/booking.service.ts`
- `src/config/env.ts` (إضافة متغيرات جديدة)

### معايير النجاح

✅ **الوظيفية**:
- الإشعارات تُرسل بنجاح
- Templates تعمل بشكل صحيح
- معالجة الأخطاء صحيحة

✅ **الموثوقية**:
- فشل الإشعارات لا يؤثر على الحجز
- Logging كامل للأخطاء
- Retry mechanism يعمل (إن وُجد)

✅ **التجربة**:
- الإشعارات واضحة ومفيدة
- Templates جميلة ومهنية

### الاختبارات المطلوبة

- [ ] Unit tests لـ `NotificationService`
- [ ] Integration tests لإرسال الإشعارات (مع mock)
- [ ] Tests لمعالجة الأخطاء
- [ ] Manual testing للإشعارات الحقيقية

### المدة المقدرة
**3-4 أيام عمل**

---

## Phase 7.7: Testing & Documentation

### الهدف
اختبار شامل وتوثيق كامل للنظام الجديد.

### الأولوية
🔴 **عالية** - ضروري قبل الانتقال للإنتاج

### النطاق
- كتابة اختبارات شاملة لجميع Policies
- كتابة اختبارات تكامل
- توثيق جميع القواعد التجارية
- تحديث الوثائق التقنية

### المهام التفصيلية

#### Task 7.1: Policy Unit Tests
- [ ] إنشاء `tests/unit/policies/booking/booking.policy.test.ts`
- [ ] إنشاء `tests/unit/policies/booking/state.policy.test.ts`
- [ ] إنشاء `tests/unit/policies/pricing/tax.policy.test.ts`
- [ ] إنشاء `tests/unit/policies/pricing/discount.policy.test.ts`
- [ ] إنشاء `tests/unit/policies/guest/guest.policy.test.ts`
- [ ] إنشاء `tests/unit/policies/catalog/availability.policy.test.ts`
- [ ] هدف: 100% code coverage للـ Policies

#### Task 7.2: Service Integration Tests
- [ ] تحديث `tests/integration/booking.integration.test.ts`
- [ ] تحديث `tests/integration/guest.integration.test.ts`
- [ ] إنشاء `tests/integration/pricing.integration.test.ts`
- [ ] إنشاء `tests/integration/availability.integration.test.ts`
- [ ] هدف: تغطية جميع السيناريوهات

#### Task 7.3: Business Rules Documentation
- [ ] إنشاء `docs/business-rules/BOOKING-RULES.md`
  - [ ] توثيق جميع قواعد الحجز
  - [ ] State transitions diagram
  - [ ] أمثلة لكل قاعدة
- [ ] إنشاء `docs/business-rules/PRICING-RULES.md`
  - [ ] توثيق قواعد التسعير
  - [ ] أمثلة على الحسابات
- [ ] إنشاء `docs/business-rules/GUEST-RULES.md`
- [ ] إنشاء `docs/business-rules/CATALOG-RULES.md`

#### Task 7.4: Technical Documentation
- [ ] تحديث `docs/architecture/SYSTEM-OVERVIEW.md`
  - [ ] إضافة Business Policy Layer
- [ ] تحديث `docs/architecture/TECHNICAL-ARCHITECTURE.md`
  - [ ] تحديث diagrams
- [ ] إنشاء `docs/architecture/BUSINESS-POLICY-LAYER.md`
  - [ ] شرح البنية
  - [ ] كيفية استخدام Policies
  - [ ] أمثلة

#### Task 7.5: API Documentation
- [ ] تحديث `docs/api/BOOKING-API.md` (إن وُجدت تغييرات)
- [ ] توثيق أي تغييرات في الاستجابات

#### Task 7.6: Migration Guide
- [ ] إنشاء `docs/migration/BUSINESS-LOGIC-REFACTOR.md`
  - [ ] شرح التغييرات
  - [ ] Breaking changes (إن وُجدت)
  - [ ] كيفية الترقية

### الملفات المتأثرة

**ملفات جديدة**:
- `tests/unit/policies/**/*.test.ts` (عدة ملفات)
- `tests/integration/pricing.integration.test.ts`
- `tests/integration/availability.integration.test.ts`
- `docs/business-rules/BOOKING-RULES.md`
- `docs/business-rules/PRICING-RULES.md`
- `docs/business-rules/GUEST-RULES.md`
- `docs/business-rules/CATALOG-RULES.md`
- `docs/architecture/BUSINESS-POLICY-LAYER.md`
- `docs/migration/BUSINESS-LOGIC-REFACTOR.md`

**ملفات معدلة**:
- `tests/integration/booking.integration.test.ts`
- `tests/integration/guest.integration.test.ts`
- `docs/architecture/SYSTEM-OVERVIEW.md`
- `docs/architecture/TECHNICAL-ARCHITECTURE.md`

### معايير النجاح

✅ **الاختبارات**:
- 100% code coverage للـ Policies
- جميع Integration tests تمر
- لا توجد failing tests

✅ **التوثيق**:
- جميع القواعد موثقة
- الوثائق التقنية محدثة
- Migration guide موجود

✅ **الجودة**:
- الكود يتبع المعايير
- لا توجد linter errors
- TypeScript types صحيحة

### الاختبارات المطلوبة

- [ ] جميع Unit tests تمر
- [ ] جميع Integration tests تمر
- [ ] E2E tests (إن وُجدت)
- [ ] Performance tests
- [ ] Manual testing

### المدة المقدرة
**5-6 أيام عمل**

---

## إدارة المخاطر

### 8.1 المخاطر المحتملة

#### Risk 1: Breaking Changes
**الاحتمالية**: متوسطة  
**التأثير**: عالي  
**التخفيف**:
- التكامل التدريجي
- اختبارات شاملة في كل مرحلة
- الاحتفاظ بالكود القديم حتى التأكد من العمل

#### Risk 2: Performance Degradation
**الاحتمالية**: منخفضة  
**التأثير**: متوسط  
**التخفيف**:
- Performance tests في كل مرحلة
- Monitoring للأداء
- Optimization عند الحاجة

#### Risk 3: Data Inconsistency
**الاحتمالية**: منخفضة  
**التأثير**: عالي  
**التخفيف**:
- Migration scripts مدروسة
- Backup قبل أي تغيير
- Rollback plan جاهز

#### Risk 4: Scope Creep
**الاحتمالية**: متوسطة  
**التأثير**: متوسط  
**التخفيف**:
- التزام صارم بالخطة
- مراجعة دورية للتقدم
- تأجيل التحسينات غير الضرورية

### 8.2 خطة الطوارئ

**إذا فشلت مرحلة**:
1. إيقاف التغييرات
2. تحليل المشكلة
3. Rollback إذا لزم الأمر
4. إصلاح المشكلة
5. إعادة المحاولة

**إذا تأخرت مرحلة**:
1. تقييم الأولويات
2. تأجيل المهام غير الحرجة
3. طلب مساعدة إضافية إذا لزم الأمر

---

## استراتيجية الاختبار

### 9.1 مستويات الاختبار

#### Unit Tests
- **الهدف**: اختبار كل Policy function بشكل منفصل
- **التغطية المستهدفة**: 100% للـ Policies
- **الأدوات**: Jest
- **الموقع**: `tests/unit/policies/`

#### Integration Tests
- **الهدف**: اختبار تفاعل Services مع Policies
- **التغطية المستهدفة**: جميع السيناريوهات الرئيسية
- **الأدوات**: Jest + MongoDB Memory Server
- **الموقع**: `tests/integration/`

#### Regression Tests
- **الهدف**: التأكد من عدم كسر الوظائف الحالية
- **الطريقة**: تشغيل جميع الاختبارات الحالية بعد كل مرحلة

### 9.2 أنواع الاختبارات

#### Policy Tests
```typescript
// Example: booking.policy.test.ts
describe('BookingPolicy', () => {
  it('should allow booking for active guest', () => {
    const guest = createActiveGuest();
    expect(BookingPolicy.canCreateBooking(guest)).toBe(true);
  });

  it('should reject booking for expired guest', () => {
    const guest = createExpiredGuest();
    expect(BookingPolicy.canCreateBooking(guest)).toBe(false);
  });
});
```

#### State Transition Tests
```typescript
// Example: state.policy.test.ts
describe('BookingStatePolicy', () => {
  it('should allow PENDING → CONFIRMED', () => {
    expect(BookingStatePolicy.canTransition(
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED
    )).toBe(true);
  });

  it('should reject CONFIRMED → PENDING', () => {
    expect(BookingStatePolicy.canTransition(
      BookingStatus.CONFIRMED,
      BookingStatus.PENDING
    )).toBe(false);
  });
});
```

#### Pricing Tests
```typescript
// Example: pricing.service.test.ts
describe('PricingService', () => {
  it('should calculate tax correctly', () => {
    const result = PricingService.calculatePrice(
      BookingItemType.ACTIVITY,
      100,
      2,
      { taxRate: 0.1 }
    );
    expect(result.tax).toBe(20); // 100 * 2 * 0.1
  });
});
```

### 9.3 Test Data Management

- استخدام Factories لإنشاء بيانات الاختبار
- استخدام Fixtures للبيانات الثابتة
- تنظيف البيانات بعد كل test

---

## التوثيق

### 10.1 أنواع التوثيق

#### Business Rules Documentation
- **الموقع**: `docs/business-rules/`
- **المحتوى**: 
  - وصف كل قاعدة تجارية
  - أمثلة عملية
  - Edge cases

#### Technical Documentation
- **الموقع**: `docs/architecture/`
- **المحتوى**:
  - بنية Business Policy Layer
  - كيفية استخدام Policies
  - Diagrams

#### API Documentation
- **الموقع**: `docs/api/`
- **المحتوى**:
  - أي تغييرات في APIs
  - أمثلة على الاستخدام

#### Migration Guide
- **الموقع**: `docs/migration/`
- **المحتوى**:
  - التغييرات الرئيسية
  - Breaking changes
  - خطوات الترقية

### 10.2 معايير التوثيق

- **الوضوح**: سهل الفهم للمطورين الجدد
- **الشمولية**: يغطي جميع الجوانب
- **الأمثلة**: أمثلة عملية لكل مفهوم
- **التحديث**: محدث مع كل تغيير

---

## الجدول الزمني المقترح

### 11.1 المدة الإجمالية

**المدة المقدرة**: 24-31 يوم عمل (حوالي 5-6 أسابيع)

### 11.2 الجدول التفصيلي

| المرحلة | المدة | البدء | الانتهاء |
|---------|-------|-------|----------|
| Phase 7.1: Foundation | 3-4 أيام | Week 1 | Week 1 |
| Phase 7.2: Pricing | 4-5 أيام | Week 1-2 | Week 2 |
| Phase 7.3: State Management | 3-4 أيام | Week 2 | Week 2-3 |
| Phase 7.4: Availability | 4-5 أيام | Week 3 | Week 3-4 |
| Phase 7.5: Soft Delete | 2-3 أيام | Week 4 | Week 4 |
| Phase 7.6: Notification | 3-4 أيام | Week 4-5 | Week 5 |
| Phase 7.7: Testing & Docs | 5-6 أيام | Week 5-6 | Week 6 |

### 11.3 Buffer Time

- **Buffer إضافي**: 3-5 أيام للطوارئ
- **المراجعة النهائية**: 2-3 أيام

### 11.4 التوازي المحتمل

بعض المهام يمكن تنفيذها بالتوازي:
- Phase 7.5 و 7.6 يمكن تنفيذهما بالتوازي (بعد اكتمال 7.4)
- كتابة التوثيق يمكن أن تبدأ مع Phase 7.7

---

## نقاط التحقق والنجاح

### 12.1 نقاط التحقق لكل مرحلة

#### Phase 7.1 Checkpoint
- [ ] جميع Policies الأساسية موجودة
- [ ] Services تستخدم Policies
- [ ] جميع الاختبارات تمر
- [ ] لا توجد regressions

#### Phase 7.2 Checkpoint
- [ ] PricingService يعمل بشكل صحيح
- [ ] الضريبة موحدة في جميع الخدمات
- [ ] جميع الاختبارات تمر
- [ ] الأسعار صحيحة

#### Phase 7.3 Checkpoint
- [ ] State Machine يعمل بشكل صحيح
- [ ] لا يمكن إجراء انتقالات غير صالحة
- [ ] جميع الاختبارات تمر
- [ ] رسائل الخطأ واضحة

#### Phase 7.4 Checkpoint
- [ ] AvailabilityService يعمل بشكل صحيح
- [ ] لا يمكن حجز عناصر غير متاحة
- [ ] فحص التداخل يعمل
- [ ] جميع الاختبارات تمر

#### Phase 7.5 Checkpoint
- [ ] جميع الكيانات تستخدم `deletedAt`
- [ ] جميع الاستعلامات تستبعد المحذوفة
- [ ] جميع الاختبارات تمر
- [ ] Migration ناجح (إن وُجد)

#### Phase 7.6 Checkpoint
- [ ] NotificationService يعمل بشكل صحيح
- [ ] الإشعارات تُرسل بنجاح
- [ ] معالجة الأخطاء صحيحة
- [ ] جميع الاختبارات تمر

#### Phase 7.7 Checkpoint
- [ ] 100% code coverage للـ Policies
- [ ] جميع Integration tests تمر
- [ ] التوثيق كامل ومحدث
- [ ] Migration guide موجود

### 12.2 معايير النجاح النهائية

✅ **الوظيفية**:
- جميع الوظائف تعمل كما هو متوقع
- لا توجد regressions
- جميع الاختبارات تمر

✅ **الجودة**:
- الكود نظيف ومنظم
- Policies منفصلة وواضحة
- سهولة الصيانة

✅ **الأداء**:
- لا تدهور في الأداء
- استعلامات محسنة
- استجابة سريعة

✅ **التوثيق**:
- جميع القواعد موثقة
- الوثائق التقنية محدثة
- Migration guide موجود

✅ **الاختبارات**:
- تغطية شاملة
- جميع الاختبارات تمر
- Edge cases مغطاة

---

## الخلاصة

### 13.1 النقاط الرئيسية

1. **الخطة شاملة**: تغطي جميع التحسينات المقترحة
2. **التنفيذ التدريجي**: كل مرحلة تعتمد على السابقة
3. **إدارة المخاطر**: خطة واضحة للتعامل مع المشاكل
4. **الاختبار الشامل**: اختبارات في كل مرحلة
5. **التوثيق الكامل**: توثيق متزامن مع التنفيذ

### 13.2 الخطوات التالية

1. **مراجعة الخطة** مع الفريق
2. **تحديد الموارد** المطلوبة
3. **بدء Phase 7.1** - Foundation
4. **مراقبة التقدم** في كل مرحلة
5. **التكيف** حسب الحاجة

### 13.3 التوقعات

بعد إكمال جميع المراحل:
- ✅ Business Policy Layer منظم وواضح
- ✅ نظام تسعير موحد ومتسق
- ✅ State Management آمن ومحمي
- ✅ Availability & Validation شامل
- ✅ توثيق كامل وواضح
- ✅ اختبارات شاملة

---

**تم إعداد هذه الخطة بواسطة**: AI Assistant  
**التاريخ**: 2025-01-27  
**الإصدار**: 1.0  
**الحالة**: Ready for Phase 8 Execution

