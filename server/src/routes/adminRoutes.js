import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { stats, customers } from '../controllers/adminController.js';

const router = Router();
router.get('/stats', authenticate, authorize('admin'), stats);
router.get('/customers', authenticate, authorize('admin'), customers);
export default router;
