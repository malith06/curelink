const request = require('supertest');
const app = require('../src/app');

describe('Health API Endpoints', () => {
  describe('GET /api/v1/health', () => {
    it('should return 200 OK and health status', async () => {
      const response = await request(app).get('/api/v1/health');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('CureLink API is running perfectly');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Undefined Routes handling', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/api/v1/unknown');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Cannot find/);
    });
  });
});
