# 📘 User Frontend API Endpoints

## 🎯 نظرة عامة

توثيق شامل لجميع الـAPI endpoints المتاحة لواجهة المستخدم (User Frontend).

**Base URL:** `/api/v1`

---

## 📑 جدول المحتويات

1. [Health Check](#health-check)
2. [Travel Packs](#travel-packs)
3. [Activities](#activities)
4. [Cars](#cars)
5. [Pack Relations](#pack-relations)
6. [Guests](#guests)
7. [Bookings](#bookings)

---

# 🏥 Health Check

## GET /health

**الوصف:** فحص حالة الخادم.

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Request

```http
GET /api/v1/health
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": {
    "status": "ok",
    "uptime": 123456.789,
    "environment": "production",
    "version": "1.0.0"
  }
}
```

---

# 📦 Travel Packs

## GET /travel-packs

**الوصف:** جلب جميع الباقات السياحية مع إمكانية الفلترة والترتيب.

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Query Parameters

| Parameter     | Type    | Required | Default     | Description                   |
| ------------- | ------- | -------- | ----------- | ----------------------------- |
| `locale`      | string  | No       | `en`        | اللغة (`en`, `fr`)            |
| `page`        | number  | No       | `1`         | رقم الصفحة                    |
| `limit`       | number  | No       | `10`        | عدد النتائج في الصفحة         |
| `sortBy`      | string  | No       | `createdAt` | الترتيب حسب                   |
| `sortOrder`   | string  | No       | `desc`      | اتجاه الترتيب (`asc`, `desc`) |
| `minPrice`    | number  | No       | -           | الحد الأدنى للسعر             |
| `maxPrice`    | number  | No       | -           | الحد الأقصى للسعر             |
| `minDuration` | number  | No       | -           | الحد الأدنى للمدة (أيام)      |
| `maxDuration` | number  | No       | -           | الحد الأقصى للمدة (أيام)      |
| `isAvailable` | boolean | No       | -           | فلترة حسب التوفر              |

### Request

```http
GET /api/v1/travel-packs?locale=en&page=1&limit=10&isAvailable=true
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "pack_123abc",
      "name": "Kyrgyzstan Adventure Pack",
      "locale": "en",
      "slug": "kyrgyzstan-adventure-pack",
      "localeGroupId": "pack_group_123",
      "price": 850,
      "duration": 7,
      "maxPersons": 4,
      "description": "Experience the beauty of Kyrgyzstan...",
      "highlights": [
        "Issyk-Kul Lake visit",
        "Mountain trekking",
        "Cultural experiences"
      ],
      "included": ["Accommodation", "Meals", "Transport"],
      "notIncluded": ["Personal expenses", "Travel insurance"],
      "itinerary": [
        {
          "day": 1,
          "title": "Arrival in Bishkek",
          "description": "Transfer to hotel and city tour",
          "activities": ["City tour", "Welcome dinner"]
        }
      ],
      "images": ["https://..."],
      "metadata": {
        "difficulty": "moderate",
        "season": "summer"
      },
      "isAvailable": true,
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-11-01T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## GET /travel-packs/:id

**الوصف:** جلب باقة سياحية واحدة حسب ID أو slug.

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| `id`      | string | ID الباقة أو slug |

### Request

```http
GET /api/v1/travel-packs/pack_123abc
# OR
GET /api/v1/travel-packs/kyrgyzstan-adventure-pack
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "pack_123abc",
    "name": "Kyrgyzstan Adventure Pack",
    "locale": "en",
    "slug": "kyrgyzstan-adventure-pack",
    "localeGroupId": "pack_group_123",
    "price": 850,
    "duration": 7,
    "maxPersons": 4,
    "description": "Experience the beauty of Kyrgyzstan with our comprehensive adventure pack. This 7-day journey takes you through stunning landscapes, rich culture, and unforgettable experiences.",
    "highlights": [
      "Issyk-Kul Lake visit",
      "Mountain trekking in Ala-Archa",
      "Traditional yurt stay",
      "Cultural experiences with local families",
      "Horse riding adventures"
    ],
    "included": [
      "Accommodation in hotels and yurts",
      "All meals (breakfast, lunch, dinner)",
      "Professional guide",
      "Transport throughout the tour",
      "Entrance fees to attractions"
    ],
    "notIncluded": [
      "International flights",
      "Personal expenses",
      "Travel insurance",
      "Tips and gratuities"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Bishkek",
        "description": "Transfer to hotel and city orientation tour",
        "activities": ["Airport pickup", "City tour", "Welcome dinner"],
        "meals": ["Dinner"],
        "accommodation": "Hotel Bishkek"
      },
      {
        "day": 2,
        "title": "Ala-Archa National Park",
        "description": "Mountain trekking adventure",
        "activities": [
          "Mountain trekking",
          "Wildlife spotting",
          "Picnic lunch"
        ],
        "meals": ["Breakfast", "Lunch", "Dinner"],
        "accommodation": "Hotel Bishkek"
      }
    ],
    "images": [
      "https://cdn.explorekg.com/packs/pack1-main.jpg",
      "https://cdn.explorekg.com/packs/pack1-gallery1.jpg",
      "https://cdn.explorekg.com/packs/pack1-gallery2.jpg"
    ],
    "metadata": {
      "difficulty": "moderate",
      "season": "summer",
      "bestMonths": ["June", "July", "August", "September"],
      "physicalLevel": "3/5",
      "ageRestriction": "12+"
    },
    "isAvailable": true,
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T15:30:00.000Z"
  }
}
```

### Error Responses

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "message": "Travel pack not found",
    "code": "PACK_NOT_FOUND",
    "statusCode": 404
  }
}
```

---

## GET /travel-packs/:id/detailed

**الوصف:** جلب باقة سياحية مع تفاصيل كاملة (الأنشطة، السيارات، والأسعار).

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | ID الباقة   |

### Query Parameters

| Parameter | Type   | Required | Default | Description                                               |
| --------- | ------ | -------- | ------- | --------------------------------------------------------- |
| `step`    | string | No       | `full`  | مستوى التفاصيل (`overview`, `activities`, `cars`, `full`) |
| `locale`  | string | No       | `en`    | اللغة (`en`, `fr`)                                        |

### Request

```http
GET /api/v1/travel-packs/pack_123abc/detailed?step=full&locale=en
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "pack": {
      "id": "pack_123abc",
      "name": "Kyrgyzstan Adventure Pack",
      "locale": "en",
      "slug": "kyrgyzstan-adventure-pack",
      "localeGroupId": "pack_group_123",
      "price": 850,
      "duration": 7,
      "maxPersons": 4,
      "description": "Experience the beauty of Kyrgyzstan...",
      "highlights": ["..."],
      "included": ["..."],
      "notIncluded": ["..."],
      "itinerary": ["..."],
      "images": ["..."],
      "metadata": {},
      "isAvailable": true
    },
    "availableActivities": [
      {
        "id": "activity_001",
        "name": "Issyk-Kul Lake Tour",
        "locale": "en",
        "slug": "issyk-kul-lake-tour",
        "localeGroupId": "activity_group_001",
        "price": 120,
        "duration": 1,
        "description": "Full day tour to the beautiful Issyk-Kul Lake",
        "highlights": ["Swimming", "Beach activities", "Lunch by the lake"],
        "included": ["Transport", "Lunch", "Guide"],
        "images": ["..."],
        "difficulty": "easy",
        "minPersons": 1,
        "maxPersons": 10,
        "isAvailable": true
      },
      {
        "id": "activity_002",
        "name": "Horse Riding Adventure",
        "locale": "en",
        "slug": "horse-riding-adventure",
        "localeGroupId": "activity_group_002",
        "price": 80,
        "duration": 0.5,
        "description": "Experience traditional Kyrgyz horse riding",
        "highlights": [
          "Professional guide",
          "Mountain views",
          "Traditional experience"
        ],
        "included": ["Horse rental", "Guide", "Equipment"],
        "images": ["..."],
        "difficulty": "moderate",
        "minPersons": 1,
        "maxPersons": 6,
        "isAvailable": true
      }
    ],
    "availableCars": [
      {
        "id": "car_001",
        "name": "Toyota Land Cruiser",
        "locale": "en",
        "slug": "toyota-land-cruiser",
        "localeGroupId": "car_group_001",
        "price": 150,
        "type": "SUV",
        "capacity": 7,
        "transmission": "Automatic",
        "fuelType": "Diesel",
        "features": ["4WD", "AC", "GPS", "Child seats available"],
        "images": ["..."],
        "pricePerDay": 150,
        "isAvailable": true
      },
      {
        "id": "car_002",
        "name": "Hyundai Tucson",
        "locale": "en",
        "slug": "hyundai-tucson",
        "localeGroupId": "car_group_002",
        "price": 100,
        "type": "SUV",
        "capacity": 5,
        "transmission": "Automatic",
        "fuelType": "Petrol",
        "features": ["AC", "GPS", "Bluetooth"],
        "images": ["..."],
        "pricePerDay": 100,
        "isAvailable": true
      }
    ],
    "pricing": {
      "basePrice": 850,
      "currency": "USD",
      "priceBreakdown": {
        "accommodation": 300,
        "meals": 200,
        "transport": 150,
        "guide": 150,
        "entranceFees": 50
      },
      "additionalCosts": {
        "activities": "From $50 per activity",
        "carRental": "From $100 per day"
      }
    },
    "availability": {
      "isAvailable": true,
      "nextAvailableDate": "2025-11-15",
      "bookedDates": ["2025-11-05", "2025-11-06", "2025-11-07"]
    }
  }
}
```

---

# 🎯 Activities

## GET /activities

**الوصف:** جلب جميع الأنشطة المتاحة مع إمكانية الفلترة والترتيب.

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Query Parameters

| Parameter     | Type    | Required | Default     | Description                                |
| ------------- | ------- | -------- | ----------- | ------------------------------------------ |
| `locale`      | string  | No       | `en`        | اللغة (`en`, `fr`)                         |
| `page`        | number  | No       | `1`         | رقم الصفحة                                 |
| `limit`       | number  | No       | `10`        | عدد النتائج في الصفحة                      |
| `sortBy`      | string  | No       | `createdAt` | الترتيب حسب                                |
| `sortOrder`   | string  | No       | `desc`      | اتجاه الترتيب (`asc`, `desc`)              |
| `minPrice`    | number  | No       | -           | الحد الأدنى للسعر                          |
| `maxPrice`    | number  | No       | -           | الحد الأقصى للسعر                          |
| `difficulty`  | string  | No       | -           | مستوى الصعوبة (`easy`, `moderate`, `hard`) |
| `isAvailable` | boolean | No       | -           | فلترة حسب التوفر                           |

### Request

```http
GET /api/v1/activities?locale=en&page=1&limit=10&difficulty=easy&isAvailable=true
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "activity_001",
      "name": "Issyk-Kul Lake Tour",
      "locale": "en",
      "slug": "issyk-kul-lake-tour",
      "localeGroupId": "activity_group_001",
      "price": 120,
      "duration": 1,
      "description": "Full day tour to the beautiful Issyk-Kul Lake, one of the largest alpine lakes in the world.",
      "highlights": [
        "Swimming in crystal clear waters",
        "Beach activities and relaxation",
        "Lunch by the lake",
        "Visit to nearby hot springs"
      ],
      "included": [
        "Round-trip transport",
        "Lunch",
        "Professional guide",
        "Entrance fees"
      ],
      "images": [
        "https://cdn.explorekg.com/activities/issyk-kul-main.jpg",
        "https://cdn.explorekg.com/activities/issyk-kul-beach.jpg"
      ],
      "difficulty": "easy",
      "minPersons": 1,
      "maxPersons": 10,
      "metadata": {
        "category": "Nature",
        "season": "Summer",
        "ageRestriction": "All ages"
      },
      "isAvailable": true,
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-11-01T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## GET /activities/available

**الوصف:** جلب جميع الأنشطة المتاحة فقط (shortcut للفلترة).

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Request

```http
GET /api/v1/activities/available?locale=en
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "activity_001",
      "name": "Issyk-Kul Lake Tour",
      "locale": "en",
      "slug": "issyk-kul-lake-tour",
      "price": 120,
      "duration": 1,
      "isAvailable": true
    }
  ]
}
```

---

## GET /activities/:id

**الوصف:** جلب نشاط واحد حسب ID أو slug.

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| `id`      | string | ID النشاط أو slug |

### Request

```http
GET /api/v1/activities/activity_001
# OR
GET /api/v1/activities/issyk-kul-lake-tour
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "activity_001",
    "name": "Issyk-Kul Lake Tour",
    "locale": "en",
    "slug": "issyk-kul-lake-tour",
    "localeGroupId": "activity_group_001",
    "price": 120,
    "duration": 1,
    "description": "Full day tour to the beautiful Issyk-Kul Lake, one of the largest alpine lakes in the world. Enjoy swimming in crystal clear waters, beach activities, and a delicious lunch by the lake.",
    "highlights": [
      "Swimming in crystal clear waters",
      "Beach activities and relaxation",
      "Lunch by the lake",
      "Visit to nearby hot springs",
      "Photo opportunities with stunning mountain backdrop"
    ],
    "included": [
      "Round-trip transport from Bishkek",
      "Lunch at lakeside restaurant",
      "Professional English-speaking guide",
      "Entrance fees to attractions",
      "Bottled water"
    ],
    "images": [
      "https://cdn.explorekg.com/activities/issyk-kul-main.jpg",
      "https://cdn.explorekg.com/activities/issyk-kul-beach.jpg",
      "https://cdn.explorekg.com/activities/issyk-kul-sunset.jpg"
    ],
    "difficulty": "easy",
    "minPersons": 1,
    "maxPersons": 10,
    "metadata": {
      "category": "Nature & Adventure",
      "season": "Summer (May-September)",
      "ageRestriction": "All ages",
      "physicalLevel": "1/5",
      "bestTime": "June to August",
      "duration": "8-10 hours",
      "pickupTime": "08:00 AM",
      "returnTime": "06:00 PM"
    },
    "isAvailable": true,
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T15:30:00.000Z"
  }
}
```

### Error Responses

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "message": "Activity not found",
    "code": "ACTIVITY_NOT_FOUND",
    "statusCode": 404
  }
}
```

