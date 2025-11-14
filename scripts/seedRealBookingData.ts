/**
 * Seed Real Booking Data
 * 
 * حقن بيانات حقيقية متطابقة مع Backend Structure
 * - Travel Packs (en & fr)
 * - Activities (en & fr)  
 * - Cars (en & fr)
 * - PackRelations (تربط packs مع activities و cars)
 * 
 * هذه البيانات ستستخدم في تجربة الحجز الكاملة من Frontend → Backend → Database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TravelPack from '../src/models/travelPack.model';
import { Activity } from '../src/models/activity.model';
import { Car } from '../src/models/car.model';
import PackRelation from '../src/models/packRelation.model';

// Load environment variables
dotenv.config();

// MongoDB Connection URI
const MONGODB_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/explorekg';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg: string) =>
    console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

// ==================== REAL DATA DEFINITIONS ====================

/**
 * Travel Packs Data
 * باقات سفر حقيقية لقرغيزستان
 */
const travelPacksData = [
  {
    localeGroupId: 'kyrgyz-adventure-pack',
    status: 'published',
    locale: 'en',
    locales: {
      en: {
        name: 'Complete Kyrgyzstan Adventure',
        description:
          'Experience the best of Kyrgyzstan with this comprehensive 7-day adventure package. Visit stunning alpine lakes, explore ancient Silk Road cities, and immerse yourself in nomadic culture.',
        ctaLabel: 'Book Now',
        metadata: {
          title: 'Complete Kyrgyzstan Adventure | ExploreKG',
          description:
            '7-day adventure package covering Issyk-Kul, Karakol, and Bishkek',
          image:
            'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=1200',
          alt: 'Kyrgyzstan mountain landscape',
          path: '/travel-packs/kyrgyz-adventure-pack',
        },
      },
      fr: {
        name: 'Aventure Complète au Kirghizistan',
        description:
          'Découvrez le meilleur du Kirghizistan avec ce forfait aventure complet de 7 jours. Visitez de superbes lacs alpins, explorez d\'anciennes villes de la Route de la Soie et imprégnez-vous de la culture nomade.',
        ctaLabel: 'Réserver',
        metadata: {
          title: 'Aventure Complète au Kirghizistan | ExploreKG',
          description:
            'Forfait aventure de 7 jours couvrant Issyk-Kul, Karakol et Bishkek',
          image:
            'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=1200',
          alt: 'Paysage montagneux du Kirghizistan',
          path: '/travel-packs/kyrgyz-adventure-pack',
        },
      },
    },
    coverImage:
      'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=1200',
    features: [
      'Issyk-Kul Lake visit',
      'Karakol city tour',
      'Ala-Archa National Park',
      'Traditional yurt stay',
      'Local guide included',
    ],
    duration: 7,
    basePrice: 899,
    currency: 'USD',
    availability: true,
  },
  {
    localeGroupId: 'mountain-explorer-pack',
    status: 'published',
    locale: 'en',
    locales: {
      en: {
        name: 'Mountain Explorer Experience',
        description:
          'A 5-day journey through Kyrgyzstan\'s breathtaking mountain ranges. Perfect for hiking enthusiasts and nature lovers. Includes accommodation, meals, and expert mountain guides.',
        ctaLabel: 'Book Now',
        metadata: {
          title: 'Mountain Explorer Experience | ExploreKG',
          description: '5-day mountain hiking adventure in Kyrgyzstan',
          image:
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
          alt: 'Kyrgyzstan mountain hiking',
          path: '/travel-packs/mountain-explorer-pack',
        },
      },
      fr: {
        name: 'Expérience Explorateur de Montagne',
        description:
          'Un voyage de 5 jours à travers les chaînes de montagnes époustouflantes du Kirghizistan. Parfait pour les amateurs de randonnée et les amoureux de la nature. Comprend l\'hébergement, les repas et des guides de montagne experts.',
        ctaLabel: 'Réserver',
        metadata: {
          title: 'Expérience Explorateur de Montagne | ExploreKG',
          description: 'Aventure de randonnée en montagne de 5 jours au Kirghizistan',
          image:
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
          alt: 'Randonnée en montagne au Kirghizistan',
          path: '/travel-packs/mountain-explorer-pack',
        },
      },
    },
    coverImage:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
    features: [
      'Multiple hiking trails',
      'Mountain guide',
      'Equipment included',
      'Mountain lodge accommodation',
      'Breakfast & dinner',
    ],
    duration: 5,
    basePrice: 699,
    currency: 'USD',
    availability: true,
  },
  {
    localeGroupId: 'cultural-heritage-pack',
    status: 'published',
    locale: 'en',
    locales: {
      en: {
        name: 'Cultural Heritage Tour',
        description:
          'Discover the rich cultural heritage of Kyrgyzstan in this 4-day tour. Visit historical sites, experience traditional crafts, and enjoy authentic local cuisine.',
        ctaLabel: 'Book Now',
        metadata: {
          title: 'Cultural Heritage Tour | ExploreKG',
          description: '4-day cultural tour of Kyrgyzstan',
          image:
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
          alt: 'Kyrgyzstan cultural heritage',
          path: '/travel-packs/cultural-heritage-pack',
        },
      },
      fr: {
        name: 'Tour du Patrimoine Culturel',
        description:
          'Découvrez le riche patrimoine culturel du Kirghizistan lors de cette visite de 4 jours. Visitez des sites historiques, découvrez l\'artisanat traditionnel et savourez une cuisine locale authentique.',
        ctaLabel: 'Réserver',
        metadata: {
          title: 'Tour du Patrimoine Culturel | ExploreKG',
          description: 'Visite culturelle de 4 jours au Kirghizistan',
          image:
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
          alt: 'Patrimoine culturel du Kirghizistan',
          path: '/travel-packs/cultural-heritage-pack',
        },
      },
    },
    coverImage:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
    features: [
      'Historical site visits',
      'Traditional craft workshops',
      'Local market tour',
      'Authentic meals',
      'Cultural guide',
    ],
    duration: 4,
    basePrice: 549,
    currency: 'USD',
    availability: true,
  },
];

