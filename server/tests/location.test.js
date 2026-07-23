const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const Pharmacy = require('../src/modules/pharmacies/pharmacy.model');
const jwt = require('jsonwebtoken');

describe('Location & Geospatial APIs', () => {
  let token;
  let userId;
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    
    // Create an approved pharmacy user
    const user = await User.create({
      email: 'testpharmacy@curelink.com',
      password: 'password123',
      role: 'PHARMACY',
      firstName: 'Test',
      lastName: 'Pharmacy',
      phone: '0771234567'
    });
    
    userId = user._id;
    
    // Create an approved profile
    await Pharmacy.create({
      ownerUserId: user._id,
      businessName: 'Test Pharmacy Inc',
      address: '123 Main St, Kandy',
      registrationNumber: 'REG123',
      verificationStatus: 'APPROVED'
    });
    
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  });

  describe('PATCH /api/v1/pharmacies/me/location', () => {
    it('should update pharmacy location with valid coordinates', async () => {
      const res = await request(app)
        .patch('/api/v1/pharmacies/me/location')
        .set('Authorization', `Bearer ${token}`)
        .send({
          latitude: 7.2906,
          longitude: 80.6337
        });
        
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.location.type).toBe('Point');
      expect(res.body.data.location.coordinates[0]).toBe(80.6337);
      expect(res.body.data.location.coordinates[1]).toBe(7.2906);
    });

    it('should reject invalid coordinates', async () => {
      const res = await request(app)
        .patch('/api/v1/pharmacies/me/location')
        .set('Authorization', `Bearer ${token}`)
        .send({
          latitude: 100, // Invalid latitude
          longitude: 80.6337
        });
        
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/pharmacies/nearby', () => {
    beforeEach(async () => {
      // Set location for our test pharmacy (Kandy)
      await request(app)
        .patch('/api/v1/pharmacies/me/location')
        .set('Authorization', `Bearer ${token}`)
        .send({
          latitude: 7.2906,
          longitude: 80.6337
        });
        
      // Create a second pharmacy far away (Colombo)
      const user2 = await User.create({
        email: 'colombopharmacy@curelink.com',
        password: 'password123',
        role: 'PHARMACY',
        firstName: 'Colombo',
        lastName: 'Pharmacy',
        phone: '0777654321'
      });
      
      await Pharmacy.create({
        ownerUserId: user2._id,
        businessName: 'Colombo Pharmacy',
        address: 'Colombo',
        registrationNumber: 'REG456',
        verificationStatus: 'APPROVED',
        location: {
          type: 'Point',
          coordinates: [79.8612, 6.9271] // Lng, Lat for Colombo
        }
      });
    });

    it('should find nearby pharmacies within radius', async () => {
      // Query near Kandy with 10km radius
      const res = await request(app)
        .get('/api/v1/pharmacies/nearby')
        .query({
          lat: 7.29,
          lng: 80.63,
          radius: 10000 // 10km
        });
        
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].businessName).toBe('Test Pharmacy Inc');
      expect(res.body.data[0].distance).toBeDefined(); // Should calculate distance
    });

    it('should not find pharmacies outside the radius', async () => {
      // Query near Galle (far from both Kandy and Colombo)
      const res = await request(app)
        .get('/api/v1/pharmacies/nearby')
        .query({
          lat: 6.0535,
          lng: 80.2210,
          radius: 10000 // 10km
        });
        
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });
  });
});
