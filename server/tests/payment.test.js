const mongoose = require('mongoose');
const paymentService = require('../src/modules/payments/payment.service');
const Order = require('../src/modules/orders/order.model');
const Payment = require('../src/modules/payments/payment.model');
const PaymentEvent = require('../src/modules/payment-events/paymentEvent.model');
const Pharmacy = require('../src/modules/pharmacies/pharmacy.model');
const stripeSandboxAdapter = require('../src/modules/payment-gateways/stripeSandbox.adapter');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../src/modules/orders/order.constants');
const { PAYMENT_PROVIDER, GATEWAY_EVENT } = require('../src/modules/payments/payment.constants');

jest.mock('../src/modules/orders/order.model');
jest.mock('../src/modules/payments/payment.model');
jest.mock('../src/modules/payment-events/paymentEvent.model');
jest.mock('../src/modules/pharmacies/pharmacy.model');
jest.mock('../src/modules/payment-gateways/stripeSandbox.adapter');
jest.mock('../src/modules/notifications/notification.service');

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    startSession: jest.fn()
  };
});

describe('Payment Service Business Rules', () => {
  let mockSession;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn()
    };
    Order.startSession.mockResolvedValue(mockSession);
  });

  describe('handleWebhookEvent', () => {
    it('should throw error on invalid signature', async () => {
      stripeSandboxAdapter.verifyWebhookSignature.mockRejectedValue(new Error('Invalid signature'));

      await expect(paymentService.handleWebhookEvent('rawBody', 'bad-sig'))
        .rejects.toThrow('Invalid signature');
    });

    it('should acknowledge duplicate event without processing', async () => {
      stripeSandboxAdapter.verifyWebhookSignature.mockResolvedValue({ id: 'evt_1' });
      stripeSandboxAdapter.parseWebhookEvent.mockResolvedValue({
        eventId: 'evt_1',
        eventType: GATEWAY_EVENT.PAYMENT_SUCCEEDED
      });

      // Simulate unique index duplicate key error
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;
      PaymentEvent.create.mockRejectedValue(duplicateError);

      // Find returns already processed event
      PaymentEvent.findOne.mockResolvedValue({ processed: true });

      const result = await paymentService.handleWebhookEvent('rawBody', 'good-sig');
      expect(result.acknowledged).toBe(true);
      expect(result.alreadyProcessed).toBe(true);
      expect(Order.startSession).not.toHaveBeenCalled();
    });

    it('should process PAYMENT_SUCCEEDED and update payment and order', async () => {
      stripeSandboxAdapter.verifyWebhookSignature.mockResolvedValue({ id: 'evt_1' });
      stripeSandboxAdapter.parseWebhookEvent.mockResolvedValue({
        eventId: 'evt_1',
        eventType: GATEWAY_EVENT.PAYMENT_SUCCEEDED,
        metadata: { paymentId: 'pay1' },
        gatewayPaymentReference: 'pi_123'
      });

      const mockPaymentEvent = { save: jest.fn() };
      PaymentEvent.create.mockResolvedValue(mockPaymentEvent);

      const mockPayment = {
        _id: 'pay1',
        orderId: 'order1',
        status: PAYMENT_STATUS.PROCESSING,
        save: jest.fn()
      };
      Payment.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockPayment) });

      const mockOrder = {
        _id: 'order1',
        orderStatus: ORDER_STATUS.PENDING_PAYMENT,
        paymentStatus: PAYMENT_STATUS.PENDING,
        statusHistory: [],
        save: jest.fn()
      };
      Order.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrder) });

      const mockPharmacy = {
        _id: 'pharmacy1',
        ownerUserId: 'owner1'
      };
      Pharmacy.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockPharmacy) });

      const result = await paymentService.handleWebhookEvent('rawBody', 'good-sig');

      expect(result.acknowledged).toBe(true);
      expect(mockPayment.status).toBe(PAYMENT_STATUS.PAID);
      expect(mockPayment.gatewayPaymentReference).toBe('pi_123');
      expect(mockPayment.save).toHaveBeenCalled();

      expect(mockOrder.paymentMethod).toBe(PAYMENT_METHOD.CARD);
      expect(mockOrder.paymentStatus).toBe(PAYMENT_STATUS.PAID);
      expect(mockOrder.orderStatus).toBe(ORDER_STATUS.PAYMENT_CONFIRMED);
      expect(mockOrder.save).toHaveBeenCalled();

      expect(mockPaymentEvent.processed).toBe(true);
      expect(mockPaymentEvent.processingStatus).toBe('SUCCESS');
      expect(mockPaymentEvent.save).toHaveBeenCalled();
      
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('selectCOD', () => {
    it('should fail if order state is not PENDING_PAYMENT', async () => {
      Order.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: 'o1', orderStatus: ORDER_STATUS.PAYMENT_CONFIRMED })
      });

      await expect(paymentService.selectCOD('o1', 'c1'))
        .rejects.toThrow('Order is not in a state that accepts payment');
    });

    it('should fail if pharmacy does not allow COD', async () => {
      Order.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: 'o1', orderStatus: ORDER_STATUS.PENDING_PAYMENT, pharmacyId: 'p1' })
      });
      Pharmacy.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: 'p1', codAvailable: false })
      });

      await expect(paymentService.selectCOD('o1', 'c1'))
        .rejects.toThrow('Cash on Delivery is not available for this pharmacy');
    });

    it('should successfully select COD', async () => {
      const mockOrder = {
        _id: 'o1',
        orderStatus: ORDER_STATUS.PENDING_PAYMENT,
        pharmacyId: 'p1',
        total: 1000,
        statusHistory: [],
        save: jest.fn()
      };
      Order.findOne.mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrder) });
      
      Pharmacy.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: 'p1', codAvailable: true })
      });

      const mockPaymentSave = jest.fn();
      Payment.mockImplementation(() => ({
        _id: 'pay1',
        paymentNumber: 'PAY-123',
        status: PAYMENT_STATUS.COD_PENDING,
        save: mockPaymentSave
      }));

      const result = await paymentService.selectCOD('o1', 'c1');

      expect(mockPaymentSave).toHaveBeenCalled();
      expect(mockOrder.paymentMethod).toBe(PAYMENT_METHOD.COD);
      expect(mockOrder.paymentStatus).toBe(PAYMENT_STATUS.COD_PENDING);
      expect(mockOrder.orderStatus).toBe(ORDER_STATUS.PAYMENT_CONFIRMED);
      expect(mockOrder.save).toHaveBeenCalled();
      
      expect(result.status).toBe(PAYMENT_STATUS.COD_PENDING);
    });
  });

  describe('collectCOD', () => {
    it('should fail if unauthorized pharmacy user tries to collect', async () => {
      const mockOrder = { _id: 'o1', pharmacyId: 'p1' };
      Order.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrder) });
      
      Pharmacy.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: 'p2' }) // Different pharmacy
      });

      await expect(paymentService.collectCOD('o1', 'user1'))
        .rejects.toThrow('Not authorized to collect payment for this order');
    });

    it('should fail if order is not pending COD collection', async () => {
      const mockOrder = { 
        _id: 'o1', 
        pharmacyId: 'p1',
        paymentMethod: PAYMENT_METHOD.CARD
      };
      Order.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrder) });
      Pharmacy.findOne.mockReturnValue({ session: jest.fn().mockResolvedValue({ _id: 'p1' }) });

      await expect(paymentService.collectCOD('o1', 'user1'))
        .rejects.toThrow('Order is not pending COD collection');
    });

    it('should successfully mark COD as collected', async () => {
      const mockOrder = { 
        _id: 'o1', 
        pharmacyId: 'p1',
        paymentMethod: PAYMENT_METHOD.COD,
        paymentStatus: PAYMENT_STATUS.COD_PENDING,
        orderStatus: ORDER_STATUS.DELIVERED,
        paymentId: 'pay1',
        save: jest.fn()
      };
      Order.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrder) });
      Pharmacy.findOne.mockReturnValue({ session: jest.fn().mockResolvedValue({ _id: 'p1' }) });

      const mockPayment = {
        _id: 'pay1',
        status: PAYMENT_STATUS.COD_PENDING,
        save: jest.fn()
      };
      Payment.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockPayment) });

      const result = await paymentService.collectCOD('o1', 'user1');

      expect(mockPayment.status).toBe(PAYMENT_STATUS.COD_COLLECTED);
      expect(mockPayment.codCollectedBy).toBe('user1');
      expect(mockPayment.save).toHaveBeenCalled();

      expect(mockOrder.paymentStatus).toBe(PAYMENT_STATUS.COD_COLLECTED);
      expect(mockOrder.save).toHaveBeenCalled();

      expect(result.status).toBe(PAYMENT_STATUS.COD_COLLECTED);
    });
  });
});
