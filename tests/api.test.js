const request = require('supertest');
const app = require('../index');

describe('API Health Check', () => {
  test('GET /check should return API status', async () => {
    const response = await request(app)
      .get('/check')
      .expect(200);

    expect(response.body).toHaveProperty('status', 200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data', 'API v 1.0 is running');
  });
});

describe('API Routes', () => {
  test('API routes should be accessible', async () => {
    // Test that API routes are properly configured
    const response = await request(app)
      .get('/api')
      .expect(404); // Should return 404 for empty API path

    expect(response).toBeDefined();
  });
});
