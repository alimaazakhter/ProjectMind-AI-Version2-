import { AIProjectGeneratorPayload, ChatMessage } from '@/types/ai';
import { ProjectBlueprint } from '@/types/project';
import { MOCK_PROJECTS } from '../mock/mockData';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const EXPRESS_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:5000/api/v1';

export interface ChatSessionSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message: string;
}

export interface StoredChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string | null;
  confidence?: number | null;
  created_at: string;
}

export class AIService {
  /**
   * Trigger AI Project Generator pipeline through Express backend gateway.
   */
  static async generateBlueprint(
    payload: AIProjectGeneratorPayload & { userId?: string },
    token?: string | null
  ): Promise<ProjectBlueprint> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        ...MOCK_PROJECTS[0],
        id: `proj-${Date.now()}`,
        title: payload.titleIdea || `${payload.domain} AI Platform`,
        domain: payload.domain,
        complexity: payload.complexity,
      };
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const { userId: _userId, ...requestPayload } = payload;

      const res = await fetch(`${EXPRESS_BASE_URL}/ai/generate-blueprint`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });

      if (!res.ok) throw new Error(`AI Generation request failed with HTTP ${res.status}`);
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      // No client-side fake blueprint: re-throw so the UI can surface a real error
      // instead of silently rendering synthetic/generic project content (BUG 16).
      console.error('Express AI Gateway blueprint request failed (surfacing error, no fallback):', err);
      throw err;
    }
  }

  /**
   * Send user message to Conversational Assistant through Express gateway.
   */
  static async sendMessageToAssistant(
    prompt: string,
    projectId?: string,
    history?: { sender: string; content: string }[],
    token?: string | null,
    userId?: string,
    sessionId?: string | null
  ): Promise<ChatMessage> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const requestBody = { prompt, projectId, sessionId: sessionId || undefined, conversationHistory: history || [] };

      const res = await fetch(`${EXPRESS_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error(`Assistant API error (HTTP ${res.status})`);
      const data = await res.json();
      const msg = data.data || data;
      // Carry the (possibly newly-created) session id back so the UI keeps the thread.
      if (msg && data.data?.sessionId) msg.session_id = data.data.sessionId;
      return msg;
    } catch (err) {
      // Surface an honest error instead of fabricating a canned greeting or a generic
      // architecture answer that could be mistaken for a real AI reply (BUG 1 / BUG 16).
      console.error('Express AI Assistant call failed:', err);
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content:
          "⚠️ I couldn't reach the AI assistant right now. Please make sure the backend and the Python AI service are running and that GEMINI_API_KEY is configured, then try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intentClassification: {
          intent: 'error',
          confidence: 1,
          explanation: 'The AI assistant service was unavailable.',
        },
        suggestedActions: [],
      };
    }
  }

  /**
   * Fetch the authenticated user's chat conversation history (session list).
   */
  static async getChatSessions(token?: string | null): Promise<ChatSessionSummary[]> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${EXPRESS_BASE_URL}/ai/chat/sessions`, { headers, cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load chat history (HTTP ${res.status})`);
    const data = await res.json();
    return data.data || [];
  }

  /**
   * Fetch the full message transcript for one chat session.
   */
  static async getChatSessionMessages(sessionId: string, token?: string | null): Promise<StoredChatMessage[]> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${EXPRESS_BASE_URL}/ai/chat/sessions/${sessionId}/messages`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to load conversation (HTTP ${res.status})`);
    const data = await res.json();
    return data.data || [];
  }
}
