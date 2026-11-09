import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listPaymentMethods, processPayment } from '../controllers/orderController.js';

const router = Router();
router.get('/methods', listPaymentMethods);
// Demonstrates the Strategy pattern standalone (no order created).
router.post('/process', authenticate, processPayment);
export default router;
