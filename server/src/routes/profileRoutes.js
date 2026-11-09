import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = Router();
router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);
export default router;
