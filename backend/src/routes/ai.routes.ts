import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { validateBody, generatorPayloadSchema, chatPayloadSchema } from '../middleware/validation.js';

const router = Router();

router.post('/generate-blueprint', optionalAuth, validateBody(generatorPayloadSchema), AIController.generateBlueprint);
router.post('/chat', optionalAuth, validateBody(chatPayloadSchema), AIController.chat);

export default router;
