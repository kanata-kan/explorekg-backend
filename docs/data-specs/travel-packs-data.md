# Travel Packs - Import Data

## Overview

This document contains ready-to-import Travel Pack data with the new `localeGroupId` field for translation linking. Each travel pack exists as **ONE document** with nested `locales: { en, fr }` structure.

## Data Structure

### localeGroupId Strategy

- **Purpose**: Links all language versions of the same travel pack
- **Format**: `pack-{number}` (extracted from original JSON `id` field)
- **Example**: `pack-1` groups English and French translations in single document

### Travel Pack Model (Nested Locales)

```json
{
  "slug": "rent-a-car-and-go",
  "localeGroupId": "pack-1",
  "status": "published",
  "locale": "en",
  "locales": {
    "en": {
      "name": "Rent a Car & Go",
      "description": "Live the adventure...",
      "ctaLabel": "See Details",
      "metadata": { ... }
    },
    "fr": {
      "name": "Louez une Voiture & Partez",
      "description": "Vivez l'aventure...",
      "ctaLabel": "Voir les détails",
      "metadata": { ... }
    }
  },
  "coverImage": "/images/travel-packs/rent_car_go.svg",
  "features": ["4x4 car rental with camping equipment", ...],
  "duration": null,
  "basePrice": null,
  "currency": "USD",
  "availability": true
}
```

---

## Import Data (3 Travel Packs)

### Pack 1: Rent a Car & Go

```json
{
  "slug": "rent-a-car-and-go",
  "localeGroupId": "pack-1",
  "status": "published",
  "locale": "en",
  "locales": {
    "en": {
      "name": "Rent a Car & Go",
      "description": "Live the adventure at your own pace with a fully equipped 4x4. Travel freely, camp under the stars, or stay in yurts and hotels.",
      "ctaLabel": "See Details",
      "metadata": {
        "title": "Rent a Car & Go | Explore Kyrgyzstan",
        "description": "Enjoy Kyrgyzstan at your own pace with a 4x4 and camping gear.",
        "path": "/travel-packs/pack-1",
        "image": "/images/travel-packs/rent_car_go.webp",
        "alt": "4x4 car rental adventure in Kyrgyzstan"
      }
    },
    "fr": {
      "name": "Louez une Voiture & Partez",
      "description": "Vivez l'aventure à votre rythme avec un 4x4 entièrement équipé. Voyagez librement, campez sous les étoiles ou séjournez dans des yourtes et des hôtels.",
      "ctaLabel": "Voir les détails",
      "metadata": {
        "title": "Louez une Voiture & Partez | Explorez le Kirghizistan",
        "description": "Profitez du Kirghizistan à votre rythme avec un 4x4 et du matériel de camping.",
        "path": "/travel-packs/pack-1",
        "image": "/images/travel-packs/rent_car_go.webp",
        "alt": "Aventure en 4x4 au Kirghizistan"
      }
    }
  },
  "coverImage": "/images/travel-packs/rent_car_go.svg",
  "features": [
    "4x4 car rental with camping equipment",
    "Option to upgrade accommodations (yurts, guesthouses, hotels)",
    "Freedom to choose your route and pace",
    "Perfect for families and small groups"
  ],
  "duration": null,
  "basePrice": null,
  "currency": "USD",
  "availability": true
}
```

---

### Pack 2: Let an Expert Guide You

