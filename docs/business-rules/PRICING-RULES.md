# قواعد التسعير - Pricing Business Rules

**التاريخ**: 2025-01-27  
**المرحلة**: Phase 7.1  
**الحالة**: ✅ موثق

---

## 📋 جدول المحتويات

1. [قواعد الضريبة](#قواعد-الضريبة)
2. [قواعد الخصومات](#قواعد-الخصومات)
3. [قواعد الدفعة المقدمة](#قواعد-الدفعة-المقدمة)
4. [أمثلة على الحسابات](#أمثلة-على-الحسابات)

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

### مثال 4: حساب كامل (خصم + ضريبة + دفعة مقدمة)

```typescript
// Input
const originalPrice = 100;
const discountPercent = 10;

// Step 1: Apply discount
const discountedPrice = DiscountPolicy.applyDiscount(originalPrice, discountPercent); // 90

// Step 2: Calculate tax
const tax = TaxPolicy.calculateTax(discountedPrice); // 9

// Step 3: Calculate total
const totalPrice = discountedPrice + tax; // 99

// Step 4: Calculate deposit
const deposit = DepositPolicy.calculateDeposit(totalPrice); // 19.8

// Step 5: Calculate remaining
const remaining = totalPrice - deposit; // 79.2
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

---

**تم إعداد هذا التوثيق بواسطة**: AI Assistant  
**التاريخ**: 2025-01-27  
**الإصدار**: 1.0

