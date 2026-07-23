const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const Pharmacy = require('../src/modules/pharmacies/pharmacy.model');
const Medicine = require('../src/modules/medicines/medicine.model');
const Availability = require('../src/modules/availability/availability.model');
const jwt = require('jsonwebtoken');

describe('Availability APIs', () => {
  jest.setTimeout(30000);
  
  let token;
  let unapprovedToken;
  let pharmacyId;
  let medicineId;
  
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    await Availability.deleteMany({});
    
    // Create Medicine
    const med = await Medicine.create({
      name: 'Paracetamol',
      brand: 'Panadol',
      category: 'Painkiller',
      description: 'Used to treat pain and fever',
      manufacturer: 'GSK',
      createdBy: new mongoose.Types.ObjectId()
    });
    medicineId = med._id;
    
    // Create an approved pharmacy
    const user = await User.create({
      email: 'approved@curelink.com',
      passwordHash: 'password123',
      role: 'PHARMACY',
      fullName: 'Test Approved',
      phone: '0771234567'
    });
    
    const pharmacy = await Pharmacy.create({
      ownerUserId: user._id,
      name: 'Approved Pharmacy',
      registrationNumber: 'REG-APP',
      phone: '0771234567',
      email: 'approved@curelink.com',
      address: {
        line1: '123 Main St',
        city: 'Kandy',
        district: 'Kandy'
      },
      verificationStatus: 'APPROVED',
      location: {
        type: 'Point',
        coordinates: [79.86, 6.92]
      }
    });
    pharmacyId = pharmacy._id;
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Create an unapproved pharmacy
    const unapprovedUser = await User.create({
      email: 'pending@curelink.com',
      passwordHash: 'password123',
      role: 'PHARMACY',
      fullName: 'Test Pending',
      phone: '0771234568'
    });
    
    await Pharmacy.create({
      ownerUserId: unapprovedUser._id,
      name: 'Pending Pharmacy',
      registrationNumber: 'REG-PEN',
      phone: '0771234568',
      email: 'pending@curelink.com',
      address: {
        line1: '123 Main St',
        city: 'Kandy',
        district: 'Kandy'
      },
      verificationStatus: 'PENDING',
      location: {
        type: 'Point',
        coordinates: [79.86, 6.92]
      }
    });
    unapprovedToken = jwt.sign({ id: unapprovedUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  });

  describe('PUT /api/v1/availability/:medicineId', () => {
    it('should allow approved pharmacy to update availability', async () => {
      const res = await request(app)
        .put(`/api/v1/availability/${medicineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'AVAILABLE',
          notes: 'Fresh stock arrived'
        });
        
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('AVAILABLE');
      expect(res.body.data.notes).toBe('Fresh stock arrived');
      expect(res.body.data.pharmacyId.toString()).toBe(pharmacyId.toString());
    });

    it('should reject unapproved pharmacy from updating availability', async () => {
      const res = await request(app)
        .put(`/api/v1/availability/${medicineId}`)
        .set('Authorization', `Bearer ${unapprovedToken}`)
        .send({
          status: 'AVAILABLE'
        });
        
      expect(res.statusCode).toBe(403);
    });

    it('should validate status enum', async () => {
      const res = await request(app)
        .put(`/api/v1/availability/${medicineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'INVALID_STATUS' // Not allowed
        });
        
      expect(res.statusCode).toBe(400); // Validation error
    });
  });

  describe('GET /api/v1/availability/inventory', () => {
    beforeEach(async () => {
      await Availability.create({
        pharmacyId,
        medicineId,
        status: 'LIMITED'
      });
    });

    it('should fetch availability list for the logged-in pharmacy', async () => {
      const res = await request(app)
        .get('/api/v1/availability/inventory')
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('LIMITED');
      // Should populate medicine
      expect(res.body.data[0].medicineId.name).toBe('Paracetamol');
    });
  });
});
