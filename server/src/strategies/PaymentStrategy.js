// ============================================================================
// STRATEGY DESIGN PATTERN — Payment Module
// ============================================================================
// This file defines the common contract (interface) for all payment strategies.
//
// In JavaScript there are no interfaces, so we use an abstract base class that
// every concrete strategy MUST extend. It declares the single method every
// strategy must implement: executePayment(amount, context).
//
//   PaymentStrategy (interface / abstract class)
//        |-- CashOnDeliveryStrategy
//        |-- MockCardPaymentStrategy
//
// PaymentContext holds a reference to a PaymentStrategy and delegates the
// actual payment work to it. The strategy can be swapped at runtime, which is
// the core idea of the Strategy pattern: "encapsulate a family of algorithms
// and make them interchangeable".
// ============================================================================

export class PaymentStrategy {
  /**
   * Executes a payment.
   * MUST be overridden by concrete strategies.
   *
   * @param {number} amount   - Amount to charge (in LKR)
   * @param {object} meta     - Extra info (e.g. simulated card details)
   * @returns {{ success: boolean, transactionId: string|null, message: string }}
   */
  executePayment(amount, meta = {}) {
    throw new Error('executePayment() must be implemented by a concrete strategy');
  }

  /** Human readable name of the strategy (used for the payments table). */
  get name() {
    return this.constructor.name;
  }
}
