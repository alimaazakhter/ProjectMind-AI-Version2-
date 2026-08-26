export type AgentMode = 'single' | 'multi';
export type ProjectLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ProjectRequirement {
  domain: string;
  skillLevel: ProjectLevel;
  preferredTech: string[];
  complexity: string;
  customRequirements?: string;
  agentMode: AgentMode;
}

export interface ProjectFeature {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TechStackCategory {
  category: string;
  item: string;
  rationale: string;
}

export interface DatasetItem {
  name: string;
  source: string;
  description: string;
}

export interface ResearchPaper {
  title: string;
  authors: string;
  year: string;
  link: string;
}

export interface RoadmapPhase {
  phase: string;
  duration: string;
  tasks: string[];
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

export interface ProjectBlueprint {
  id: string;
  title: string;
  tagline: string;
  domain: string;
  complexity: string;
  agent_mode?: AgentMode;
  abstract?: string;
  problemStatement?: string;
  problem_statement?: string;
  literatureReview?: string;
  literature_review?: string;
  methodology?: MethodologyStep[];
  algorithmsUsed?: AlgorithmSpec[];
  algorithms_used?: AlgorithmSpec[];
  whyUseful?: string[];
  why_useful?: string[];
  realWorldApplications?: RealWorldApplication[];
  real_world_applications?: RealWorldApplication[];
  objectives: string[];
  features: ProjectFeature[];
  techStack?: TechStackCategory[];
  tech_stack?: TechStackCategory[];
  architecture: {
    summary: string;
    components: string[];
    diagramDescription: string;
  };
  datasets: DatasetItem[];
  researchReferences?: ResearchPaper[];
  research_references?: ResearchPaper[];
  roadmap: RoadmapPhase[];
  vivaQuestions?: VivaPair[];
  viva_questions?: VivaPair[];
  starterCode?: StarterCodeFile[];
  starter_code?: StarterCodeFile[];
  uniquifierSuggestions?: string[];
  uniquifier_suggestions?: string[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}
