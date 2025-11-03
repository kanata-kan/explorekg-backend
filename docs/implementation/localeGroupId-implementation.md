# localeGroupId Implementation - Translation Linking

## Overview

Added `localeGroupId` field to the Activity model to link English and French translations of the same activity together.

## Architecture Decision

- **Approach**: Manual assignment of `localeGroupId` in Postman
- **Why**: Simple solution for ~20 activities, no UUID generation complexity
- **Format**: Use the same ID from JSON files (e.g., "activity-2", "activity-3")
- **Benefit**: Easy to query all language versions of the same activity

---

## Changes Made

### 1. Model Layer (`src/models/activity.model.ts`)

#### Interface Update

```typescript
export interface IActivity extends Document {
  // ... other fields
  localeGroupId: string; // Logical identifier linking all language versions
  locale: 'en' | 'fr';
  // ... other fields
}
```

#### Schema Update

```typescript
localeGroupId: {
  type: String,
  required: [true, 'Locale group ID is required'],
  trim: true,
  index: true, // Indexed for fast queries
  minlength: [3, 'Locale group ID must be at least 3 characters'],
  maxlength: [100, 'Locale group ID cannot exceed 100 characters'],
}
```

**Note**: Field has `index: true` for efficient querying

---

### 2. Validators (`src/validators/activity.validator.ts`)

#### Create Schema

```typescript
export const activityCreateSchema = z.object({
  // ... other fields
  localeGroupId: z
    .string()
    .min(3, 'Locale group ID must be at least 3 characters')
    .max(100, 'Locale group ID cannot exceed 100 characters')
    .trim(),
  locale: z.enum(['en', 'fr']).default('en'),
  // ... other fields
});
```

#### Update Schema

```typescript
export const activityUpdateSchema = z.object({
  // ... other fields
  localeGroupId: z
    .string()
    .min(3, 'Locale group ID must be at least 3 characters')
    .max(100, 'Locale group ID cannot exceed 100 characters')
    .trim()
    .optional(),
  locale: z.enum(['en', 'fr']).optional(),
  // ... other fields
});
```

---

### 3. Service Layer (`src/services/activity.service.ts`)

#### Added Filter Support

```typescript
interface ActivityFilters {
  locale?: 'en' | 'fr';
  localeGroupId?: string; // NEW: Filter by translation group
  status?: 'active' | 'inactive' | 'maintenance';
  // ... other filters
}
```

#### Query Logic

```typescript
// Filter by localeGroupId (to get all translations of the same activity)
if (filters.localeGroupId) {
  query.localeGroupId = filters.localeGroupId;
}
```

#### New Method: Find All Translations

```typescript
/**
 * Find all language versions of an activity by localeGroupId
 * Returns all translations (EN, FR) for the same activity
 */
static async findByLocaleGroupId(
  localeGroupId: string
): Promise<IActivity[]> {
  const activities = await Activity.find({
    localeGroupId,
    status: 'active',
  }).sort({ locale: 1 }); // Sort by locale (en first, then fr)

  return activities;
}
```

---

### 4. Migration Script (`scripts/migrateActivitiesFromJson.ts`)

#### Transform Function Update

```typescript
function transformActivityData(
  jsonActivity: JsonActivity,
  locale: 'en' | 'fr'
) {
  // Extract localeGroupId from JSON id field
  const localeGroupId = jsonActivity.id;

  return {
    // ... other fields
    localeGroupId, // Link EN/FR translations with the same ID
    locale,
    // ... other fields
  };
}
```

**How it works**:

- Reads `id` from JSON file (e.g., `"activity-2"`)
- Uses it as `localeGroupId` for both EN and FR versions
- Both translations get the same `localeGroupId` → easily queryable

---

## Usage Examples

### 1. Create Activity with localeGroupId (Postman)

**English Version:**

```json
POST /api/activities
{
  "name": "Kyrgyz Horseback Riding",
  "description": "Experience traditional horseback riding...",
  "localeGroupId": "activity-2",
  "locale": "en",
  "coverImage": "https://example.com/horse-en.jpg",
  "duration": "4 hours",
  "location": "Song-Kol Lake",
  "groupSize": "1-6 people",
  "price": 75,
  "metadata": {
    "title": "Horseback Riding in Kyrgyzstan",
    "description": "Ride through stunning mountain landscapes",
    "path": "/activities/horseback-riding",
    "image": "https://example.com/horse-meta.jpg",
    "alt": "Horseback riding in Kyrgyzstan"
  }
}
```

**French Version:**

```json
POST /api/activities
{
  "name": "Équitation Kirghize",
  "description": "Découvrez l'équitation traditionnelle...",
  "localeGroupId": "activity-2",
  "locale": "fr",
  "coverImage": "https://example.com/horse-fr.jpg",
  "duration": "4 heures",
  "location": "Lac Song-Kol",
  "groupSize": "1-6 personnes",
  "price": 75,
  "metadata": {
    "title": "Équitation au Kirghizistan",
    "description": "Parcourez des paysages montagneux époustouflants",
    "path": "/activities/equitation-kirghize",
    "image": "https://example.com/horse-meta.jpg",
    "alt": "Équitation au Kirghizistan"
  }
}
```

