import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FastAPIService } from '../services/fastapi.service.js';
import { SupabaseService } from '../services/supabase.service.js';

// Lightweight per-job maps. Unlike a background task, these only cache metadata; the
// generation itself lives on the AI worker, so a recycled backend instance at worst
// forgets the original payload (requirements row skipped) — it never loses the job.
const jobOwner = new Map<string, string>();
const jobPayload = new Map<string, any>();
const jobPersisted = new Map<string, any>();

export class AIController {
  /**
   * POST /api/v1/ai/generate-blueprint — Start generation on the AI worker and return its
   * jobId immediately. The client then polls the status endpoint. The backend does NOT run
   * a long background task (that was fragile on free hosting); it simply proxies the
   * worker's job and persists the result when the client polls and sees it completed.
   */
  static async generateBlueprint(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      let jobId: string;
      try {
        jobId = await FastAPIService.startBlueprintGeneration(req.body);
      } catch (aiError: any) {
        res.status(aiError?.statusCode === 429 ? 429 : 502).json({
          success: false,
          message: aiError?.message || 'AI generation service is unavailable.',
        });
        return;
      }

      jobOwner.set(jobId, userId);
      jobPayload.set(jobId, req.body);

      res.status(202).json({
        success: true,
        data: { jobId, status: 'processing' },
        message: 'Blueprint generation started.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/generate-blueprint/status/:jobId — Proxy the worker job. On completion,
   * persist the blueprint to Supabase (once) and return the stored record.
   */
  static async getGenerationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      const jobId = String(req.params.jobId);

      // Ownership: enforce when we still remember the owner (backend not recycled).
      const owner = jobOwner.get(jobId);
      if (owner && owner !== userId) {
        res.status(403).json({ success: false, status: 'failed', message: 'You do not have access to this generation job.' });
        return;
      }

      // Already persisted (idempotent for repeat polls).
      if (jobPersisted.has(jobId)) {
        res.status(200).json({ success: true, status: 'completed', data: jobPersisted.get(jobId) });
        return;
      }

      const result = await FastAPIService.pollBlueprintGeneration(jobId, userId);

      if (result.status === 'processing') {
        res.status(200).json({ success: true, status: 'processing' });
        return;
      }
      if (result.status === 'failed') {
        res.status(200).json({ success: false, status: 'failed', message: result.message, errorStatus: result.errorStatus });
        return;
      }

      // completed → persist once, then return the stored record.
      try {
        const persisted = await SupabaseService.createProject(result.blueprint!, userId, jobPayload.get(jobId));
        jobPersisted.set(jobId, persisted);
        jobOwner.delete(jobId);
        jobPayload.delete(jobId);
        res.status(200).json({ success: true, status: 'completed', data: persisted });
      } catch (persistErr: any) {
        res.status(200).json({ success: false, status: 'failed', message: `Generated, but saving failed: ${persistErr?.message || 'unknown error'}` });
      }
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
