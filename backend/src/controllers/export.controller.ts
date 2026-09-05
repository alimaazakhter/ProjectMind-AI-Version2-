import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ExportService } from '../services/export.service.js';

export class ExportController {
  /**
   * GET /api/v1/exports/:id/:format — Stream export file (pdf, docx, ppt, md) with ownership check.
   */
  static async exportFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const format = String(req.params.format);
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      if (!['pdf', 'docx', 'ppt', 'md'].includes(format)) {
        res.status(400).json({
          success: false,
          message: `Invalid export format "${format}". Supported formats: pdf, docx, ppt, md.`,
        });
        return;
      }

      const result = await ExportService.exportBlueprint(id, format as any, userId);

      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);

      if (typeof result.buffer === 'string') {
        res.send(result.buffer);
      } else {
        res.send(result.buffer);
      }
    } catch (error: any) {
      if (error.message?.includes('Forbidden') || error.message?.includes('permission')) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}
