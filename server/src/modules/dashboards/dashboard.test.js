const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../users/user.model');
const Pharmacy = require('../pharmacies/pharmacy.model');
const { ROLES } = require('../users/user.constants');
const { signToken } = require('../auth/auth.service');

describe('Dashboard Endpoints', () => {
  let customerToken, pharmacyToken, adminToken;
  let customer, pharmacyUser, adminUser, pharmacy;

  beforeAll(async () => {
    // Setup users
    customer = await User.create({
      name: 'Customer Dash',
      email: 'customer.dash@example.com',
      password: 'Password123!',
      role: ROLES.CUSTOMER,
      phone: '0711111111',
    });
    customerToken = signToken(customer._id);

    adminUser = await User.create({
      name: 'Admin Dash',
      email: 'admin.dash@example.com',
      password: 'Password123!',
      role: ROLES.ADMIN,
      phone: '0711111112',
    });
    adminToken = signToken(adminUser._id);

    pharmacy = await Pharmacy.create({
      name: 'Dash Pharmacy',
      licenseNumber: 'DASH-123',
      contactEmail: 'dash.pharmacy@example.com',
      phone: '0112222222',
      address: { street: 'Main', city: 'Colombo', location: { type: 'Point', coordinates: [79, 6] } }
    });

    pharmacyUser = await User.create({
      name: 'Pharmacy Dash',
      email: 'pharmacy.dash@example.com',
      password: 'Password123!',
      role: ROLES.PHARMACY,
      phone: '0711111113',
      pharmacyId: pharmacy._id,
    });
    pharmacyToken = signToken(pharmacyUser._id);
  });

  afterAll(async () => {
    await User.deleteMany({ email: /dash@example\.com/ });
    await Pharmacy.deleteMany({ name: 'Dash Pharmacy' });
  });

  describe('GET /api/v1/dashboards/customer', () => {
    it('should return customer dashboard data successfully', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/customer')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.activeRequests).toBeInstanceOf(Array);
    });

    it('should block non-customers', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/customer')
        .set('Authorization', `Bearer ${pharmacyToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/dashboards/pharmacy', () => {
    it('should return pharmacy dashboard data successfully', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/pharmacy')
        .set('Authorization', `Bearer ${pharmacyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.grossFulfilledOrderValue).toBeDefined();
    });

    it('should block non-pharmacies', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/pharmacy')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/dashboards/admin', () => {
    it('should return admin dashboard data successfully', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalCustomers).toBeDefined();
    });

    it('should block non-admins', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/admin')
        .set('Authorization', `Bearer ${pharmacyToken}`);

      expect(res.status).toBe(403);
    });
  });
});
