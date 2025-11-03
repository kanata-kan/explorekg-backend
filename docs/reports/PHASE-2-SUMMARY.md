# 🚀 ExploreKG Server - Phase 2: Pack Relations API

> **Backend API for travel package management with dynamic pricing and multi-language support**

---

## 📌 About This Phase

**Phase 2** introduces the **Pack Relations** feature - a powerful system that links travel packages with activities and rental cars, featuring intelligent pricing calculations and flexible customization options.

---

## ✨ Key Features

### 🎯 Pack Relations Management

- **Dynamic Pricing Engine** - Multiple discount levels (item + global)
- **Flexible Strategies** - Sum-based or custom fixed pricing
- **Optional Items** - Required vs optional activities/cars
- **Smart Constraints** - Min/max activity limits
- **Multi-step Wizard** - Progressive data loading (overview → activities → cars → full)

### 🌐 Multi-language Support

- English (EN) and French (FR) locales
- Consistent `localeGroupId` linking strategy
- Locale-aware API responses

### 💰 Advanced Pricing

- Item-level discounts on activities and cars
- Global discount on total package price
- Custom price override option
- Automatic 20% deposit calculation
- Separate optional items pricing

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **Language:** TypeScript 5
- **Database:** MongoDB (Mongoose 8)
- **Validation:** Zod 3
- **Testing:** Jest 30 + Supertest
- **Documentation:** Markdown + Postman

---

## 📊 Project Stats

| Metric        | Value                  |
| ------------- | ---------------------- |
| API Endpoints | 7                      |
| Tests         | 39 (100% pass)         |
| Test Coverage | Unit + Integration     |
| Documentation | 4 comprehensive guides |
| Code Quality  | TypeScript strict mode |

---

## 🎯 API Endpoints

```
POST   /api/v1/pack-relations              Create pack relation
GET    /api/v1/pack-relations              Get all pack relations
GET    /api/v1/pack-relations/:id          Get by ID
PUT    /api/v1/pack-relations/:id          Update pack relation
DELETE /api/v1/pack-relations/:id          Delete pack relation
POST   /api/v1/pack-relations/calculate-price   Calculate custom price
GET    /api/v1/travel-packs/:id/detailed   Get detailed pack (multi-step)
```

---

## 📚 Documentation

- **[API Reference](docs/pack-relations-quickref.md)** - Complete API documentation
- **[Postman Guide](docs/POSTMAN-PACK-RELATIONS.md)** - Testing roadmap
- **[Test Report](TEST-REPORT-PACKRELATION.md)** - Comprehensive test results (Arabic)
- **[Testing Summary](DARIJA-TEST-SUMMARY.md)** - Detailed test explanations (Darija)

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env

# Run development server
pnpm dev

# Run tests
pnpm test

# Run specific test suites
pnpm test packRelation
```

---

## 📦 Project Structure

```
src/
├── models/
│   └── packRelation.model.ts      # Schema with pricing logic
├── services/
│   └── packRelation.service.ts    # Business logic
├── controllers/
│   └── packRelation.controller.ts # Request handlers
├── routes/
│   └── packRelation.routes.ts     # API routes
└── validators/
    └── packRelation.validator.ts  # Zod validation

tests/
├── unit/
│   └── packRelation.test.ts       # 12 unit tests
└── integration/
    └── packRelation.integration.test.ts  # 27 integration tests

docs/
├── pack-relations-quickref.md     # API reference
└── POSTMAN-PACK-RELATIONS.md      # Testing guide
```

---

## 🧪 Testing

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Results: 39/39 tests passing (100%)
```

---

## 🎨 Example Usage

### Create Pack Relation

```json
POST /api/v1/pack-relations
{
  "travelPackLocaleGroupId": "desert-adventure",
  "relations": {
    "activities": [
      {
        "localeGroupId": "quad-biking",
        "discount": 10,
        "optional": false,
        "quantity": 1
      }
    ],
    "cars": [
      {
        "localeGroupId": "4x4-suv",
        "durationDays": 3,
        "discount": 15,
        "optional": false
      }
    ]
  },
  "pricing": {
    "strategy": "sum",
    "globalDiscount": 5
  },
  "settings": {
    "allowCustomization": true,
    "minActivities": 1,
    "maxActivities": 3
  }
}
```

### Calculate Custom Price

```json
POST /api/v1/pack-relations/calculate-price
{
  "travelPackLocaleGroupId": "desert-adventure",
  "selectedActivities": ["quad-biking", "camel-ride"],
  "selectedCar": "4x4-suv",
  "carDurationDays": 3,
  "locale": "en"
}
```

---

## 🔐 Environment Variables

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/explorekg
MAX_PAGINATION_LIMIT=100
```

---

## 📈 What's New in Phase 2

### ✅ Completed

- ✅ Full CRUD operations for pack relations
- ✅ Dynamic pricing calculation engine
- ✅ Multi-step wizard for progressive loading
- ✅ Optional vs required items support
- ✅ Customization constraints (min/max)
- ✅ 39 comprehensive tests (100% passing)
- ✅ Complete API documentation
- ✅ Postman testing roadmap
- ✅ Bug fixes (car service pricing filter)

### 📊 Deliverables

- 19 files added/modified
- 6,290+ lines of code
- 4 documentation files
- 2 test suites (unit + integration)
- 4 utility scripts

---

## 🤝 Contributing

This is a backend API project for ExploreKG - a Kyrgyzstan travel platform.

---

## 📄 License

ISC

---

## 👨‍💻 Author

Built with ❤️ for ExploreKG

---

## 🔗 Related Projects

- **Frontend:** Coming soon
- **Admin Panel:** Coming soon

---

**Phase 2 Status:** ✅ Complete & Production Ready
