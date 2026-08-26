import { AgentMode, ProjectLevel } from './project';

export interface AIProjectGeneratorPayload {
  titleIdea?: string;
  domain: string;
  skillLevel: ProjectLevel;
  preferredTech: string[];
  complexity: string;
  agentMode: AgentMode;
  customRequirements?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isOffTopic?: boolean;
  intentClassification?: {
    intent: string;
    confidence: number;
    explanation?: string;
  };
  suggestedActions?: string[];
}