---

# 🚗 Cars

## GET /cars

**الوصف:** جلب جميع السيارات المتاحة مع إمكانية الفلترة والترتيب.

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Query Parameters

| Parameter      | Type    | Required | Default     | Description                         |
| -------------- | ------- | -------- | ----------- | ----------------------------------- |
| `locale`       | string  | No       | `en`        | اللغة (`en`, `fr`)                  |
| `page`         | number  | No       | `1`         | رقم الصفحة                          |
| `limit`        | number  | No       | `10`        | عدد النتائج في الصفحة               |
| `sortBy`       | string  | No       | `createdAt` | الترتيب حسب                         |
| `sortOrder`    | string  | No       | `desc`      | اتجاه الترتيب (`asc`, `desc`)       |
| `minPrice`     | number  | No       | -           | الحد الأدنى للسعر                   |
| `maxPrice`     | number  | No       | -           | الحد الأقصى للسعر                   |
| `type`         | string  | No       | -           | نوع السيارة (`sedan`, `suv`, `van`) |
| `transmission` | string  | No       | -           | ناقل الحركة (`manual`, `automatic`) |
| `minCapacity`  | number  | No       | -           | الحد الأدنى للسعة                   |
| `isAvailable`  | boolean | No       | -           | فلترة حسب التوفر                    |