---

### 2. Get All Translations of an Activity

**Query by localeGroupId:**

```
GET /api/activities?localeGroupId=activity-2
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "...",
        "name": "Kyrgyz Horseback Riding",
        "localeGroupId": "activity-2",
        "locale": "en"
        // ... other English fields
      },
      {
        "_id": "...",
        "name": "Équitation Kirghize",
        "localeGroupId": "activity-2",
        "locale": "fr"
        // ... other French fields
      }
    ],
    "pagination": {
      "total": 2,
      "pages": 1
      // ...
    }
  }
}
```

---

### 3. Get Only English Version

```
GET /api/activities?localeGroupId=activity-2&locale=en
```

---

### 4. Update localeGroupId

```
PATCH /api/activities/:id
{
  "localeGroupId": "activity-custom-id"
}
```

---

## Database Structure

### Before (Separate Translations)

```
┌─────────────────────────────────┐
│ Activity (EN)                   │
│ _id: "abc123"                   │
│ name: "Horseback Riding"        │
│ locale: "en"                    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Activity (FR)                   │
│ _id: "def456"                   │
│ name: "Équitation"              │
│ locale: "fr"                    │
└─────────────────────────────────┘
❌ No link between translations
```

### After (Linked with localeGroupId)

```
┌─────────────────────────────────┐
│ Activity (EN)                   │
│ _id: "abc123"                   │
│ name: "Horseback Riding"        │
│ localeGroupId: "activity-2"     │ ← Same ID
│ locale: "en"                    │
└─────────────────────────────────┘
                ↕
┌─────────────────────────────────┐
│ Activity (FR)                   │
│ _id: "def456"                   │
│ name: "Équitation"              │
│ localeGroupId: "activity-2"     │ ← Same ID
│ locale: "fr"                    │
└─────────────────────────────────┘
✅ Linked translations
```

---

## Migration Strategy

### Step 1: Run Migration Script

```bash
npm run migrate:activities
```

**What happens:**

- Reads EN/FR JSON files
- Extracts `id` from each activity (e.g., "activity-2")
- Sets `localeGroupId = id` for both language versions
- Both EN and FR versions get same `localeGroupId`

### Step 2: Verify Data

```bash
# Check MongoDB
mongosh explorekg --eval "db.activities.find({localeGroupId: 'activity-2'})"

# Should return 2 documents (EN + FR)
```

---

## Benefits

1. **Easy Translation Lookup**: Query all language versions with one filter
2. **Indexed Performance**: `localeGroupId` has database index for fast queries
3. **Simple Management**: Manually assign IDs in Postman (no complex UUID logic)
4. **Flexible Updates**: Can change `localeGroupId` later if needed
5. **Frontend-Friendly**: Frontend can easily switch between EN/FR versions

---

## API Endpoints Summary

| Method | Endpoint              | Query Params                           | Purpose                  |
| ------ | --------------------- | -------------------------------------- | ------------------------ |
| GET    | `/api/activities`     | `localeGroupId=activity-2`             | Get all translations     |
| GET    | `/api/activities`     | `localeGroupId=activity-2&locale=en`   | Get specific translation |
| POST   | `/api/activities`     | Body: `{ localeGroupId, locale, ... }` | Create with group ID     |
| PATCH  | `/api/activities/:id` | Body: `{ localeGroupId }`              | Update group ID          |

---

## Testing Checklist

- [ ] Create EN activity with localeGroupId
- [ ] Create FR activity with same localeGroupId
- [ ] Query by localeGroupId → returns 2 items
- [ ] Query by localeGroupId + locale → returns 1 item
- [ ] Update localeGroupId on one activity
- [ ] Verify updated activity appears in new group
- [ ] Run migration script → verify all activities have localeGroupId
- [ ] Check indexes → verify localeGroupId is indexed

---

## Notes

- **Required Field**: `localeGroupId` is mandatory for all new activities
- **Manual Assignment**: Assign in Postman when creating activities
- **Recommended Format**: `activity-{number}` (e.g., "activity-1", "activity-2")
- **No Duplicates**: Same activity can have multiple languages, but each language version is a separate document
- **Index Performance**: Queries filtered by `localeGroupId` are optimized with database index

---

## Future Enhancements

If the dataset grows beyond ~20 activities, consider:

1. **Auto-generation**: Generate `localeGroupId` using UUID in create controller
2. **Duplicate Detection**: Prevent creating multiple EN versions with same `localeGroupId`
3. **Bulk Link API**: Endpoint to link existing activities by common fields
4. **Translation Status**: Add field to track translation completeness

For now, manual assignment keeps it simple and maintainable! 🎯
