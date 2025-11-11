# قواعد التسعير - Pricing Business Rules

**التاريخ**: 2025-01-27  
**المرحلة**: Phase 7.2 - Pricing Unification  
**الحالة**: ✅ موثق ومحدث

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [قواعد الضريبة](#قواعد-الضريبة)
3. [قواعد الخصومات](#قواعد-الخصومات)
4. [قواعد الدفعة المقدمة](#قواعد-الدفعة-المقدمة)
5. [PricingService الموحد](#pricingservice-الموحد)
6. [أمثلة على الحسابات](#أمثلة-على-الحسابات)

---

## نظرة عامة

تم توحيد نظام التسعير في Phase 7.2 من خلال إنشاء **PricingService** موحد. هذا يضمن:

- ✅ **الاتساق**: نفس منطق التسعير في جميع الخدمات
- ✅ **المرونة**: دعم خيارات متعددة (ضريبة، خصم، دفعة مقدمة)
- ✅ **القابلية للصيانة**: منطق موحد في مكان واحد
- ✅ **القابلية للاختبار**: سهولة اختبار منطق التسعير

### المكونات الرئيسية

1. **PricingService** (`src/services/pricing.service.ts`) - الخدمة الموحدة
2. **PricingConfig** (`src/config/pricing.config.ts`) - التكوين المركزي
3. **Policies** (`src/policies/pricing/`) - قواعد التسعير

---

## قواعد الضريبة

### PR-001: معدل الضريبة الافتراضي

**القاعدة**: الضريبة ثابتة 10% من المبلغ الفرعي

**التنفيذ**: `TaxPolicy.calculateTax(subtotal)`

**الكود**:
```typescript
const subtotal = 100;
const tax = TaxPolicy.calculateTax(subtotal); // 10
```

---

### PR-002: الضريبة القابلة للتكوين

**القاعدة**: يمكن تحديد معدل ضريبة مخصص

**التنفيذ**: `TaxPolicy.calculateTax(subtotal, taxRate)`

**الكود**:
```typescript
const subtotal = 100;
const taxRate = 0.15; // 15%
const tax = TaxPolicy.calculateTax(subtotal, taxRate); // 15
```

---

### PR-003: الضريبة من متغيرات البيئة

**القاعدة**: يمكن قراءة معدل الضريبة من `TAX_RATE` environment variable

**التنفيذ**: `TaxPolicy.getTaxRateFromConfig()`

**الكود**:
```typescript
// .env
TAX_RATE=0.15

// Code
const taxRate = TaxPolicy.getTaxRateFromConfig(); // 0.15
const tax = TaxPolicy.calculateTax(subtotal, taxRate);
```

---

## قواعد الخصومات

### PR-004: تطبيق الخصم

**القاعدة**: الخصم يُطبق كنسبة مئوية (0-100%)

**التنفيذ**: `DiscountPolicy.applyDiscount(price, discountPercent)`

**الكود**:
```typescript
const originalPrice = 100;
const discountPercent = 10; // 10%
const discountedPrice = DiscountPolicy.applyDiscount(originalPrice, discountPercent); // 90
```

---

### PR-005: حساب مبلغ الخصم

**القاعدة**: حساب مبلغ الخصم من السعر الأصلي

**التنفيذ**: `DiscountPolicy.calculateDiscountAmount(price, discountPercent)`

**الكود**:
```typescript
const price = 100;
const discountPercent = 10;
const discountAmount = DiscountPolicy.calculateDiscountAmount(price, discountPercent); // 10
```

---

### PR-006: التحقق من الخصم

**القاعدة**: الخصم يجب أن يكون بين 0% و 100%

**التنفيذ**: `DiscountPolicy.validateDiscount(discount)`

**الكود**:
```typescript
DiscountPolicy.validateDiscount(10); // ✅ Valid
DiscountPolicy.validateDiscount(150); // ❌ Throws error
```

---

## قواعد الدفعة المقدمة

### PR-007: معدل الدفعة المقدمة الافتراضي

**القاعدة**: الدفعة المقدمة ثابتة 20% من الإجمالي

**التنفيذ**: `DepositPolicy.calculateDeposit(total)`

**الكود**:
```typescript
const total = 100;
const deposit = DepositPolicy.calculateDeposit(total); // 20
```

---

### PR-008: الدفعة المقدمة القابلة للتكوين

**القاعدة**: يمكن تحديد معدل دفعة مقدمة مخصص

**التنفيذ**: `DepositPolicy.calculateDeposit(total, depositRate)`

**الكود**:
```typescript
const total = 100;
const depositRate = 0.3; // 30%
const deposit = DepositPolicy.calculateDeposit(total, depositRate); // 30
```

---

### PR-009: الدفعة المقدمة من متغيرات البيئة

**القاعدة**: يمكن قراءة معدل الدفعة المقدمة من `DEPOSIT_RATE` environment variable

**التنفيذ**: `DepositPolicy.getDepositRate()`

**الكود**:
```typescript
// .env
DEPOSIT_RATE=0.3

// Code
const depositRate = DepositPolicy.getDepositRate(); // 0.3
const deposit = DepositPolicy.calculateDeposit(total, depositRate);
```

---

## أمثلة على الحسابات

### مثال 1: حساب السعر مع الضريبة

```typescript
// Input
const subtotal = 100;

// Calculate tax
const tax = TaxPolicy.calculateTax(subtotal); // 10

// Calculate total
const totalPrice = subtotal + tax; // 110
```

### مثال 2: حساب السعر مع الخصم والضريبة

```typescript
// Input
const originalPrice = 100;
const discountPercent = 10;

// Apply discount
const discountedPrice = DiscountPolicy.applyDiscount(originalPrice, discountPercent); // 90

// Calculate tax on discounted price
const tax = TaxPolicy.calculateTax(discountedPrice); // 9

// Calculate total
const totalPrice = discountedPrice + tax; // 99
```

### مثال 3: حساب الدفعة المقدمة

```typescript
// Input
const totalPrice = 100;

// Calculate deposit
const deposit = DepositPolicy.calculateDeposit(totalPrice); // 20

// Remaining amount
const remaining = totalPrice - deposit; // 80
```

### مثال 4: حساب كامل باستخدام PricingService

```typescript
import { calculatePrice } from '../services/pricing.service';

const snapshot: BookingSnapshot = {
  itemType: BookingItemType.ACTIVITY,
  itemId: 'activity-123',
  title: 'Test Activity',
  pricePerPerson: 50,
  currency: 'USD',
  locale: 'en',
  snapshotAt: new Date(),
};

const data: CreateBookingData = {
  guestId: 'guest-123',
  itemType: BookingItemType.ACTIVITY,
  itemId: 'activity-123',
  numberOfPersons: 2,
};

// Calculate complete pricing with discount and deposit
const pricing = calculatePrice(snapshot, data, {
  discountPercentage: 10,
  includeTax: true,
  includeDeposit: true,
});

// Result:
// {
//   subtotal: 100,
//   tax: 9,              // 10% of 90
//   discount: 10,
//   discountAmount: 10,
//   total: 99,           // 90 + 9
//   deposit: 19.8        // 20% of 99
// }
```

### مثال 5: حساب سعر Pack Relation

```typescript
import { calculatePackRelationPrice } from '../services/pricing.service';

const pricing = calculatePackRelationPrice(
  200,  // activitiesTotal
  300,  // carsTotal
  100,  // optionalActivitiesTotal (not included in subtotal)
  10,   // globalDiscount (10%)
  { includeDeposit: true }
);

// Result:
// {
//   subtotal: 500,      // 200 + 300
//   tax: 0,             // Tax not included by default
//   discount: 10,
//   discountAmount: 50, // 10% of 500
//   total: 450,         // 500 - 50
//   deposit: 90         // 20% of 450
// }
```

---

## PricingService الموحد

### PR-010: استخدام PricingService

**القاعدة**: جميع حسابات التسعير يجب أن تستخدم `PricingService`

**التنفيذ**: `calculatePrice()` أو `calculatePackRelationPrice()`

**الكود**:
```typescript
// ✅ Correct - Using PricingService
import { calculatePrice } from '../services/pricing.service';

const pricing = calculatePrice(snapshot, data, {
  includeTax: true,
  includeDeposit: false,
});

// ❌ Incorrect - Direct calculation
const tax = subtotal * 0.1; // Don't do this!
```

---

### PR-011: حساب المبلغ الفرعي

**القاعدة**: حساب المبلغ الفرعي بناءً على نوع العنصر

**التنفيذ**: `calculateSubtotal(snapshot, data)`

**القواعد**:
- للأنشطة/الحزم: `pricePerPerson × numberOfPersons`
- للسيارات: `pricePerDay × numberOfDays`
- التقريب إلى منزلتين عشريتين

**الكود**:
```typescript
const subtotal = calculateSubtotal(snapshot, data);
```

---

### PR-012: ترتيب تطبيق الخصم والضريبة

**القاعدة**: الخصم يُطبق أولاً، ثم الضريبة على السعر بعد الخصم

**التنفيذ**: `calculatePrice()` أو `calculateTotal()`

**الكود**:
```typescript
// Step 1: Apply discount
const discountedPrice = originalPrice - (originalPrice * discountPercent / 100);

// Step 2: Calculate tax on discounted price
const tax = discountedPrice * taxRate;

// Step 3: Calculate total
const total = discountedPrice + tax;
```

---

### PR-013: حساب الدفعة المقدمة

**القاعدة**: الدفعة المقدمة تُحسب من الإجمالي النهائي (بعد الخصم والضريبة)

**التنفيذ**: `calculateDeposit(total)` أو `calculatePrice(..., { includeDeposit: true })`

**الكود**:
```typescript
const deposit = calculateDeposit(total); // 20% of total
```

---

## ملخص القواعد

| القاعدة | الوصف | Policy Method |
|---------|-------|---------------|
| PR-001 | معدل الضريبة الافتراضي (10%) | `TaxPolicy.calculateTax()` |
| PR-002 | ضريبة قابلة للتكوين | `TaxPolicy.calculateTax(subtotal, taxRate)` |
| PR-003 | ضريبة من environment | `TaxPolicy.getTaxRateFromConfig()` |
| PR-004 | تطبيق الخصم | `DiscountPolicy.applyDiscount()` |
| PR-005 | حساب مبلغ الخصم | `DiscountPolicy.calculateDiscountAmount()` |
| PR-006 | التحقق من الخصم | `DiscountPolicy.validateDiscount()` |
| PR-007 | معدل الدفعة المقدمة الافتراضي (20%) | `DepositPolicy.calculateDeposit()` |
| PR-008 | دفعة مقدمة قابلة للتكوين | `DepositPolicy.calculateDeposit(total, depositRate)` |
| PR-009 | دفعة مقدمة من environment | `DepositPolicy.getDepositRate()` |
| PR-010 | استخدام PricingService | `calculatePrice()` / `calculatePackRelationPrice()` |
| PR-011 | حساب المبلغ الفرعي | `calculateSubtotal()` |
| PR-012 | ترتيب تطبيق الخصم والضريبة | الخصم أولاً، ثم الضريبة |
| PR-013 | حساب الدفعة المقدمة | `calculateDeposit()` من الإجمالي النهائي |

---

**تم إعداد هذا التوثيق بواسطة**: AI Assistant  
**التاريخ**: 2025-01-27  
**الإصدار**: 1.0