### Request

```http
GET /api/v1/cars?locale=en&page=1&limit=10&type=suv&isAvailable=true
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "car_001",
      "name": "Toyota Land Cruiser",
      "locale": "en",
      "slug": "toyota-land-cruiser",
      "localeGroupId": "car_group_001",
      "price": 150,
      "type": "SUV",
      "capacity": 7,
      "transmission": "Automatic",
      "fuelType": "Diesel",
      "description": "Powerful and reliable SUV perfect for mountain roads and long-distance travel.",
      "features": [
        "4WD capability",
        "Air conditioning",
        "GPS navigation",
        "Bluetooth connectivity",
        "Child seats available",
        "Roof rack",
        "USB charging ports"
      ],
      "specifications": {
        "year": 2023,
        "color": "White",
        "doors": 5,
        "luggage": "Large",
        "mileage": "Unlimited"
      },
      "images": [
        "https://cdn.explorekg.com/cars/land-cruiser-main.jpg",
        "https://cdn.explorekg.com/cars/land-cruiser-interior.jpg"
      ],
      "pricePerDay": 150,
      "metadata": {
        "insurance": "Full coverage included",
        "deposit": 500,
        "minimumRentalDays": 1,
        "driverAge": "25+"
      },
      "isAvailable": true,
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-11-01T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## GET /cars/available

**الوصف:** جلب جميع السيارات المتاحة فقط (shortcut للفلترة).

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Request

```http
GET /api/v1/cars/available?locale=en
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "car_001",
      "name": "Toyota Land Cruiser",
      "locale": "en",
      "slug": "toyota-land-cruiser",
      "price": 150,
      "type": "SUV",
      "capacity": 7,
      "transmission": "Automatic",
      "isAvailable": true
    }
  ]
}
```

---

## GET /cars/:id

**الوصف:** جلب سيارة واحدة حسب ID أو slug.

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Parameters

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| `id`      | string | ID السيارة أو slug |

### Request

```http
GET /api/v1/cars/car_001
# OR
GET /api/v1/cars/toyota-land-cruiser
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "car_001",
    "name": "Toyota Land Cruiser",
    "locale": "en",
    "slug": "toyota-land-cruiser",
    "localeGroupId": "car_group_001",
    "price": 150,
    "type": "SUV",
    "capacity": 7,
    "transmission": "Automatic",
    "fuelType": "Diesel",
    "description": "Powerful and reliable SUV perfect for mountain roads and long-distance travel in Kyrgyzstan. This vehicle is equipped with 4WD capability, making it ideal for exploring remote areas and challenging terrains.",
    "features": [
      "4WD capability for mountain roads",
      "Climate control air conditioning",
      "GPS navigation system",
      "Bluetooth connectivity",
      "Child seats available upon request",
      "Roof rack for extra luggage",
      "USB charging ports",
      "Spare tire and emergency kit"
    ],
    "specifications": {
      "year": 2023,
      "color": "White",
      "doors": 5,
      "luggage": "Large (fits 6-7 suitcases)",
      "mileage": "Unlimited",
      "engine": "4.5L V8 Diesel",
      "horsepower": "286 HP"
    },
    "images": [
      "https://cdn.explorekg.com/cars/land-cruiser-main.jpg",
      "https://cdn.explorekg.com/cars/land-cruiser-interior.jpg",
      "https://cdn.explorekg.com/cars/land-cruiser-exterior.jpg"
    ],
    "pricePerDay": 150,
    "metadata": {
      "insurance": "Full coverage included",
      "deposit": 500,
      "minimumRentalDays": 1,
      "driverAge": "25+ years old",
      "licenseRequired": "International or local driving license",
      "pickupLocations": ["Bishkek Airport", "Downtown Bishkek"],
      "additionalDriver": "Free"
    },
    "rentalTerms": {
      "cancellationPolicy": "Free cancellation up to 24 hours before pickup",
      "fuelPolicy": "Full to Full",
      "paymentMethods": ["Credit Card", "Cash", "Bank Transfer"]
    },
    "isAvailable": true,
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T15:30:00.000Z"
  }
}
```

### Error Responses

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "message": "Car not found",
    "code": "CAR_NOT_FOUND",
    "statusCode": 404
  }
}
```

