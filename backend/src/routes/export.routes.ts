import { Router } from 'express';
import { ExportController } from '../controllers/export.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Supports both /api/v1/export/:id/:format AND /api/v1/export/:id?format=pdf
router.get('/:id/:format', optionalAuth, ExportController.exportFile);
router.get('/:id', optionalAuth, (req, res, next) => {
  const format = (req.query.format as string) || 'pdf';
  req.params.format = format;
  ExportController.exportFile(req, res, next);
});

export default router;
