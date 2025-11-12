# Notification System Architecture

**المشروع**: ExploreKG Backend  
**المرحلة**: Phase 7.6  
**التاريخ**: 2025-01-27

---

## 📋 نظرة عامة

نظام إشعارات مركزي قابل للتوسع (Scalable)، قابل لإعادة الاستخدام (Reusable)، سهل الصيانة (Maintainable)، ومرن (Flexible) يسمح بإرسال إشعارات عبر قنوات متعددة (Email, SMS, Push) مع الحفاظ على الأداء.

---

## 🏗️ البنية المعمارية

```
┌─────────────────────────────────────────────────────────┐
│              Event Sources (Controllers/Services)       │
│  - Booking Created → Notification Event                 │
│  - Payment Received → Notification Event                │
│  - Booking Cancelled → Notification Event               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│            Notification Service (Central)               │
│  - Receives Events                                      │
│  - Determines Notification Type                         │
│  - Applies Business Rules (Policy)                      │
│  - Selects Channels                                     │
│  - Queues Notifications (Optional)                      │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ Notification │    │  Template        │
│ Policy       │    │  Service         │
│              │    │                  │
│ - shouldSend │    │ - renderTemplate │
│ - getChannels│    │ - getTemplate    │
└──────────────┘    └──────────────────┘
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Channel Interface (IChannel)               │
│  - send(notification)                                   │
│  - validate(notification)                               │
│  - getSupportedTypes()                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Email   │ │   SMS    │ │   Push   │
│ Channel  │ │ Channel  │ │ Channel  │
│          │ │          │ │          │
│ (Now)    │ │(Future)  │ │(Future)  │
└──────────┘ └──────────┘ └──────────┘
```

---

## 📦 المكونات الرئيسية

### 1. Types & Interfaces

#### `NotificationType`
```typescript
enum NotificationType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  BOOKING_CANCELLATION = 'booking_cancellation',
  BOOKING_EXPIRATION = 'booking_expiration',
  // Future types...
}
```

#### `NotificationChannel`
```typescript
enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}
```

#### `INotification`
```typescript
interface INotification {
  type: NotificationType;
  recipient: {
    email?: string;
    phone?: string;
    userId?: string;
  };
  data: Record<string, any>;
  channels: NotificationChannel[];
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}
```

#### `IChannel`
```typescript
interface IChannel {
  name: NotificationChannel;
  send(notification: INotification): Promise<ChannelResult>;
  validate(notification: INotification): boolean;
  getSupportedTypes(): NotificationType[];
  isEnabled(): boolean;
}
```

---

### 2. Notification Service (Central)

**المسؤوليات**:
- استقبال الأحداث من النظام
- تحديد نوع الإشعار
- تطبيق القواعد التجارية (Policy)
- اختيار القنوات المناسبة
- إرسال الإشعارات عبر القنوات

**الواجهة**:
```typescript
class NotificationService {
  static async send(notification: INotification): Promise<void>
  static async sendToChannel(notification: INotification, channel: NotificationChannel): Promise<void>
  static async sendEvent(event: NotificationEvent): Promise<void>
}
```

---

### 3. Notification Policy

**المسؤوليات**:
- تحديد ما إذا كان يجب إرسال الإشعار
- تحديد القنوات المطلوبة
- تطبيق القواعد التجارية

**الواجهة**:
```typescript
class NotificationPolicy {
  static shouldSend(type: NotificationType, context: any): boolean
  static getChannels(type: NotificationType, context: any): NotificationChannel[]
  static getTemplate(type: NotificationType, channel: NotificationChannel): string
}
```

---

### 4. Channels

#### Email Channel (Implementation)
```typescript
class EmailChannel implements IChannel {
  name = NotificationChannel.EMAIL;
  
  async send(notification: INotification): Promise<ChannelResult>
  validate(notification: INotification): boolean
  getSupportedTypes(): NotificationType[]
  isEnabled(): boolean
}
```

#### SMS Channel (Future)
```typescript
class SMSChannel implements IChannel {
  // Similar structure
}
```

#### Push Channel (Future)
```typescript
class PushChannel implements IChannel {
  // Similar structure
}
```

