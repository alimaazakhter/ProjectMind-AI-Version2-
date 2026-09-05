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
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      
      // 1. Forward request to Python FastAPI microservice (real multi-agent generation).
      //    An AI failure is surfaced honestly as a 502 — never masked with fake content.
      let rawBlueprint;
      try {
        rawBlueprint = await FastAPIService.generateBlueprint(req.body, userId);
      } catch (aiError: any) {
        res.status(aiError?.statusCode === 429 ? 429 : 502).json({
          success: false,
          message: aiError?.message || 'AI generation service is unavailable.',
        });
        return;
      }

      // 2. Persist across projects, requirements, blueprints, tech_stack, roadmaps, references, history.
      //    createProject throws if the write does not actually land in Supabase.
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
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      const { prompt, projectId, sessionId } = req.body;

      // Derive project context (title + domain) for project-aware replies — and enforce
      // ownership. We never pass the raw project UUID to the AI service.
      let projectContext: string | undefined;
      if (projectId) {
        const project = await SupabaseService.getProjectById(projectId, userId);
        if (!project) {
          res.status(403).json({ success: false, message: 'You do not have access to this project.' });
          return;
        }
        projectContext = `${project.title} (${project.domain})`;
      }

      // 1. Log incoming user query. If sessionId is provided we append to that
      //    conversation; otherwise a NEW session is created and its id is returned so the
      //    frontend keeps posting into the same conversation.
      const userLog = await SupabaseService.logChatMessage({
        user_id: userId,
        project_id: projectId || null,
        session_id: sessionId || null,
        sender: 'user',
        content: prompt,
      });
      const activeSessionId = userLog.session_id || null;

      // 2. Query FastAPI assistant with intent classification and multi-turn history.
      //    An AI failure is surfaced honestly as a 502 — never masked with a canned reply.
      let assistantResponse;
      try {
        assistantResponse = await FastAPIService.sendChatMessage(prompt, projectContext, req.body.conversationHistory);
      } catch (aiError: any) {
        res.status(aiError?.statusCode === 429 ? 429 : 502).json({
          success: false,
          message: aiError?.message || 'AI assistant service is unavailable.',
        });
        return;
      }

      // 3. Log assistant response & intent telemetry into the SAME session.
      await SupabaseService.logChatMessage({
        user_id: userId,
        project_id: projectId || null,
        session_id: activeSessionId,
        sender: 'assistant',
        content: assistantResponse.content,
        intent: assistantResponse.intentClassification?.intent,
        confidence: assistantResponse.intentClassification?.confidence,
      });

      res.status(200).json({
        success: true,
        data: { ...assistantResponse, sessionId: activeSessionId },
        message: 'Assistant response generated successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/chat/sessions — List the authenticated user's chat conversations.
   */
  static async getChatSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      const sessions = await SupabaseService.getChatSessionsByUser(userId);
      res.status(200).json({ success: true, data: sessions, total: sessions.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/chat/sessions/:id/messages — Full transcript of one owned session.
   */
  static async getChatSessionMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      const sessionId = String(req.params.id);
      try {
        const messages = await SupabaseService.getChatMessagesBySession(sessionId, userId);
        res.status(200).json({ success: true, data: messages, total: messages.length });
      } catch (ownErr: any) {
        if (ownErr?.message?.includes('Forbidden')) {
          res.status(403).json({ success: false, message: ownErr.message });
          return;
        }
        throw ownErr;
      }
    } catch (error) {
      next(error);
    }
  }
}
