const {
  toCents,
  fromCents,
  calculateItemSubtotal,
  calculateQuotationTotal,
  calculateItemAvailability,
  calculateQuotationCompleteness
} = require('../src/modules/quotations/quotation.calculator');
const { AVAILABILITY_RESULT } = require('../src/modules/quotations/quotation.constants');

describe('Quotation Calculator and Business Rules', () => {
  describe('Money Conversion', () => {
    it('should correctly convert standard decimal to cents (toCents)', () => {
      expect(toCents(10.50)).toBe(1050);
      expect(toCents(100.01)).toBe(10001);
      expect(toCents(0.99)).toBe(99);
      expect(toCents('15.50')).toBe(1550);
      // Floating point precision handling
      expect(toCents(0.1 + 0.2)).toBe(30); 
      
      expect(toCents(null)).toBeNull();
      expect(toCents(undefined)).toBeNull();
      expect(toCents('invalid')).toBeNull();
    });

    it('should correctly convert cents to standard decimal (fromCents)', () => {
      expect(fromCents(1050)).toBe(10.50);
      expect(fromCents(10001)).toBe(100.01);
      expect(fromCents(99)).toBe(0.99);
      
      expect(fromCents(null)).toBeNull();
      expect(fromCents(undefined)).toBeNull();
      expect(fromCents('invalid')).toBeNull();
    });
  });

  describe('Subtotals and Totals', () => {
    it('should calculate item subtotal in cents', () => {
      expect(calculateItemSubtotal(5, 1050)).toBe(5250);
      expect(calculateItemSubtotal(0, 1050)).toBe(0);
      expect(calculateItemSubtotal(5, 0)).toBe(0);
    });

    it('should calculate overall quotation total in cents', () => {
      const items = [
        { subtotal: 1000 },
        { subtotal: 2000 }
      ];
      expect(calculateQuotationTotal(items, 500)).toBe(3500); // 1000 + 2000 + 500
      expect(calculateQuotationTotal(items)).toBe(3000);
      expect(calculateQuotationTotal([], 500)).toBe(500);
      expect(calculateQuotationTotal(null, 500)).toBe(500);
    });
  });

  describe('Item Availability and Completeness', () => {
    it('should determine correct availability result', () => {
      expect(calculateItemAvailability(10, 10)).toBe(AVAILABILITY_RESULT.FULLY_AVAILABLE);
      expect(calculateItemAvailability(10, 15)).toBe(AVAILABILITY_RESULT.FULLY_AVAILABLE);
      expect(calculateItemAvailability(10, 5)).toBe(AVAILABILITY_RESULT.PARTIALLY_AVAILABLE);
      expect(calculateItemAvailability(10, 0)).toBe(AVAILABILITY_RESULT.UNAVAILABLE);
      expect(calculateItemAvailability(10, null)).toBe(AVAILABILITY_RESULT.UNAVAILABLE);
    });

    it('should calculate overall completeness metrics correctly for full availability', () => {
      const items = [
        { requestedQuantity: 10, availableQuantity: 10 },
        { requestedQuantity: 5, availableQuantity: 10 } // oversupplied
      ];
      
      const metrics = calculateQuotationCompleteness(items);
      
      expect(metrics.totalRequested).toBe(15);
      expect(metrics.totalAvailable).toBe(15); // capped at requested for percentage
      expect(metrics.coveragePercentage).toBe(100);
      expect(metrics.fullyAvailableCount).toBe(2);
      expect(metrics.partiallyAvailableCount).toBe(0);
      expect(metrics.unavailableCount).toBe(0);
      expect(metrics.isCompleteFulfilment).toBe(true);
    });

    it('should calculate overall completeness metrics correctly for partial availability', () => {
      const items = [
        { requestedQuantity: 10, availableQuantity: 5 },
        { requestedQuantity: 5, availableQuantity: 0 },
        { requestedQuantity: 10, availableQuantity: 10 }
      ];
      
      const metrics = calculateQuotationCompleteness(items);
      
      expect(metrics.totalRequested).toBe(25);
      expect(metrics.totalAvailable).toBe(15);
      expect(metrics.coveragePercentage).toBe(60);
      expect(metrics.fullyAvailableCount).toBe(1);
      expect(metrics.partiallyAvailableCount).toBe(1);
      expect(metrics.unavailableCount).toBe(1);
      expect(metrics.isCompleteFulfilment).toBe(false);
    });

    it('should handle empty items array', () => {
      const metrics = calculateQuotationCompleteness([]);
      expect(metrics.totalRequested).toBe(0);
      expect(metrics.coveragePercentage).toBe(0);
      expect(metrics.isCompleteFulfilment).toBe(false);
    });
  });
});

const quotationService = require('../src/modules/quotations/quotation.service');
const Quotation = require('../src/modules/quotations/quotation.model');
const MedicineRequest = require('../src/modules/requests/request.model');
const PrescriptionVerification = require('../src/modules/prescription-verifications/verification.model');
const { QUOTATION_STATUS } = require('../src/modules/quotations/quotation.constants');
const requestService = require('../src/modules/requests/request.service');
const mongoose = require('mongoose');

