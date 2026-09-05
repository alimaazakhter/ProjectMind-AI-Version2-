import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/sync', requireAuth, UserController.syncProfile);
router.get('/profile', requireAuth, UserController.getProfile);
router.put('/profile', requireAuth, UserController.updateProfile);

export default router;
