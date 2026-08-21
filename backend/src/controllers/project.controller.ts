import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SupabaseService } from '../services/supabase.service.js';

export class ProjectController {
  /**
   * GET /api/v1/projects — List all blueprints belonging to authenticated user.
   */
  static async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId || 'user_demo';
      const projects = await SupabaseService.getProjectsByUser(userId);

      res.status(200).json({
        success: true,
        data: projects,
        message: 'Projects retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/projects/:id — Get a single blueprint with user ownership check.
   */
  static async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = req.userId || 'user_demo';
      const project = await SupabaseService.getProjectById(id, userId);

      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project blueprint not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: project,
        message: 'Project blueprint retrieved successfully.',
      });
    } catch (error: any) {
      if (error.message?.includes('Forbidden')) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/projects — Create and persist a new project blueprint.
   */
  static async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId || 'user_demo';
      const created = await SupabaseService.createProject(req.body, userId);

      res.status(201).json({
        success: true,
        data: created,
        message: 'Project blueprint created successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/projects/:id — Update an existing blueprint with ownership validation.
   */
  static async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = req.userId || 'user_demo';
      const updated = await SupabaseService.updateProject(id, req.body, userId);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Project blueprint not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Project blueprint updated successfully.',
      });
    } catch (error: any) {
      if (error.message?.includes('Forbidden')) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/v1/projects/:id — Delete a blueprint with ownership validation.
   */
  static async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = req.userId || 'user_demo';
      const deleted = await SupabaseService.deleteProject(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Project blueprint not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Project blueprint deleted successfully.',
      });
    } catch (error: any) {
      if (error.message?.includes('Forbidden')) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}
