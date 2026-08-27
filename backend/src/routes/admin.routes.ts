import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Enforce strict admin authorization across all admin routes
router.use(requireAdmin);

// 1. Overview & Telemetry
router.get('/overview', AdminController.getOverview);
router.get('/metrics', AdminController.getOverview); // Backward compatibility alias

// 2. User Management & RBAC
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);

// 3. Global Project Catalog & Moderation
router.get('/projects', AdminController.getProjects);
router.get('/projects/:id', AdminController.getProjectDetails);
router.delete('/projects/:id', AdminController.deleteProject);

// 4. Chat Telemetry & Intent Audit Logs
router.get('/chat-logs', AdminController.getChatLogs);

// 5. AI Engine Configuration
router.get('/ai-config', AdminController.getAIConfig);
router.post('/ai-config', AdminController.updateAIConfig);

// 6. Diagnostics, Maintenance & Audit Reports
router.post('/diagnostics/ping-all', AdminController.pingAllDiagnostics);
router.post('/cache/flush', AdminController.flushCache);
router.get('/audit-report', AdminController.getAuditReport);

export default router;
