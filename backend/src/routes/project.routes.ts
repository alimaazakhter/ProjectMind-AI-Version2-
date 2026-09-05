import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, projectUpdateSchema } from '../middleware/validation.js';

const router = Router();

router.get('/', requireAuth, ProjectController.getProjects);
router.get('/:id', requireAuth, ProjectController.getProjectById);
router.post('/', requireAuth, ProjectController.createProject);
router.put('/:id', requireAuth, validateBody(projectUpdateSchema), ProjectController.updateProject);
router.delete('/:id', requireAuth, ProjectController.deleteProject);

export default router;
