# 📦 Activities Data - Ready for API Import

> بيانات الأنشطة السياحية محولة للبنية الجديدة وجاهزة للاستيراد عبر Postman

---

## 📋 نظرة عامة

هذا الملف يحتوي على **10 أنشطة** (5 بالإنجليزية + 5 بالفرنسية) محولة من ملفات JSON إلى البنية الجديدة التي تتوافق مع الـ Backend.

### ✨ التحسينات المضافة:

- ✅ إضافة حقل `localeGroupId` لربط الترجمات
- ✅ إضافة حقول `status` و `availabilityStatus`
- ✅ البيانات جاهزة للإرسال مباشرة عبر POST في Postman
- ✅ كل activity مستقل (يمكنك نسخه ولصقه مباشرة)

---

## 🎯 كيفية الاستخدام

### الطريقة 1: استيراد يدوي عبر Postman

1. افتح Postman
2. أنشئ طلب جديد: `POST http://localhost:4000/api/v1/activities`
3. اختر `Body` → `raw` → `JSON`
4. انسخ أي activity من الأسفل والصقه
5. اضغط **Send**

### الطريقة 2: استيراد جماعي عبر Migration Script

```bash
npm run migrate:activities
```

> ⚠️ **ملاحظة:** Script الـ Migration محدّث ويضيف `localeGroupId` تلقائياً

---

## 📚 البيانات الجاهزة

---

## 🇬🇧 Activity 1 - English Version

