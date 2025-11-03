# 🚗 Cars Data - Ready for API Import

> بيانات السيارات المتاحة للتأجير محولة للبنية الجديدة وجاهزة للاستيراد عبر Postman

---

## 📋 نظرة عامة

هذا الملف يحتوي على **10 سيارات** (5 بالإنجليزية + 5 بالفرنسية) محولة من ملفات JSON إلى البنية الجديدة التي تتوافق مع الـ Backend.

### ✨ التحسينات المضافة:

- ✅ إضافة حقل `localeGroupId` لربط الترجمات
- ✅ إضافة حقول `status` و `availabilityStatus`
- ✅ البيانات جاهزة للإرسال مباشرة عبر POST في Postman
- ✅ كل car مستقل (يمكنك نسخه ولصقه مباشرة)

---

## 🎯 كيفية الاستخدام

### الطريقة 1: استيراد يدوي عبر Postman

1. افتح Postman
2. أنشئ طلب جديد: `POST http://localhost:4000/api/v1/cars`
3. اختر `Body` → `raw` → `JSON`
4. انسخ أي car من الأسفل والصقه
5. اضغط **Send**

### الطريقة 2: استيراد جماعي عبر Migration Script

```bash
npm run migrate:cars
```

> ⚠️ **ملاحظة:** Script الـ Migration محدّث ويضيف `localeGroupId` تلقائياً

---

## 📚 البيانات الجاهزة

---

## 🇬🇧 Car 1 - English Version (BMW X7)

