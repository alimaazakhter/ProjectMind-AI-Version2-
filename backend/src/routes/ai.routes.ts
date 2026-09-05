import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, generatorPayloadSchema, chatPayloadSchema } from '../middleware/validation.js';

const router = Router();

router.post('/generate-blueprint', requireAuth, validateBody(generatorPayloadSchema), AIController.generateBlueprint);
router.post('/chat', requireAuth, validateBody(chatPayloadSchema), AIController.chat);
router.get('/chat/sessions', requireAuth, AIController.getChatSessions);
router.get('/chat/sessions/:id/messages', requireAuth, AIController.getChatSessionMessages);

export default router;