jest.mock('../src/modules/quotations/quotation.model');
jest.mock('../src/modules/requests/request.model');
jest.mock('../src/modules/prescription-verifications/verification.model');
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    startSession: jest.fn()
  };
});

describe('Quotation Business Rules', () => {
  let mockSession;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn()
    };
    mongoose.startSession.mockResolvedValue(mockSession);
  });

  describe('submitQuotation (Pharmacy)', () => {
    it('should block submission if total is 0', async () => {
      Quotation.findOne.mockResolvedValue({
        _id: 'q1',
        status: QUOTATION_STATUS.DRAFT,
        deliveryAvailable: true,
        preparationMinutes: 15,
        expiresAt: new Date(Date.now() + 100000),
        total: 0,
        items: [],
        requestId: 'r1'
      });

      MedicineRequest.findById.mockResolvedValue({
        _id: 'r1',
        requiresPrescription: false
      });

      await expect(quotationService.submitQuotation('q1', 'pharmacy1'))
        .rejects
        .toThrow('Cannot submit a quotation with a total value of 0');
    });

    it('should block submission if prescription is required but not verified', async () => {
      Quotation.findOne.mockResolvedValue({
        _id: 'q1',
        status: QUOTATION_STATUS.DRAFT,
        deliveryAvailable: true,
        preparationMinutes: 15,
        expiresAt: new Date(Date.now() + 100000),
        total: 1500, // 15.00
        items: [{ availableQuantity: 1, unitPrice: 1500, subtotal: 1500 }],
        requestId: 'r1',
        pharmacyId: 'pharmacy1',
        save: jest.fn()
      });

      MedicineRequest.findById.mockResolvedValue({
        _id: 'r1',
        requiresPrescription: true,
        status: 'PENDING' // or QUOTATIONS_RECEIVED
      });

      PrescriptionVerification.findOne.mockResolvedValue({
        status: 'REJECTED' // not verified
      });

      await expect(quotationService.submitQuotation('q1', 'pharmacy1'))
        .rejects
        .toThrow('You must verify the prescription before submitting a quotation for this request');
    });

    it('should successfully submit quotation and update request status', async () => {
      const mockSave = jest.fn();
      const mockRequestSave = jest.fn();

      Quotation.findOne.mockResolvedValue({
        _id: 'q1',
        status: QUOTATION_STATUS.DRAFT,
        deliveryAvailable: true,
        preparationMinutes: 15,
        expiresAt: new Date(Date.now() + 100000),
        total: 1500,
        items: [{ availableQuantity: 1, unitPrice: 1500, subtotal: 1500 }],
        requestId: 'r1',
        pharmacyId: 'pharmacy1',
        save: mockSave
      });

      MedicineRequest.findById.mockResolvedValue({
        _id: 'r1',
        requiresPrescription: false, // skipping verification check
        status: 'PENDING',
        save: mockRequestSave
      });

      MedicineRequest.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await quotationService.submitQuotation('q1', 'pharmacy1');

      expect(mockSave).toHaveBeenCalled();
      expect(MedicineRequest.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('acceptQuotation (Customer)', () => {
    it('should accept a quotation and decline others atomically', async () => {
      const mockRequestSave = jest.fn();
      const mockQuotationSave = jest.fn();

      const mockRequest = {
        _id: 'r1',
        status: 'QUOTATIONS_RECEIVED',
        save: mockRequestSave
      };

      const mockQuotation = {
        _id: 'q1',
        status: QUOTATION_STATUS.SUBMITTED,
        save: mockQuotationSave
      };

      MedicineRequest.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockRequest)
      });

      Quotation.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockQuotation)
      });

      Quotation.updateMany.mockResolvedValue({ modifiedCount: 2 });

      await requestService.acceptQuotation('r1', 'q1', 'customer1');

      expect(mockRequest.status).toBe('QUOTATION_ACCEPTED');
      expect(mockRequest.acceptedQuotationId).toBe('q1');
      expect(mockQuotation.status).toBe(QUOTATION_STATUS.ACCEPTED);
      expect(mockRequestSave).toHaveBeenCalled();
      expect(mockQuotationSave).toHaveBeenCalled();
      expect(Quotation.updateMany).toHaveBeenCalledWith(
        { requestId: 'r1', _id: { $ne: 'q1' }, status: QUOTATION_STATUS.SUBMITTED },
        { $set: { status: QUOTATION_STATUS.DECLINED } },
        { session: mockSession }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should block acceptance if request is not QUOTATIONS_RECEIVED', async () => {
      MedicineRequest.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue({
          _id: 'r1',
          status: 'DRAFT'
        })
      });

      await expect(requestService.acceptQuotation('r1', 'q1', 'customer1'))
        .rejects
        .toThrow(/Cannot accept quotation for a request/);
    });
  });
});
