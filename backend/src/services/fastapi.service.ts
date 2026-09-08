import axios from 'axios';
import { env } from '../config/env.js';
import { ProjectBlueprint, ProjectRequirement } from '../models/project.types.js';
import { ChatMessage } from '../models/chat.types.js';

export class FastAPIService {
  private static baseURL = env.FASTAPI_URL || 'http://localhost:8000/api/v1/ai';

  /**
   * Forward generation request to the Python FastAPI microservice.
   * Returns validated multi-agent output produced by Gemini.
   *
   * There is intentionally NO fake-content fallback: if the AI service is
   * unreachable or errors, this throws an honest, actionable error so the
   * caller can surface it instead of silently returning generic/synthetic
   * blueprint content (which previously made every domain look identical).
   */
  /**
   * Start generation on the AI worker and return the worker's jobId immediately.
   * The heavy work runs on the worker (which holds the job), so the backend never keeps
   * its own long-lived background task — that in-memory task was lost whenever the free
   * backend instance recycled, which surfaced as an 8-minute "generation timed out".
   */
  static async startBlueprintGeneration(payload: ProjectRequirement): Promise<string> {
    try {
      const startRes = await axios.post(`${this.baseURL}/generate`, {
        // Empty title passes through so the worker auto-synthesizes a NOVEL title.
        titleIdea: payload.titleIdea || '',
        domain: payload.domain,
        skillLevel: payload.skillLevel || 'intermediate',
        preferredTech: payload.preferredTech || [],
        complexity: payload.complexity || 'Production Grade Architecture',
        agentMode: payload.agentMode || 'multi',
        customRequirements: payload.customRequirements || null,
      }, {
        // 90s so a cold-started worker (Render free ~50-70s wake) can still accept the job.
        timeout: 90000,
        headers: { 'Content-Type': 'application/json' },
      });
      const jobId = startRes.data?.jobId;
      if (!jobId) throw new Error('AI worker did not return a job id.');
      return jobId;
    } catch (error: any) {
      const httpStatus = error?.response?.status;
      const detail = error?.response?.data?.detail || error?.message || 'Unknown error';
      console.error(
        `[FastAPIService] Failed to start generation at ${this.baseURL}/generate` +
          (httpStatus ? ` (HTTP ${httpStatus})` : '') + `: ${detail}`
      );
      if (httpStatus === 429) {
        const rateErr: any = new Error(`AI generation is temporarily rate-limited: ${detail} Please try again.`);
        rateErr.statusCode = 429;
        throw rateErr;
      }
      throw new Error(`AI generation service is unavailable. Ensure the Python AI service is running. (${detail})`);
    }
  }

