import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/sync', optionalAuth, UserController.syncProfile);
router.get('/profile', optionalAuth, UserController.getProfile);
router.put('/profile', optionalAuth, UserController.updateProfile);

export default router;
