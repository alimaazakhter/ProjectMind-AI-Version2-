import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Define routes that require regular student/user authentication.
 * Public routes (Landing page, Sign-in, Sign-up, Admin passcode gate, public assets) are accessible directly.
 * Protected student workspace routes require valid Clerk sessions.
 */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/generator(.*)',
  '/assistant(.*)',
  '/workspace(.*)',
  '/history(.*)',
  '/profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webp|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