```json
{
  "slug": "let-an-expert-guide-you",
  "localeGroupId": "pack-2",
  "status": "published",
  "locale": "en",
  "locales": {
    "en": {
      "name": "Let an Expert Guide You",
      "description": "Relax while a local driver-guide takes you through hidden trails, cooks for you, and shares cultural insights.",
      "ctaLabel": "See Details",
      "metadata": {
        "title": "Guided Adventure | Explore Kyrgyzstan",
        "description": "Discover Kyrgyzstan worry-free with an expert local guide.",
        "path": "/travel-packs/pack-2",
        "image": "/images/travel-packs/expert_guide.webp",
        "alt": "Guided travel experience in Kyrgyzstan"
      }
    },
    "fr": {
      "name": "Laissez un Expert Vous Guider",
      "description": "Détendez-vous pendant qu'un chauffeur-guide local vous emmène sur des sentiers cachés, cuisine pour vous et partage sa culture.",
      "ctaLabel": "Voir les détails",
      "metadata": {
        "title": "Aventure Guidée | Explorez le Kirghizistan",
        "description": "Découvrez le Kirghizistan en toute sérénité avec un guide local expérimenté.",
        "path": "/travel-packs/pack-2",
        "image": "/images/travel-packs/expert_guide.webp",
        "alt": "Voyage guidé au Kirghizistan"
      }
    }
  },
  "coverImage": "/images/travel-packs/expert_guide.svg",
  "features": [
    "Experienced driver-guide included",
    "Local knowledge: secret spots, cultural insights, traditions",
    "Wild cooking experience by your guide",
    "Comfortable and safe journey"
  ],
  "duration": null,
  "basePrice": null,
  "currency": "USD",
  "availability": true
}
```

---

### Pack 3: Join a Group Adventure

```json
{
  "slug": "join-a-group-adventure",
  "localeGroupId": "pack-3",
  "status": "published",
  "locale": "en",
  "locales": {
    "en": {
      "name": "Join a Group Adventure",
      "description": "Share the journey with fellow explorers in a fun and social group setup across Kyrgyzstan.",
      "ctaLabel": "See Details",
      "metadata": {
        "title": "Group Adventure | Explore Kyrgyzstan",
        "description": "Join a group of 15–20 explorers and share unforgettable moments.",
        "path": "/travel-packs/pack-3",
        "image": "/images/travel-packs/group_adventure.webp",
        "alt": "Group travel adventure in Kyrgyzstan"
      }
    },
    "fr": {
      "name": "Rejoignez une Aventure en Groupe",
      "description": "Partagez le voyage avec d'autres explorateurs dans une ambiance conviviale à travers le Kirghizistan.",
      "ctaLabel": "Voir les détails",
      "metadata": {
        "title": "Aventure en Groupe | Explorez le Kirghizistan",
        "description": "Rejoignez un groupe de 15 à 20 explorateurs et partagez des moments inoubliables.",
        "path": "/travel-packs/pack-3",
        "image": "/images/travel-packs/group_adventure.webp",
        "alt": "Aventure en groupe au Kirghizistan"
      }
    }
  },
  "coverImage": "/images/travel-packs/group_adventure.svg",
  "features": [
    "Group size: 15–20 people",
    "Multi-car or bus adventure setup",
    "Social and fun atmosphere",
    "Unique shared experiences in nature"
  ],
  "duration": null,
  "basePrice": null,
  "currency": "USD",
  "availability": true
}
```

---

## Usage Examples

### Creating Travel Packs via API

```bash
# Create Pack 1
curl -X POST http://localhost:5000/api/travel-packs \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "rent-a-car-and-go",
    "localeGroupId": "pack-1",
    "status": "published",
    "locale": "en",
    "locales": {
      "en": {
        "name": "Rent a Car & Go",
        "description": "Live the adventure at your own pace..."
      },
      "fr": {
        "name": "Louez une Voiture & Partez",
        "description": "Vivez l aventure à votre rythme..."
      }
    },
    "coverImage": "/images/travel-packs/rent_car_go.svg",
    "features": ["4x4 car rental with camping equipment"],
    "availability": true
  }'
```

### Querying Travel Packs

```bash
# Get all travel packs (all in one - nested translations)
curl http://localhost:5000/api/travel-packs

# Filter by localeGroupId (returns single pack with nested EN+FR)
curl http://localhost:5000/api/travel-packs?localeGroupId=pack-1

# Get specific pack by slug
curl http://localhost:5000/api/travel-packs/rent-a-car-and-go
```

### Frontend Integration (React/Next.js)

