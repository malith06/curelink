const request = require('supertest');
const app = require('../../app');
const User = require('../users/user.model');
const customerDashboardService = require('./customerDashboard.service');
const pharmacyDashboardService = require('./pharmacyDashboard.service');
const adminDashboardService = require('./adminDashboard.service');
const { generateToken } = require('../../utils/jwt');
const { ROLES } = require('../users/user.constants');

jest.mock('../users/user.model');
jest.mock('./customerDashboard.service');
jest.mock('./pharmacyDashboard.service');
jest.mock('./adminDashboard.service');

describe('Dashboard Endpoints', () => {
  let customerToken, pharmacyToken, adminToken;

  beforeEach(() => {
    jest.clearAllMocks();
    
    customerToken = generateToken({ id: 'c1', role: ROLES.CUSTOMER });
    pharmacyToken = generateToken({ id: 'p1', role: ROLES.PHARMACY });
    adminToken = generateToken({ id: 'a1', role: ROLES.ADMIN });

    User.findById.mockImplementation((id) => {
      if (id === 'c1') return Promise.resolve({ _id: 'c1', role: ROLES.CUSTOMER, isActive: true });
      if (id === 'p1') return Promise.resolve({ _id: 'p1', role: ROLES.PHARMACY, isActive: true, pharmacyId: 'pharm1' });
      if (id === 'a1') return Promise.resolve({ _id: 'a1', role: ROLES.ADMIN, isActive: true });
      return Promise.resolve(null);
    });
  });

  describe('GET /api/v1/dashboards/customer', () => {
    it('should return customer dashboard data successfully', async () => {
      customerDashboardService.getCustomerDashboard.mockResolvedValue({
        summary: {},
        activeRequests: [],
      });

      const res = await request(app)
        .get('/api/v1/dashboards/customer')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
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
      pharmacyDashboardService.getPharmacyDashboard.mockResolvedValue({
        summary: { grossFulfilledOrderValue: 0 },
      });

      const res = await request(app)
        .get('/api/v1/dashboards/pharmacy')
        .set('Authorization', `Bearer ${pharmacyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
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
      adminDashboardService.getAdminDashboard.mockResolvedValue({
        summary: { totalCustomers: 0 },
      });

      const res = await request(app)
        .get('/api/v1/dashboards/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should block non-admins', async () => {
      const res = await request(app)
        .get('/api/v1/dashboards/admin')
        .set('Authorization', `Bearer ${pharmacyToken}`);

      expect(res.status).toBe(403);
    });
  });
});
