import { AIProjectGeneratorPayload, ChatMessage } from '@/types/ai';
import { ProjectBlueprint } from '@/types/project';
import { MOCK_PROJECTS } from '../mock/mockData';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const EXPRESS_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:5000/api/v1';

export class AIService {
  /**
   * Trigger AI Project Generator pipeline through Express backend gateway.
   */
  static async generateBlueprint(payload: AIProjectGeneratorPayload, token?: string | null): Promise<ProjectBlueprint> {
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

      const res = await fetch(`${EXPRESS_BASE_URL}/ai/generate-blueprint`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('AI Generation request failed');
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.warn('Express AI Gateway call failed, synthesizing client-side blueprint fallback.', err);
      return {
        ...MOCK_PROJECTS[0],
        id: `proj-${Date.now()}`,
        title: payload.titleIdea || `${payload.domain} Intelligent System`,
        domain: payload.domain,
        complexity: payload.complexity,
      };
    }
  }

  /**
   * Send user message to Conversational Assistant through Express gateway.
   */
  static async sendMessageToAssistant(prompt: string, projectId?: string, token?: string | null): Promise<ChatMessage> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const lower = prompt.toLowerCase();
      const projectKeywords = ['project', 'idea', 'code', 'python', 'react', 'next', 'database', 'viva', 'architecture', 'roadmap', 'ai', 'stack', 'dataset'];
      const isRelated = projectKeywords.some((k) => lower.includes(k));

      if (!isRelated) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: '⚠️ Please ask a project-related question. I can assist you with project ideas, architecture design, tech stacks, roadmaps, viva preparation, or documentation.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOffTopic: true,
          intentClassification: {
            intent: 'unrelated',
            confidence: 0.95,
            explanation: 'Query does not match academic or technical project topics.',
          },
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: `Great question regarding **${prompt}**! In modern microservice projects, decouple the frontend client, Node/Express API gateway, and Python/FastAPI ML worker. Would you like me to generate a complete blueprint or starter code?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intentClassification: {
          intent: 'project_inquiry',
          confidence: 0.98,
          explanation: 'Valid project inquiry identified.',
        },
      };
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${EXPRESS_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, projectId }),
      });

      if (!res.ok) throw new Error('Assistant API error');
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.warn('Express AI Assistant call failed, falling back gracefully.', err);
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: `Great question regarding **${prompt}**! To implement this, ensure you have configured your Express API gateway and connected database persistence.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
  }
}