```json
{
  "name": "Authentic Kyrgyz Beshbarmak Cooking Class",
  "description": "Discover Kyrgyzstan's most iconic dish — Beshbarmak, meaning \"Five Fingers\" — in an immersive cooking experience that blends history, tradition, and flavor.",
  "coverImage": "/images/activities/beshbarmak-cooking-classes/BCC-cover-img.webp",
  "images": [
    "/images/activities/beshbarmak-cooking-classes/BCC-img-1.webp",
    "/images/activities/beshbarmak-cooking-classes/BCC-img-3.webp",
    "/images/activities/beshbarmak-cooking-classes/BCC-img-4.webp"
  ],
  "duration": "1.5 hours",
  "location": "Naryn Museum or local guest house",
  "groupSize": "Small and intimate (ideal for families or friends)",
  "price": 0,
  "metadata": {
    "title": "Authentic Kyrgyz Beshbarmak Cooking Class",
    "description": "Cook and share Beshbarmak — Kyrgyzstan's national dish — in an authentic, cultural setting.",
    "path": "/activities/activity-1",
    "image": "/images/activities/beshbarmak-cooking-classes/BCC-cover-img.webp",
    "alt": "Guests learning to cook Beshbarmak in Kyrgyzstan"
  },
  "localeGroupId": "activity-1",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- FREE activity (price: 0)
- `localeGroupId: "activity-1"` links this to French version
- Perfect for family-oriented experiences

---

## 🇫🇷 Activity 1 - French Version

```json
{
  "name": "Cours de cuisine kirghize authentique – Beshbarmak",
  "description": "Découvrez le plat le plus emblématique du Kirghizistan — le Beshbarmak, qui signifie «cinq doigts». Une expérience culinaire immersive mêlant histoire, tradition et saveurs locales.",
  "coverImage": "/images/activities/beshbarmak-cooking-classes/BCC-cover-img.webp",
  "images": [
    "/images/activities/beshbarmak-cooking-classes/BCC-img-1.webp",
    "/images/activities/beshbarmak-cooking-classes/BCC-img-3.webp",
    "/images/activities/beshbarmak-cooking-classes/BCC-img-4.webp"
  ],
  "duration": "1h30",
  "location": "Musée de Naryn ou maison d'hôtes locale",
  "groupSize": "Petit groupe convivial (idéal pour familles ou amis)",
  "price": 0,
  "metadata": {
    "title": "Cours de cuisine kirghize authentique – Beshbarmak",
    "description": "Cuisinez et partagez le Beshbarmak, le plat national du Kirghizistan, dans un cadre authentique et culturel.",
    "path": "/activities/activity-1",
    "image": "/images/activities/beshbarmak-cooking-classes/BCC-cover-img.webp",
    "alt": "Participants apprenant à cuisiner le Beshbarmak au Kirghizistan"
  },
  "localeGroupId": "activity-1",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Same `localeGroupId` as English version → linked translations
- Query: `GET /api/v1/activities?localeGroupId=activity-1` returns both versions

---

## 🇬🇧 Activity 2 - English Version

```json
{
  "name": "Eagle Hunting Show – With a World Champion",
  "description": "Witness one of Kyrgyzstan's most breathtaking traditions: the ancient art of eagle hunting, performed by a 3-time champion of the World Nomad Games.",
  "coverImage": "/images/activities/eagle-hunting-show/EHS-cover-img.webp",
  "images": [
    "/images/activities/eagle-hunting-show/EHS-img-1.webp",
    "/images/activities/eagle-hunting-show/EHS-img-2.webp",
    "/images/activities/eagle-hunting-show/EHS-img-3.webp",
    "/images/activities/eagle-hunting-show/EHS-img-4.webp",
    "/images/activities/eagle-hunting-show/EHS-img-5.webp",
    "/images/activities/eagle-hunting-show/EHS-img-6.webp"
  ],
  "duration": "1–2 hours",
  "location": "Alysh village, near the Salkyn Tor mountains",
  "groupSize": "Any",
  "price": 0,
  "metadata": {
    "title": "Eagle Hunting Show – With a World Champion",
    "description": "See a live eagle hunting performance by a 3-time Nomad Games champion.",
    "path": "/activities/activity-2",
    "image": "/images/activities/eagle-hunting-show/EHS-cover-img.webp",
    "alt": "Eagle hunter performing in Kyrgyz mountains"
  },
  "localeGroupId": "activity-2",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- High-value experience with world champion
- Multiple images (6 total) - great for gallery displays
- FREE activity - excellent for attracting tourists

---

## 🇫🇷 Activity 2 - French Version

```json
{
  "name": "Spectacle de chasse à l'aigle – Avec un champion du monde",
  "description": "Assistez à l'une des traditions les plus impressionnantes du Kirghizistan : l'art ancestral de la chasse à l'aigle, présenté par un dresseur triple champion des Jeux Nomades Mondiaux.",
  "coverImage": "/images/activities/eagle-hunting-show/EHS-cover-img.webp",
  "images": [
    "/images/activities/eagle-hunting-show/EHS-img-1.webp",
    "/images/activities/eagle-hunting-show/EHS-img-2.webp",
    "/images/activities/eagle-hunting-show/EHS-img-3.webp",
    "/images/activities/eagle-hunting-show/EHS-img-4.webp",
    "/images/activities/eagle-hunting-show/EHS-img-5.webp",
    "/images/activities/eagle-hunting-show/EHS-img-6.webp"
  ],
  "duration": "1 à 2 heures",
  "location": "Village d'Alysh, près des montagnes de Salkyn Tor",
  "groupSize": "Tout type de groupe",
  "price": 0,
  "metadata": {
    "title": "Spectacle de chasse à l'aigle – Avec un champion du monde",
    "description": "Découvrez une démonstration de chasse à l'aigle par un triple champion des Jeux Nomades Mondiaux.",
    "path": "/activities/activity-2",
    "image": "/images/activities/eagle-hunting-show/EHS-cover-img.webp",
    "alt": "Dresseur d'aigle lors d'une démonstration dans les montagnes du Kirghizistan"
  },
  "localeGroupId": "activity-2",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

---

## 🇬🇧 Activity 3 - English Version

```json
{
  "name": "8-Day Horseback & Cultural Adventure – Naryn Region",
  "description": "Discover Kyrgyzstan's untouched heartland on an unforgettable 8-day journey through mountains, villages, and Silk Road landmarks.",
  "coverImage": "/images/activities/eight-days-horse-trekking-tour/8-DHT-cover-img.webp",
  "images": [
    "/images/activities/eight-days-horse-trekking-tour/8-DHT-img-1.webp",
    "/images/activities/eight-days-horse-trekking-tour/8-DHT-img-2.webp",
    "/images/activities/eight-days-horse-trekking-tour/8-DHT-img-3.webp"
  ],
  "duration": "8 days / 7 nights",
  "location": "Naryn Region (multiple villages and landmarks)",
  "groupSize": "2–8 participants",
  "price": 0,
  "metadata": {
    "title": "8-Day Horse Trekking Tour – Naryn Region",
    "description": "Ride through mountains, villages, and Silk Road ruins on an 8-day horse adventure.",
    "path": "/activities/activity-3",
    "image": "/images/activities/eight-days-horse-trekking-tour/8-DHT-cover-img.webp",
    "alt": "Horse trekking through Kyrgyz mountain landscapes"
  },
  "localeGroupId": "activity-3",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Multi-day adventure tour (8 days)
- Premium experience - consider pricing strategy
- Limited group size (2-8) - exclusive experience
- **💡 Recommendation:** Update `price` field based on actual pricing

---

## 🇫🇷 Activity 3 - French Version

```json
{
  "name": "Aventure équestre et culturelle de 8 jours – Région de Naryn",
  "description": "Découvrez le cœur intact du Kirghizistan lors d'un voyage inoubliable de 8 jours à travers montagnes, villages et sites historiques de la Route de la Soie.",
  "coverImage": "/images/activities/eight-days-horse-trekking-tour/8-DHT-cover-img.webp",
  "images": [
    "/images/activities/eight-days-horse-trekking-tour/8-DHT-img-1.webp",
    "/images/activities/eight-days-horse-trekking-tour/8-DHT-img-2.webp",
    "/images/activities/eight-days-horse-trekking-tour/8-DHT-img-3.webp"
  ],
  "duration": "8 jours / 7 nuits",
  "location": "Région de Naryn (plusieurs villages et sites emblématiques)",
  "groupSize": "2 à 8 participants",
  "price": 0,
  "metadata": {
    "title": "Randonnée équestre de 8 jours – Région de Naryn",
    "description": "Parcourez montagnes, villages et vestiges de la Route de la Soie lors d'une aventure équestre de 8 jours.",
    "path": "/activities/activity-3",
    "image": "/images/activities/eight-days-horse-trekking-tour/8-DHT-cover-img.webp",
    "alt": "Cavaliers traversant les paysages montagneux du Kirghizistan"
  },
  "localeGroupId": "activity-3",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

---

## 🇬🇧 Activity 4 - English Version

```json
{
  "name": "Shaar Waterfall Horse Trek",
  "description": "Ride through breathtaking mountain trails to Kyrgyzstan's hidden gem — the Shaar Waterfall, the highest in Central Asia.",
  "coverImage": "/images/activities/one-day-horse-trekking/1-DHT-cover-img.webp",
  "images": [
    "/images/activities/one-day-horse-trekking/1-DHT-img-1.webp",
    "/images/activities/one-day-horse-trekking/1-DHT-img-2.webp",
    "/images/activities/one-day-horse-trekking/1-DHT-img-3.webp"
  ],
  "duration": "Full-day trek (approx. 28 km round trip)",
  "location": "Shaar Waterfall trail (Naryn Region)",
  "groupSize": "2–6 participants",
  "price": 0,
  "metadata": {
    "title": "Shaar Waterfall Horse Trek",
    "description": "Full-day horseback adventure to Kyrgyzstan's tallest waterfall.",
    "path": "/activities/activity-4",
    "image": "/images/activities/one-day-horse-trekking/1-DHT-cover-img.webp",
    "alt": "Horse riders approaching Shaar Waterfall"
  },
  "localeGroupId": "activity-4",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Full-day adventure (28 km round trip)
- Natural landmark attraction (highest waterfall in Central Asia)
- Small group experience (2-6 people)

---

## 🇫🇷 Activity 4 - French Version

```json
{
  "name": "Randonnée à cheval vers la cascade de Shaar",
  "description": "Partez sur des sentiers de montagne spectaculaires jusqu'à la cascade cachée de Shaar, la plus haute d'Asie centrale.",
  "coverImage": "/images/activities/one-day-horse-trekking/1-DHT-cover-img.webp",
  "images": [
    "/images/activities/one-day-horse-trekking/1-DHT-img-1.webp",
    "/images/activities/one-day-horse-trekking/1-DHT-img-2.webp",
    "/images/activities/one-day-horse-trekking/1-DHT-img-3.webp"
  ],
  "duration": "Excursion d'une journée (environ 28 km aller-retour)",
  "location": "Sentier de la cascade de Shaar (région de Naryn)",
  "groupSize": "2 à 6 participants",
  "price": 0,
  "metadata": {
    "title": "Randonnée à cheval – Cascade de Shaar",
    "description": "Aventure équestre d'une journée vers la plus haute cascade du Kirghizistan.",
    "path": "/activities/activity-4",
    "image": "/images/activities/one-day-horse-trekking/1-DHT-cover-img.webp",
    "alt": "Cavaliers approchant la cascade de Shaar"
  },
  "localeGroupId": "activity-4",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

---

## 🇬🇧 Activity 5 - English Version

```json
{
  "name": "Camping in the Kyrgyz Mountains",
  "description": "End your days under a canopy of stars, surrounded by silence, fresh air, and the beauty of the wild.",
  "coverImage": "/images/activities/the-camping/TC-cover-img.webp",
  "images": [
    "/images/activities/the-camping/TC-img-1.webp",
    "/images/activities/the-camping/TC-img-2.webp",
    "/images/activities/the-camping/TC-img-3.webp",
    "/images/activities/the-camping/TC-img-4.webp",
    "/images/activities/the-camping/TC-img-5.webp",
    "/images/activities/the-camping/TC-img-6.webp",
    "/images/activities/the-camping/TC-img-7.webp",
    "/images/activities/the-camping/TC-img-8.webp"
  ],
  "duration": "Overnight (customizable)",
  "location": "Remote mountain camps across Kyrgyzstan",
  "groupSize": "Any",
  "price": 0,
  "metadata": {
    "title": "Camping in the Kyrgyz Mountains",
    "description": "Spend nights under the stars in Kyrgyzstan's pristine mountain wilderness.",
    "path": "/activities/activity-5",
    "image": "/images/activities/the-camping/TC-cover-img.webp",
    "alt": "Tents set up for camping in Kyrgyz mountain valley"
  },
  "localeGroupId": "activity-5",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Flexible duration (customizable)
- Most images (8 total) - perfect for visual storytelling
- Open to all group sizes
- Great add-on to other activities

---

## 🇫🇷 Activity 5 - French Version

```json
{
  "name": "Camping dans les montagnes kirghizes",
  "description": "Terminez vos journées sous un ciel étoilé, entouré de silence, d'air pur et de la beauté sauvage des montagnes kirghizes.",
  "coverImage": "/images/activities/the-camping/TC-cover-img.webp",
  "images": [
    "/images/activities/the-camping/TC-img-1.webp",
    "/images/activities/the-camping/TC-img-2.webp",
    "/images/activities/the-camping/TC-img-3.webp",
    "/images/activities/the-camping/TC-img-4.webp",
    "/images/activities/the-camping/TC-img-5.webp",
    "/images/activities/the-camping/TC-img-6.webp",
    "/images/activities/the-camping/TC-img-7.webp",
    "/images/activities/the-camping/TC-img-8.webp"
  ],
  "duration": "Nuitée (personnalisable)",
  "location": "Campements de montagne à travers le Kirghizistan",
  "groupSize": "Tout type de groupe",
  "price": 0,
  "metadata": {
    "title": "Camping dans les montagnes kirghizes",
    "description": "Passez des nuits sous les étoiles dans la nature sauvage et préservée du Kirghizistan.",
    "path": "/activities/activity-5",
    "image": "/images/activities/the-camping/TC-cover-img.webp",
    "alt": "Tentes installées pour le camping dans une vallée montagneuse du Kirghizistan"
  },
  "localeGroupId": "activity-5",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

---

## 📊 ملخص البيانات

| localeGroupId | Name (EN)                | Name (FR)                     | Duration | Price | Images |
| ------------- | ------------------------ | ----------------------------- | -------- | ----- | ------ |
| activity-1    | Beshbarmak Cooking Class | Cours de cuisine Beshbarmak   | 1.5h     | $0    | 3      |
| activity-2    | Eagle Hunting Show       | Spectacle de chasse à l'aigle | 1-2h     | $0    | 6      |
| activity-3    | 8-Day Horse Adventure    | Aventure équestre 8 jours     | 8 days   | $0    | 3      |
| activity-4    | Shaar Waterfall Trek     | Randonnée cascade Shaar       | 1 day    | $0    | 3      |
| activity-5    | Mountain Camping         | Camping en montagne           | Custom   | $0    | 8      |

---

## 🎯 نصائح وتوجيهات من الأستاذ 👨‍🏫

### 1. استراتيجية الأسعار 💰

**الوضع الحالي:** كل الأنشطة مجانية (`price: 0`)

**توصيات:**

```javascript
// ❌ غير واقعي للأعمال
"price": 0

// ✅ أسعار مقترحة
{
  "activity-1": 25,  // Cooking class - reasonable price
  "activity-2": 50,  // World champion show - premium
  "activity-3": 850, // 8-day tour - comprehensive package
  "activity-4": 75,  // Full-day trek with guide
  "activity-5": 35   // Overnight camping per night
}
```

**🔧 كيف تعدلها:**
بعد إنشاء الأنشطة، استعمل PATCH:

```bash
PATCH /api/v1/activities/:id
{
  "price": 50
}
```

---

### 2. إدارة التوفر ⏰

**سيناريو:** نشاط معين مشغول أو الطقس سيء

```bash
# تعطيل نشاط مؤقتاً
PATCH /api/v1/activities/:id/availability
{
  "availabilityStatus": "unavailable"
}

# إعادة تفعيله
PATCH /api/v1/activities/:id/availability
{
  "availabilityStatus": "available"
}
```

---

### 3. استراتيجية الترجمات 🌐

**الوضع الحالي:**

- ✅ كل activity عندها `localeGroupId`
- ✅ EN و FR مربوطين

**كيف تستغل هذا:**

```javascript
// Frontend: Switch between languages
const fetchActivityTranslations = async groupId => {
  const response = await fetch(`/api/v1/activities?localeGroupId=${groupId}`);
  const data = await response.json();

  const en = data.data.items.find(a => a.locale === 'en');
  const fr = data.data.items.find(a => a.locale === 'fr');

  return { en, fr };
};

// Usage:
const translations = await fetchActivityTranslations('activity-2');
console.log(translations.en.name); // Eagle Hunting Show
console.log(translations.fr.name); // Spectacle de chasse à l'aigle
```

---

### 4. تحسين SEO 🔍

**ملاحظة:** كل activity عندها metadata كاملة

```javascript
// ✅ Best Practice: Use metadata for SEO
<Head>
  <title>{activity.metadata.title}</title>
  <meta name="description" content={activity.metadata.description} />
  <meta property="og:image" content={activity.metadata.image} />
  <meta property="og:url" content={activity.metadata.path} />
  <link rel="canonical" href={activity.metadata.path} />
</Head>
```

---

### 5. إدارة الصور 🖼️

**ملاحظة:** الصور حالياً relative paths

```javascript
// ❌ الوضع الحالي
"coverImage": "/images/activities/..."

// ✅ التحسين المقترح
// في الـ Backend: أضف domain
activity.coverImage = `${process.env.CDN_URL}${activity.coverImage}`;

// أو في الـ Frontend
<img
  src={`${process.env.NEXT_PUBLIC_CDN_URL}${activity.coverImage}`}
  alt={activity.metadata.alt}
/>
```

**📌 تنظيم الصور:**

```
/images/activities/
  ├── beshbarmak-cooking-classes/
  │   ├── BCC-cover-img.webp
  │   ├── BCC-img-1.webp
  │   └── BCC-img-3.webp
  ├── eagle-hunting-show/
  │   ├── EHS-cover-img.webp (6 images total)
  └── ...
```

---

### 6. Tags الذكية 🏷️

**تذكير:** Tags تُنشأ تلقائياً من الـ Model

```typescript
// activity.model.ts - Pre-save hook
activitySchema.pre('save', function () {
  // Auto-generates tags from: name, location, description
  this.tags = generateTags(this.name, this.location, this.description);
});
```

**مثال:**

```javascript
// Input
"name": "Eagle Hunting Show – With a World Champion"

// Auto-generated tags
"tags": ["eagle", "hunting", "show", "champion"]
```

**🎯 الفائدة:**

- Text search: `GET /api/v1/activities?q=eagle`
- Recommendations: Activities with similar tags
- SEO: Keywords for search engines

---

### 7. استراتيجية الفلترة 🔎

**أمثلة عملية:**

```bash
# الأنشطة المجانية فقط
GET /api/v1/activities?isFree=true

# أنشطة اليوم الواحد (بعد تحديث الأسعار)
GET /api/v1/activities?maxPrice=100

# أنشطة Naryn Region
GET /api/v1/activities?location=Naryn

# متاحة للحجز بالإنجليزية
GET /api/v1/activities?availabilityStatus=available&locale=en

# المجمّع: أنشطة مجانية ومتاحة بالفرنسية
GET /api/v1/activities?isFree=true&availabilityStatus=available&locale=fr
```

---

### 8. ربط مع Travel Packs 🎒

**السيناريو:** ربط activities بـ travel packages

```javascript
// Step 1: Create travel pack
POST /api/v1/travel-packs
{
  "name": "Naryn Cultural Experience",
  "activities": [] // Empty for now
}
// Response: { _id: "pack-123" }

// Step 2: Link activities to pack
POST /api/v1/activities/:activityId/packs
{
  "packIds": ["pack-123"]
}

// Now activity knows it belongs to this pack
// ✅ activity.packIds = ["pack-123"]
```

---

### 9. Validation Errors - كيف تتعامل معها 🚫

**مثال:** نسيت إضافة `localeGroupId`

```bash
POST /api/v1/activities
{
  "name": "Test Activity",
  "locale": "en"
  # ❌ Missing: localeGroupId, description, coverImage, etc.
}
```

**Response:**

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "errors": [
      "Locale group ID is required",
      "Description must be at least 10 characters",
      "Cover image must be a valid URL"
    ]
  }
}
```

**الحل:**

- تأكد من كل الحقول المطلوبة موجودة
- راجع `activity.validator.ts` للـ rules الكاملة

---

### 10. أفضل ممارسات الـ Testing 🧪

```bash
# Test 1: Create EN version
POST /api/v1/activities
{ ...activity-1-en data... }
# Save the _id returned

# Test 2: Create FR version with SAME localeGroupId
POST /api/v1/activities
{ ...activity-1-fr data... }

# Test 3: Verify they're linked
GET /api/v1/activities?localeGroupId=activity-1
# Should return 2 items

# Test 4: Get only EN
GET /api/v1/activities?localeGroupId=activity-1&locale=en
# Should return 1 item

# Test 5: Update price
PATCH /api/v1/activities/:id
{ "price": 25 }

# Test 6: Check statistics
GET /api/v1/activities/statistics
# Verify count increased
```

---

## ⚡ Quick Start Commands

```bash
# 1. Start your server
npm run dev

# 2. Import all activities via migration
npm run migrate:activities

# 3. Verify import
curl http://localhost:4000/api/v1/activities | jq

# 4. Check statistics
curl http://localhost:4000/api/v1/activities/statistics | jq

# 5. Test translation linking
curl "http://localhost:4000/api/v1/activities?localeGroupId=activity-1" | jq
```

---

## 🎓 الخلاصة النهائية

### ✅ ما تم إنجازه:

1. ✅ تحويل 10 أنشطة (5 EN + 5 FR) للبنية الجديدة
2. ✅ إضافة `localeGroupId` لربط الترجمات
3. ✅ إضافة `status` و `availabilityStatus`
4. ✅ البيانات جاهزة 100% للاستيراد

### 📋 الخطوات التالية:

1. ✅ انسخ أي activity من الأعلى
2. ✅ الصقه في Postman
3. ✅ اضغط Send
4. ✅ كرر للـ 10 activities
5. ✅ جرب الـ queries بالـ `localeGroupId`

### 💡 نصيحة أخيرة:

- **ابدأ بـ 2-3 أنشطة** فقط للتجربة
- **جرّب كل الـ endpoints** (GET, POST, PATCH, DELETE)
- **اختبر الترجمات** بالـ `localeGroupId`
- **بعدين** أضف باقي الأنشطة

---

## 🆘 Need Help?

إذا واجهتك أي مشكلة:

1. تأكد أن الـ server شغال: `pnpm dev`
2. راجع الـ validation errors بعناية
3. استعمل `activities-quickref.md` للأمثلة
4. اختبر بـ activity واحد أولاً قبل استيراد الكل

**بالتوفيق! 🚀**