```typescript
// Fetch travel pack with all translations
const response = await fetch('/api/travel-packs?localeGroupId=pack-1');
const { items } = await response.json();

const pack = items[0]; // Single document with nested locales

// Access English version
const titleEN = pack.locales.en.name;

// Access French version
const titleFR = pack.locales.fr.name;

// Use primary locale
const currentLocale = pack.locale || 'en';
const displayTitle = pack.locales[currentLocale]?.name;
```

---

## Migration Script

If you have a migration script (like `migrateTravelPacksFromJson.ts`), update it to:

1. Extract `localeGroupId` from JSON `id` field
2. Merge EN and FR JSON into single document
3. Nest translations under `locales: { en, fr }`
4. Set primary `locale` field

### Example Migration Logic

```typescript
// Read EN and FR JSON files
const enPacks = JSON.parse(
  fs.readFileSync('./data/content/en/travel-packs.json', 'utf-8')
);
const frPacks = JSON.parse(
  fs.readFileSync('./data/content/fr/travel-packs.json', 'utf-8')
);

// Group by id
const packGroups = new Map();

enPacks.forEach(pack => {
  if (!packGroups.has(pack.id)) {
    packGroups.set(pack.id, { en: pack });
  } else {
    packGroups.get(pack.id).en = pack;
  }
});

frPacks.forEach(pack => {
  if (!packGroups.has(pack.id)) {
    packGroups.set(pack.id, { fr: pack });
  } else {
    packGroups.get(pack.id).fr = pack;
  }
});

// Create merged documents
for (const [id, translations] of packGroups) {
  const enPack = translations.en;
  const frPack = translations.fr;

  const mergedPack = {
    slug: slugify(enPack?.name || frPack?.name || id),
    localeGroupId: id, // Original id becomes localeGroupId
    status: 'published',
    locale: 'en',
    locales: {
      ...(enPack && {
        en: {
          name: enPack.name,
          description: enPack.description,
          ctaLabel: enPack.ctaLabel,
          metadata: enPack.metadata,
        },
      }),
      ...(frPack && {
        fr: {
          name: frPack.name,
          description: frPack.description,
          ctaLabel: frPack.ctaLabel,
          metadata: frPack.metadata,
        },
      }),
    },
    coverImage: enPack?.coverImage || frPack?.coverImage,
    features: enPack?.features || frPack?.features || [],
    duration: enPack?.duration ?? null,
    basePrice: enPack?.price ?? null,
    currency: 'USD',
    availability: true,
  };

  await TravelPack.create(mergedPack);
}
```

---

## Key Differences from Activities/Cars

| Aspect                 | Activities/Cars                   | Travel Packs                                              |
| ---------------------- | --------------------------------- | --------------------------------------------------------- |
| **Structure**          | Separate documents per language   | Single document with nested locales                       |
| **localeGroupId**      | Links separate EN/FR docs         | Identifies pack (already contains all translations)       |
| **Query Pattern**      | `?localeGroupId=X` returns 2 docs | `?localeGroupId=X` returns 1 doc with nested translations |
| **Translation Access** | Different `_id` values            | Access via `pack.locales.en` or `pack.locales.fr`         |

---

## Teacher's Guidance 👨‍🏫

### Why Different Architecture?

1. **Travel Packs** are presentation-focused content with less data
2. **Activities/Cars** have more complex relations (bookings, availability)
3. **Nested approach** simplifies frontend rendering for travel packs
4. **localeGroupId** still provides consistency across all APIs

### Frontend Benefits

```typescript
// Travel Packs: One fetch, both languages
const pack = await fetchPack('pack-1');
const title = pack.locales[userLang].name; // Direct access

// Activities: Need to fetch specific language OR both separately
const activities = await fetchActivities('?localeGroupId=hiking-1&locale=en');
```

### When to Use Which Pattern?

- **Nested (Travel Packs)**: Static content, few updates, presentation-focused
- **Separate (Activities/Cars)**: Dynamic content, frequent updates, complex relations

Both patterns coexist harmoniously with `localeGroupId` as the unifying concept! 🎯
