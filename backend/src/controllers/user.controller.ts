import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SupabaseService } from '../services/supabase.service.js';

export class UserController {
  /**
   * POST /api/v1/users/sync — Sync logged-in Clerk user data into Supabase profiles table.
   */
  static async syncProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clerkUserId = req.userId || req.body.clerk_user_id || 'user_demo';
      const { email, full_name, university, semester, academic_level, role } = req.body;

      if (!email && !clerkUserId) {
        res.status(400).json({ success: false, message: 'Email or Clerk User ID is required.' });
        return;
      }

      const profile = await SupabaseService.syncUserProfile({
        clerk_user_id: clerkUserId,
        email: email || `${clerkUserId}@projectmind.ai`,
        full_name,
        role: role || 'student',
        university,
        semester,
        academic_level,
      });

      res.status(200).json({
        success: true,
        data: profile,
        message: 'User profile synced successfully with Supabase.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/profile — Fetch current user profile.
   */
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clerkUserId = req.userId || 'user_demo';
      const profile = await SupabaseService.getUserProfile(clerkUserId);

      if (!profile) {
        res.status(404).json({ success: false, message: 'User profile not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
        message: 'Profile retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/profile — Update academic details.
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clerkUserId = req.userId || 'user_demo';
      const updated = await SupabaseService.updateUserProfile(clerkUserId, req.body);

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Profile updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