---

# 🔗 Pack Relations

## GET /pack-relations/:packId

**الوصف:** جلب علاقة الباقة (الأنشطة والسيارات المرتبطة بباقة معينة).

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Parameters

| Parameter | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| `packId`  | string | ID مجموعة الباقة (localeGroupId) |

### Request

```http
GET /api/v1/pack-relations/pack_group_123
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "relation_001",
    "travelPackLocaleGroupId": "pack_group_123",
    "availableActivities": [
      {
        "localeGroupId": "activity_group_001",
        "name": {
          "en": "Issyk-Kul Lake Tour",
          "fr": "Tour du lac Issyk-Kul"
        },
        "price": 120,
        "isOptional": true
      },
      {
        "localeGroupId": "activity_group_002",
        "name": {
          "en": "Horse Riding Adventure",
          "fr": "Aventure à cheval"
        },
        "price": 80,
        "isOptional": true
      }
    ],
    "availableCars": [
      {
        "localeGroupId": "car_group_001",
        "name": {
          "en": "Toyota Land Cruiser",
          "fr": "Toyota Land Cruiser"
        },
        "pricePerDay": 150,
        "capacity": 7
      },
      {
        "localeGroupId": "car_group_002",
        "name": {
          "en": "Hyundai Tucson",
          "fr": "Hyundai Tucson"
        },
        "pricePerDay": 100,
        "capacity": 5
      }
    ],
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T15:30:00.000Z"
  }
}
```