```json
{
  "name": "BMW X7 (2024)",
  "description": "A luxury SUV that blends elegance, cutting-edge technology, and power — designed for travelers who want to experience Kyrgyzstan in style and comfort. The BMW X7 offers the smoothness of a high-end vehicle while remaining fully equipped for Kyrgyzstan's diverse landscapes.",
  "coverImage": "/images/cars/BMW X7/BMW-X7-cover-img.webp",
  "pricing": {
    "amount": 180,
    "currency": "USD",
    "unit": "day"
  },
  "specs": {
    "seats": "7",
    "transmission": "Automatic",
    "drive": "4x4 xDrive",
    "luggage": "Large",
    "fuel": "Petrol"
  },
  "metadata": {
    "title": "BMW X7 (2024) — Luxury SUV Rental in Kyrgyzstan",
    "description": "Experience Kyrgyzstan in elegance and power with the 2024 BMW X7 — luxury SUV for comfort and adventure.",
    "path": "/cars/car-1",
    "image": "/images/cars/BMW X7/BMW-X7-cover-img.webp",
    "alt": "BMW X7 2024 luxury SUV available for rental"
  },
  "images": [
    "/images/cars/BMW X7/BMW-X7-img-1.webp",
    "/images/cars/BMW X7/BMW-X7-img-2.webp",
    "/images/cars/BMW X7/BMW-X7-img-3.webp",
    "/images/cars/BMW X7/BMW-X7-img-4.webp",
    "/images/cars/BMW X7/BMW-X7-img-5.webp"
  ],
  "localeGroupId": "car-1",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Premium luxury SUV - highest price point ($180/day)
- 7-seater with 4x4 capability
- `localeGroupId: "car-1"` links this to French version
- Perfect for high-end tourism market

---

## 🇫🇷 Car 1 - French Version (BMW X7)

```json
{
  "name": "BMW X7 (2024)",
  "description": "Un SUV de luxe alliant élégance, technologie de pointe et puissance — conçu pour les voyageurs souhaitant découvrir le Kirghizistan avec style et confort. Le BMW X7 offre la douceur d'un véhicule haut de gamme tout en restant parfaitement adapté à la diversité des paysages kirghiz.",
  "coverImage": "/images/cars/BMW X7/BMW-X7-cover-img.webp",
  "pricing": {
    "amount": 180,
    "currency": "USD",
    "unit": "jour"
  },
  "specs": {
    "seats": "7",
    "transmission": "Automatique",
    "drive": "4x4 xDrive",
    "luggage": "Grand",
    "fuel": "Essence"
  },
  "metadata": {
    "title": "BMW X7 (2024) — Location de SUV de luxe au Kirghizistan",
    "description": "Découvrez le Kirghizistan avec élégance et puissance grâce au BMW X7 2024 — un SUV de luxe alliant confort et aventure.",
    "path": "/cars/car-1",
    "image": "/images/cars/BMW X7/BMW-X7-cover-img.webp",
    "alt": "SUV BMW X7 2024 de luxe disponible à la location"
  },
  "images": [
    "/images/cars/BMW X7/BMW-X7-img-1.webp",
    "/images/cars/BMW X7/BMW-X7-img-2.webp",
    "/images/cars/BMW X7/BMW-X7-img-3.webp",
    "/images/cars/BMW X7/BMW-X7-img-4.webp",
    "/images/cars/BMW X7/BMW-X7-img-5.webp"
  ],
  "localeGroupId": "car-1",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Same `localeGroupId` as English version → linked translations
- Query: `GET /api/v1/cars?localeGroupId=car-1` returns both versions
- Notice French-specific fields: `unit: "jour"`, `transmission: "Automatique"`, `fuel: "Essence"`

---

## 🇬🇧 Car 2 - English Version (Mercedes-Benz Sprinter)

```json
{
  "name": "Mercedes-Benz Sprinter Minibus",
  "description": "A reliable and spacious minibus perfect for group adventures across Kyrgyzstan. Known for its durability, capacity, and comfort during long journeys — ideal for shared travel experiences.",
  "coverImage": "/images/cars/BUS/BUS-cover-img.webp",
  "pricing": {
    "amount": 140,
    "currency": "USD",
    "unit": "day"
  },
  "specs": {
    "seats": "15–20",
    "transmission": "Manual",
    "drive": "2WD Diesel",
    "luggage": "Extra Large",
    "fuel": "Diesel"
  },
  "metadata": {
    "title": "Mercedes-Benz Sprinter — Group Minibus Rental in Kyrgyzstan",
    "description": "Travel together across Kyrgyzstan with the reliable Mercedes-Benz Sprinter Minibus — perfect for group tours.",
    "path": "/cars/car-2",
    "image": "/images/cars/BUS/BUS-cover-img.webp",
    "alt": "Mercedes-Benz Sprinter Minibus available for group rental"
  },
  "images": [
    "/images/cars/BUS/BUS-img-1.webp",
    "/images/cars/BUS/BUS-img-2.webp",
    "/images/cars/BUS/BUS-img-3.webp",
    "/images/cars/BUS/BUS-img-4.webp"
  ],
  "localeGroupId": "car-2",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Group transport solution (15-20 passengers)
- Manual transmission, Diesel engine
- Great for tour operators and large families
- Mid-range price ($140/day)

---

## 🇫🇷 Car 2 - French Version (Mercedes-Benz Sprinter)

```json
{
  "name": "Mercedes-Benz Sprinter Minibus",
  "description": "Un minibus spacieux et fiable, parfait pour les aventures en groupe à travers le Kirghizistan. Reconnu pour sa durabilité, sa capacité et son confort sur les longs trajets — idéal pour vivre des expériences partagées.",
  "coverImage": "/images/cars/BUS/BUS-cover-img.webp",
  "pricing": {
    "amount": 140,
    "currency": "USD",
    "unit": "jour"
  },
  "specs": {
    "seats": "15–20",
    "transmission": "Manuelle",
    "drive": "2WD Diesel",
    "luggage": "Très grand",
    "fuel": "Diesel"
  },
  "metadata": {
    "title": "Mercedes-Benz Sprinter — Location de minibus de groupe au Kirghizistan",
    "description": "Voyagez ensemble à travers le Kirghizistan avec le fiable Mercedes-Benz Sprinter Minibus — idéal pour les circuits en groupe.",
    "path": "/cars/car-2",
    "image": "/images/cars/BUS/BUS-cover-img.webp",
    "alt": "Minibus Mercedes-Benz Sprinter disponible pour la location de groupe"
  },
  "images": [
    "/images/cars/BUS/BUS-img-1.webp",
    "/images/cars/BUS/BUS-img-2.webp",
    "/images/cars/BUS/BUS-img-3.webp",
    "/images/cars/BUS/BUS-img-4.webp"
  ],
  "localeGroupId": "car-2",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

---

## 🇬🇧 Car 3 - English Version (Jeep Wrangler)

```json
{
  "name": "Jeep Wrangler (2022)",
  "description": "An icon of freedom and adventure, the Jeep Wrangler is built for travelers who want to experience Kyrgyzstan's wilderness up close. Agile, powerful, and authentic — perfect for rugged off-road exploration.",
  "coverImage": "/images/cars/JEEP WRANGLER/JEEP-cover-img.webp",
  "pricing": {
    "amount": 120,
    "currency": "USD",
    "unit": "day"
  },
  "specs": {
    "seats": "4",
    "transmission": "Automatic",
    "drive": "4x4",
    "luggage": "Medium",
    "fuel": "Petrol"
  },
  "metadata": {
    "title": "Jeep Wrangler (2022) — Off-Road Rental in Kyrgyzstan",
    "description": "Explore Kyrgyzstan's remote trails with the iconic Jeep Wrangler — the perfect blend of thrill and authenticity.",
    "path": "/cars/car-3",
    "image": "/images/cars/JEEP WRANGLER/JEEP-cover-img.webp",
    "alt": "Jeep Wrangler 2022 off-road SUV for rental"
  },
  "images": [
    "/images/cars/JEEP WRANGLER/JEEP -img-1.webp",
    "/images/cars/JEEP WRANGLER/JEEP -img-2.webp",
    "/images/cars/JEEP WRANGLER/JEEP -img-3.webp",
    "/images/cars/JEEP WRANGLER/JEEP -img-4.webp",
    "/images/cars/JEEP WRANGLER/JEEP -img-5.webp"
  ],
  "localeGroupId": "car-3",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Adventure-focused vehicle
- Smaller capacity (4 seats) but excellent off-road
- Iconic brand with global recognition
- $120/day - competitive pricing

---

## 🇫🇷 Car 3 - French Version (Jeep Wrangler)

```json
{
  "name": "Jeep Wrangler (2022)",
  "description": "Icône de liberté et d'aventure, la Jeep Wrangler est faite pour les voyageurs souhaitant vivre la nature kirghize de près. Agile, puissante et authentique — parfaite pour l'exploration tout-terrain.",
  "coverImage": "/images/cars/JEEP WRANGLER/JEEP-cover-img.webp",
  "pricing": {
    "amount": 120,
    "currency": "USD",
    "unit": "jour"
  },
  "specs": {
    "seats": "4",
    "transmission": "Automatique",
    "drive": "4x4",
    "luggage": "Moyen",
    "fuel": "Essence"
  },
  "metadata": {
    "title": "Jeep Wrangler (2022) — Location tout-terrain au Kirghizistan",
    "description": "Explorez les pistes reculées du Kirghizistan avec l'emblématique Jeep Wrangler — un mélange parfait d'adrénaline et d'authenticité.",
    "path": "/cars/car-3",
    "image": "/images/cars/JEEP WRANGLER/JEEP-cover-img.webp",
    "alt": "Jeep Wrangler 2022 SUV tout-terrain disponible à la location"
  },
  "images": [
    "/images/cars/JEEP WRANGLER/JEEP -img-1.webp",
    "/images/cars/JEEP WRANGLER/JEEP -img-2.webp",
    "/images/cars/JEEP WRANGLER/JEEP -img-3.webp",
    "/images/cars/JEEP WRANGLER/JEEP -img-4.webp",
    "/images/cars/JEEP WRANGLER/JEEP -img-5.webp"
  ],
  "localeGroupId": "car-3",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

---

## 🇬🇧 Car 4 - English Version (Toyota Land Cruiser)

```json
{
  "name": "Toyota Land Cruiser",
  "description": "The legendary 4x4 built for strength, reliability, and adventure — the Toyota Land Cruiser remains the ultimate companion for exploring Kyrgyzstan's toughest terrains. Trusted worldwide, combining technology and rugged heritage.",
  "coverImage": "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-cover-img.webp",
  "pricing": {
    "amount": 100,
    "currency": "USD",
    "unit": "day"
  },
  "specs": {
    "seats": "5–7",
    "transmission": "Automatic/Manual",
    "drive": "4x4",
    "luggage": "Large",
    "fuel": "Diesel"
  },
  "metadata": {
    "title": "Toyota Land Cruiser — Reliable 4x4 SUV for Kyrgyzstan Adventures",
    "description": "Conquer Kyrgyzstan's wild landscapes with the iconic Toyota Land Cruiser — unmatched reliability and performance.",
    "path": "/cars/car-4",
    "image": "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-cover-img.webp",
    "alt": "Toyota Land Cruiser available for adventure rental"
  },
  "images": [
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-1.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-2.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-3.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-4.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-5.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-6.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-7.webp"
  ],
  "localeGroupId": "car-4",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Most popular 4x4 worldwide
- Excellent reliability for tough terrain
- Flexible seating (5-7 passengers)
- Both automatic and manual available
- Most images (7 total) - great for showcasing
- Competitive price ($100/day)

---

## 🇫🇷 Car 4 - French Version (Toyota Land Cruiser)

```json
{
  "name": "Toyota Land Cruiser",
  "description": "Le légendaire 4x4 conçu pour la force, la fiabilité et l'aventure — le Toyota Land Cruiser reste le compagnon idéal pour explorer les terrains les plus exigeants du Kirghizistan. Fiable, robuste et doté d'une technologie avancée.",
  "coverImage": "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-cover-img.webp",
  "pricing": {
    "amount": 100,
    "currency": "USD",
    "unit": "jour"
  },
  "specs": {
    "seats": "5–7",
    "transmission": "Automatique/Manuelle",
    "drive": "4x4",
    "luggage": "Grand",
    "fuel": "Diesel"
  },
  "metadata": {
    "title": "Toyota Land Cruiser — SUV 4x4 fiable pour les aventures au Kirghizistan",
    "description": "Affrontez les paysages sauvages du Kirghizistan avec le mythique Toyota Land Cruiser — fiabilité et performance incomparables.",
    "path": "/cars/car-4",
    "image": "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-cover-img.webp",
    "alt": "Toyota Land Cruiser disponible pour les locations d'aventure"
  },
  "images": [
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-1.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-2.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-3.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-4.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-5.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-6.webp",
    "/images/cars/TOYOTA LAND CRUISER/T-CRUISER-img-7.webp"
  ],
  "localeGroupId": "car-4",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

---

## 🇬🇧 Car 5 - English Version (Toyota Sequoia)

```json
{
  "name": "Toyota Sequoia",
  "description": "A powerful and spacious SUV, perfect for families or groups who value both comfort and strength when exploring Kyrgyzstan's rugged roads. The Toyota Sequoia ensures safety and comfort on every journey.",
  "coverImage": "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-cover-img.webp",
  "pricing": {
    "amount": 90,
    "currency": "USD",
    "unit": "day"
  },
  "specs": {
    "seats": "7",
    "transmission": "Automatic/Manual",
    "drive": "4x4",
    "luggage": "Large",
    "fuel": "Petrol"
  },
  "metadata": {
    "title": "Toyota Sequoia (2009) — Family SUV Rental in Kyrgyzstan",
    "description": "Spacious and strong, the Toyota Sequoia is perfect for comfortable and safe family adventures across Kyrgyzstan.",
    "path": "/cars/car-5",
    "image": "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-cover-img.webp",
    "alt": "Toyota Sequoia family SUV available for rental"
  },
  "images": [
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-1.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-2.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-3.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-4.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-5.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-6.webp"
  ],
  "localeGroupId": "car-5",
  "locale": "en",
  "status": "active",
  "availabilityStatus": "available"
}
```

**✅ Notes:**

- Family-oriented SUV
- 7 seats with large luggage capacity
- Most affordable option ($90/day)
- Older model (2009) but reliable
- Good value for budget-conscious families

---

## 🇫🇷 Car 5 - French Version (Toyota Sequoia)

```json
{
  "name": "Toyota Sequoia",
  "description": "Un SUV puissant et spacieux, parfait pour les familles ou les groupes recherchant à la fois confort et robustesse sur les routes kirghizes. La Toyota Sequoia assure sécurité et bien-être à chaque voyage.",
  "coverImage": "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-cover-img.webp",
  "pricing": {
    "amount": 90,
    "currency": "USD",
    "unit": "jour"
  },
  "specs": {
    "seats": "7",
    "transmission": "Automatique/Manuelle",
    "drive": "4x4",
    "luggage": "Grand",
    "fuel": "Essence"
  },
  "metadata": {
    "title": "Toyota Sequoia (2009) — Location de SUV familial au Kirghizistan",
    "description": "Spacieuse et solide, la Toyota Sequoia est idéale pour les aventures familiales confortables et sûres à travers le Kirghizistan.",
    "path": "/cars/car-5",
    "image": "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-cover-img.webp",
    "alt": "SUV familial Toyota Sequoia disponible à la location"
  },
  "images": [
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-1.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-2.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-3.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-4.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-5.webp",
    "/images/cars/TOYOTA SEQUOIA/T-SEQUOIA-img-6.webp"
  ],
  "localeGroupId": "car-5",
  "locale": "fr",
  "status": "active",
  "availabilityStatus": "available"
}
```

---

## 📊 ملخص البيانات

| localeGroupId | Name                | Type       | Seats | Price/Day | Images | Transmission |
| ------------- | ------------------- | ---------- | ----- | --------- | ------ | ------------ |
| car-1         | BMW X7              | Luxury SUV | 7     | $180      | 5      | Automatic    |
| car-2         | Mercedes Sprinter   | Minibus    | 15-20 | $140      | 4      | Manual       |
| car-3         | Jeep Wrangler       | Off-Road   | 4     | $120      | 5      | Automatic    |
| car-4         | Toyota Land Cruiser | 4x4 SUV    | 5-7   | $100      | 7      | Auto/Manual  |
| car-5         | Toyota Sequoia      | Family SUV | 7     | $90       | 6      | Auto/Manual  |

---

## 🎯 نصائح وتوجيهات من الأستاذ 👨‍🏫

### 1. تصنيف السيارات حسب الاستخدام 🚙

```javascript
// Luxury segment
car-1: BMW X7 - $180/day → VIP clients, business travelers

// Group transport
car-2: Mercedes Sprinter - $140/day → Tour groups, large families

// Adventure seekers
car-3: Jeep Wrangler - $120/day → Off-road enthusiasts
car-4: Toyota Land Cruiser - $100/day → Reliable adventure

// Family-friendly
car-5: Toyota Sequoia - $90/day → Budget-conscious families
```

---

### 2. استراتيجية التسعير 💰

**تدرج الأسعار:**

```javascript
$90  → Entry-level (Toyota Sequoia)
$100 → Mid-range (Land Cruiser)
$120 → Adventure (Jeep Wrangler)
$140 → Group (Mercedes Sprinter)
$180 → Premium (BMW X7)
```

**💡 نصيحة:**

- احسب التكلفة اليومية: وقود + صيانة + استهلاك
- أضف هامش ربح 30-40%
- قدّم خصومات للحجز المبكر أو الإيجار الطويل

---

### 3. إدارة التوفر (Availability) 📅

```bash
# سيناريو: BMW X7 محجوز من 1-5 نوفمبر
PATCH /api/v1/cars/:id
{
  "availabilityStatus": "reserved"
}

# بعد انتهاء الحجز
PATCH /api/v1/cars/:id
{
  "availabilityStatus": "available"
}

# صيانة دورية
PATCH /api/v1/cars/:id
{
  "status": "maintenance",
  "availabilityStatus": "unavailable"
}
```

---

### 4. الفلترة الذكية 🔍

**أمثلة عملية:**

```bash
# سيارات فاخرة (Luxury)
GET /api/v1/cars?minPrice=150&transmission=Automatic

# سيارات 4x4 متاحة
GET /api/v1/cars?drive=4x4&availabilityStatus=available

# سيارات عائلية (7+ seats)
GET /api/v1/cars?seats=7

# سيارات اقتصادية (Diesel)
GET /api/v1/cars?fuel=Diesel&maxPrice=150

# بحث نصي
GET /api/v1/cars?q=Toyota

# مجمّع: 4x4 متاحة بأقل من $120
GET /api/v1/cars?drive=4x4&maxPrice=120&availabilityStatus=available
```

---

### 5. ربط الترجمات (localeGroupId) 🌐

```javascript
// Frontend: Switch between languages
const fetchCarTranslations = async groupId => {
  const response = await fetch(`/api/v1/cars?localeGroupId=${groupId}`);
  const data = await response.json();

  const en = data.data.items.find(c => c.locale === 'en');
  const fr = data.data.items.find(c => c.locale === 'fr');

  return { en, fr };
};

// Usage:
const translations = await fetchCarTranslations('car-1');
console.log(translations.en.name); // BMW X7 (2024)
console.log(translations.fr.specs.transmission); // Automatique
```

---

### 6. معالجة الأخطاء الشائعة ❌

**خطأ 1: نسيان localeGroupId**

```bash
POST /api/v1/cars
{
  "name": "Test Car",
  "locale": "en"
  # ❌ Missing: localeGroupId
}

# Response: 400 Bad Request
{
  "error": "Locale group ID is required"
}
```

**الحل:**

```json
{
  "name": "Test Car",
  "localeGroupId": "car-test-1", // ✅ Added
  "locale": "en"
}
```

---

### 7. SEO للسيارات 🔍

```javascript
// ✅ Best Practice: Use metadata
<Head>
  <title>{car.metadata.title}</title>
  <meta name="description" content={car.metadata.description} />

  {/* Multilingual SEO */}
  <link
    rel="alternate"
    hrefLang="en"
    href={`/cars/${car.localeGroupId}?lang=en`}
  />
  <link
    rel="alternate"
    hrefLang="fr"
    href={`/cars/${car.localeGroupId}?lang=fr`}
  />

  {/* Open Graph */}
  <meta property="og:image" content={car.metadata.image} />
  <meta property="og:url" content={car.metadata.path} />
</Head>
```

---

### 8. نظام الحجز (Booking System) 📝

```javascript
// Step 1: Check availability
GET /api/v1/cars/:id

// Step 2: Reserve car
PATCH /api/v1/cars/:id
{
  "availabilityStatus": "reserved"
}

// Step 3: Create booking record (separate Booking model)
POST /api/v1/bookings
{
  "carId": "car-id",
  "startDate": "2025-11-01",
  "endDate": "2025-11-05",
  "totalPrice": 900  // 5 days × $180
}

// Step 4: After booking ends, release car
PATCH /api/v1/cars/:id
{
  "availabilityStatus": "available"
}
```

---

### 9. التقارير والإحصائيات 📊

```bash
# إحصائيات عامة
GET /api/v1/cars/statistics

# Expected Response:
{
  "total": 10,
  "byAvailability": {
    "available": 8,
    "reserved": 1,
    "unavailable": 1
  },
  "byFuel": {
    "Petrol": 4,
    "Diesel": 3,
    "Essence": 3
  },
  "pricing": {
    "averagePrice": 126,
    "minPrice": 90,
    "maxPrice": 180
  },
  "mostPopular": "Toyota Land Cruiser"
}
```

---

### 10. أفضل ممارسات Testing 🧪

```bash
# Test 1: Create BMW X7 (EN)
POST /api/v1/cars
{ ...car-1-en data... }
# Save returned _id

# Test 2: Create BMW X7 (FR) with SAME localeGroupId
POST /api/v1/cars
{ ...car-1-fr data... }

# Test 3: Verify they're linked
GET /api/v1/cars?localeGroupId=car-1
# Should return 2 items

# Test 4: Filter by price range
GET /api/v1/cars?minPrice=150&maxPrice=200
# Should return BMW X7 only

# Test 5: Reserve a car
PATCH /api/v1/cars/:id
{ "availabilityStatus": "reserved" }

# Test 6: Verify it's not in available list
GET /api/v1/cars?availabilityStatus=available
# BMW should not appear
```

---

## 🚀 Quick Start Commands

```bash
# 1. Start server
npm run dev

# 2. Import all cars via migration
npm run migrate:cars

# 3. Verify import
curl http://localhost:4000/api/v1/cars | jq

# 4. Check stats
curl http://localhost:4000/api/v1/cars/statistics | jq

# 5. Test translation linking
curl "http://localhost:4000/api/v1/cars?localeGroupId=car-1" | jq
```

---

## 📝 ملاحظات مهمة

### عن الوحدات (Units):

```javascript
// English
"unit": "day"   // per day
"unit": "hour"  // per hour
"unit": "week"  // per week

// French
"unit": "jour"    // par jour
"unit": "heure"   // par heure
"unit": "semaine" // par semaine
```

### عن المواصفات (Specs):

```javascript
// English
"transmission": "Automatic" | "Manual"
"fuel": "Petrol" | "Diesel" | "Electric" | "Hybrid"

// French
"transmission": "Automatique" | "Manuelle"
"fuel": "Essence" | "Diesel" | "Électrique" | "Hybride"
```

---

## 🎓 الخلاصة النهائية

### ✅ ما تم إنجازه:

1. ✅ تحويل 10 سيارات (5 EN + 5 FR) للبنية الجديدة
2. ✅ إضافة `localeGroupId` لربط الترجمات
3. ✅ إضافة `status` و `availabilityStatus`
4. ✅ البيانات جاهزة 100% للاستيراد

### 📋 الخطوات التالية:

1. انسخ أي car من الأعلى
2. الصقه في Postman
3. اضغط Send
4. كرر للـ 10 cars
5. جرب الـ queries بالـ `localeGroupId`

### 💡 نصيحة أخيرة:

- **ابدأ بـ 2 سيارات** فقط للتجربة (مثلاً BMW X7 EN + FR)
- **جرّب كل الـ filters** (price, transmission, fuel, seats)
- **اختبر حالات الحجز** (available → reserved → available)
- **بعدين** أضف باقي السيارات

---

## 🆘 Need Help?

إذا واجهتك أي مشكلة:

1. تأكد أن الـ server شغال: `npm run dev`
2. راجع الـ validation errors بعناية
3. استعمل `cars-quickref.md` للأمثلة (سيتم تحديثه قريباً)
4. اختبر بـ car واحد أولاً قبل استيراد الكل

**بالتوفيق! 🚗💨**
