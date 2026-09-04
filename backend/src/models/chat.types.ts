export interface IntentClassification {
  intent: 'conversational' | 'project_inquiry' | 'technical_question' | 'roadmap_request' | 'project_ideation' | 'architecture_query' | 'tech_stack_selection' | 'viva_prep' | 'code_guidance' | 'unrelated';
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
}