  /**
   * Poll one worker generation job (a single short request). Returns the current status;
   * on completion it maps the worker payload into a persistable blueprint.
   */
  static async pollBlueprintGeneration(
    jobId: string,
    userId: string
  ): Promise<{ status: 'processing' | 'completed' | 'failed'; blueprint?: Omit<ProjectBlueprint, 'id' | 'created_at' | 'updated_at'>; message?: string; errorStatus?: number }> {
    let s: any;
    try {
      const res = await axios.get(`${this.baseURL}/generate/status/${jobId}`, { timeout: 25000 });
      s = res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return { status: 'failed', message: 'Generation job expired on the AI worker. Please try again.' };
      }
      // Transient hiccup (worker cold/busy) — tell the caller to keep polling.
      return { status: 'processing' };
    }
    if (s.status === 'completed') {
      return { status: 'completed', blueprint: this.mapWorkerResult(s.result, userId) };
    }
    if (s.status === 'failed') {
      return { status: 'failed', message: s.detail || 'AI generation failed.', errorStatus: s.errorStatus };
    }
    return { status: 'processing' };
  }

  /** Map the worker's blueprint payload into the shape SupabaseService.createProject expects. */
  private static mapWorkerResult(data: any, userId: string): Omit<ProjectBlueprint, 'id' | 'created_at' | 'updated_at'> {
    return {
      user_id: userId,
      title: data.title || 'Untitled Project',
      tagline: data.tagline || '',
      domain: data.domain || '',
      complexity: data.complexity || 'Production Grade Architecture',
      agent_mode: data.agent_mode || 'multi',
      abstract: data.abstract || '',
      problem_statement: data.problem_statement || '',
      literature_review: data.literature_review || '',
      methodology: data.methodology || [],
      algorithms_used: data.algorithms_used || [],
      why_useful: data.why_useful || [],
      real_world_applications: data.real_world_applications || [],
      objectives: data.objectives || [],
      features: data.features || [],
      tech_stack: data.tech_stack || [],
      architecture: data.architecture || { summary: '', components: [], diagramDescription: '' },
      datasets: data.datasets || [],
      research_references: data.research_references || [],
      roadmap: data.roadmap || [],
      viva_questions: data.viva_questions || [],
      starter_code: data.starter_code || [],
      uniquifier_suggestions: data.uniquifier_suggestions || [],
    };
  }

  /**
   * Forward chat prompt to the Python FastAPI intent classifier & assistant.
   *
   * No canned assistant reply is returned on failure — an honest error is
   * thrown so the UI can tell the user the assistant is unavailable rather than
   * pretending a generic answer is real.
   */
  static async sendChatMessage(prompt: string, projectContext?: string, history?: any[]): Promise<ChatMessage> {
    try {
      const response = await axios.post(`${this.baseURL}/chat`, {
        prompt,
        projectContext: projectContext || null,
        conversationHistory: history || [],
      }, {
        // Generous timeout so a cold-started AI worker (Render free spins down after
        // ~15 min idle and takes ~50s to wake) doesn't fail an otherwise-fast chat call.
        timeout: 90000,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = response.data;
      const intent = res.intent || 'general_knowledge';
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: res.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intentClassification: {
          intent,
          confidence: typeof res.confidence === 'number' ? res.confidence : 0.9,
          explanation: `Classified by AI Service as "${intent}"`,
        },
        suggestedActions: res.suggestedActions || res.suggested_actions || [],
      };
    } catch (error: any) {
      const httpStatus = error?.response?.status;
      const detail = error?.response?.data?.detail || error?.message || 'Unknown error';
      console.error(
        `[FastAPIService] Chat generation failed at ${this.baseURL}/chat` +
          (httpStatus ? ` (HTTP ${httpStatus})` : '') +
          `: ${detail}`
      );
      if (httpStatus === 429) {
        const rateErr: any = new Error(
          `The AI assistant is temporarily rate-limited: ${detail} Please wait a moment and try again.`
        );
        rateErr.statusCode = 429;
        throw rateErr;
      }
      throw new Error(
        `AI assistant service is unavailable. Ensure the Python AI service is running and GEMINI_API_KEY is configured. (${detail})`
      );
    }
  }

  /**
   * Check FastAPI worker health.
   */
  static async checkHealth(): Promise<{ status: 'Healthy' | 'Offline'; latencyMs: number }> {
    const start = Date.now();
    try {
      await axios.get(`${this.baseURL}/health`, { timeout: 2000 });
      return { status: 'Healthy', latencyMs: Date.now() - start };
    } catch {
      return { status: 'Offline', latencyMs: 0 };
    }
  }

  /**
   * Fetch current AI engine configuration from FastAPI worker.
   */
  static async getAIConfig(): Promise<{
    active_model: string;
    fallback_models: string[];
    available_models: string[];
    temperature: number;
    is_configured: boolean;
  }> {
    try {
      const res = await axios.get(`${this.baseURL}/config`, { timeout: 3000 });
      return res.data.data;
    } catch {
      return {
        active_model: 'gemini-3.5-flash-lite',
        fallback_models: ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'],
        available_models: ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.5-pro'],
        temperature: 0.4,
        is_configured: true,
      };
    }
  }

  /**
   * Update AI engine configuration on FastAPI worker.
   */
  static async updateAIConfig(payload: { model?: string; temperature?: number; provider?: string }): Promise<any> {
    const res = await axios.post(`${this.baseURL}/config`, payload, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data.data;
  }

  /**
   * Ping FastAPI worker for diagnostics.
   */
  static async pingDiagnostics(): Promise<{
    status: 'Online' | 'Offline';
    latencyMs: number;
    activeModel: string;
    geminiStatus: string;
  }> {
    const start = Date.now();
    try {
      const res = await axios.get(`${this.baseURL}/ping`, { timeout: 3000 });
      const data = res.data;
      return {
        status: 'Online',
        latencyMs: data.latencyMs || (Date.now() - start),
        activeModel: data.activeModel || 'gemini-3.5-flash-lite',
        geminiStatus: data.geminiStatus || 'Online',
      };
    } catch {
      return {
        status: 'Offline',
        latencyMs: 0,
        activeModel: 'N/A',
        geminiStatus: 'Offline',
      };
    }
  }
}
