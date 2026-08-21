import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validateBody, projectUpdateSchema } from '../middleware/validation.js';

const router = Router();

// In development, optionalAuth allows demo projects; in strict mode requireAuth blocks unauthenticated requests
router.get('/', optionalAuth, ProjectController.getProjects);
router.get('/:id', optionalAuth, ProjectController.getProjectById);
router.post('/', requireAuth, ProjectController.createProject);
router.put('/:id', requireAuth, validateBody(projectUpdateSchema), ProjectController.updateProject);
router.delete('/:id', requireAuth, ProjectController.deleteProject);

export default router;
