# Pricing Service - خدمة التسعير الموحدة

**التاريخ**: 2025-01-27  
**المرحلة**: Phase 7.2 - Pricing Unification  
**الحالة**: ✅ موثق

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الهيكل](#الهيكل)
3. [الوظائف الرئيسية](#الوظائف-الرئيسية)
4. [أمثلة الاستخدام](#أمثلة-الاستخدام)
5. [التكامل مع الخدمات الأخرى](#التكامل-مع-الخدمات-الأخرى)
6. [التكوين](#التكوين)

---

## نظرة عامة

**PricingService** هو خدمة موحدة لحساب الأسعار في جميع أنحاء النظام. تم إنشاؤه في Phase 7.2 لضمان اتساق حساب الأسعار في جميع الخدمات.

### الأهداف

1. **الاتساق**: نفس منطق التسعير في جميع الخدمات
2. **المرونة**: دعم خيارات متعددة (ضريبة، خصم، دفعة مقدمة)
3. **القابلية للصيانة**: منطق موحد في مكان واحد
4. **القابلية للاختبار**: سهولة اختبار منطق التسعير

### الموقع

```
src/services/pricing.service.ts
```

---

## الهيكل

### الوظائف الرئيسية

```typescript
// حساب المبلغ الفرعي
calculateSubtotal(snapshot, data): number

// تطبيق الضريبة
applyTax(subtotal, taxRate?): number

// تطبيق الخصم
applyDiscount(price, discountPercentage): { discountedPrice, discountAmount }

// حساب الإجمالي
calculateTotal(subtotal, options?): number

// حساب الدفعة المقدمة
calculateDeposit(total, depositRate?): number

// حساب السعر الكامل
calculatePrice(snapshot, data, options?): PricingBreakdown

// حساب سعر Pack Relations
calculatePackRelationPrice(activitiesTotal, carsTotal, optionalActivitiesTotal, globalDiscount?, options?): PricingBreakdown
```

### Interfaces

```typescript
interface PricingOptions {
  taxRate?: number;
  discountPercentage?: number;
  depositRate?: number;
  includeTax?: boolean;
  includeDeposit?: boolean;
}

interface PricingBreakdown {
  subtotal: number;
  tax: number;
  discount: number;
  discountAmount: number;
  total: number;
  deposit?: number;
}
```

---

## الوظائف الرئيسية

### 1. calculateSubtotal

حساب المبلغ الفرعي بناءً على نوع العنصر والكمية.

```typescript
const subtotal = calculateSubtotal(snapshot, data);
```

**المدخلات**:
- `snapshot`: BookingSnapshot - لقطة العنصر
- `data`: CreateBookingData - بيانات الحجز

**المخرجات**:
- `number`: المبلغ الفرعي

**القواعد**:
- للأنشطة/الحزم: `pricePerPerson × numberOfPersons`
- للسيارات: `pricePerDay × numberOfDays`
- التقريب إلى منزلتين عشريتين

---

### 2. applyTax

تطبيق الضريبة على المبلغ الفرعي.

```typescript
const tax = applyTax(subtotal, taxRate?);
```

**المدخلات**:
- `subtotal`: number - المبلغ الفرعي
- `taxRate?`: number - معدل الضريبة (اختياري، افتراضي 10%)

**المخرجات**:
- `number`: مبلغ الضريبة

**القواعد**:
- يستخدم `TaxPolicy.calculateTax()`
- معدل الضريبة الافتراضي: 10%
- يمكن تخصيص معدل الضريبة

---

### 3. applyDiscount

تطبيق الخصم على السعر.

```typescript
const result = applyDiscount(price, discountPercentage);
// result = { discountedPrice: 90, discountAmount: 10 }
```

**المدخلات**:
- `price`: number - السعر الأصلي
- `discountPercentage`: number - نسبة الخصم (0-100%)

**المخرجات**:
- `{ discountedPrice: number, discountAmount: number }`

**القواعد**:
- يستخدم `DiscountPolicy.applyDiscount()`
- الخصم كنسبة مئوية (0-100%)
- التقريب إلى منزلتين عشريتين

---

### 4. calculateTotal

حساب الإجمالي مع الضريبة والخصم.

```typescript
const total = calculateTotal(subtotal, {
  discountPercentage: 10,
  includeTax: true,
  taxRate: 0.1
});
```

**المدخلات**:
- `subtotal`: number - المبلغ الفرعي
- `options?`: PricingOptions - خيارات التسعير

**المخرجات**:
- `number`: الإجمالي

**القواعد**:
- تطبيق الخصم أولاً (إن وُجد)
- ثم تطبيق الضريبة على السعر بعد الخصم
- التقريب إلى منزلتين عشريتين

---

### 5. calculateDeposit

حساب الدفعة المقدمة.

```typescript
const deposit = calculateDeposit(total, depositRate?);
```

**المدخلات**:
- `total`: number - الإجمالي
- `depositRate?`: number - معدل الدفعة (اختياري، افتراضي 20%)

**المخرجات**:
- `number`: مبلغ الدفعة المقدمة

**القواعد**:
- يستخدم `DepositPolicy.calculateDeposit()`
- معدل الدفعة الافتراضي: 20%
- التقريب إلى منزلتين عشريتين

---

### 6. calculatePrice

حساب السعر الكامل (الوظيفة الرئيسية).

```typescript
const pricing = calculatePrice(snapshot, data, {
  discountPercentage: 10,
  includeTax: true,
  includeDeposit: true
});
```

**المدخلات**:
- `snapshot`: BookingSnapshot - لقطة العنصر
- `data`: CreateBookingData - بيانات الحجز
- `options?`: PricingOptions - خيارات التسعير

**المخرجات**:
- `PricingBreakdown`: تفصيل كامل للسعر

**القواعد**:
1. حساب المبلغ الفرعي
2. تطبيق الخصم (إن وُجد)
3. تطبيق الضريبة على السعر بعد الخصم
4. حساب الإجمالي
5. حساب الدفعة المقدمة (إن طُلب)

---

### 7. calculatePackRelationPrice

حساب سعر Pack Relations (للحزم المعقدة).

```typescript
const pricing = calculatePackRelationPrice(
  activitiesTotal,
  carsTotal,
  optionalActivitiesTotal,
  globalDiscount,
  { includeTax: false, includeDeposit: true }
);
```

**المدخلات**:
- `activitiesTotal`: number - إجمالي الأنشطة المطلوبة
- `carsTotal`: number - إجمالي السيارات
- `optionalActivitiesTotal`: number - إجمالي الأنشطة الاختيارية (للمعلومات فقط)
- `globalDiscount?`: number - خصم عام (نسبة مئوية)
- `options?`: PricingOptions - خيارات التسعير

**المخرجات**:
- `PricingBreakdown`: تفصيل كامل للسعر

**القواعد**:
- المبلغ الفرعي = الأنشطة المطلوبة + السيارات
- الأنشطة الاختيارية لا تُحسب في المبلغ الفرعي
- تطبيق الخصم العام على المبلغ الفرعي
- الضريبة اختيارية (افتراضي: غير مضمنة)
- الدفعة المقدمة اختيارية

---

## أمثلة الاستخدام

### مثال 1: حساب سعر نشاط بسيط

```typescript
import { calculatePrice } from '../services/pricing.service';

const snapshot: BookingSnapshot = {
  itemType: BookingItemType.ACTIVITY,
  itemId: 'activity-123',
  title: 'Hiking Tour',
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

const pricing = calculatePrice(snapshot, data);
// Result:
// {
//   subtotal: 100,
//   tax: 10,
//   discount: 0,
//   discountAmount: 0,
//   total: 110
// }
```

### مثال 2: حساب سعر مع خصم

```typescript
const pricing = calculatePrice(snapshot, data, {
  discountPercentage: 10,
});
// Result:
// {
//   subtotal: 100,
//   tax: 9,        // 10% of 90
//   discount: 10,
//   discountAmount: 10,
//   total: 99      // 90 + 9
// }
```

### مثال 3: حساب سعر مع دفعة مقدمة

```typescript
const pricing = calculatePrice(snapshot, data, {
  includeDeposit: true,
});
// Result:
// {
//   subtotal: 100,
//   tax: 10,
//   discount: 0,
//   discountAmount: 0,
//   total: 110,
//   deposit: 22    // 20% of 110
// }
```

### مثال 4: حساب سعر Pack Relation

```typescript
import { calculatePackRelationPrice } from '../services/pricing.service';

const pricing = calculatePackRelationPrice(
  200,  // activitiesTotal
  300,  // carsTotal
  100,  // optionalActivitiesTotal
  10,   // globalDiscount (10%)
  { includeDeposit: true }
);
// Result:
// {
//   subtotal: 500,      // 200 + 300
//   tax: 0,             // Tax not included
//   discount: 10,
//   discountAmount: 50,  // 10% of 500
//   total: 450,         // 500 - 50
//   deposit: 90         // 20% of 450
// }
```

---

## التكامل مع الخدمات الأخرى

### Booking Service

```typescript
// src/services/booking.service.ts
import { calculatePrice } from './pricing.service';

const calculateBookingPrice = (snapshot, data) => {
  const pricing = calculatePrice(snapshot, data, {
    includeTax: true,
    includeDeposit: false,
  });

  return {
    subtotal: pricing.subtotal,
    tax: pricing.tax,
    discount: pricing.discount,
    totalPrice: pricing.total,
  };
};
```

### PackRelation Service

```typescript
// src/services/packRelation.service.ts
import { calculatePackRelationPrice, DepositPolicy } from './pricing.service';

const calculateTotalPrice = (activities, cars, pricingConfig) => {
  // ... calculate totals ...
  
  const pricing = calculatePackRelationPrice(
    activitiesTotal,
    carsTotal,
    optionalActivitiesTotal,
    pricingConfig.globalDiscount,
    {
      includeTax: false,
      includeDeposit: true,
    }
  );

  return {
    subtotal: pricing.subtotal,
    globalDiscount: pricing.discount,
    discountAmount: pricing.discountAmount,
    finalTotal: pricing.total,
    deposit: pricing.deposit,
  };
};
```

---

## التكوين

### Pricing Configuration

```typescript
// src/config/pricing.config.ts
export const DEFAULT_TAX_RATE = 0.1;        // 10%
export const DEFAULT_DEPOSIT_RATE = 0.2;    // 20%

export const getTaxRate = (): number => {
  const envTaxRate = process.env.TAX_RATE;
  if (envTaxRate) {
    const rate = parseFloat(envTaxRate);
    if (!isNaN(rate) && rate >= 0 && rate <= 1) {
      return rate;
    }
  }
  return DEFAULT_TAX_RATE;
};

export const getDepositRate = (): number => {
  const envDepositRate = process.env.DEPOSIT_RATE;
  if (envDepositRate) {
    const rate = parseFloat(envDepositRate);
    if (!isNaN(rate) && rate >= 0 && rate <= 1) {
      return rate;
    }
  }
  return DEFAULT_DEPOSIT_RATE;
};
```

### Environment Variables

```bash
# .env
TAX_RATE=0.1          # 10% (default)
DEPOSIT_RATE=0.2      # 20% (default)
```

---

## ملخص

| الوظيفة | الوصف | الاستخدام |
|---------|-------|-----------|
| `calculateSubtotal` | حساب المبلغ الفرعي | BookingService |
| `applyTax` | تطبيق الضريبة | داخلي |
| `applyDiscount` | تطبيق الخصم | داخلي |
| `calculateTotal` | حساب الإجمالي | داخلي |
| `calculateDeposit` | حساب الدفعة | PackRelationService |
| `calculatePrice` | حساب السعر الكامل | BookingService |
| `calculatePackRelationPrice` | حساب سعر Pack | PackRelationService |

---

**تم إعداد هذا التوثيق بواسطة**: AI Assistant  
**التاريخ**: 2025-01-27  
**الإصدار**: 1.0

