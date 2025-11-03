# 🚀 ExploreKG Server - Quick ChatGPT Briefing

## 📋 Project Summary

**Tourism booking platform** for Kyrgyzstan built with **Node.js + TypeScript + MongoDB**.
**Guest-based system** (no permanent accounts) with **snapshot-based bookings**.

## 🏗️ Tech Stack

- **Runtime**: Node.js 22.15+ with TypeScript 5.x
- **Framework**: Express.js 5.x + Mongoose ODM
- **Database**: MongoDB 8.x with TTL indexes
- **Validation**: Zod schemas for all endpoints
- **Testing**: Jest with full coverage
- **Security**: Helmet + CORS + Rate limiting

## 🧩 6 Main Systems

### 1. **Guest System** (`/api/v1/guests` - 10 endpoints)

- Temporary visitors with **UUID v4 sessions** (24h TTL)
- No permanent accounts required
- Auto-cleanup with MongoDB TTL

### 2. **Booking System** (`/api/v1/bookings` - 9 endpoints)

- **Snapshot architecture** protects pricing from changes
- Unique booking numbers: `BKG-20251102-0001`
- Payment flow + cancellation logic
- TTL for unpaid bookings (24h auto-expire)

### 3. **Travel Packs** (`/api/v1/travel-packs` - 6+ endpoints)

- Multi-language tourism packages (AR/EN/FR)
- Advanced search and filtering
- Image galleries with metadata

### 4. **Activities** (`/api/v1/activities` - 6+ endpoints)

- Individual tourism experiences
- Category-based organization
- Flexible duration and pricing

### 5. **Cars** (`/api/v1/cars` - 6+ endpoints)

- Vehicle rental service
- Fleet management with availability tracking
- Dynamic pricing models

### 6. **Pack Relations** (`/api/v1/pack-relations` - 4+ endpoints)

- Links travel packs to activities/cars
- Bundle pricing logic
- Package composition management

## 🔄 Typical User Journey

```
1. Create Guest → POST /guests (get UUID sessionId)
2. Browse Catalog → GET /travel-packs
3. Create Booking → POST /bookings (snapshot + unique number)
4. Process Payment → POST /bookings/{number}/payment
5. Manage Booking → GET /bookings/{number} (details/cancel)
```

## 📊 Key Data Models

**Guest**: sessionId (UUID), email, names, phone, preferences, TTL  
**Booking**: bookingNumber, guestId, itemType, snapshot, price, status, TTL  
**TravelPack**: localeGroupId, multilingual content, pricing, images, features

## 🎯 Architecture Highlights

- **TTL System**: Auto-cleanup for sessions and unpaid bookings
- **Snapshot Pattern**: Freeze item data at booking time
- **Multi-language**: Content in Arabic, English, French
- **UUID Sessions**: Secure temporary visitor management
- **Atomic Counters**: Daily booking number generation

## 📁 Documentation Structure (60 files)

```
docs/
├── CHATGPT-PROJECT-OVERVIEW.md    # This file
├── frontend/                      # React/Next.js integration (9 files)
├── api/                          # Endpoint documentation (7 files)
├── architecture/                 # System design (5 files)
├── features/                     # System explanations (4 files)
├── testing/                      # Test guides (4 files)
└── [8 more specialized folders]
```

## ✅ Current Status

- **Production Ready**: Booking system fully tested ✅
- **All APIs Working**: 6 systems with 40+ endpoints ✅
- **Full Documentation**: 60 organized documentation files ✅
- **Test Coverage**: Jest integration and unit tests ✅
- **Branch**: `feature/booking-journey-guest-v1`

## 🔧 Common Development Areas

- **Frontend Integration**: React/Next.js components and state management
- **API Extensions**: New endpoints for existing systems
- **Performance**: MongoDB indexing and query optimization
- **Validation**: Zod schema enhancements
- **Testing**: Additional test scenarios
- **Deployment**: Environment configuration and production setup

## 🚨 Key Points for ChatGPT

- System is **thoroughly tested** and **production-ready**
- **Snapshot architecture** is critical for booking data integrity
- **TTL management** is essential for temporary guests and bookings
- **Multi-language support** requires careful localeGroupId handling
- **UUID sessions** eliminate need for traditional authentication

**Ready to help with any development, debugging, or enhancement tasks!** 🚀
