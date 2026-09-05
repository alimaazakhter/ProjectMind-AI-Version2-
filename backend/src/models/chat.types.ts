export interface IntentClassification {
  // The AI service is the source of truth for intent labels (greeting, casual_chat,
  // general_knowledge, project_ideation, architecture_query, tech_stack_selection,
  // roadmap_help, viva_prep, code_guidance, ...). Kept as a string to avoid brittle drift.
  intent: string;
  confidence: number;
  explanation: string;
}

export interface ChatSessionEntity {
  id: string;
  project_id?: string | null;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageEntity {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string | null;
  confidence?: number | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id?: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isOffTopic?: boolean;
  intentClassification?: IntentClassification;
  suggestedActions?: string[];
}
