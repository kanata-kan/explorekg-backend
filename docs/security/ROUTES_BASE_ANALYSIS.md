# 📊 تحليل المسارات الأساسي (Routes Base Analysis)

> **تاريخ التحليل:** 3 نوفمبر 2025  
> **الهدف:** تصنيف جميع المسارات الموجودة قبل تطبيق نظام الحماية

---

## 📋 ملخص المسارات

| الفئة              | عدد المسارات | الوصف                |
| ------------------ | ------------ | -------------------- |
| **Health**         | 1            | فحص صحة السيرفر      |
| **Guest**          | 10           | نظام الزوار          |
| **Booking**        | 9            | نظام الحجوزات        |
| **Travel Packs**   | 7            | رحلات السفر          |
| **Activities**     | 9            | الأنشطة السياحية     |
| **Cars**           | 9            | السيارات             |
| **Pack Relations** | 6            | العلاقات بين الرحلات |
| **Security**       | 3-4          | مراقبة الأمان        |
| **المجموع**        | ~54          | إجمالي المسارات      |

---

## 🏥 Health Routes

| المسار        | Method | الوصف           | التصنيف الحالي | التصنيف المطلوب |
| ------------- | ------ | --------------- | -------------- | --------------- |
| `/api/health` | GET    | فحص صحة السيرفر | Public         | **Public**      |

**الحماية الحالية:** لا يوجد rate limiting  
**الحماية المطلوبة:** يبقى Public بدون حماية

---

## 👤 Guest Routes (`/api/v1/guests`)

| المسار                       | Method | الوصف                          | التصنيف الحالي       | التصنيف المطلوب       |
| ---------------------------- | ------ | ------------------------------ | -------------------- | --------------------- |
| `POST /`                     | POST   | إنشاء زائر جديد                | Public               | **Public**            |
| `GET /statistics`            | GET    | إحصائيات الزوار                | Public (Admin تعليق) | **Admin**             |
| `POST /cleanup-expired`      | POST   | تنظيف الزوار المنتهية صلاحيتهم | Public (Admin تعليق) | **Admin**             |
| `GET /email/:email`          | GET    | البحث بالبريد                  | Public               | **Public**            |
| `GET /:sessionId`            | GET    | الحصول على زائر بالـ sessionId | Public               | **Mixed** (ownership) |
| `GET /`                      | GET    | جميع الزوار النشطين            | Public (Admin تعليق) | **Admin**             |
| `PATCH /:sessionId`          | PATCH  | تحديث بيانات زائر              | Public               | **Mixed** (ownership) |
| `PATCH /:sessionId/extend`   | PATCH  | تمديد صلاحية الزائر            | Public               | **Mixed** (ownership) |
| `POST /:sessionId/link-user` | POST   | ربط الزائر بمستخدم             | Public               | **Mixed** (ownership) |
| `DELETE /:sessionId`         | DELETE | حذف زائر                       | Public (Admin تعليق) | **Admin**             |

**الحماية الحالية:** `guestCreationLimit` على المسار الرئيسي  
**الحماية المطلوبة:**

- Public: POST `/`, GET `/email/:email`
- Mixed (ownership validation): GET/PATCH/POST على `/:sessionId`
- Admin: GET `/statistics`, POST `/cleanup-expired`, GET `/`, DELETE `/:sessionId`

---

## 📅 Booking Routes (`/api/v1/bookings`)

| المسار                         | Method | الوصف                   | التصنيف الحالي         | التصنيف المطلوب       |
| ------------------------------ | ------ | ----------------------- | ---------------------- | --------------------- |
| `POST /`                       | POST   | إنشاء حجز جديد          | Public (يتطلب guestId) | **Public**            |
| `GET /statistics`              | GET    | إحصائيات الحجوزات       | Public (Admin تعليق)   | **Admin**             |
| `POST /cleanup-expired`        | POST   | تنظيف الحجوزات المنتهية | Public (Admin تعليق)   | **Admin**             |
| `GET /guest/:guestId`          | GET    | حجوزات زائر معين        | Public                 | **Mixed** (ownership) |
| `GET /:bookingNumber`          | GET    | الحصول على حجز برقمه    | Public                 | **Mixed** (ownership) |
| `GET /`                        | GET    | جميع الحجوزات النشطة    | Public (Admin تعليق)   | **Admin**             |
| `PATCH /:bookingNumber/status` | PATCH  | تحديث حالة الحجز        | Public (Admin تعليق)   | **Admin**             |
| `POST /:bookingNumber/payment` | POST   | معالجة الدفع            | Public                 | **Mixed** (ownership) |
| `POST /:bookingNumber/cancel`  | POST   | إلغاء الحجز             | Public                 | **Mixed** (ownership) |