---

## POST /pack-relations/calculate-price

**الوصف:** حساب السعر الكلي بناءً على الاختيارات (الباقة + الأنشطة + السيارة).

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Request Body

```json
{
  "travelPackLocaleGroupId": "pack_group_123",
  "numberOfPersons": 2,
  "selectedActivities": ["activity_group_001", "activity_group_002"],
  "selectedCarId": "car_group_001",
  "locale": "en"
}
```

### Request

```http
POST /api/v1/pack-relations/calculate-price
Content-Type: application/json

{
  "travelPackLocaleGroupId": "pack_group_123",
  "numberOfPersons": 2,
  "selectedActivities": ["activity_group_001", "activity_group_002"],
  "selectedCarId": "car_group_001",
  "locale": "en"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "breakdown": {
      "packBasePrice": 850,
      "packTotalPrice": 1700,
      "activities": [
        {
          "id": "activity_group_001",
          "name": "Issyk-Kul Lake Tour",
          "pricePerPerson": 120,
          "totalPrice": 240
        },
        {
          "id": "activity_group_002",
          "name": "Horse Riding Adventure",
          "pricePerPerson": 80,
          "totalPrice": 160
        }
      ],
      "activitiesTotalPrice": 400,
      "car": {
        "id": "car_group_001",
        "name": "Toyota Land Cruiser",
        "pricePerDay": 150,
        "days": 7,
        "totalPrice": 1050
      },
      "carTotalPrice": 1050
    },
    "summary": {
      "packPrice": 1700,
      "activitiesPrice": 400,
      "carPrice": 1050,
      "subtotal": 3150,
      "tax": 0,
      "total": 3150,
      "currency": "USD"
    },
    "numberOfPersons": 2
  }
}
```

### Error Responses

```json
// 400 Bad Request - Invalid data
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "travelPackLocaleGroupId": "Travel pack not found"
    }
  }
}

// 404 Not Found - Pack not found
{
  "success": false,
  "error": {
    "message": "Travel pack not found",
    "code": "PACK_NOT_FOUND",
    "statusCode": 404
  }
}
```

---

# 👤 Guests

## POST /guests

**الوصف:** إنشاء ضيف جديد (Guest Session).

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Request Body

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+996555123456"
}
```

### Request

```http
POST /api/v1/guests
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+996555123456"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123def456ghi789",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+996555123456",
    "status": "active",
    "expiresAt": "2025-11-10T12:00:00.000Z",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "lastActiveAt": "2025-11-03T12:00:00.000Z"
  },
  "message": "Guest created successfully. Session ID stored in cookie."
}
```

**ملاحظة مهمة:** سيتم تخزين `sessionId` تلقائياً في Cookie للاستخدام في الطلبات اللاحقة.

### Error Responses

```json
// 400 Bad Request - Invalid data
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "email": "Invalid email format",
      "phoneNumber": "Phone number must start with +"
    }
  }
}

