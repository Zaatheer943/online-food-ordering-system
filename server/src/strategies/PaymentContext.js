import { PaymentStrategy } from './PaymentStrategy.js';

// ============================================================================
// CONTEXT — PaymentContext
// ============================================================================
// Holds a reference to a PaymentStrategy and delegates payment execution to
// it. The strategy can be set/changed at RUNTIME via setStrategy(), which is
// exactly how the Strategy pattern achieves flexibility without conditional
// logic scattered through the code.
// ============================================================================
export class PaymentContext {
  /**
   * @param {PaymentStrategy} strategy - The payment strategy to use.
   */
  constructor(strategy) {
    if (!(strategy instanceof PaymentStrategy)) {
      throw new Error('PaymentContext requires a PaymentStrategy instance');
    }
    this.strategy = strategy;
  }

  /** Swap the strategy at runtime. */
  setStrategy(strategy) {
    if (!(strategy instanceof PaymentStrategy)) {
      throw new Error('setStrategy() requires a PaymentStrategy instance');
    }
    this.strategy = strategy;
  }

  /**
   * Execute the currently configured payment strategy.
   * @param {number} amount
   * @param {object} meta
   */
  execute(amount, meta = {}) {
    return this.strategy.executePayment(amount, meta);
  }

  /** Name of the active strategy (for logging / DB storage). */
  getStrategyName() {
    return this.strategy.name;
  }
}
