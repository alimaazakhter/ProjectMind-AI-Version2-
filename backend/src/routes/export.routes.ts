import { Router } from 'express';
import { ExportController } from '../controllers/export.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Supports both /api/v1/export/:id/:format AND /api/v1/export/:id?format=pdf
router.get('/:id/:format', requireAuth, ExportController.exportFile);
router.get('/:id', requireAuth, (req, res, next) => {
  const format = (req.query.format as string) || 'pdf';
  req.params.format = format;
  ExportController.exportFile(req, res, next);
});

export default router;
