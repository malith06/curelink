const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');

jest.mock('../src/modules/users/user.model');

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register/customer', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/api/v1/auth/register/customer').send({});
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 if passwords do not match', async () => {
      const response = await request(app).post('/api/v1/auth/register/customer').send({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'Password123!',
        confirmPassword: 'Password123'
      });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should successfully register a customer', async () => {
      User.create.mockResolvedValue({
        _id: 'mockId',
        role: 'CUSTOMER',
        fullName: 'Test User',
        email: 'test@example.com',
        toJSON: () => ({
          id: 'mockId',
          fullName: 'Test User',
          email: 'test@example.com',
          role: 'CUSTOMER'
        })
      });

      const response = await request(app).post('/api/v1/auth/register/customer').send({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should successfully login a user', async () => {
      const mockUser = {
        _id: 'mockId',
        isActive: true,
        role: 'CUSTOMER',
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        toJSON: () => ({
          id: 'mockId',
          email: 'test@example.com',
          role: 'CUSTOMER'
        })
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!'
      });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });
  });
});
