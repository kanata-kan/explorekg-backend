// scripts/migrateTravelPacksFromJson.ts
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import TravelPack from '../src/models/travelPack.model';
import { ENV } from '../src/config/env';

/**
 * Migration script for Travel Packs with localeGroupId
 *
 * Key differences from Activities/Cars:
 * - Travel Packs use NESTED locales structure (one document, multiple translations)
 * - EN and FR translations are merged into single document
 * - localeGroupId extracted from JSON `id` field
 *
 * Usage:
 *   npx ts-node scripts/migrateTravelPacksFromJson.ts
 */

interface JsonTravelPack {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  features: string[];
  duration: number | null;
  price: number | null;
  ctaLabel: string;
  metadata: {
    title: string;
    description: string;
    path: string;
    image: string;
    alt: string;
  };
}

/**
 * Slugify function (simplified)
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Main migration function
 */
async function migrateTravelPacks() {
  try {
    console.log('🚀 Starting Travel Packs migration with localeGroupId...\n');

    // Connect to MongoDB
    await mongoose.connect(ENV.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read EN and FR JSON files
    const enPath = path.join(__dirname, '../data/content/en/travel-packs.json');
    const frPath = path.join(__dirname, '../data/content/fr/travel-packs.json');

    if (!fs.existsSync(enPath) || !fs.existsSync(frPath)) {
      throw new Error(
        'JSON files not found. Please ensure both EN and FR files exist.'
      );
    }

    const enPacks: JsonTravelPack[] = JSON.parse(
      fs.readFileSync(enPath, 'utf-8')
    );
    const frPacks: JsonTravelPack[] = JSON.parse(
      fs.readFileSync(frPath, 'utf-8')
    );

    console.log(`📖 Read ${enPacks.length} EN packs`);
    console.log(`📖 Read ${frPacks.length} FR packs\n`);

    // Group packs by id (localeGroupId)
    const packGroups = new Map<
      string,
      { en?: JsonTravelPack; fr?: JsonTravelPack }
    >();

    enPacks.forEach(pack => {
      if (!packGroups.has(pack.id)) {
        packGroups.set(pack.id, { en: pack });
      } else {
        packGroups.get(pack.id)!.en = pack;
      }
    });

    frPacks.forEach(pack => {
      if (!packGroups.has(pack.id)) {
        packGroups.set(pack.id, { fr: pack });
      } else {
        packGroups.get(pack.id)!.fr = pack;
      }
    });

    console.log(
      `🔗 Grouped ${packGroups.size} travel packs by localeGroupId\n`
    );

    // Clear existing data (optional - remove if you want to keep existing data)
    const deleteResult = await TravelPack.deleteMany({});
    console.log(
      `🗑️  Cleared ${deleteResult.deletedCount} existing travel packs\n`
    );

    // Create merged documents
    let successCount = 0;
    let errorCount = 0;

    for (const [id, translations] of packGroups) {
      try {
        const enPack = translations.en;
        const frPack = translations.fr;

        // Use EN as base, fallback to FR
        const basePack = enPack || frPack;
        if (!basePack) {
          console.warn(`⚠️  Skipping ${id} - no translations found`);
          continue;
        }

        const mergedPack = {
          slug: slugify(basePack.name),
          localeGroupId: id, // Original id becomes localeGroupId
          status: 'published' as const,
          locale: enPack ? 'en' : 'fr',
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
          coverImage: basePack.coverImage,
          features: basePack.features || [],
          duration: basePack.duration ?? null,
          basePrice: basePack.price ?? null,
          currency: 'USD',
          availability: true,
        };

        await TravelPack.create(mergedPack);

        const locales = Object.keys(mergedPack.locales).join(', ');
        console.log(
          `✅ Created: ${mergedPack.slug} (${mergedPack.localeGroupId}) [${locales}]`
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Error creating pack ${id}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount} travel packs`);
    console.log(`   ❌ Errors: ${errorCount} travel packs`);
    console.log(`   📦 Total: ${packGroups.size} travel packs\n`);

    // Display sample data
    console.log('📋 Sample data verification:');
    const samplePacks = await TravelPack.find().limit(3).lean();
    samplePacks.forEach((pack: any) => {
      const locales = Object.keys(pack.locales || {}).join(', ');
      console.log(`   - ${pack.slug} (${pack.localeGroupId}) [${locales}]`);
      if (pack.locales?.en) {
        console.log(`     EN: ${pack.locales.en.name}`);
      }
      if (pack.locales?.fr) {
        console.log(`     FR: ${pack.locales.fr.name}`);
      }
    });

    console.log('\n🎉 Travel Packs migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log(
      '   1. Verify data: GET http://localhost:4000/api/v1/travel-packs'
    );
    console.log(
      '   2. Test localeGroupId filter: GET http://localhost:4000/api/v1/travel-packs?localeGroupId=pack-1'
    );
    console.log('   3. Check nested translations in response');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run migration
migrateTravelPacks();
