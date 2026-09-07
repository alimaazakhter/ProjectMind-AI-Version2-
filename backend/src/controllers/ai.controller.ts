import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FastAPIService } from '../services/fastapi.service.js';
import { SupabaseService } from '../services/supabase.service.js';
import { JobStore } from '../services/jobStore.js';

export class AIController {
  /**
   * POST /api/v1/ai/generate-blueprint — Start async multi-agent generation.
   *
   * Generation takes 90–200s, which exceeds the ~100s edge/proxy timeout on most PaaS
   * (Render/Cloudflare). So we DON'T hold the HTTP request: we create a job, return its
   * id immediately (202), and run the real work in the background. The client polls
   * GET /ai/generate-blueprint/status/:jobId for the result. No single request is ever
   * held long enough to trip the edge timeout.
   */
  static async generateBlueprint(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const job = JobStore.create(userId);
      const payload = req.body;

      // Fire-and-forget: run generation + persistence in the background and record the
      // outcome on the job. Never throws into the request lifecycle.
      void (async () => {
        try {
          const rawBlueprint = await FastAPIService.generateBlueprint(payload, userId);
          const persisted = await SupabaseService.createProject(rawBlueprint, userId, payload);
          JobStore.complete(job.id, persisted);
        } catch (err: any) {
          JobStore.fail(
            job.id,
            err?.message || 'AI generation failed.',
            err?.statusCode === 429 ? 429 : 502
          );
        }
      })();

      res.status(202).json({
        success: true,
        data: { jobId: job.id, status: job.status },
        message: 'Blueprint generation started.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/generate-blueprint/status/:jobId — Poll an async generation job.
   */
  static async getGenerationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const job = JobStore.get(String(req.params.jobId), userId);
      if (!job) {
        res.status(404).json({ success: false, status: 'not_found', message: 'Generation job not found or expired.' });
        return;
      }

      if (job.status === 'completed') {
        res.status(200).json({ success: true, status: 'completed', data: job.result });
        return;
      }
      if (job.status === 'failed') {
        res.status(200).json({ success: false, status: 'failed', message: job.error, errorStatus: job.errorStatus });
        return;
      }
      res.status(200).json({ success: true, status: 'processing' });
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