---

### 5. Template Service

**المسؤوليات**:
- إدارة القوالب
- عرض القوالب مع البيانات
- دعم قوالب متعددة (Email, SMS, Push)

**الواجهة**:
```typescript
class TemplateService {
  static renderTemplate(templateName: string, data: any): Promise<string>
  static getTemplate(type: NotificationType, channel: NotificationChannel): string
}
```

---

## 🔄 تدفق العمل (Flow)

### مثال: إرسال تأكيد الحجز

```
1. Booking Service creates booking
   ↓
2. Booking Service calls: NotificationService.sendEvent({
     type: 'booking_created',
     booking: booking,
     guest: guest
   })
   ↓
3. Notification Service:
   - Determines NotificationType.BOOKING_CONFIRMATION
   - Applies NotificationPolicy.shouldSend()
   - Gets channels: [EMAIL]
   - Creates INotification object
   ↓
4. Notification Service:
   - For each channel:
     - Gets template from TemplateService
     - Renders template with data
     - Calls Channel.send()
   ↓
5. Email Channel:
   - Validates notification
   - Sends email via provider (SendGrid/SES)
   - Returns result
```

---

## 🎯 المبادئ المعمارية

### 1. Separation of Concerns
- **Service**: التنسيق والمنطق المركزي
- **Policy**: القواعد التجارية
- **Channels**: التنفيذ الفعلي
- **Templates**: العرض

### 2. Open/Closed Principle
- **مفتوح للتوسع**: إضافة قنوات جديدة بدون تعديل الكود الموجود
- **مغلق للتعديل**: لا حاجة لتعديل NotificationService عند إضافة قناة

### 3. Dependency Inversion
- **Service يعتمد على Interface**: `IChannel` وليس على `EmailChannel`
- **سهولة الاستبدال**: تبديل EmailChannel بسهولة

### 4. Single Responsibility
- كل مكون له مسؤولية واحدة واضحة

---

## 🚀 قابلية التوسع

### إضافة قناة جديدة (مثال: WhatsApp)

```typescript
// 1. إنشاء WhatsAppChannel
class WhatsAppChannel implements IChannel {
  name = NotificationChannel.WHATSAPP;
  // Implementation...
}

// 2. تسجيل القناة في NotificationService
NotificationService.registerChannel(new WhatsAppChannel());

// 3. تحديث Policy لتحديد متى تستخدم WhatsApp
// (لا حاجة لتعديل NotificationService!)
```

---

## ⚡ الأداء

### 1. Queue System (Optional)
- استخدام Queue (Bull/BullMQ) للمعالجة غير المتزامنة
- تحسين الأداء للمعالجة الكثيفة

### 2. Caching
- تخزين القوالب في Cache
- تقليل قراءة الملفات

### 3. Batching
- تجميع الإشعارات المتعددة
- إرسال دفعة واحدة

---

## 🔒 معالجة الأخطاء

### 1. Error Handling
- فشل الإشعارات لا يجب أن يفشل العملية الأساسية (Booking)
- Logging كامل للأخطاء
- Retry mechanism (اختياري)

### 2. Fallback
- إذا فشلت قناة، تجربة قناة بديلة
- إشعار Admin عند الفشل المتكرر

---

## 📝 التوثيق

### الملفات المطلوبة:
- `src/types/notification.types.ts` - Types & Interfaces
- `src/services/notification.service.ts` - Service المركزي
- `src/policies/notification.policy.ts` - Business Rules
- `src/channels/email.channel.ts` - Email Implementation
- `src/channels/base.channel.ts` - Base Channel Interface
- `src/services/template.service.ts` - Template Management
- `src/config/notification.config.ts` - Configuration

---

## ✅ معايير النجاح

1. **✅ قابلية التوسع**: إضافة قناة جديدة في < 30 دقيقة
2. **✅ الأداء**: إرسال إشعار في < 500ms
3. **✅ الموثوقية**: فشل الإشعارات لا يؤثر على العملية الأساسية
4. **✅ الصيانة**: كود واضح ومنظم
5. **✅ الاختبار**: تغطية > 80%

---

**آخر تحديث**: 2025-01-27

