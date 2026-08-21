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
