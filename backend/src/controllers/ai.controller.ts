import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FastAPIService } from '../services/fastapi.service.js';
import { SupabaseService } from '../services/supabase.service.js';

export class AIController {
  /**
   * POST /api/v1/ai/generate-blueprint — Orchestrate multi-agent generation and persist across normalized tables.
   */
  static async generateBlueprint(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId || 'user_demo';
      
      // 1. Forward request to Python FastAPI microservice (or fallback synthesis)
      const rawBlueprint = await FastAPIService.generateBlueprint(req.body, userId);

      // 2. Persist across projects, requirements, blueprints, tech_stack, roadmaps, references, history
      const persistedBlueprint = await SupabaseService.createProject(rawBlueprint, userId, req.body);

      res.status(201).json({
        success: true,
        data: persistedBlueprint,
        message: 'AI Project Blueprint generated and saved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ai/chat — Handle conversational AI assistance with session logging and intent classification.
   */
  static async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId || 'user_demo';
      const { prompt, projectId } = req.body;

      // 1. Log incoming user query
      await SupabaseService.logChatMessage({
        user_id: userId,
        project_id: projectId || null,
        sender: 'user',
        content: prompt,
      });

      // 2. Query FastAPI assistant with intent classification and multi-turn history
      const assistantResponse = await FastAPIService.sendChatMessage(prompt, projectId, req.body.conversationHistory);

      // 3. Log assistant response & intent telemetry
      await SupabaseService.logChatMessage({
        user_id: userId,
        project_id: projectId || null,
        sender: 'assistant',
        content: assistantResponse.content,
        intent: assistantResponse.intentClassification?.intent,
        confidence: assistantResponse.intentClassification?.confidence,
      });

      res.status(200).json({
        success: true,
        data: assistantResponse,
        message: 'Chat message processed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
