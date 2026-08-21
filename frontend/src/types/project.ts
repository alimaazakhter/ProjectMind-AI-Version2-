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

export interface ProjectBlueprint {
  id: string;
  title: string;
  tagline: string;
  domain: string;
  complexity: string;
  problemStatement: string;
  objectives: string[];
  features: ProjectFeature[];
  techStack: TechStackCategory[];
  architecture: {
    summary: string;
    components: string[];
    diagramDescription: string;
  };
  datasets: DatasetItem[];
  researchReferences: ResearchPaper[];
  roadmap: RoadmapPhase[];
  vivaQuestions: VivaPair[];
  starterCode: StarterCodeFile[];
  uniquifierSuggestions: string[];
  createdAt: string;
  updatedAt: string;
}
