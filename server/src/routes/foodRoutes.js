import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { listFoods, getFood, createFood, updateFood, deleteFood } from '../controllers/foodController.js';

const router = Router();
router.get('/', listFoods);
router.get('/:id', getFood);
// Write operations are admin-only
router.post('/', authenticate, authorize('admin'), createFood);
router.put('/:id', authenticate, authorize('admin'), updateFood);
router.delete('/:id', authenticate, authorize('admin'), deleteFood);
export default router;
