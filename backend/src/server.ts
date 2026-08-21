import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Handlers
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import exportRoutes from './routes/export.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// 1. Security & Core Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow cross-origin static file downloads
  })
);

app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Official Clerk Authentication Middleware
app.use(clerkMiddleware());

// 3. Health & Readiness Probe Endpoints
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ProjectMind AI Express Gateway',
    version: '1.0.0',
  });
});

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ProjectMind AI Express Gateway',
    version: '1.0.0',
  });
});

// 4. API Routes Mounting
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/exports', exportRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes);

// 5. 404 Route Fallback
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.',
  });
});

// 6. Centralized Global Error Handler
app.use(errorHandler);

// 7. Start HTTP Server
const PORT = parseInt(env.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 ProjectMind AI Express Backend is running on port ${PORT}`);
  console.log(`📡 Local Gateway: http://localhost:${PORT}/api/v1`);
  console.log(`🛡️  Allowed Origin: ${env.FRONTEND_URL}`);
  console.log(`⚡ Supabase Client: ${process.env.SUPABASE_URL ? 'Connected' : 'In-Memory Mode'}\n`);
});

export default app;
