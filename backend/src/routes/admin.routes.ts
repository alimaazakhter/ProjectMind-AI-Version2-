import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/metrics', optionalAuth, AdminController.getMetrics);

export default router;
