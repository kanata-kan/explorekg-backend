// src/__tests__/guest.service.test.ts
import * as guestService from '../services/guest.service';
import { Guest } from '../models/guest.model';

// Mock uuid module to avoid ESM issues in Jest
jest.mock('uuid', () => ({
  v4: jest.fn(() => '12345678-1234-4234-8234-123456789012'),
  validate: jest.fn((uuid: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }),
  version: jest.fn((uuid: string) => {
    if (uuid.includes('-4')) return 4;
    return 0;
  }),
}));

describe('Guest Service', () => {
  describe('createGuest', () => {
    it('should create a guest with valid data', async () => {
      const guestData = {
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+201234567890',
        locale: 'en' as const,
      };

      const guest = await guestService.createGuest(guestData);

      expect(guest).toBeDefined();
      expect(guest.email).toBe('test@example.com');
      expect(guest.fullName).toBe('Test User');
      expect(guest.phone).toBe('+201234567890');
      expect(guest.locale).toBe('en');
      expect(guest.sessionId).toBeDefined();
      expect(guest.sessionId.length).toBeGreaterThan(0);
      expect(guest.canMigrate).toBe(true);
      expect(guest.userId).toBeUndefined();
      expect(guest.expiresAt).toBeDefined();
    });

    it('should throw error for duplicate email', async () => {
      const guestData = {
        email: 'duplicate@example.com',
        fullName: 'Test User',
        phone: '+201234567890',
        locale: 'en' as const,
      };

      await guestService.createGuest(guestData);

      await expect(guestService.createGuest(guestData)).rejects.toThrow();
    });
  });

  describe('findBySessionId', () => {
    it('should find guest by sessionId', async () => {
      const guestData = {
        email: 'find@example.com',
        fullName: 'Find User',
        phone: '+201234567890',
        locale: 'en' as const,
      };

      const createdGuest = await guestService.createGuest(guestData);
      const foundGuest = await guestService.findBySessionId(
        createdGuest.sessionId
      );

      expect(foundGuest).toBeDefined();
      expect(foundGuest.sessionId).toBe(createdGuest.sessionId);
      expect(foundGuest.email).toBe('find@example.com');
    });

    it('should throw error for non-existent sessionId', async () => {
      const fakeSessionId = '00000000-0000-4000-8000-000000000000';

      await expect(guestService.findBySessionId(fakeSessionId)).rejects.toThrow(
        'Guest not found or expired'
      );
    });

    it('should throw error for invalid UUID format', async () => {
      await expect(
        guestService.findBySessionId('invalid-uuid')
      ).rejects.toThrow('Invalid sessionId format');
    });
  });

  describe('updateGuest', () => {
    it('should update guest information', async () => {
      const guestData = {
        email: 'update@example.com',
        fullName: 'Original Name',
        phone: '+201234567890',
        locale: 'en' as const,
      };

      const createdGuest = await guestService.createGuest(guestData);

      const updateData = {
        fullName: 'Updated Name',
        phone: '+209876543210',
      };

      const updatedGuest = await guestService.updateGuest(
        createdGuest.sessionId,
        updateData
      );

      expect(updatedGuest.fullName).toBe('Updated Name');
      expect(updatedGuest.phone).toBe('+209876543210');
      expect(updatedGuest.email).toBe('update@example.com'); // Should not change
    });
  });

  describe('extendExpiration', () => {
    it('should extend guest expiration date', async () => {
      const guestData = {
        email: 'extend@example.com',
        fullName: 'Extend User',
        phone: '+201234567890',
        locale: 'en' as const,
      };

      const createdGuest = await guestService.createGuest(guestData);
      const originalExpiration = createdGuest.expiresAt;

      const extendedGuest = await guestService.extendExpiration(
        createdGuest.sessionId,
        15
      );

      expect(extendedGuest.expiresAt.getTime()).toBeGreaterThan(
        originalExpiration.getTime()
      );
    });
  });

  describe('getStatistics', () => {
    it('should return guest statistics', async () => {
      const stats = await guestService.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.active).toBeGreaterThanOrEqual(0);
      expect(stats.expired).toBeGreaterThanOrEqual(0);
      expect(stats.linked).toBeGreaterThanOrEqual(0);
      expect(stats.canMigrate).toBeGreaterThanOrEqual(0);
      expect(stats.byLocale).toBeDefined();
      expect(stats.byLocale.en).toBeGreaterThanOrEqual(0);
      expect(stats.byLocale.fr).toBeGreaterThanOrEqual(0);
    });
  });

  // Cleanup after tests
  afterAll(async () => {
    await Guest.deleteMany({
      email: {
        $in: [
          'test@example.com',
          'duplicate@example.com',
          'find@example.com',
          'update@example.com',
          'extend@example.com',
        ],
      },
    });
  });
});
