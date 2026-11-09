import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createOrder, myOrders, myOrderDetail, allOrders, orderDetail, updateOrderStatus
} from '../controllers/orderController.js';

const router = Router();

// Customer routes (must be defined BEFORE /:id admin route)
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, myOrders);
router.get('/my-orders/:id', authenticate, myOrderDetail);

// Admin routes
router.get('/', authenticate, authorize('admin'), allOrders);
router.get('/:id', authenticate, authorize('admin'), orderDetail);
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus);

export default router;
