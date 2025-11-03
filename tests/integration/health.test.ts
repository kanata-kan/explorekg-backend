import request from 'supertest';
import { createApp } from '../../src/app';

describe('Health Endpoint', () => {
  const app = createApp();

  describe('GET /api/health', () => {
    it('should return 200 status and JSON response', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: expect.any(Boolean),
          message: expect.any(String),
        })
      );
    });

    it('should return success: true in response body', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.success).toBe(true);
    });

    it('should include timestamp in response', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });
  });
});
