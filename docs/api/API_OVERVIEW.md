# 📚 API Overview

## 🎯 نظرة عامة

دليل شامل لجميع الـAPI endpoints في ExploreKG.

**Base URL:** `/api/v1`  
**Version:** v1.3.0  
**Last Updated:** November 3, 2025

---

## 🌳 API Structure Tree

```
/api/v1
├── /health                    # Health check
│
├── /guests                    # Guest management (Public)
│   ├── POST /                 # Create guest
│   ├── GET /:sessionId        # Get guest
│   ├── GET /email/:email      # Find by email
│   ├── PATCH /:sessionId      # Update guest
│   ├── PATCH /:sessionId/extend    # Extend session
│   ├── POST /:sessionId/link-user  # Link to user
│   ├── GET / (Admin)          # Get all guests
│   ├── GET /statistics (Admin)     # Get statistics
│   ├── POST /cleanup-expired (Admin)  # Cleanup
│   └── DELETE /:sessionId (Admin)     # Delete guest
│
├── /travel-packs              # Travel packs
│   ├── GET /                  # List packs (Public)
│   ├── GET /:id               # Get by ID (Public)
│   ├── GET /:id/detailed      # Detailed view (Public)
│   ├── GET /statistics (Admin)     # Statistics
│   ├── POST / (Admin)         # Create
│   ├── PATCH /:id (Admin)     # Update
│   └── DELETE /:id (Admin)    # Delete
│
├── /activities                # Activities
│   ├── GET /                  # List activities (Public)
│   ├── GET /available         # Available only (Public)
│   ├── GET /:id               # Get by ID (Public)
│   ├── GET /statistics (Admin)     # Statistics
│   ├── POST / (Admin)         # Create
│   ├── PATCH /:id (Admin)     # Update
│   ├── DELETE /:id (Admin)    # Delete
│   ├── PATCH /:id/availability (Admin)  # Update availability
│   └── POST /:id/packs (Admin)    # Associate with packs
│
├── /cars                      # Cars
│   ├── GET /                  # List cars (Public)
│   ├── GET /available         # Available only (Public)
│   ├── GET /:id               # Get by ID (Public)
│   ├── GET /statistics (Admin)     # Statistics
│   ├── POST / (Admin)         # Create
│   ├── PATCH /:id (Admin)     # Update
│   ├── DELETE /:id (Admin)    # Delete
│   ├── PATCH /:id/availability (Admin)  # Update availability
│   └── POST /:id/packs (Admin)    # Associate with packs
│
├── /pack-relations            # Pack relations
│   ├── GET /:packId           # Get relation (Public)
│   ├── POST /calculate-price  # Calculate price (Public)
│   ├── GET / (Admin)          # Get all
│   ├── POST / (Admin)         # Create
│   ├── PUT /:packId (Admin)   # Update
│   └── DELETE /:packId (Admin)  # Delete
│
├── /bookings                  # Bookings
│   ├── POST /                 # Create booking (Public)
│   ├── GET /:bookingNumber    # Get booking (Public/Ownership)
│   ├── GET /guest/:guestId    # Get guest bookings (Public/Ownership)
│   ├── POST /:bookingNumber/payment  # Process payment (Public/Ownership)
│   ├── POST /:bookingNumber/cancel   # Cancel booking (Public/Ownership)
│   ├── GET / (Admin)          # Get all bookings
│   ├── GET /statistics (Admin)     # Statistics
│   ├── POST /cleanup-expired (Admin)  # Cleanup
│   └── PATCH /:bookingNumber/status (Admin)  # Update status
│
├── /admin                     # Admin management
│   ├── POST /login            # Admin login (Public)
│   ├── POST /logout           # Admin logout
│   ├── GET /me                # Current admin info
│   ├── POST /change-password  # Change password
│   ├── GET /statistics (SUPER_ADMIN)  # Statistics
│   ├── POST / (SUPER_ADMIN)   # Create admin
│   ├── GET / (ADMIN+)         # Get all admins
│   ├── GET /:id (ADMIN+)      # Get admin by ID
│   ├── PATCH /:id (SUPER_ADMIN)    # Update admin
│   ├── DELETE /:id (SUPER_ADMIN)   # Delete admin
│   └── POST /:id/reset-password (SUPER_ADMIN)  # Reset password
│
└── /security                  # Security monitoring
    ├── GET /status (Admin)    # Security status
    ├── GET /metrics (Admin)   # Security metrics
    ├── GET /health (Admin)    # System health
    └── POST /test-alert (Admin/Dev)  # Test alerts

```

---

## 📊 Endpoints Summary

### 🟢 Public Endpoints (User Frontend)

**الوصول:** بدون مصادقة أو Ownership validation

