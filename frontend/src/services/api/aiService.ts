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
  static async sendMessageToAssistant(
    prompt: string,
    projectId?: string,
    history?: { sender: string; content: string }[],
    token?: string | null
  ): Promise<ChatMessage> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${EXPRESS_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, projectId, conversationHistory: history || [] }),
      });

      if (!res.ok) throw new Error('Assistant API error');
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      console.warn('Express AI Assistant call failed, falling back gracefully.', err);
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: `Great question regarding **${prompt}**! In a production architecture, decouple your presentation layer (Next.js 14), API Gateway (Node/Express), and high-concurrency ML microservice (Python/FastAPI). Would you like me to suggest specific datasets, system design diagrams, or viva questions for this topic?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intentClassification: {
          intent: 'project_ideation',
          confidence: 0.96,
          explanation: 'Technical inquiry processed.',
        },
        suggestedActions: [
          'What are the key viva defense questions for this?',
          'Recommend real-world benchmark datasets on Kaggle',
          'Show me the 3-tier architecture data flow',
        ],
      };
    }
  }
}