**الحماية الحالية:** `strictRateLimit` على المسار الرئيسي، `paymentRateLimit` على `/payment`  
**الحماية المطلوبة:**

- Public: POST `/`
- Mixed (ownership validation): GET `/guest/:guestId`, GET `/:bookingNumber`, POST `/:bookingNumber/payment`, POST `/:bookingNumber/cancel`
- Admin: GET `/statistics`, POST `/cleanup-expired`, GET `/`, PATCH `/:bookingNumber/status`

---

## 🎒 Travel Pack Routes (`/api/v1/travel-packs`)

| المسار              | Method | الوصف             | التصنيف الحالي       | التصنيف المطلوب |
| ------------------- | ------ | ----------------- | -------------------- | --------------- |
| `GET /statistics`   | GET    | إحصائيات الرحلات  | Public               | **Admin**       |
| `GET /`             | GET    | قائمة الرحلات     | Public               | **Public**      |
| `POST /`            | POST   | إنشاء رحلة جديدة  | Public (Admin تعليق) | **Admin**       |
| `GET /:id/detailed` | GET    | تفاصيل رحلة كاملة | Public               | **Public**      |
| `GET /:id`          | GET    | الحصول على رحلة   | Public               | **Public**      |
| `PATCH /:id`        | PATCH  | تحديث رحلة        | Public (Admin تعليق) | **Admin**       |
| `DELETE /:id`       | DELETE | حذف رحلة          | Public (Admin تعليق) | **Admin**       |

**الحماية الحالية:** `generalRateLimit`  
**الحماية المطلوبة:**

- Public: GET `/`, GET `/:id/detailed`, GET `/:id`
- Admin: GET `/statistics`, POST `/`, PATCH `/:id`, DELETE `/:id`

---

## 🎯 Activity Routes (`/api/v1/activities`)

| المسار                    | Method | الوصف             | التصنيف الحالي       | التصنيف المطلوب |
| ------------------------- | ------ | ----------------- | -------------------- | --------------- |
| `GET /statistics`         | GET    | إحصائيات الأنشطة  | Public               | **Admin**       |
| `GET /available`          | GET    | الأنشطة المتاحة   | Public               | **Public**      |
| `GET /`                   | GET    | قائمة الأنشطة     | Public               | **Public**      |
| `POST /`                  | POST   | إنشاء نشاط        | Public (Admin تعليق) | **Admin**       |
| `GET /:id`                | GET    | الحصول على نشاط   | Public               | **Public**      |
| `PATCH /:id`              | PATCH  | تحديث نشاط        | Public (Admin تعليق) | **Admin**       |
| `DELETE /:id`             | DELETE | حذف نشاط          | Public (Admin تعليق) | **Admin**       |
| `PATCH /:id/availability` | PATCH  | تحديث توفر النشاط | Public (Admin تعليق) | **Admin**       |
| `POST /:id/packs`         | POST   | ربط النشاط برحلات | Public (Admin تعليق) | **Admin**       |

**الحماية الحالية:** `generalRateLimit`  
**الحماية المطلوبة:**

- Public: GET `/available`, GET `/`, GET `/:id`
- Admin: GET `/statistics`, POST `/`, PATCH `/:id`, DELETE `/:id`, PATCH `/:id/availability`, POST `/:id/packs`

---

## 🚗 Car Routes (`/api/v1/cars`)

| المسار                    | Method | الوصف              | التصنيف الحالي       | التصنيف المطلوب |
| ------------------------- | ------ | ------------------ | -------------------- | --------------- |
| `GET /statistics`         | GET    | إحصائيات السيارات  | Public               | **Admin**       |
| `GET /available`          | GET    | السيارات المتاحة   | Public               | **Public**      |
| `GET /`                   | GET    | قائمة السيارات     | Public               | **Public**      |
| `POST /`                  | POST   | إنشاء سيارة        | Public (Admin تعليق) | **Admin**       |
| `GET /:id`                | GET    | الحصول على سيارة   | Public               | **Public**      |
| `PATCH /:id`              | PATCH  | تحديث سيارة        | Public (Admin تعليق) | **Admin**       |
| `DELETE /:id`             | DELETE | حذف سيارة          | Public (Admin تعليق) | **Admin**       |
| `PATCH /:id/availability` | PATCH  | تحديث توفر السيارة | Public (Admin تعليق) | **Admin**       |
| `POST /:id/packs`         | POST   | ربط السيارة برحلات | Public (Admin تعليق) | **Admin**       |

**الحماية الحالية:** `generalRateLimit`  
**الحماية المطلوبة:**

