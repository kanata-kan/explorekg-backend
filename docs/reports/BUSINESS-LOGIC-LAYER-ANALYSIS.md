# تحليل طبقة منطق الأعمال - Business Logic Layer Analysis

**المشروع**: ExploreKG Backend  
**تاريخ التحليل**: 2025-01-27  
**النطاق**: تحليل شامل لطبقة الخدمات (Services Layer) والقواعد التجارية المخفية  
**الحالة**: بعد إكمال المراحل 1-5 من إعادة الهيكلة المعمارية

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الخريطة المفاهيمية لمنطق الأعمال](#الخريطة-المفاهيمية-لمنطق-الأعمال)
3. [القواعد التجارية المكتشفة](#القواعد-التجارية-المكتشفة)
4. [تحليل التفاعلات والتدفقات](#تحليل-التفاعلات-والتدفقات)
5. [المشاكل والتناقضات](#المشاكل-والتناقضات)
6. [التوصيات والتحسينات المقترحة](#التوصيات-والتحسينات-المقترحة)
7. [اقتراح هيكل Business Policy Layer](#اقتراح-هيكل-business-policy-layer)

---

## نظرة عامة

### 1.1 هيكل الخدمات الحالي

المشروع يحتوي على **8 خدمات رئيسية**:

```
src/services/
├── activity.service.ts      # إدارة الأنشطة
├── admin.service.ts         # إدارة المسؤولين
├── booking.service.ts       # إدارة الحجوزات
├── car.service.ts           # إدارة السيارات
├── guest.service.ts         # إدارة الضيوف
├── packRelation.service.ts  # إدارة علاقات الحزم
├── securityMonitoring.service.ts  # مراقبة الأمان
└── travelPack.service.ts    # إدارة حزم السفر
```

### 1.2 نمط البنية المعمارية

المشروع يتبع **Layered Architecture** مع فصل واضح بين:
- **Presentation Layer**: Routes → Controllers
- **Business Logic Layer**: Services (الموضوع الحالي)
- **Data Access Layer**: Models (Mongoose)
- **Infrastructure Layer**: Config, Utils, Security

### 1.3 منهجية التحليل

تم تحليل كل خدمة من حيث:
- القواعد التجارية الصريحة والضمنية
- منطق الحسابات والأسعار
- قواعد التحقق من الحالة (State Validation)
- قواعد الانتقال بين الحالات (State Transitions)
- التفاعلات بين الخدمات
- معالجة الأخطاء التجارية

---

## الخريطة المفاهيمية لمنطق الأعمال

### 2.1 تدفق الحجز الكامل (Booking Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    BOOKING LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

1. GUEST CREATION
   ├─ Rule: Guest expires after 30 days
   ├─ Rule: SessionId must be UUID v4
   ├─ Rule: Email must be unique (if active)
   └─ Rule: Guest can migrate to User (if not expired)

2. ITEM SELECTION (TravelPack/Activity/Car)
   ├─ Rule: Item must exist and be active
   ├─ Rule: Item must be available
   └─ Rule: Locale must match guest locale

3. BOOKING CREATION
   ├─ Rule: Guest must not be expired
   ├─ Rule: Generate unique bookingNumber (BKG-YYYYMMDD-####)
   ├─ Rule: Create immutable snapshot of item
   ├─ Rule: Calculate price based on item type
   │   ├─ TravelPack/Activity: pricePerPerson × numberOfPersons
   │   └─ Car: pricePerDay × numberOfDays
   ├─ Rule: Apply tax (10% fixed)
   ├─ Rule: Set expiration (24 hours for unpaid)
   └─ Rule: Initial status = PENDING, paymentStatus = UNPAID

4. PAYMENT PROCESSING
   ├─ Rule: Cannot pay if booking is cancelled
   ├─ Rule: Cannot pay if booking is expired
   ├─ Rule: Cannot pay if already paid
   ├─ Rule: On payment → status = CONFIRMED, paymentStatus = PAID
   └─ Rule: Record paymentMethod and transactionId

5. CANCELLATION
   ├─ Rule: Can cancel if status = PENDING or CONFIRMED
   ├─ Rule: Cannot cancel if status = CANCELLED or EXPIRED
   ├─ Rule: If paid → paymentStatus = REFUNDED
   └─ Rule: Record cancellationReason

6. EXPIRATION
   ├─ Rule: Auto-expire after 24 hours (unpaid)
   ├─ Rule: Status changes to EXPIRED
   └─ Rule: Cannot update expired bookings
```

### 2.2 تدفق التسعير (Pricing Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRICING CALCULATION                     │
└─────────────────────────────────────────────────────────────┘

A. SIMPLE BOOKING PRICING (booking.service.ts)
   └─ calculateBookingPrice()
       ├─ Subtotal = basePrice × quantity
       ├─ Tax = subtotal × 0.1 (10% fixed)
       ├─ Discount = 0 (currently hardcoded)
       └─ Total = subtotal + tax - discount

B. PACK RELATION PRICING (packRelation.service.ts)
   └─ calculateTotalPrice()
       ├─ Strategy: 'sum' or 'custom'
       │
       ├─ IF 'custom':
       │   └─ finalTotal = customPrice
       │
       └─ IF 'sum':
           ├─ Activities: price × quantity × (1 - discount%)
           ├─ Cars: pricePerDay × days × (1 - discount%)
           ├─ Subtotal = requiredActivities + cars
           │   └─ Rule: Optional activities NOT included in subtotal
           ├─ GlobalDiscount = subtotal × (globalDiscount% / 100)
           ├─ finalTotal = subtotal - globalDiscount
           └─ Deposit = finalTotal × 0.2 (20% fixed)

C. CUSTOM SELECTION PRICING
   └─ calculateCustomPrice()
       ├─ Rule: Pack must allow customization
       ├─ Rule: minActivities ≤ selected ≤ maxActivities
       └─ Apply same pricing logic as 'sum' strategy
```

### 2.3 تدفق إدارة الضيوف (Guest Management Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    GUEST LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

1. CREATION
   ├─ Rule: Auto-generate UUID v4 sessionId
   ├─ Rule: Email must be unique (if active guest exists)
   ├─ Rule: Default locale = 'en'
   ├─ Rule: Default expiration = 30 days
   └─ Rule: canMigrate = true by default

2. VALIDATION
   ├─ Rule: Guest must not be expired for any operation
   ├─ Rule: SessionId must be valid UUID format
   └─ Rule: Email format validation

3. UPDATE
   ├─ Rule: Cannot update if linked to User (userId exists)
   └─ Rule: Can extend expiration date

4. MIGRATION TO USER
   ├─ Rule: canMigrate must be true
   ├─ Rule: userId must be null
   ├─ Rule: Guest must not be expired
   └─ Rule: After linking → canMigrate = false
```

### 2.4 تدفق إدارة الكتالوج (Catalog Management Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    CATALOG OPERATIONS                        │
└─────────────────────────────────────────────────────────────┘

A. TRAVEL PACKS
   ├─ Rule: Must have at least one locale (en or fr)
   ├─ Rule: Soft delete (deletedAt field)
   ├─ Rule: Filter by status, locale, price range, duration
   └─ Rule: Text search using MongoDB text index

B. ACTIVITIES
   ├─ Rule: Filter by status, availability, price, location
   ├─ Rule: Can be free (price = 0)
   ├─ Rule: Support localeGroupId for translations
   └─ Rule: Can associate with travel packs

C. CARS
   ├─ Rule: Filter by status, availability, specs, price
   ├─ Rule: Support localeGroupId for translations
   ├─ Rule: Can associate with travel packs
   └─ Rule: Soft delete (status = 'inactive')

D. PACK RELATIONS
   ├─ Rule: One relation per travelPackLocaleGroupId
   ├─ Rule: Activities can be required or optional
   ├─ Rule: Cars can be required or optional
   ├─ Rule: Pricing strategy: 'sum' or 'custom'
   ├─ Rule: Item-level discounts (per activity/car)
   ├─ Rule: Global discount (percentage)
   └─ Rule: Customization settings (min/max activities)
```

---

## القواعد التجارية المكتشفة

### 3.1 قواعد الحجز (Booking Rules)

#### BR-001: إنشاء الحجز
- **القاعدة**: لا يمكن إنشاء حجز لضيف منتهي الصلاحية
- **الموقع**: `booking.service.ts:211-219`
- **التنفيذ**: `if (guest.isExpired()) throw ValidationError`

#### BR-002: رقم الحجز
- **القاعدة**: رقم الحجز يجب أن يكون فريداً بتنسيق `BKG-YYYYMMDD-####`
- **الموقع**: `booking.service.ts:222`
- **التنفيذ**: `BookingCounter.getNextBookingNumber()`

#### BR-003: Snapshot غير قابل للتعديل
- **القاعدة**: يتم حفظ نسخة ثابتة من العنصر المحجوز وقت الحجز
- **الموقع**: `booking.service.ts:225-229`
- **السبب**: حماية من تغيير الأسعار بعد الحجز

#### BR-004: حساب السعر
- **القاعدة**: 
  - TravelPack/Activity: `pricePerPerson × numberOfPersons`
  - Car: `pricePerDay × numberOfDays`
- **الموقع**: `booking.service.ts:169-201`
- **التنفيذ**: `calculateBookingPrice()`

#### BR-005: الضريبة
- **القاعدة**: الضريبة ثابتة 10% من المبلغ الفرعي
- **الموقع**: `booking.service.ts:192`
- **التنفيذ**: `const tax = subtotal * 0.1`

#### BR-006: انتهاء الصلاحية
- **القاعدة**: الحجوزات غير المدفوعة تنتهي بعد 24 ساعة
- **الموقع**: `booking.service.ts:235`
- **التنفيذ**: `expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)`

#### BR-007: حالة الحجز الأولية
- **القاعدة**: الحجز الجديد يكون `PENDING` و `UNPAID`
- **الموقع**: `booking.service.ts:249-250`

#### BR-008: الدفع
- **القاعدة**: لا يمكن الدفع لحجز ملغي أو منتهي الصلاحية
- **الموقع**: `booking.service.ts:359-369`
- **التنفيذ**: فحوصات متعددة قبل السماح بالدفع

#### BR-009: تحديث الحالة بعد الدفع
- **القاعدة**: عند الدفع → `status = CONFIRMED`, `paymentStatus = PAID`
- **الموقع**: `booking.service.ts:372-376`

#### BR-010: الإلغاء
- **القاعدة**: يمكن الإلغاء فقط إذا كانت الحالة `PENDING` أو `CONFIRMED`
- **الموقع**: `booking.service.ts:397-401`
- **التنفيذ**: `booking.canBeCancelled()`

#### BR-011: الاسترداد التلقائي
- **القاعدة**: إذا كان الحجز مدفوعاً وتم إلغاؤه → `paymentStatus = REFUNDED`
- **الموقع**: `booking.service.ts:408-410`

#### BR-012: تحديث الحجوزات المنتهية
- **القاعدة**: لا يمكن تحديث حجز منتهي الصلاحية أو ملغي
- **الموقع**: `booking.service.ts:333-339`

### 3.2 قواعد الضيوف (Guest Rules)

#### GR-001: إنشاء الضيف
- **القاعدة**: يتم توليد `sessionId` تلقائياً كـ UUID v4
- **الموقع**: `guest.service.ts:66`
- **التنفيذ**: `const sessionId = uuidv4()`

#### GR-002: انتهاء صلاحية الضيف
- **القاعدة**: الضيف ينتهي بعد 30 يوم من الإنشاء
- **الموقع**: `guest.service.ts:77-78`
- **التنفيذ**: `expiresAt.setDate(expiresAt.getDate() + 30)`

#### GR-003: البريد الإلكتروني الفريد
- **القاعدة**: لا يمكن إنشاء ضيف بنفس البريد إذا كان هناك ضيف نشط
- **الموقع**: `guest.service.ts:69-74`
- **التنفيذ**: `if (existingGuest && !existingGuest.isExpired()) throw`

#### GR-004: تحديث الضيف
- **القاعدة**: لا يمكن تحديث ضيف مرتبط بمستخدم مسجل
- **الموقع**: `guest.service.ts:158-162`
- **التنفيذ**: `if (guest.userId) throw ValidationError`

#### GR-005: ربط الضيف بالمستخدم
- **القاعدة**: يمكن الربط فقط إذا:
  - `canMigrate = true`
  - `userId = null`
  - الضيف غير منتهي الصلاحية
- **الموقع**: `guest.service.ts:211-215`
- **التنفيذ**: `guest.canBeLinkedToUser()`

#### GR-006: منع الترحيل المتكرر
- **القاعدة**: بعد الربط → `canMigrate = false`
- **الموقع**: `guest.service.ts:218`

### 3.3 قواعد التسعير (Pricing Rules)

#### PR-001: استراتيجية التسعير
- **القاعدة**: حزم السفر تدعم استراتيجيتين:
  - `'sum'`: حساب من مجموع العناصر
  - `'custom'`: سعر مخصص ثابت
- **الموقع**: `packRelation.service.ts:312-330`

#### PR-002: حساب السعر من المجموع
- **القاعدة**: 
  - الأنشطة المطلوبة + السيارات = المبلغ الفرعي
  - الأنشطة الاختيارية لا تدخل في المبلغ الفرعي
- **الموقع**: `packRelation.service.ts:333-350`

#### PR-003: الخصومات على مستوى العنصر
- **القاعدة**: كل نشاط أو سيارة يمكن أن يكون له خصم خاص
- **الموقع**: `packRelation.service.ts:211-212, 258-259`
- **التنفيذ**: `finalPrice = basePrice × (1 - discount / 100)`

#### PR-004: الخصم العام
- **القاعدة**: خصم عام يُطبق على المبلغ الفرعي
- **الموقع**: `packRelation.service.ts:353-354`
- **التنفيذ**: `discountAmount = subtotal × (globalDiscount / 100)`

#### PR-005: الدفعة المقدمة
- **القاعدة**: الدفعة المقدمة = 20% من السعر النهائي
- **الموقع**: `packRelation.service.ts:357`
- **التنفيذ**: `deposit = finalTotal * 0.2`

#### PR-006: الضريبة في الحجوزات
- **القاعدة**: الضريبة ثابتة 10% (فقط في booking.service)
- **الموقع**: `booking.service.ts:192`
- **ملاحظة**: لا توجد ضريبة في packRelation pricing

### 3.4 قواعد التخصيص (Customization Rules)

#### CR-001: تفعيل التخصيص
- **القاعدة**: الحزمة يجب أن تسمح بالتخصيص (`allowCustomization = true`)
- **الموقع**: `packRelation.service.ts:406-408`

#### CR-002: الحد الأدنى من الأنشطة
- **القاعدة**: يجب اختيار عدد أدنى من الأنشطة إذا كان محدداً
- **الموقع**: `packRelation.service.ts:413-420`

#### CR-003: الحد الأقصى من الأنشطة
- **القاعدة**: لا يمكن اختيار أكثر من الحد الأقصى المحدد
- **الموقع**: `packRelation.service.ts:422-429`

### 3.5 قواعد الكتالوج (Catalog Rules)

#### CAT-001: الحذف الناعم
- **القاعدة**: TravelPacks تستخدم `deletedAt` للحذف الناعم
- **الموقع**: `travelPack.service.ts:49, 134, 191, 230`
- **التنفيذ**: `deletedAt: { $exists: false }` في جميع الاستعلامات

#### CAT-002: الحذف الناعم للسيارات
- **القاعدة**: السيارات تستخدم `status = 'inactive'` للحذف الناعم
- **الموقع**: `car.service.ts:232-236`

#### CAT-003: الحذف الناعم للأنشطة
- **القاعدة**: الأنشطة تستخدم `status = 'inactive'` للحذف الناعم
- **الموقع**: `activity.service.ts:214-215`

#### CAT-004: الترجمة (Locale Grouping)
- **القاعدة**: العناصر المرتبطة بنفس `localeGroupId` هي ترجمات لنفس العنصر
- **الموقع**: موجود في جميع خدمات الكتالوج
- **الاستخدام**: `findByLocaleGroupId()` في جميع الخدمات

#### CAT-005: البحث النصي
- **القاعدة**: البحث يستخدم MongoDB text index (أسرع من regex)
- **الموقع**: `car.service.ts:78-86, travelPack.service.ts:78-86`
- **التنفيذ**: `query.$text = { $search: searchQuery }`

#### CAT-006: التصفية حسب السعر
- **القاعدة**: دعم نطاق السعر (minPrice, maxPrice)
- **الموقع**: موجود في جميع خدمات الكتالوج

### 3.6 قواعد الأمان (Security Rules)

#### SEC-001: صلاحيات المسؤول
- **القاعدة**: نظام RBAC مع أدوار (SUPER_ADMIN, ADMIN, etc.)
- **الموقع**: `admin.service.ts` + `security/roles.enum.ts`

#### SEC-002: كلمة المرور
- **القاعدة**: كلمات المرور مشفرة باستخدام bcrypt
- **الموقع**: `admin.service.ts:73, 242`

#### SEC-003: مراقبة الأمان
- **القاعدة**: تتبع محاولات المصادقة الفاشلة والهجمات
- **الموقع**: `securityMonitoring.service.ts`

---

## تحليل التفاعلات والتدفقات

### 4.1 التفاعل بين Booking و Guest

```
Booking Service ←→ Guest Service
├─ createBooking() requires valid, non-expired guest
├─ findByGuestId() supports both UUID and ObjectId
└─ Guest expiration affects booking validity
```

**القواعد المكتشفة**:
- BR-001: الحجز يتطلب ضيفاً نشطاً
- GR-003: انتهاء صلاحية الضيف يمنع إنشاء حجوزات جديدة

### 4.2 التفاعل بين Booking و Catalog Items

```
Booking Service ←→ TravelPack/Activity/Car Services
├─ createBookingSnapshot() fetches item data
├─ Snapshot preserves item state at booking time
└─ Price calculation depends on item type
```

**القواعد المكتشفة**:
- BR-003: Snapshot يحمي من تغيير الأسعار
- BR-004: حساب السعر يختلف حسب نوع العنصر

### 4.3 التفاعل بين PackRelation و Catalog

```
PackRelation Service ←→ TravelPack/Activity/Car Services
├─ getDetailedPack() aggregates pack + activities + cars
├─ calculateTotalPrice() uses item prices with discounts
└─ calculateCustomPrice() validates customization rules
```

**القواعد المكتشفة**:
- PR-001: استراتيجيات تسعير متعددة
- CR-001: قواعد التخصيص مرتبطة بـ PackRelation

### 4.4 التفاعل بين Admin و Security

```
Admin Service ←→ Security Services
├─ Authentication via AuthService
├─ Role-based access control
└─ Security monitoring integration
```

---

## المشاكل والتناقضات

### 5.1 مشاكل في التسعير

#### 🔴 المشكلة 1: ضريبة غير متسقة
- **الموقع**: 
  - `booking.service.ts:192` → ضريبة 10%
  - `packRelation.service.ts` → لا توجد ضريبة
- **المشكلة**: الحجوزات البسيطة لها ضريبة، لكن حزم السفر المعقدة لا
- **التأثير**: عدم اتساق في الأسعار النهائية
- **الأولوية**: عالية

#### 🟡 المشكلة 2: خصومات مكررة
- **الموقع**: 
  - `booking.service.ts:195` → `discount = 0` (hardcoded)
  - `packRelation.service.ts` → خصومات متعددة المستويات
- **المشكلة**: نظام الخصومات غير موحد
- **التأثير**: صعوبة في إضافة خصومات للحجوزات البسيطة
- **الأولوية**: متوسطة

#### 🟡 المشكلة 3: حساب الدفعة المقدمة
- **الموقع**: `packRelation.service.ts:357`
- **المشكلة**: الدفعة المقدمة 20% ثابتة، لا يمكن تخصيصها
- **التأثير**: عدم مرونة في سياسات الدفع
- **الأولوية**: منخفضة

### 5.2 مشاكل في إدارة الحالة

#### 🟡 المشكلة 4: منطق انتهاء الصلاحية مكرر
- **الموقع**: 
  - `booking.model.ts:293-299` → `isExpired()`
  - `booking.service.ts:287-290` → فحص يدوي
- **المشكلة**: نفس المنطق موجود في مكانين
- **التأثير**: صعوبة الصيانة
- **الأولوية**: متوسطة

#### 🟡 المشكلة 5: تحديث الحالة غير محمي
- **الموقع**: `booking.service.ts:326-345`
- **المشكلة**: `updateBookingStatus()` يسمح بانتقالات غير صالحة
- **مثال**: يمكن تغيير الحالة من `CONFIRMED` إلى `PENDING`
- **التأثير**: انتهاك قواعد العمل
- **الأولوية**: عالية

### 5.3 مشاكل في الكتالوج

#### 🟡 المشكلة 6: طرق حذف ناعم مختلفة
- **الموقع**: 
  - `travelPack.service.ts` → `deletedAt`
  - `car.service.ts` → `status = 'inactive'`
  - `activity.service.ts` → `status = 'inactive'`
- **المشكلة**: عدم اتساق في طريقة الحذف الناعم
- **التأثير**: صعوبة في الاستعلامات الموحدة
- **الأولوية**: متوسطة

#### 🟡 المشكلة 7: منطق البحث مكرر
- **الموقع**: `car.service.ts:78-86, travelPack.service.ts:78-86`
- **المشكلة**: نفس منطق البحث النصي في عدة أماكن
- **التأثير**: صعوبة الصيانة
- **الأولوية**: منخفضة

### 5.4 مشاكل في التحقق

#### 🔴 المشكلة 8: فحص التوفر غير موجود
- **الموقع**: `booking.service.ts:createBooking()`
- **المشكلة**: لا يتم فحص توفر العنصر قبل الحجز
- **مثال**: يمكن حجز سيارة غير متاحة
- **التأثير**: انتهاك قواعد العمل
- **الأولوية**: عالية

#### 🟡 المشكلة 9: فحص التواريخ غير موجود
- **الموقع**: `booking.service.ts:createBooking()`
- **المشكلة**: لا يتم فحص أن `startDate < endDate`
- **التأثير**: بيانات غير صالحة
- **الأولوية**: متوسطة

### 5.5 مشاكل في التكامل

#### 🟡 المشكلة 10: رسائل البريد الإلكتروني وهمية
- **الموقع**: `booking.service.ts:258-263, 381-383, 414-418`
- **المشكلة**: جميع إشعارات البريد الإلكتروني هي console.log
- **التأثير**: لا يتم إرسال إشعارات حقيقية
- **الأولوية**: متوسطة (لكن معروف ومخطط له)

#### 🟡 المشكلة 11: عدم وجود فحص للتداخل
- **الموقع**: `booking.service.ts:createBooking()`
- **المشكلة**: لا يتم فحص تداخل الحجوزات
- **مثال**: يمكن حجز نفس السيارة في نفس الوقت
- **التأثير**: انتهاك قواعد العمل
- **الأولوية**: عالية

### 5.6 مشاكل في الأمان

#### 🟡 المشكلة 12: معالجة الأخطاء غير متسقة
- **الموقع**: `admin.service.ts` يستخدم `Error` بدلاً من `AppError`
- **المشكلة**: عدم استخدام نظام الأخطاء الموحد
- **التأثير**: معالجة أخطاء غير متسقة
- **الأولوية**: متوسطة

---

## التوصيات والتحسينات المقترحة

### 6.1 توحيد نظام التسعير

#### التوصية 1: إنشاء Pricing Service موحد
```typescript
// src/services/pricing.service.ts
export class PricingService {
  static calculatePrice(
    itemType: BookingItemType,
    basePrice: number,
    quantity: number,
    options: {
      taxRate?: number;      // Default: 0.1 (10%)
      discount?: number;     // Percentage
      depositRate?: number;  // Default: 0.2 (20%)
    }
  ): PriceBreakdown {
    // Unified pricing logic
  }
}
```

**الفائدة**:
- إزالة التكرار
- توحيد حساب الضريبة
- سهولة إضافة خصومات

#### التوصية 2: جعل الضريبة قابلة للتكوين
- نقل معدل الضريبة إلى متغير بيئة أو قاعدة بيانات
- السماح بضريبة مختلفة حسب نوع العنصر

### 6.2 تحسين إدارة الحالة

#### التوصية 3: State Machine للحجوزات
```typescript
// src/services/bookingStateMachine.ts
export class BookingStateMachine {
  private static validTransitions = {
    [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.EXPIRED],
    [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.EXPIRED]: [],
  };

  static canTransition(from: BookingStatus, to: BookingStatus): boolean {
    return this.validTransitions[from]?.includes(to) ?? false;
  }
}
```

**الفائدة**:
- منع الانتقالات غير الصالحة
- وضوح في قواعد الحالة
- سهولة الصيانة

#### التوصية 4: توحيد منطق انتهاء الصلاحية
- استخدام `isExpired()` من النموذج فقط
- إزالة الفحوصات اليدوية

### 6.3 تحسين التحقق

#### التوصية 5: إضافة Availability Checker
```typescript
// src/services/availability.service.ts
export class AvailabilityService {
  static async checkItemAvailability(
    itemType: BookingItemType,
    itemId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    // Check if item is available
    // Check for overlapping bookings
    // Return availability status
  }
}
```

**الفائدة**:
- منع الحجوزات المتداخلة
- فحص التوفر قبل الحجز
- تحسين تجربة المستخدم

#### التوصية 6: إضافة Date Validator
- فحص `startDate < endDate`
- فحص أن التواريخ في المستقبل
- فحص الحد الأدنى/الأقصى للمدة

### 6.4 توحيد الحذف الناعم

#### التوصية 7: استخدام `deletedAt` في جميع الكيانات
- توحيد طريقة الحذف الناعم
- إضافة `deletedAt` للأنشطة والسيارات
- تحديث جميع الاستعلامات

**الفائدة**:
- استعلامات موحدة
- سهولة الاسترجاع
- تتبع أفضل

### 6.5 تحسين التكامل

#### التوصية 8: إنشاء Notification Service
```typescript
// src/services/notification.service.ts
export class NotificationService {
  static async sendBookingConfirmation(booking: IBooking): Promise<void> {
    // Send email via service (SendGrid, AWS SES, etc.)
  }

  static async sendPaymentConfirmation(booking: IBooking): Promise<void> {
    // Send payment confirmation
  }

  static async sendCancellationNotice(booking: IBooking): Promise<void> {
    // Send cancellation notice
  }
}
```

**الفائدة**:
- فصل الاهتمامات
- سهولة التبديل بين مزودي البريد
- إمكانية إضافة إشعارات SMS/Push

### 6.6 تحسين معالجة الأخطاء

#### التوصية 9: توحيد استخدام AppError
- تحديث `admin.service.ts` لاستخدام `AppError`
- استخدام `BusinessRuleError` للقواعد التجارية
- استخدام `ValidationError` للتحقق

---

## اقتراح هيكل Business Policy Layer

### 7.1 الهيكل المقترح

```
src/
├── policies/                    # Business Policy Layer (NEW)
│   ├── booking/
│   │   ├── booking.policy.ts    # Booking business rules
│   │   ├── pricing.policy.ts    # Pricing rules
│   │   └── state.policy.ts      # State transition rules
│   ├── guest/
│   │   └── guest.policy.ts      # Guest lifecycle rules
│   ├── catalog/
│   │   ├── availability.policy.ts
│   │   └── catalog.policy.ts
│   ├── pricing/
│   │   ├── tax.policy.ts        # Tax calculation rules
│   │   ├── discount.policy.ts   # Discount rules
│   │   └── deposit.policy.ts    # Deposit rules
│   └── index.ts
```

### 7.2 مثال على Policy

```typescript
// src/policies/booking/booking.policy.ts
export class BookingPolicy {
  /**
   * Rule: Guest must be active to create booking
   */
  static canCreateBooking(guest: IGuest): boolean {
    return !guest.isExpired();
  }

  /**
   * Rule: Item must be available
   */
  static async canBookItem(
    itemType: BookingItemType,
    itemId: string
  ): Promise<boolean> {
    // Check availability logic
  }

  /**
   * Rule: Booking expiration is 24 hours
   */
  static calculateExpirationDate(): Date {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    return date;
  }
}
```

```typescript
// src/policies/pricing/tax.policy.ts
export class TaxPolicy {
  private static readonly DEFAULT_TAX_RATE = 0.1; // 10%

  /**
   * Rule: Tax is calculated as percentage of subtotal
   */
  static calculateTax(subtotal: number, taxRate?: number): number {
    const rate = taxRate ?? this.DEFAULT_TAX_RATE;
    return subtotal * rate;
  }

  /**
   * Rule: Tax rate can vary by item type
   */
  static getTaxRate(itemType: BookingItemType): number {
    // Could be configurable per item type
    return this.DEFAULT_TAX_RATE;
  }
}
```

```typescript
// src/policies/booking/state.policy.ts
export class BookingStatePolicy {
  private static readonly VALID_TRANSITIONS: Record<
    BookingStatus,
    BookingStatus[]
  > = {
    [BookingStatus.PENDING]: [
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.EXPIRED,
    ],
    [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.EXPIRED]: [],
  };

  /**
   * Rule: Only valid state transitions are allowed
   */
  static canTransition(
    from: BookingStatus,
    to: BookingStatus
  ): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * Rule: Cancelled bookings cannot be modified
   */
  static canModify(status: BookingStatus): boolean {
    return status !== BookingStatus.CANCELLED &&
           status !== BookingStatus.EXPIRED;
  }
}
```

### 7.3 استخدام Policies في Services

```typescript
// src/services/booking.service.ts (UPDATED)
import { BookingPolicy } from '../policies/booking/booking.policy';
import { BookingStatePolicy } from '../policies/booking/state.policy';
import { TaxPolicy } from '../policies/pricing/tax.policy';

export const createBooking = async (data: CreateBookingData) => {
  // Use policy instead of inline logic
  const guest = await Guest.findById(data.guestId);
  if (!BookingPolicy.canCreateBooking(guest)) {
    throw new ValidationError('Guest session has expired');
  }

  // Use policy for expiration
  const expiresAt = BookingPolicy.calculateExpirationDate();

  // Use policy for tax
  const tax = TaxPolicy.calculateTax(subtotal);

  // ...
};

export const updateBookingStatus = async (
  bookingNumber: string,
  status: BookingStatus
) => {
  const booking = await findByBookingNumber(bookingNumber);

  // Use policy for state transition
  if (!BookingStatePolicy.canTransition(booking.status, status)) {
    throw new ValidationError('Invalid state transition');
  }

  booking.status = status;
  await booking.save();
};
```

### 7.4 فوائد Business Policy Layer

1. **فصل القواعد التجارية**: القواعد منفصلة عن منطق التطبيق
2. **سهولة الاختبار**: يمكن اختبار كل قاعدة على حدة
3. **سهولة الصيانة**: تغيير القواعد في مكان واحد
4. **الوضوح**: القواعد واضحة ومكتوبة بشكل صريح
5. **إعادة الاستخدام**: يمكن استخدام نفس القاعدة في أماكن متعددة
6. **التوثيق**: القواعد موثقة بشكل أفضل

### 7.5 خطة التنفيذ المقترحة

#### المرحلة 1: استخراج القواعد الأساسية
- [ ] إنشاء `policies/` directory
- [ ] استخراج قواعد الحجز
- [ ] استخراج قواعد التسعير
- [ ] تحديث `booking.service.ts` لاستخدام Policies

#### المرحلة 2: توسيع Policies
- [ ] إضافة قواعد الضيوف
- [ ] إضافة قواعد الكتالوج
- [ ] إضافة قواعد التوفر

#### المرحلة 3: توحيد واختبار
- [ ] توحيد جميع القواعد
- [ ] كتابة اختبارات للـ Policies
- [ ] تحديث الوثائق

---

## الخلاصة

### 8.1 النقاط الرئيسية

1. **القواعد التجارية موجودة لكنها مبعثرة**: القواعد موجودة في الخدمات لكنها غير منظمة بشكل واضح

2. **التكرار موجود**: منطق التسعير والتحقق مكرر في عدة أماكن

3. **عدم الاتساق**: طرق مختلفة للحذف الناعم، ضريبة غير متسقة

4. **نقاط ضعف في التحقق**: عدم فحص التوفر والتداخل

5. **إمكانية التحسين**: يمكن تحسين البنية بشكل كبير بإضافة Business Policy Layer

### 8.2 الأولويات

#### عالية الأولوية:
- 🔴 توحيد نظام التسعير (ضريبة، خصومات)
- 🔴 إضافة فحص التوفر والتداخل
- 🔴 State Machine للحجوزات

#### متوسطة الأولوية:
- 🟡 توحيد الحذف الناعم
- 🟡 Notification Service
- 🟡 توحيد معالجة الأخطاء

#### منخفضة الأولوية:
- 🟢 تحسين التوثيق
- 🟢 إعادة هيكلة البحث النصي

### 8.3 الخطوات التالية

1. **مراجعة التقرير** مع الفريق
2. **تحديد الأولويات** حسب احتياجات العمل
3. **بدء التنفيذ** بالمرحلة 1 من Business Policy Layer
4. **اختبار شامل** بعد كل مرحلة
5. **توثيق القواعد** الجديدة

---

**تم إعداد هذا التقرير بواسطة**: AI Assistant  
**تاريخ**: 2025-01-27  
**الإصدار**: 1.0