| Method | Endpoint                          | Description          |
| ------ | --------------------------------- | -------------------- |
| GET    | `/health`                         | Health check         |
| POST   | `/guests`                         | Create guest session |
| GET    | `/guests/email/:email`            | Find guest by email  |
| GET    | `/travel-packs`                   | List travel packs    |
| GET    | `/travel-packs/:id`               | Get pack by ID       |
| GET    | `/travel-packs/:id/detailed`      | Detailed pack view   |
| GET    | `/activities`                     | List activities      |
| GET    | `/activities/available`           | Available activities |
| GET    | `/activities/:id`                 | Get activity by ID   |
| GET    | `/cars`                           | List cars            |
| GET    | `/cars/available`                 | Available cars       |
| GET    | `/cars/:id`                       | Get car by ID        |
| GET    | `/pack-relations/:packId`         | Get pack relation    |
| POST   | `/pack-relations/calculate-price` | Calculate price      |
| POST   | `/bookings`                       | Create booking       |

**Total:** 16 endpoints

---

### 🔐 Ownership-Protected Endpoints

**الوصول:** Requires sessionId (للضيف نفسه) أو Admin token

| Method | Endpoint                           | Description        |
| ------ | ---------------------------------- | ------------------ |
| GET    | `/guests/:sessionId`               | Get guest info     |
| PATCH  | `/guests/:sessionId`               | Update guest       |
| PATCH  | `/guests/:sessionId/extend`        | Extend session     |
| POST   | `/guests/:sessionId/link-user`     | Link to user       |
| GET    | `/bookings/:bookingNumber`         | Get booking        |
| GET    | `/bookings/guest/:guestId`         | Get guest bookings |
| POST   | `/bookings/:bookingNumber/payment` | Process payment    |
| POST   | `/bookings/:bookingNumber/cancel`  | Cancel booking     |

**Total:** 8 endpoints

---

### 🔴 Admin Endpoints

**الوصول:** Requires Admin authentication + RBAC permissions

#### Admin Management (11 endpoints)

- `POST /admin/login`
- `POST /admin/logout`
- `GET /admin/me`
- `POST /admin/change-password`
- `GET /admin/statistics` (SUPER_ADMIN)
- `POST /admin` (SUPER_ADMIN)
- `GET /admin` (ADMIN+)
- `GET /admin/:id` (ADMIN+)
- `PATCH /admin/:id` (SUPER_ADMIN)
- `DELETE /admin/:id` (SUPER_ADMIN)
- `POST /admin/:id/reset-password` (SUPER_ADMIN)

#### Content Management (21 endpoints)

**Travel Packs:** 4 endpoints  
**Activities:** 7 endpoints  
**Cars:** 7 endpoints  
**Pack Relations:** 3 endpoints

#### Booking & Guest Management (8 endpoints)

**Bookings:** 4 endpoints  
**Guests:** 4 endpoints

#### Security Monitoring (4 endpoints)

- `GET /security/status`
- `GET /security/metrics`
- `GET /security/health`
- `POST /security/test-alert` (Dev only)

**Total Admin Endpoints:** 44 endpoints

---

## 📈 Total API Endpoints

| Category            | Count  |
| ------------------- | ------ |
| Public              | 16     |
| Ownership-Protected | 8      |
| Admin               | 44     |
| **TOTAL**           | **68** |

---

## 🌐 API Features

### ✅ Multi-Language Support

- All content endpoints support `locale` parameter
- Available locales: `en`, `fr`
- Example: `GET /travel-packs?locale=fr`

### ✅ Pagination

- Default: `page=1`, `limit=10`
- Max limit: 100
- Response includes pagination metadata

### ✅ Filtering & Sorting

- Price ranges: `minPrice`, `maxPrice`
- Duration ranges: `minDuration`, `maxDuration`
- Availability: `isAvailable=true/false`
- Sort: `sortBy=price&sortOrder=asc`

### ✅ Search

- By ID or slug: `GET /travel-packs/pack_123` or `/kyrgyzstan-adventure`
- By email: `GET /guests/email/user@example.com`

---

## 🔐 Authentication Types

### 1. No Authentication

- Health check
- Browse catalog (packs, activities, cars)
- Create guest session
- Calculate price

### 2. Session-Based (Cookie)

- Guest operations (ownership protected)
- Booking operations (ownership protected)

### 3. JWT Token (Bearer)

- All admin operations
- Header: `Authorization: Bearer {token}`

---

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "pagination": {
    /* if applicable */
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": {
      /* optional */
    }
  }
}
```

---

## 🚀 Quick Links

- [User API Documentation](./user/README.md)
- [Admin API Documentation](./admin/README.md)
- [Authentication Flow](./AUTH_FLOW.md)
- [Security Notes](./SECURITY_NOTES.md)

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
