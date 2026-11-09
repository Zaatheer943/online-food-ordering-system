import { PaymentStrategy } from './PaymentStrategy.js';
import crypto from 'node:crypto';

// ============================================================================
// CONCRETE STRATEGY 2 — Mock Card Payment
// ============================================================================
// SIMULATED card payment for academic demonstration ONLY.
//
// IMPORTANT: This strategy never receives, stores or validates real card
// numbers, CVV codes or banking credentials. It only accepts a fake display
// name and simulates a gateway round-trip (validation + approval) so the
// Strategy pattern can be demonstrated end-to-end.
// ============================================================================
export class MockCardPaymentStrategy extends PaymentStrategy {
  executePayment(amount, meta = {}) {
    // Simulate basic input checks on NON-sensitive demo data only.
    if (!meta.cardHolderName || String(meta.cardHolderName).trim().length < 3) {
      return {
        success: false,
        transactionId: null,
        message: 'Card holder name is required for card payment.',
        method: 'Card Payment'
      };
    }

    // Simulate gateway processing: generate a mock transaction reference.
    const transactionId = `CARD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    // Simulate an occasional decline for realism (deterministic demo option):
    // card numbers ending in "0000" are treated as declined.
    if (meta.demoCardNumber && String(meta.demoCardNumber).endsWith('0000')) {
      return {
        success: false,
        transactionId: null,
        message: 'Payment declined by mock gateway. Please try another card.',
        method: 'Card Payment'
      };
    }

    return {
      success: true,
      transactionId,
      message: `Card payment of LKR ${amount.toFixed(2)} approved (simulated).`,
      method: 'Card Payment'
    };
  }
}
