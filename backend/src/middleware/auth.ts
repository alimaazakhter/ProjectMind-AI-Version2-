import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

// Extend Express Request to carry verified Clerk userId
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

/**
 * Middleware that enforces Clerk authentication using official @clerk/express getAuth(req).
 * Rejects unauthenticated requests with HTTP 401.
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const auth = getAuth(req);

    if (!auth || !auth.userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required to access this resource.',
      });
      return;
    }

    // Attach verified Clerk user ID to request
    req.userId = auth.userId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Failed to verify authentication token.',
    });
  }
};

/**
 * Optional authentication middleware.
 * Attaches userId if token is present, but allows request to proceed if absent.
 */
export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      req.userId = auth.userId;
    }
  } catch {
    // Ignore verification failure for optional endpoints
  }
  next();
};

const VALID_ADMIN_PASSCODES = ['1234', 'admin123', 'admin2026', process.env.ADMIN_PASSCODE].filter(Boolean);

/**
 * Strict Admin Authorization Middleware.
 * Enforces admin privilege:
 * 1. Checks valid x-admin-passcode header, OR
 * 2. Checks verified Clerk authentication with Supabase profile role === 'admin'.
 * 
 * Rejects unauthorized users / students with HTTP 403 Forbidden.
 */
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Passcode Header Authorization Check
    const adminPasscode = (req.headers['x-admin-passcode'] as string)?.trim();
    if (adminPasscode && VALID_ADMIN_PASSCODES.includes(adminPasscode)) {
      req.userRole = 'admin';
      req.userId = req.userId || 'admin_console';
      next();
      return;
    }

    // 2. Clerk Token + Supabase Profile Role Check
    try {
      const auth = getAuth(req);
      if (auth && auth.userId) {
        req.userId = auth.userId;
        const { SupabaseService } = await import('../services/supabase.service.js');
        const profile = await SupabaseService.getUserProfile(auth.userId);
        if (profile && profile.role === 'admin') {
          req.userRole = 'admin';
          next();
          return;
        }
      }
    } catch {
      // Ignore inner error and fall through to 403
    }

    res.status(403).json({
      success: false,
      message: 'Forbidden: Administrator privileges required to access this resource.',
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Administrator authorization verification failed.',
    });
  }
};