// 409 Conflict - Email already exists
{
  "success": false,
  "error": {
    "message": "Guest with this email already exists",
    "code": "GUEST_ALREADY_EXISTS",
    "statusCode": 409,
    "details": {
      "existingSessionId": "guest_existing123"
    }
  }
}
```

---

## GET /guests/:sessionId

**الوصف:** جلب بيانات ضيف حسب Session ID.

**الصلاحيات:** Public + Ownership Validation  
**المصادقة:** يتطلب `sessionId` في Cookie أو Header (للضيف نفسه) أو Admin Token

### Parameters

| Parameter   | Type   | Description      |
| ----------- | ------ | ---------------- |
| `sessionId` | string | Session ID للضيف |

### Request

```http
GET /api/v1/guests/guest_abc123def456ghi789
Cookie: sessionId=guest_abc123def456ghi789
# OR
X-Session-ID: guest_abc123def456ghi789
# OR (Admin only)
Authorization: Bearer admin_token_here
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123def456ghi789",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+996555123456",
    "status": "active",
    "linkedUserId": null,
    "bookingsCount": 2,
    "totalSpent": 3500,
    "expiresAt": "2025-11-10T12:00:00.000Z",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "lastActiveAt": "2025-11-03T14:30:00.000Z"
  }
}
```

### Error Responses

```json
// 401 Unauthorized - No session ID provided
{
  "success": false,
  "error": {
    "message": "Session ID is required",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}

// 403 Forbidden - Accessing another guest's data
{
  "success": false,
  "error": {
    "message": "You do not have permission to access this guest",
    "code": "FORBIDDEN",
    "statusCode": 403
  }
}

// 404 Not Found
{
  "success": false,
  "error": {
    "message": "Guest not found",
    "code": "GUEST_NOT_FOUND",
    "statusCode": 404
  }
}
```

---

## GET /guests/email/:email

**الوصف:** البحث عن ضيف باستخدام البريد الإلكتروني.

**الصلاحيات:** Public  
**المصادقة:** غير مطلوبة

### Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| `email`   | string | البريد الإلكتروني |

### Request

```http
GET /api/v1/guests/email/john.doe@example.com
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123def456ghi789",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "status": "active",
    "expiresAt": "2025-11-10T12:00:00.000Z",
    "createdAt": "2025-11-03T12:00:00.000Z"
  }
}
```

### Error Responses

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "message": "Guest not found with this email",
    "code": "GUEST_NOT_FOUND",
    "statusCode": 404
  }
}
```

---

## PATCH /guests/:sessionId

**الوصف:** تحديث بيانات الضيف.

**الصلاحيات:** Public + Ownership Validation  
**المصادقة:** يتطلب `sessionId` في Cookie أو Header (للضيف نفسه) أو Admin Token

### Parameters

| Parameter   | Type   | Description      |
| ----------- | ------ | ---------------- |
| `sessionId` | string | Session ID للضيف |

### Request Body

```json
{
  "fullName": "John Michael Doe",
  "phoneNumber": "+996555987654"
}
```

### Request

```http
PATCH /api/v1/guests/guest_abc123def456ghi789
Cookie: sessionId=guest_abc123def456ghi789
Content-Type: application/json

{
  "fullName": "John Michael Doe",
  "phoneNumber": "+996555987654"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123def456ghi789",
    "fullName": "John Michael Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+996555987654",
    "status": "active",
    "updatedAt": "2025-11-03T15:00:00.000Z"
  },
  "message": "Guest updated successfully"
}
```

### Error Responses

```json
// 403 Forbidden
{
  "success": false,
  "error": {
    "message": "You do not have permission to update this guest",
    "code": "FORBIDDEN",
    "statusCode": 403
  }
}
```

---

## PATCH /guests/:sessionId/extend

**الوصف:** تمديد فترة انتهاء صلاحية الجلسة.

**الصلاحيات:** Public + Ownership Validation  
**المصادقة:** يتطلب `sessionId` في Cookie أو Header

### Parameters

| Parameter   | Type   | Description      |
| ----------- | ------ | ---------------- |
| `sessionId` | string | Session ID للضيف |

### Request Body

```json
{
  "days": 7
}
```

### Request

```http
PATCH /api/v1/guests/guest_abc123def456ghi789/extend
Cookie: sessionId=guest_abc123def456ghi789
Content-Type: application/json

{
  "days": 7
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123def456ghi789",
    "oldExpiresAt": "2025-11-10T12:00:00.000Z",
    "newExpiresAt": "2025-11-17T12:00:00.000Z"
  },
  "message": "Session extended successfully by 7 days"
}
```

---

## POST /guests/:sessionId/link-user

**الوصف:** ربط الضيف بحساب مستخدم مسجل (للاستخدام المستقبلي).

**الصلاحيات:** Public + Ownership Validation  
**المصادقة:** يتطلب `sessionId` في Cookie أو Header

### Parameters

| Parameter   | Type   | Description      |
| ----------- | ------ | ---------------- |
| `sessionId` | string | Session ID للضيف |

### Request Body

```json
{
  "userId": "user_123abc"
}
```

### Request

```http
POST /api/v1/guests/guest_abc123def456ghi789/link-user
Cookie: sessionId=guest_abc123def456ghi789
Content-Type: application/json

{
  "userId": "user_123abc"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sessionId": "guest_abc123def456ghi789",
    "linkedUserId": "user_123abc",
    "status": "linked"
  },
  "message": "Guest successfully linked to user account"
}
```

---

# 📅 Bookings

## POST /bookings

**الوصف:** إنشاء حجز جديد.

**الصلاحيات:** Public  
**المصادقة:** يتطلب `sessionId` في Cookie أو Header

### Request Body

```json
{
  "guestId": "guest_abc123def456ghi789",
  "travelPackLocaleGroupId": "pack_group_123",
  "numberOfPersons": 2,
  "selectedActivities": ["activity_group_001", "activity_group_002"],
  "selectedCarId": "car_group_001",
  "totalPrice": 3150,
  "startDate": "2025-12-01",
  "endDate": "2025-12-08",
  "notes": "Prefer early morning pickup"
}
```

### Request

