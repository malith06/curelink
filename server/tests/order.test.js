const mongoose = require('mongoose');
const orderService = require('../src/modules/orders/order.service');
const Order = require('../src/modules/orders/order.model');
const Quotation = require('../src/modules/quotations/quotation.model');
const MedicineRequest = require('../src/modules/requests/request.model');
const User = require('../src/modules/users/user.model');
const Pharmacy = require('../src/modules/pharmacies/pharmacy.model');
const { ORDER_STATUS, FULFILMENT_METHOD, CHANGE_SOURCE } = require('../src/modules/orders/order.constants');
const { REQUEST_STATUS } = require('../src/modules/requests/request.constants');

jest.mock('../src/modules/orders/order.model');
jest.mock('../src/modules/quotations/quotation.model');
jest.mock('../src/modules/requests/request.model');
jest.mock('../src/modules/users/user.model');
jest.mock('../src/modules/pharmacies/pharmacy.model');

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    startSession: jest.fn()
  };
});

describe('Order Service Business Rules', () => {
  let mockSession;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = {
      withTransaction: jest.fn(async (cb) => {
        await cb();
      }),
      endSession: jest.fn()
    };
    mongoose.startSession.mockResolvedValue(mockSession);
  });

  describe('createOrderFromQuotation', () => {
    it('should return existing order if idempotency key matches', async () => {
      Order.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: 'existing-order-id' })
      });

      const order = await orderService.createOrderFromQuotation('customerId', 'quotationId', {});
      expect(order._id).toBe('existing-order-id');
    });

    it('should block if quotation is not ACCEPTED', async () => {
      Order.findOne.mockReturnValue({ session: jest.fn().mockResolvedValue(null) });
      Quotation.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue({ status: 'SUBMITTED' })
      });

      await expect(orderService.createOrderFromQuotation('customerId', 'quotationId', {}))
        .rejects.toThrow('Only accepted quotations can be converted to orders');
    });

    it('should successfully create order and update request status', async () => {
      Order.findOne.mockReturnValue({ session: jest.fn().mockResolvedValue(null) });
      
      const mockQuotation = {
        _id: 'q1',
        status: 'ACCEPTED',
        requestId: 'r1',
        pharmacyId: 'p1',
        items: [
          {
            _id: 'qi1',
            requestItemId: 'ri1',
            medicineId: 'm1',
            quantity: 2,
            unitPrice: 1000,
            availabilityResult: 'AVAILABLE',
            medicineSnapshot: { genericName: 'MedA' }
          }
        ]
      };
      Quotation.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockQuotation) });

      const mockRequest = {
        _id: 'r1',
        customerId: 'customerId',
        status: REQUEST_STATUS.QUOTATION_ACCEPTED,
        statusTimeline: [],
        save: jest.fn()
      };
      MedicineRequest.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockRequest) });

      User.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: 'customerId', name: 'John Doe', email: 'j@d.com', phone: '123' })
      });

      Pharmacy.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: 'p1', name: 'Pharma', registrationNumber: '123', phone: '1', email: 'e', address: {} })
      });

      const mockSave = jest.fn().mockResolvedValue({ _id: 'new-order-id' });
      Order.mockImplementation(() => ({ save: mockSave }));

      const payload = {
        fulfilmentMethod: FULFILMENT_METHOD.DELIVERY,
        deliveryAddress: { fullName: 'John Doe', phone: '123', line1: 'line1', city: 'city', district: 'dist', country: 'LK' }
      };

      const result = await orderService.createOrderFromQuotation('customerId', 'quotationId', payload);
      
      expect(mockSave).toHaveBeenCalled();
      expect(mockRequest.status).toBe(REQUEST_STATUS.CONVERTED_TO_ORDER);
      expect(mockRequest.save).toHaveBeenCalled();
      expect(result._id).toBe('new-order-id');
    });
  });

  describe('cancelOrder', () => {
    it('should block cancellation if state does not allow it', async () => {
      Order.findById.mockResolvedValue({
        _id: 'o1',
        customerId: 'customerId',
        orderStatus: ORDER_STATUS.PREPARING,
        fulfilmentMethod: FULFILMENT_METHOD.DELIVERY
      });

      await expect(orderService.cancelOrder('o1', 'customerId', 'changed mind'))
        .rejects.toThrow('Order cannot be cancelled at this stage');
    });

    it('should cancel successfully in PENDING_PAYMENT state', async () => {
      const mockOrder = {
        _id: 'o1',
        customerId: 'customerId',
        orderStatus: ORDER_STATUS.PENDING_PAYMENT,
        fulfilmentMethod: FULFILMENT_METHOD.DELIVERY,
        statusHistory: [],
        save: jest.fn()
      };
      Order.findById.mockResolvedValue(mockOrder);

      const result = await orderService.cancelOrder('o1', 'customerId', 'changed mind');
      expect(result.orderStatus).toBe(ORDER_STATUS.CANCELLED);
      expect(result.customerCancellation.reason).toBe('changed mind');
      expect(mockOrder.save).toHaveBeenCalled();
    });
  });
});
