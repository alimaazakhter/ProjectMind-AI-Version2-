export type AgentMode = 'single' | 'multi';
export type ProjectLevel = 'beginner' | 'intermediate' | 'advanced';
export type ProjectStatus = 'draft' | 'generating' | 'completed' | 'archived';

// Entity: projects
export interface ProjectEntity {
  id: string;
  user_id: string;
  title: string;
  domain: string;
  complexity: string;
  agent_mode: AgentMode;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

// Entity: project_requirements
export interface ProjectRequirement {
  id?: string;
  project_id?: string;
  titleIdea?: string;
  raw_input?: string;
  domain: string;
  skillLevel: ProjectLevel;
  preferredTech: string[];
  complexity: string;
  customRequirements?: string;
  agentMode: AgentMode;
}

// Entity: project_tech_stack
export interface TechStackCategory {
  id?: string;
  project_id?: string;
  category: string;
  item: string;
  rationale: string;
}

// Entity: project_references (type = 'dataset')
export interface DatasetItem {
  id?: string;
  project_id?: string;
  name: string;
  source: string;
  description: string;
}

// Entity: project_references (type = 'research_paper')
export interface ResearchPaper {
  id?: string;
  project_id?: string;
  title: string;
  authors: string;
  year: string;
  link: string;
}

// Entity: project_roadmaps
export interface RoadmapPhase {
  id?: string;
  project_id?: string;
  phase: string;
  duration: string;
  tasks: string[];
}

// Entity: project_history
export interface ProjectHistoryEntity {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  version_tag: string;
  changes_summary: string;
  created_at: string;
}

export interface ProjectFeature {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface VivaPair {
  question: string;
  answer: string;
  category: string;
}

export interface StarterCodeFile {
  file: string;
  language: string;
  code: string;
}

export interface AlgorithmSpec {
  name: string;
  category?: string;
  purpose: string;
  input_features?: string;
  output?: string;
  rationale?: string;
}

export interface MethodologyStep {
  step_number?: number;
  title: string;
  description: string;
  details?: string[];
}

export interface RealWorldApplication {
  domain: string;
  application: string;
}

// Unified Complete Blueprint Model (combines projects + blueprints + child tables for Client Presentation & Exports)
export interface ProjectBlueprint {
  id: string;
  user_id: string;
  title: string;
  tagline: string;
  domain: string;
  complexity: string;
  agent_mode: AgentMode;
  status?: ProjectStatus;
  abstract?: string;
  problem_statement: string;
  literature_review?: string;
  methodology?: MethodologyStep[];
  algorithms_used?: AlgorithmSpec[];
  why_useful?: string[];
  real_world_applications?: RealWorldApplication[];
  objectives: string[];
  features: ProjectFeature[];
  tech_stack: TechStackCategory[];
  architecture: {
    summary: string;
    components: string[];
    diagramDescription: string;
  };
  datasets: DatasetItem[];
  research_references: ResearchPaper[];
  roadmap: RoadmapPhase[];
  viva_questions: VivaPair[];
  starter_code: StarterCodeFile[];
  uniquifier_suggestions: string[];
  created_at: string;
  updated_at: string;
}