/**
 * Activities Data
 * أنشطة حقيقية لقرغيزستان
 */
const activitiesData = {
  en: [
    {
      localeGroupId: 'horseback-riding',
      locale: 'en',
      name: 'Horseback Riding in the Mountains',
      description:
        'Experience traditional Kyrgyz horseback riding through stunning mountain trails. Suitable for all skill levels with professional guides.',
      coverImage:
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
        'https://images.unsplash.com/photo-1544966503-7cc5319b6e79?w=1200',
      ],
      duration: '3 hours',
      location: 'Ala-Archa National Park',
      groupSize: '2-8 people',
      price: 85,
      metadata: {
        title: 'Horseback Riding in the Mountains | ExploreKG',
        description: 'Traditional Kyrgyz horseback riding experience',
        path: '/activities/horseback-riding',
        image:
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
        alt: 'Horseback riding in Kyrgyzstan mountains',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['outdoor', 'adventure', 'nature'],
    },
    {
      localeGroupId: 'hiking-ala-archa',
      locale: 'en',
      name: 'Ala-Archa Hiking Tour',
      description:
        'Guided hiking tour through Ala-Archa National Park with breathtaking views and diverse wildlife.',
      coverImage:
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
      images: [
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
        'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=1200',
      ],
      duration: '5 hours',
      location: 'Ala-Archa National Park',
      groupSize: '4-12 people',
      price: 65,
      metadata: {
        title: 'Ala-Archa Hiking Tour | ExploreKG',
        description: 'Guided hiking in Ala-Archa National Park',
        path: '/activities/hiking-ala-archa',
        image:
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
        alt: 'Hiking in Ala-Archa National Park',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['hiking', 'nature', 'outdoor'],
    },
    {
      localeGroupId: 'issyk-kul-lake-tour',
      locale: 'en',
      name: 'Issyk-Kul Lake Day Tour',
      description:
        'Full-day tour to the stunning Issyk-Kul Lake, the second largest alpine lake in the world.',
      coverImage:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200',
      ],
      duration: '8 hours',
      location: 'Issyk-Kul Region',
      groupSize: '2-10 people',
      price: 120,
      metadata: {
        title: 'Issyk-Kul Lake Day Tour | ExploreKG',
        description: 'Full-day tour to Issyk-Kul Lake',
        path: '/activities/issyk-kul-lake-tour',
        image:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        alt: 'Issyk-Kul Lake Kyrgyzstan',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['nature', 'lakes', 'scenic'],
    },
    {
      localeGroupId: 'yurt-stay-experience',
      locale: 'en',
      name: 'Traditional Yurt Stay',
      description:
        'Experience authentic nomadic culture with an overnight stay in a traditional Kyrgyz yurt.',
      coverImage:
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
        'https://images.unsplash.com/photo-1553909489-43f8318cec76?w=1200',
      ],
      duration: 'Overnight',
      location: 'Song-Kul Region',
      groupSize: '2-6 people',
      price: 95,
      metadata: {
        title: 'Traditional Yurt Stay | ExploreKG',
        description: 'Overnight stay in traditional Kyrgyz yurt',
        path: '/activities/yurt-stay-experience',
        image:
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
        alt: 'Traditional Kyrgyz yurt',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['cultural', 'traditional', 'unique'],
    },
    {
      localeGroupId: 'karakol-city-tour',
      locale: 'en',
      name: 'Karakol City Historical Tour',
      description:
        'Explore the historic city of Karakol with its unique architecture and rich cultural heritage.',
      coverImage:
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
      images: [
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200',
      ],
      duration: '4 hours',
      location: 'Karakol',
      groupSize: '2-15 people',
      price: 45,
      metadata: {
        title: 'Karakol City Historical Tour | ExploreKG',
        description: 'Historical tour of Karakol city',
        path: '/activities/karakol-city-tour',
        image:
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
        alt: 'Karakol city architecture',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['cultural', 'historical', 'city-tour'],
    },
    {
      localeGroupId: 'eagle-hunting-show',
      locale: 'en',
      name: 'Eagle Hunting Demonstration',
      description:
        'Witness the ancient art of eagle hunting, a traditional practice of Central Asian nomads.',
      coverImage:
        'https://images.unsplash.com/photo-1560191951-0-9e9a0e4c6f5d?w=1200',
      images: [
        'https://images.unsplash.com/photo-1560191951-0-9e9a0e4c6f5d?w=1200',
      ],
      duration: '2 hours',
      location: 'Bokonbaevo',
      groupSize: '4-20 people',
      price: 75,
      metadata: {
        title: 'Eagle Hunting Demonstration | ExploreKG',
        description: 'Traditional eagle hunting show',
        path: '/activities/eagle-hunting-show',
        image:
          'https://images.unsplash.com/photo-1560191951-0-9e9a0e4c6f5d?w=1200',
        alt: 'Eagle hunting demonstration',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['cultural', 'traditional', 'unique'],
    },
  ],
  fr: [
    {
      localeGroupId: 'horseback-riding',
      locale: 'fr',
      name: 'Équitation dans les Montagnes',
      description:
        'Découvrez l\'équitation traditionnelle kirghize à travers des sentiers de montagne époustouflants. Adapté à tous les niveaux avec des guides professionnels.',
      coverImage:
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
        'https://images.unsplash.com/photo-1544966503-7cc5319b6e79?w=1200',
      ],
      duration: '3 heures',
      location: 'Parc National d\'Ala-Archa',
      groupSize: '2-8 personnes',
      price: 85,
      metadata: {
        title: 'Équitation dans les Montagnes | ExploreKG',
        description: 'Expérience d\'équitation traditionnelle kirghize',
        path: '/activities/horseback-riding',
        image:
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
        alt: 'Équitation dans les montagnes du Kirghizistan',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['plein-air', 'aventure', 'nature'],
    },
    {
      localeGroupId: 'hiking-ala-archa',
      locale: 'fr',
      name: 'Randonnée au Parc d\'Ala-Archa',
      description:
        'Randonnée guidée dans le Parc National d\'Ala-Archa avec des vues à couper le souffle et une faune diversifiée.',
      coverImage:
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
      images: [
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
        'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=1200',
      ],
      duration: '5 heures',
      location: 'Parc National d\'Ala-Archa',
      groupSize: '4-12 personnes',
      price: 65,
      metadata: {
        title: 'Randonnée au Parc d\'Ala-Archa | ExploreKG',
        description: 'Randonnée guidée dans le Parc National d\'Ala-Archa',
        path: '/activities/hiking-ala-archa',
        image:
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
        alt: 'Randonnée dans le Parc National d\'Ala-Archa',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['randonnée', 'nature', 'plein-air'],
    },
    {
      localeGroupId: 'issyk-kul-lake-tour',
      locale: 'fr',
      name: 'Visite d\'une Journée au Lac Issyk-Kul',
      description:
        'Visite d\'une journée complète du magnifique lac Issyk-Kul, le deuxième plus grand lac alpin au monde.',
      coverImage:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200',
      ],
      duration: '8 heures',
      location: 'Région d\'Issyk-Kul',
      groupSize: '2-10 personnes',
      price: 120,
      metadata: {
        title: 'Visite d\'une Journée au Lac Issyk-Kul | ExploreKG',
        description: 'Visite d\'une journée complète du lac Issyk-Kul',
        path: '/activities/issyk-kul-lake-tour',
        image:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        alt: 'Lac Issyk-Kul Kirghizistan',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['nature', 'lacs', 'paysage'],
    },
    {
      localeGroupId: 'yurt-stay-experience',
      locale: 'fr',
      name: 'Séjour en Yourte Traditionnelle',
      description:
        'Découvrez la culture nomade authentique avec un séjour d\'une nuit dans une yourte kirghize traditionnelle.',
      coverImage:
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
        'https://images.unsplash.com/photo-1553909489-43f8318cec76?w=1200',
      ],
      duration: 'Nuitée',
      location: 'Région de Song-Kul',
      groupSize: '2-6 personnes',
      price: 95,
      metadata: {
        title: 'Séjour en Yourte Traditionnelle | ExploreKG',
        description: 'Séjour d\'une nuit dans une yourte kirghize traditionnelle',
        path: '/activities/yurt-stay-experience',
        image:
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
        alt: 'Yourte kirghize traditionnelle',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['culturel', 'traditionnel', 'unique'],
    },
    {
      localeGroupId: 'karakol-city-tour',
      locale: 'fr',
      name: 'Visite Historique de la Ville de Karakol',
      description:
        'Explorez la ville historique de Karakol avec son architecture unique et son riche patrimoine culturel.',
      coverImage:
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
      images: [
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200',
      ],
      duration: '4 heures',
      location: 'Karakol',
      groupSize: '2-15 personnes',
      price: 45,
      metadata: {
        title: 'Visite Historique de la Ville de Karakol | ExploreKG',
        description: 'Visite historique de la ville de Karakol',
        path: '/activities/karakol-city-tour',
        image:
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
        alt: 'Architecture de la ville de Karakol',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['culturel', 'historique', 'visite-ville'],
    },
    {
      localeGroupId: 'eagle-hunting-show',
      locale: 'fr',
      name: 'Démonstration de Chasse à l\'Aigle',
      description:
        'Assistez à l\'art ancien de la chasse à l\'aigle, une pratique traditionnelle des nomades d\'Asie centrale.',
      coverImage:
        'https://images.unsplash.com/photo-1560191951-0-9e9a0e4c6f5d?w=1200',
      images: [
        'https://images.unsplash.com/photo-1560191951-0-9e9a0e4c6f5d?w=1200',
      ],
      duration: '2 heures',
      location: 'Bokonbaevo',
      groupSize: '4-20 personnes',
      price: 75,
      metadata: {
        title: 'Démonstration de Chasse à l\'Aigle | ExploreKG',
        description: 'Spectacle de chasse à l\'aigle traditionnel',
        path: '/activities/eagle-hunting-show',
        image:
          'https://images.unsplash.com/photo-1560191951-0-9e9a0e4c6f5d?w=1200',
        alt: 'Démonstration de chasse à l\'aigle',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['culturel', 'traditionnel', 'unique'],
    },
  ],
};

/**
 * Cars Data
 * سيارات حقيقية للإيجار
 */
const carsData = {
  en: [
    {
      localeGroupId: 'toyota-rav4-2023',
      locale: 'en',
      name: 'Toyota RAV4 2023',
      description:
        'Comfortable and reliable SUV perfect for exploring Kyrgyzstan\'s diverse terrain. Automatic transmission, 5 seats, spacious luggage capacity.',
      coverImage:
        'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1200',
      images: [
        'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1200',
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1200',
      ],
      pricing: {
        amount: 45,
        currency: 'USD',
        unit: 'day',
      },
      specs: {
        seats: '5',
        transmission: 'Automatic',
        drive: '4WD',
        luggage: '580L',
        fuel: 'Petrol',
      },
      metadata: {
        title: 'Toyota RAV4 2023 Rental | ExploreKG',
        description: 'Rent a Toyota RAV4 2023 for your Kyrgyzstan adventure',
        path: '/cars/toyota-rav4-2023',
        image:
          'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1200',
        alt: 'Toyota RAV4 2023',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['suv', 'automatic', '4wd'],
    },
    {
      localeGroupId: 'ford-ranger-2022',
      locale: 'en',
      name: 'Ford Ranger 2022',
      description:
        'Rugged pickup truck ideal for off-road adventures and mountain expeditions. High ground clearance and powerful engine.',
      coverImage:
        'https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=1200',
      images: [
        'https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=1200',
        'https://images.unsplash.com/photo-1605792657660-596af9009b82?w=1200',
      ],
      pricing: {
        amount: 65,
        currency: 'USD',
        unit: 'day',
      },
      specs: {
        seats: '5',
        transmission: 'Automatic',
        drive: '4WD',
        luggage: 'N/A',
        fuel: 'Diesel',
      },
      metadata: {
        title: 'Ford Ranger 2022 Rental | ExploreKG',
        description: 'Rent a Ford Ranger 2022 for off-road adventures',
        path: '/cars/ford-ranger-2022',
        image:
          'https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=1200',
        alt: 'Ford Ranger 2022',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['pickup', 'off-road', '4wd'],
    },
    {
      localeGroupId: 'hyundai-tucson-2023',
      locale: 'en',
      name: 'Hyundai Tucson 2023',
      description:
        'Modern and fuel-efficient SUV with all the latest features. Perfect for city tours and comfortable long-distance travel.',
      coverImage:
        'https://images.unsplash.com/photo-1607672886196-7e27cc0a4fca?w=1200',
      images: [
        'https://images.unsplash.com/photo-1607672886196-7e27cc0a4fca?w=1200',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200',
      ],
      pricing: {
        amount: 40,
        currency: 'USD',
        unit: 'day',
      },
      specs: {
        seats: '5',
        transmission: 'Automatic',
        drive: 'FWD',
        luggage: '530L',
        fuel: 'Hybrid',
      },
      metadata: {
        title: 'Hyundai Tucson 2023 Rental | ExploreKG',
        description: 'Rent a Hyundai Tucson 2023 for comfortable travel',
        path: '/cars/hyundai-tucson-2023',
        image:
          'https://images.unsplash.com/photo-1607672886196-7e27cc0a4fca?w=1200',
        alt: 'Hyundai Tucson 2023',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['suv', 'hybrid', 'comfort'],
    },
  ],
  fr: [
    {
      localeGroupId: 'toyota-rav4-2023',
      locale: 'fr',
      name: 'Toyota RAV4 2023',
      description:
        'SUV confortable et fiable parfait pour explorer les terrains divers du Kirghizistan. Transmission automatique, 5 places, capacité de bagages spacieuse.',
      coverImage:
        'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1200',
      images: [
        'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1200',
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1200',
      ],
      pricing: {
        amount: 45,
        currency: 'USD',
        unit: 'jour',
      },
      specs: {
        seats: '5',
        transmission: 'Automatique',
        drive: '4x4',
        luggage: '580L',
        fuel: 'Essence',
      },
      metadata: {
        title: 'Location Toyota RAV4 2023 | ExploreKG',
        description: 'Louez une Toyota RAV4 2023 pour votre aventure au Kirghizistan',
        path: '/cars/toyota-rav4-2023',
        image:
          'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1200',
        alt: 'Toyota RAV4 2023',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['suv', 'automatique', '4x4'],
    },
    {
      localeGroupId: 'ford-ranger-2022',
      locale: 'fr',
      name: 'Ford Ranger 2022',
      description:
        'Pick-up robuste idéal pour les aventures tout-terrain et les expéditions en montagne. Grande garde au sol et moteur puissant.',
      coverImage:
        'https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=1200',
      images: [
        'https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=1200',
        'https://images.unsplash.com/photo-1605792657660-596af9009b82?w=1200',
      ],
      pricing: {
        amount: 65,
        currency: 'USD',
        unit: 'jour',
      },
      specs: {
        seats: '5',
        transmission: 'Automatique',
        drive: '4x4',
        luggage: 'N/A',
        fuel: 'Diesel',
      },
      metadata: {
        title: 'Location Ford Ranger 2022 | ExploreKG',
        description: 'Louez un Ford Ranger 2022 pour les aventures tout-terrain',
        path: '/cars/ford-ranger-2022',
        image:
          'https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=1200',
        alt: 'Ford Ranger 2022',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['pick-up', 'tout-terrain', '4x4'],
    },
    {
      localeGroupId: 'hyundai-tucson-2023',
      locale: 'fr',
      name: 'Hyundai Tucson 2023',
      description:
        'SUV moderne et économe en carburant avec toutes les dernières fonctionnalités. Parfait pour les visites en ville et les longs trajets confortables.',
      coverImage:
        'https://images.unsplash.com/photo-1607672886196-7e27cc0a4fca?w=1200',
      images: [
        'https://images.unsplash.com/photo-1607672886196-7e27cc0a4fca?w=1200',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200',
      ],
      pricing: {
        amount: 40,
        currency: 'USD',
        unit: 'jour',
      },
      specs: {
        seats: '5',
        transmission: 'Automatique',
        drive: 'Traction avant',
        luggage: '530L',
        fuel: 'Hybrid',
      },
      metadata: {
        title: 'Location Hyundai Tucson 2023 | ExploreKG',
        description: 'Louez un Hyundai Tucson 2023 pour un voyage confortable',
        path: '/cars/hyundai-tucson-2023',
        image:
          'https://images.unsplash.com/photo-1607672886196-7e27cc0a4fca?w=1200',
        alt: 'Hyundai Tucson 2023',
      },
      status: 'active',
      availabilityStatus: 'available',
      tags: ['suv', 'hybride', 'confort'],
    },
  ],
};

/**
 * PackRelations Data
 * علاقات تربط الباقات مع الأنشطة والسيارات
 */
const packRelationsData = [
  {
    travelPackLocaleGroupId: 'kyrgyz-adventure-pack',
    relations: {
      activities: [
        {
          localeGroupId: 'issyk-kul-lake-tour',
          quantity: 1,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'karakol-city-tour',
          quantity: 1,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'hiking-ala-archa',
          quantity: 1,
          optional: true,
          discount: 10,
        },
        {
          localeGroupId: 'horseback-riding',
          quantity: 1,
          optional: true,
          discount: 15,
        },
        {
          localeGroupId: 'yurt-stay-experience',
          quantity: 1,
          optional: true,
          discount: 0,
        },
        {
          localeGroupId: 'eagle-hunting-show',
          quantity: 1,
          optional: true,
          discount: 5,
        },
      ],
      cars: [
        {
          localeGroupId: 'toyota-rav4-2023',
          durationDays: 7,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'ford-ranger-2022',
          durationDays: 7,
          optional: true,
          discount: 10,
        },
        {
          localeGroupId: 'hyundai-tucson-2023',
          durationDays: 7,
          optional: true,
          discount: 0,
        },
      ],
    },
    pricing: {
      strategy: 'sum',
      globalDiscount: 10,
    },
    settings: {
      allowCustomization: true,
      minActivities: 2,
      maxActivities: 6,
    },
  },
  {
    travelPackLocaleGroupId: 'mountain-explorer-pack',
    relations: {
      activities: [
        {
          localeGroupId: 'hiking-ala-archa',
          quantity: 2,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'horseback-riding',
          quantity: 1,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'yurt-stay-experience',
          quantity: 1,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'eagle-hunting-show',
          quantity: 1,
          optional: true,
          discount: 5,
        },
      ],
      cars: [
        {
          localeGroupId: 'ford-ranger-2022',
          durationDays: 5,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'toyota-rav4-2023',
          durationDays: 5,
          optional: true,
          discount: 5,
        },
      ],
    },
    pricing: {
      strategy: 'sum',
      globalDiscount: 15,
    },
    settings: {
      allowCustomization: true,
      minActivities: 3,
      maxActivities: 4,
    },
  },
  {
    travelPackLocaleGroupId: 'cultural-heritage-pack',
    relations: {
      activities: [
        {
          localeGroupId: 'karakol-city-tour',
          quantity: 1,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'eagle-hunting-show',
          quantity: 1,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'yurt-stay-experience',
          quantity: 1,
          optional: true,
          discount: 0,
        },
        {
          localeGroupId: 'issyk-kul-lake-tour',
          quantity: 1,
          optional: true,
          discount: 10,
        },
      ],
      cars: [
        {
          localeGroupId: 'hyundai-tucson-2023',
          durationDays: 4,
          optional: false,
          discount: 0,
        },
        {
          localeGroupId: 'toyota-rav4-2023',
          durationDays: 4,
          optional: true,
          discount: 5,
        },
      ],
    },
    pricing: {
      strategy: 'sum',
      globalDiscount: 5,
    },
    settings: {
      allowCustomization: true,
      minActivities: 2,
      maxActivities: 4,
    },
  },
];

// ==================== SEEDING FUNCTIONS ====================

/**
 * Connect to MongoDB
 */
async function connectDB(): Promise<void> {
  try {
    log.info(
      `Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`
    );
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, {
      tls: true,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    log.success('Connected to MongoDB successfully');
  } catch (error: any) {
    log.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Clear existing data from collections
 */
async function clearCollections(): Promise<void> {
  log.header('🗑️  Clearing existing collections...');

  try {
    const counts = {
      travelPacks: await TravelPack.countDocuments(),
      activities: await Activity.countDocuments(),
      cars: await Car.countDocuments(),
      packRelations: await PackRelation.countDocuments(),
    };

    if (counts.travelPacks > 0) {
      await TravelPack.deleteMany({});
      log.warning(`Deleted ${counts.travelPacks} existing travel packs`);
    }

    if (counts.activities > 0) {
      await Activity.deleteMany({});
      log.warning(`Deleted ${counts.activities} existing activities`);
    }

    if (counts.cars > 0) {
      await Car.deleteMany({});
      log.warning(`Deleted ${counts.cars} existing cars`);
    }

    if (counts.packRelations > 0) {
      await PackRelation.deleteMany({});
      log.warning(`Deleted ${counts.packRelations} existing pack relations`);
    }

    if (
      counts.travelPacks === 0 &&
      counts.activities === 0 &&
      counts.cars === 0 &&
      counts.packRelations === 0
    ) {
      log.info('Collections are already empty');
    }
  } catch (error: any) {
    log.error(`Failed to clear collections: ${error.message}`);
    throw error;
  }
}

/**
 * Seed Travel Packs
 */
async function seedTravelPacks(): Promise<Map<string, any>> {
  log.header('🎒 Seeding Travel Packs...');

  try {
    const insertedPacks = await TravelPack.insertMany(travelPacksData);
    log.success(`Inserted ${insertedPacks.length} travel packs`);

    // Create a map of localeGroupId to pack document
    const packsMap = new Map<string, any>();
    for (const pack of insertedPacks) {
      packsMap.set(pack.localeGroupId, pack);
    }

    return packsMap;
  } catch (error: any) {
    log.error(`Failed to seed travel packs: ${error.message}`);
    throw error;
  }
}

/**
 * Seed Activities
 */
async function seedActivities(): Promise<Map<string, any>> {
  log.header('📍 Seeding Activities...');

  try {
    // Insert EN activities
    const insertedEN = await Activity.insertMany(activitiesData.en);
    log.success(`Inserted ${insertedEN.length} EN activities`);

    // Insert FR activities
    const insertedFR = await Activity.insertMany(activitiesData.fr);
    log.success(`Inserted ${insertedFR.length} FR activities`);

    // Create a map of localeGroupId to activity documents
    const activitiesMap = new Map<string, any>();
    for (const activity of [...insertedEN, ...insertedFR]) {
      const key = `${activity.localeGroupId}-${activity.locale}`;
      activitiesMap.set(key, activity);
    }

    log.success(
      `Total activities inserted: ${insertedEN.length + insertedFR.length}`
    );
    return activitiesMap;
  } catch (error: any) {
    log.error(`Failed to seed activities: ${error.message}`);
    throw error;
  }
}

/**
 * Seed Cars
 */
async function seedCars(): Promise<Map<string, any>> {
  log.header('🚗 Seeding Cars...');

  try {
    // Insert EN cars
    const insertedEN = await Car.insertMany(carsData.en);
    log.success(`Inserted ${insertedEN.length} EN cars`);

    // Insert FR cars
    const insertedFR = await Car.insertMany(carsData.fr);
    log.success(`Inserted ${insertedFR.length} FR cars`);

    // Create a map of localeGroupId to car documents
    const carsMap = new Map<string, any>();
    for (const car of [...insertedEN, ...insertedFR]) {
      const key = `${car.localeGroupId}-${car.locale}`;
      carsMap.set(key, car);
    }

    log.success(`Total cars inserted: ${insertedEN.length + insertedFR.length}`);
    return carsMap;
  } catch (error: any) {
    log.error(`Failed to seed cars: ${error.message}`);
    throw error;
  }
}

/**
 * Seed PackRelations
 */
async function seedPackRelations(
  packsMap: Map<string, any>,
  activitiesMap: Map<string, any>,
  carsMap: Map<string, any>
): Promise<void> {
  log.header('🔗 Seeding PackRelations...');

  try {
    // Verify that all referenced packs, activities, and cars exist
    for (const relationData of packRelationsData) {
      const pack = packsMap.get(relationData.travelPackLocaleGroupId);
      if (!pack) {
        log.warning(
          `Pack with localeGroupId "${relationData.travelPackLocaleGroupId}" not found`
        );
      }

      // Verify activities
      for (const activityRelation of relationData.relations.activities) {
        const activityEN = activitiesMap.get(
          `${activityRelation.localeGroupId}-en`
        );
        const activityFR = activitiesMap.get(
          `${activityRelation.localeGroupId}-fr`
        );
        if (!activityEN || !activityFR) {
          log.warning(
            `Activity with localeGroupId "${activityRelation.localeGroupId}" not found`
          );
        }
      }

      // Verify cars
      for (const carRelation of relationData.relations.cars) {
        const carEN = carsMap.get(`${carRelation.localeGroupId}-en`);
        const carFR = carsMap.get(`${carRelation.localeGroupId}-fr`);
        if (!carEN || !carFR) {
          log.warning(
            `Car with localeGroupId "${carRelation.localeGroupId}" not found`
          );
        }
      }
    }

    // Insert pack relations
    const insertedRelations = await PackRelation.insertMany(packRelationsData);
    log.success(`Inserted ${insertedRelations.length} pack relations`);

    log.success('✅ PackRelations seeded successfully!');
  } catch (error: any) {
    log.error(`Failed to seed pack relations: ${error.message}`);
    throw error;
  }
}

/**
 * Verify inserted data
 */
async function verifyData(): Promise<void> {
  log.header('🔍 Verifying inserted data...');

  try {
    const travelPackCount = await TravelPack.countDocuments();
    const activityCount = await Activity.countDocuments();
    const carCount = await Car.countDocuments();
    const packRelationCount = await PackRelation.countDocuments();

    log.info(`Travel Packs in DB: ${travelPackCount}`);
    log.info(`Activities in DB: ${activityCount}`);
    log.info(`Cars in DB: ${carCount}`);
    log.info(`PackRelations in DB: ${packRelationCount}`);

    // Verify pack relations
    const relations = await PackRelation.find().lean();
    for (const relation of relations) {
      const pack = await TravelPack.findOne({
        localeGroupId: relation.travelPackLocaleGroupId,
      });
      if (!pack) {
        log.warning(
          `PackRelation references non-existent pack: ${relation.travelPackLocaleGroupId}`
        );
      }
    }

    log.success('✅ All data verified successfully!');
  } catch (error: any) {
    log.error(`Verification failed: ${error.message}`);
    throw error;
  }
}

/**
 * Print final statistics
 */
function printStatistics(
  packsMap: Map<string, any>,
  activitiesMap: Map<string, any>,
  carsMap: Map<string, any>
): void {
  console.log('\n' + '='.repeat(60));
  log.header('📊 SEEDING STATISTICS | إحصائيات الإدخال');
  console.log('='.repeat(60));
  console.log('');
  console.log(`  🎒 Travel Packs:           ${packsMap.size} packs`);
  console.log(
    `  📍 Activities:              ${activitiesMap.size / 2} activities (${activitiesMap.size / 2} EN + ${activitiesMap.size / 2} FR)`
  );
  console.log(
    `  🚗 Cars:                    ${carsMap.size / 2} cars (${carsMap.size / 2} EN + ${carsMap.size / 2} FR)`
  );
  console.log(`  🔗 PackRelations:          ${packRelationsData.length} relations`);
  console.log('');
  console.log('='.repeat(60));
  log.success('✅ Real booking data seeding completed successfully!');
  log.success('✅ تم إدخال بيانات الحجز الحقيقية بنجاح!');
  console.log('='.repeat(60));
  console.log('');
  log.info('🎯 You can now test the complete booking flow:');
  log.info('   Frontend → Backend → Database');
  log.info('   All data is real and connected!');
  console.log('');
}

/**
 * Main seeding function
 */
async function seedRealBookingData(): Promise<void> {
  try {
    console.log('\n' + '='.repeat(60));
    log.header(
      '🌱 SEEDING REAL BOOKING DATA | إدخال بيانات الحجز الحقيقية'
    );
    console.log('='.repeat(60));
    console.log('');

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearCollections();

    // Seed all collections
    const packsMap = await seedTravelPacks();
    const activitiesMap = await seedActivities();
    const carsMap = await seedCars();
    await seedPackRelations(packsMap, activitiesMap, carsMap);

    // Verify data
    await verifyData();

    // Print statistics
    printStatistics(packsMap, activitiesMap, carsMap);
  } catch (error: any) {
    log.error(`Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    log.info('Database connection closed');
  }
}

// Run seeding
seedRealBookingData();

