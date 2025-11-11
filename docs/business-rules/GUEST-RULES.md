# قواعد الضيوف - Guest Business Rules

**التاريخ**: 2025-01-27  
**المرحلة**: Phase 7.1  
**الحالة**: ✅ موثق

---

## 📋 جدول المحتويات

1. [قواعد إنشاء الضيف](#قواعد-إنشاء-الضيف)
2. [قواعد تحديث الضيف](#قواعد-تحديث-الضيف)
3. [قواعد ربط الضيف بالمستخدم](#قواعد-ربط-الضيف-بالمستخدم)
4. [قواعد انتهاء الصلاحية](#قواعد-انتهاء-الصلاحية)

---

## قواعد إنشاء الضيف

### GR-001: توليد SessionId

**القاعدة**: يتم توليد `sessionId` تلقائياً كـ UUID v4

**التنفيذ**: في `guest.service.ts:createGuest()`

**الكود**:
```typescript
const sessionId = uuidv4();
```

---

### GR-002: التحقق من البريد الإلكتروني

**القاعدة**: يجب أن يكون البريد الإلكتروني بصيغة صحيحة

**التنفيذ**: `GuestPolicy.canCreateGuest(email)`

**الكود**:
```typescript
GuestPolicy.canCreateGuest('test@example.com'); // ✅ Valid
GuestPolicy.canCreateGuest('invalid-email'); // ❌ Throws error
```

---

### GR-003: البريد الإلكتروني الفريد

**القاعدة**: لا يمكن إنشاء ضيف بنفس البريد إذا كان هناك ضيف نشط

**التنفيذ**: في `guest.service.ts:createGuest()`

**الكود**:
```typescript
const existingGuest = await Guest.findByEmail(data.email);
if (existingGuest && !existingGuest.isExpired()) {
  throw new ValidationError('Guest with email already exists and is active');
}
```

---

### GR-004: حساب تاريخ انتهاء الصلاحية

**القاعدة**: الضيف ينتهي بعد 30 يوم من الإنشاء

**التنفيذ**: `GuestPolicy.calculateExpirationDate()`

**الكود**:
```typescript
const expiresAt = GuestPolicy.calculateExpirationDate(); // 30 days from now
```

---

### GR-005: Locale الافتراضي

**القاعدة**: Locale الافتراضي هو `'en'`

**التنفيذ**: في `guest.service.ts:createGuest()`

---

## قواعد تحديث الضيف

### GR-006: شروط التحديث

**القاعدة**: لا يمكن تحديث ضيف إذا:
- ❌ مرتبط بمستخدم مسجل (userId !== null)
- ❌ منتهي الصلاحية

**التنفيذ**: `GuestPolicy.canUpdateGuest(guest)`

**الكود**:
```typescript
if (!GuestPolicy.canUpdateGuest(guest)) {
  if (guest.userId) {
    throw new ValidationError('Cannot update guest - already linked to user');
  }
  if (guest.isExpired()) {
    throw new ValidationError('Guest session has expired');
  }
}
```

---

## قواعد ربط الضيف بالمستخدم

### GR-007: شروط الربط

**القاعدة**: يمكن ربط الضيف بمستخدم إذا:
- ✅ `canMigrate = true`
- ✅ `userId = null`
- ✅ الضيف غير منتهي الصلاحية

**التنفيذ**: `GuestPolicy.canLinkToUser(guest)`

**الكود**:
```typescript
if (!GuestPolicy.canLinkToUser(guest)) {
  throw new ValidationError('Guest cannot be linked to user');
}
```

---

### GR-008: منع الترحيل المتكرر

**القاعدة**: بعد الربط → `canMigrate = false`

**التنفيذ**: في `guest.service.ts:linkToUser()`

**الكود**:
```typescript
guest.userId = userId;
guest.canMigrate = false; // Prevent further migrations
await guest.save();
```

---

## قواعد انتهاء الصلاحية

### GR-009: مدة انتهاء الصلاحية

**القاعدة**: الضيف ينتهي بعد 30 يوم من الإنشاء

**التنفيذ**: `GuestPolicy.calculateExpirationDate()`

---

### GR-010: التحقق من صحة الجلسة

**القاعدة**: يجب التحقق من أن جلسة الضيف غير منتهية قبل أي عملية

**التنفيذ**: `GuestPolicy.isGuestSessionValid(guest)`

**الكود**:
```typescript
if (!GuestPolicy.isGuestSessionValid(guest)) {
  throw new ValidationError('Guest session has expired');
}
```

---

### GR-011: تمديد انتهاء الصلاحية

**القاعدة**: يمكن تمديد انتهاء صلاحية الضيف

**التنفيذ**: في `guest.service.ts:extendExpiration()`

**الكود**:
```typescript
const newExpiresAt = GuestPolicy.calculateExpirationDate(daysToAdd);
guest.expiresAt = newExpiresAt;
await guest.save();
```

---

## ملخص القواعد

| القاعدة | الوصف | Policy Method |
|---------|-------|---------------|
| GR-002 | التحقق من البريد الإلكتروني | `GuestPolicy.canCreateGuest()` |
| GR-004 | حساب تاريخ انتهاء الصلاحية | `GuestPolicy.calculateExpirationDate()` |
| GR-006 | شروط التحديث | `GuestPolicy.canUpdateGuest()` |
| GR-007 | شروط الربط | `GuestPolicy.canLinkToUser()` |
| GR-010 | التحقق من صحة الجلسة | `GuestPolicy.isGuestSessionValid()` |

---

## دورة حياة الضيف

```
┌─────────────┐
│   CREATE    │
│   Guest     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ACTIVE    │
│  (30 days)  │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│   UPDATE    │  │ LINK TO USER│
│   Guest     │  │  (migrate)  │
└──────┬──────┘  └──────────────┘
       │
       ▼
┌─────────────┐
│   EXPIRED   │
│  (after 30) │
└─────────────┘
```

---

**تم إعداد هذا التوثيق بواسطة**: AI Assistant  
**التاريخ**: 2025-01-27  
**الإصدار**: 1.0