```http
POST /api/v1/bookings
Cookie: sessionId=guest_abc123def456ghi789
Content-Type: application/json

{
  "guestId": "guest_abc123def456ghi789",
  "travelPackLocaleGroupId": "pack_group_123",
  "numberOfPersons": 2,
  "selectedActivities": ["activity_group_001", "activity_group_002"],
  "selectedCarId": "car_group_001",
  "totalPrice": 3150,
  "startDate": "2025-12-01",
  "endDate": "2025-12-08",
  "notes": "Prefer early morning pickup"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK-20251103-A1B2C3",
    "guestId": "guest_abc123def456ghi789",
    "travelPackLocaleGroupId": "pack_group_123",
    "packDetails": {
      "name": "Kyrgyzstan Adventure Pack",
      "duration": 7,
      "locale": "en"
    },
    "numberOfPersons": 2,
    "selectedActivities": [
      {
        "id": "activity_group_001",
        "name": "Issyk-Kul Lake Tour",
        "price": 240
      },
      {
        "id": "activity_group_002",
        "name": "Horse Riding Adventure",
        "price": 160
      }
    ],
    "selectedCar": {
      "id": "car_group_001",
      "name": "Toyota Land Cruiser",
      "price": 1050
    },
    "pricing": {
      "packPrice": 1700,
      "activitiesPrice": 400,
      "carPrice": 1050,
      "totalPrice": 3150,
      "currency": "USD"
    },
    "startDate": "2025-12-01T00:00:00.000Z",
    "endDate": "2025-12-08T23:59:59.000Z",
    "status": "pending",
    "paymentStatus": "unpaid",
    "notes": "Prefer early morning pickup",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "expiresAt": "2025-11-03T18:00:00.000Z"
  },
  "message": "Booking created successfully. Please complete payment within 6 hours."
}
```

### Error Responses

```json
// 400 Bad Request - Validation error
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": {
      "startDate": "Start date must be in the future",
      "numberOfPersons": "Number of persons must be between 1 and 10"
    }
  }
}

// 401 Unauthorized - No session
{
  "success": false,
  "error": {
    "message": "Guest session required",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}

// 404 Not Found - Pack not found
{
  "success": false,
  "error": {
    "message": "Travel pack not found",
    "code": "PACK_NOT_FOUND",
    "statusCode": 404
  }
}

// 409 Conflict - Dates not available
{
  "success": false,
  "error": {
    "message": "Selected dates are not available",
    "code": "DATES_NOT_AVAILABLE",
    "statusCode": 409,
    "details": {
      "conflictingDates": ["2025-12-05", "2025-12-06"]
    }
  }
}
```

---

## GET /bookings/:bookingNumber

**الوصف:** جلب حجز واحد حسب رقم الحجز.

**الصلاحيات:** Public + Ownership Validation  
**المصادقة:** يتطلب `sessionId` في Cookie أو Header (للضيف صاحب الحجز) أو Admin Token

### Parameters

| Parameter       | Type   | Description |
| --------------- | ------ | ----------- |
| `bookingNumber` | string | رقم الحجز   |

### Request

```http
GET /api/v1/bookings/BK-20251103-A1B2C3
Cookie: sessionId=guest_abc123def456ghi789
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK-20251103-A1B2C3",
    "guestId": "guest_abc123def456ghi789",
    "guestDetails": {
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+996555123456"
    },
    "travelPackLocaleGroupId": "pack_group_123",
    "packDetails": {
      "name": "Kyrgyzstan Adventure Pack",
      "duration": 7,
      "locale": "en",
      "slug": "kyrgyzstan-adventure-pack"
    },
    "numberOfPersons": 2,
    "selectedActivities": [
      {
        "id": "activity_group_001",
        "name": "Issyk-Kul Lake Tour",
        "price": 240
      }
    ],
    "selectedCar": {
      "id": "car_group_001",
      "name": "Toyota Land Cruiser",
      "price": 1050
    },
    "pricing": {
      "packPrice": 1700,
      "activitiesPrice": 240,
      "carPrice": 1050,
      "totalPrice": 2990,
      "currency": "USD"
    },
    "startDate": "2025-12-01T00:00:00.000Z",
    "endDate": "2025-12-08T23:59:59.000Z",
    "status": "confirmed",
    "paymentStatus": "paid",
    "paymentMethod": "credit_card",
    "paidAt": "2025-11-03T14:30:00.000Z",
    "notes": "Prefer early morning pickup",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "updatedAt": "2025-11-03T14:30:00.000Z",
    "expiresAt": null
  }
}
```

---

## GET /bookings/guest/:guestId

**الوصف:** جلب جميع حجوزات ضيف معين.

**الصلاحيات:** Public + Ownership Validation  
**المصادقة:** يتطلب `sessionId` في Cookie أو Header (للضيف نفسه) أو Admin Token

### Parameters

| Parameter | Type   | Description      |
| --------- | ------ | ---------------- |
| `guestId` | string | Session ID للضيف |

### Request