- Public: GET `/available`, GET `/`, GET `/:id`
- Admin: GET `/statistics`, POST `/`, PATCH `/:id`, DELETE `/:id`, PATCH `/:id/availability`, POST `/:id/packs`

---

## 🔗 Pack Relations Routes (`/api/v1/pack-relations`)

| المسار                  | Method | الوصف            | التصنيف الحالي       | التصنيف المطلوب |
| ----------------------- | ------ | ---------------- | -------------------- | --------------- |
| `POST /`                | POST   | إنشاء علاقة      | Public (Admin تعليق) | **Admin**       |
| `POST /calculate-price` | POST   | حساب السعر       | Public               | **Public**      |
| `GET /`                 | GET    | جميع العلاقات    | Public (Admin تعليق) | **Admin**       |
| `GET /:packId`          | GET    | الحصول على علاقة | Public               | **Public**      |
| `PUT /:packId`          | PUT    | تحديث علاقة      | Public (Admin تعليق) | **Admin**       |
| `DELETE /:packId`       | DELETE | حذف علاقة        | Public (Admin تعليق) | **Admin**       |

**الحماية الحالية:** `generalRateLimit`  
**الحماية المطلوبة:**

- Public: POST `/calculate-price`, GET `/:packId`
- Admin: POST `/`, GET `/`, PUT `/:packId`, DELETE `/:packId`

---

## 🔒 Security Routes (`/api/v1/security`)

| المسار             | Method | الوصف                            | التصنيف الحالي      | التصنيف المطلوب      |
| ------------------ | ------ | -------------------------------- | ------------------- | -------------------- |
| `GET /status`      | GET    | حالة الأمان الحالية              | Public (Admin TODO) | **Admin**            |
| `GET /metrics`     | GET    | مقاييس الأمان التفصيلية          | Public (Admin TODO) | **Admin**            |
| `GET /health`      | GET    | صحة النظام                       | Public (Admin TODO) | **Admin**            |
| `POST /test-alert` | POST   | اختبار تنبيهات الأمان (dev only) | Dev only            | **Admin (Dev only)** |

**الحماية الحالية:** `strictRateLimit`  
**الحماية المطلوبة:** Admin فقط (جميع المسارات)

---

## 📊 تصنيف نهائي مُبسّط

### ✅ Public (مفتوحة للجميع)

**18 مسار:**

- Health: 1 مسار
- Guests: 2 (POST `/`, GET `/email/:email`)
- Bookings: 1 (POST `/`)
- Travel Packs: 3 (GET `/`, GET `/:id/detailed`, GET `/:id`)
- Activities: 3 (GET `/available`, GET `/`, GET `/:id`)
- Cars: 3 (GET `/available`, GET `/`, GET `/:id`)
- Pack Relations: 2 (POST `/calculate-price`, GET `/:packId`)

### 🔄 Mixed (تحتاج ownership validation)

**10 مسارات:**

- Guests: 4 (GET/PATCH/POST على `/:sessionId`)
- Bookings: 5 (GET `/guest/:guestId`, GET `/:bookingNumber`, POST `/:bookingNumber/payment`, POST `/:bookingNumber/cancel`)

### 🔐 Admin (إدارية فقط)

**26 مسار:**

- Guests: 4
- Bookings: 3
- Travel Packs: 4
- Activities: 6
- Cars: 6
- Pack Relations: 4
- Security: 3-4

---

## ⚠️ ملاحظات مهمة

1. **التعليقات الموجودة:** معظم المسارات الإدارية تحتوي على تعليق `(future: add auth middleware)` أو `(Admin TODO)`
2. **Rate Limiting الحالي:**
   - `generalRateLimit`: على `/api`
   - `guestCreationLimit`: على `/guests`
   - `strictRateLimit`: على `/bookings` و `/security`
   - `paymentRateLimit`: على مسارات الدفع
3. **الحماية الموجودة:** النظام يحتوي على middleware أمان متقدم لكن بدون RBAC
4. **ownership validation:** لا يوجد حالياً للمسارات المختلطة

---

## 🎯 الخطوة التالية

بناءً على هذا التحليل، سنقوم بـ:

1. ✅ **إنشاء نظام RBAC كامل** (المرحلة 1-4)
2. ✅ **تصنيف المسارات إلى مجلدات** `public/` و `admin/` (المرحلة 5)
3. ✅ **تطبيق الحماية المناسبة** على كل فئة (المرحلة 6)
4. ✅ **إضافة ownership validation** للمسارات المختلطة
5. ✅ **اختبار شامل** للنظام (المرحلة 7)

---

**تاريخ إنشاء هذا الملف:** 3 نوفمبر 2025  
**الحالة:** ✅ مكتمل - جاهز للانتقال للمرحلة 1
