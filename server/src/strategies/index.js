import { CashOnDeliveryStrategy } from './CashOnDeliveryStrategy.js';
import { MockCardPaymentStrategy } from './MockCardPaymentStrategy.js';
import { PaymentContext } from './PaymentContext.js';

// ============================================================================
// STRATEGY REGISTRY / FACTORY
// ============================================================================
// Maps a payment method key (sent by the client) to its concrete strategy
// class. This is where the runtime selection happens — the caller asks for a
// strategy by name and gets back a ready-to-use PaymentContext.
// ============================================================================
const STRATEGIES = {
  'cod':  CashOnDeliveryStrategy,
  'card': MockCardPaymentStrategy
};

export const PAYMENT_METHODS = [
  { key: 'cod',  label: 'Cash on Delivery', description: 'Pay when your order arrives.' },
  { key: 'card', label: 'Card Payment',     description: 'Simulated card payment (demo only).' }
];

/**
 * Creates a PaymentContext configured with the requested strategy.
 * @param {string} methodKey - 'cod' or 'card'
 * @returns {PaymentContext}
 */
export function createPaymentContext(methodKey = 'cod') {
  const StrategyClass = STRATEGIES[methodKey];
  if (!StrategyClass) {
    throw new Error(`Unsupported payment method: ${methodKey}`);
  }
  return new PaymentContext(new StrategyClass());
}
