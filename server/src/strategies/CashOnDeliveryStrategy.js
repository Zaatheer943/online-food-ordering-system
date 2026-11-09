import { PaymentStrategy } from './PaymentStrategy.js';
import crypto from 'node:crypto';

// ============================================================================
// CONCRETE STRATEGY 1 — Cash on Delivery (COD)
// ============================================================================
// No online charge happens. The customer pays the delivery person when the
// order arrives. This strategy simply "authorises" the order for the given
// amount and returns a successful result with a COD transaction reference.
// ============================================================================
export class CashOnDeliveryStrategy extends PaymentStrategy {
  executePayment(amount) {
    // Simulate a tiny processing delay so behaviour matches other strategies
    const transactionId = `COD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    return {
      success: true,
      transactionId,
      message: `Cash on Delivery order confirmed. Pay LKR ${amount.toFixed(2)} on delivery.`,
      method: 'Cash on Delivery'
    };
  }
}