```http
GET /api/v1/bookings/guest/guest_abc123def456ghi789
Cookie: sessionId=guest_abc123def456ghi789
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "bookingNumber": "BK-20251103-A1B2C3",
      "travelPackName": "Kyrgyzstan Adventure Pack",
      "numberOfPersons": 2,
      "totalPrice": 2990,
      "startDate": "2025-12-01",
      "endDate": "2025-12-08",
      "status": "confirmed",
      "paymentStatus": "paid",
      "createdAt": "2025-11-03T12:00:00.000Z"
    },
    {
      "bookingNumber": "BK-20251102-X9Y8Z7",
      "travelPackName": "Silk Road Explorer",
      "numberOfPersons": 1,
      "totalPrice": 1200,
      "startDate": "2025-11-20",
      "endDate": "2025-11-25",
      "status": "pending",
      "paymentStatus": "unpaid",
      "createdAt": "2025-11-02T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

---

## POST /bookings/:bookingNumber/payment

**الوصف:** تسجيل دفع الحجز (تحديد الحجز كـ"مدفوع").

**الصلاحيات:** Public + Ownership Validation  
**المصادقة:** يتطلب `sessionId` في Cookie أو Header (للضيف صاحب الحجز) أو Admin Token

### Parameters

| Parameter       | Type   | Description |
| --------------- | ------ | ----------- |
| `bookingNumber` | string | رقم الحجز   |

### Request Body

```json
{
  "paymentMethod": "credit_card",
  "transactionId": "TXN_123456789",
  "notes": "Paid via Stripe"
}
```

### Request

```http
POST /api/v1/bookings/BK-20251103-A1B2C3/payment
Cookie: sessionId=guest_abc123def456ghi789
Content-Type: application/json

{
  "paymentMethod": "credit_card",
  "transactionId": "TXN_123456789",
  "notes": "Paid via Stripe"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK-20251103-A1B2C3",
    "status": "confirmed",
    "paymentStatus": "paid",
    "paymentMethod": "credit_card",
    "transactionId": "TXN_123456789",
    "paidAt": "2025-11-03T14:30:00.000Z",
    "totalPrice": 2990
  },
  "message": "Payment processed successfully. Booking confirmed."
}
```

### Error Responses

```json
// 403 Forbidden
{
  "success": false,
  "error": {
    "message": "You do not have permission to process payment for this booking",
    "code": "FORBIDDEN",
    "statusCode": 403
  }
}

// 409 Conflict - Already paid
{
  "success": false,
  "error": {
    "message": "Booking is already paid",
    "code": "ALREADY_PAID",
    "statusCode": 409
  }
}
```

---

## POST /bookings/:bookingNumber/cancel

**الوصف:** إلغاء الحجز.

**الصلاحيات:** Public + Ownership Validation  
**المصادقة:** يتطلب `sessionId` في Cookie أو Header (للضيف صاحب الحجز) أو Admin Token

### Parameters

| Parameter       | Type   | Description |
| --------------- | ------ | ----------- |
| `bookingNumber` | string | رقم الحجز   |

### Request Body

```json
{
  "reason": "Changed travel plans"
}
```

### Request

```http
POST /api/v1/bookings/BK-20251103-A1B2C3/cancel
Cookie: sessionId=guest_abc123def456ghi789
Content-Type: application/json

{
  "reason": "Changed travel plans"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK-20251103-A1B2C3",
    "status": "cancelled",
    "cancelledAt": "2025-11-03T16:00:00.000Z",
    "cancellationReason": "Changed travel plans",
    "refundEligible": true,
    "refundAmount": 2990
  },
  "message": "Booking cancelled successfully. Refund will be processed within 5-7 business days."
}
```

### Error Responses

```json
// 403 Forbidden
{
  "success": false,
  "error": {
    "message": "You do not have permission to cancel this booking",
    "code": "FORBIDDEN",
    "statusCode": 403
  }
}

// 409 Conflict - Already cancelled
{
  "success": false,
  "error": {
    "message": "Booking is already cancelled",
    "code": "ALREADY_CANCELLED",
    "statusCode": 409
  }
}

// 409 Conflict - Too late to cancel
{
  "success": false,
  "error": {
    "message": "Cancellation not allowed within 48 hours of start date",
    "code": "CANCELLATION_NOT_ALLOWED",
    "statusCode": 409,
    "details": {
      "startDate": "2025-12-01",
      "cancellationDeadline": "2025-11-29"
    }
  }
}
```

---

## 📝 ملاحظات مهمة

### 🔒 Ownership Validation

بعض المسارات محمية بنظام Ownership Validation:

- يجب أن يكون `sessionId` في Cookie أو Header `X-Session-ID`
- الضيف يمكنه فقط الوصول لبياناته الخاصة
- المسؤولون (Admins) يمكنهم الوصول لجميع البيانات

### ⏰ Expiration System

- **Guest Sessions:** تنتهي بعد 7 أيام من آخر نشاط (قابلة للتمديد)
- **Pending Bookings:** تنتهي بعد 6 ساعات من الإنشاء إذا لم يتم الدفع

### 💰 Pricing

- جميع الأسعار بـUSD
- السعر الكلي يشمل: (الباقة × عدد الأشخاص) + الأنشطة + السيارة

### 🌐 Localization

- استخدم query parameter `locale` لتحديد اللغة
- القيم المتاحة: `en`, `fr`
- الافتراضي: `en`

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
