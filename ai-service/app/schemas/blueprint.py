from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ==========================================
# INPUT SCHEMAS
# ==========================================
class BlueprintGenerateRequest(BaseModel):
    title_idea: str = Field(..., alias="titleIdea", description="Project title or core topic")
    domain: str = Field(..., description="Academic / Technology domain")
    skill_level: str = Field("intermediate", alias="skillLevel", description="Target developer skill level")
    preferred_tech: List[str] = Field(default_factory=list, alias="preferredTech", description="List of preferred technologies")
    complexity: str = Field("Production Grade Architecture", description="Architecture complexity tier")
    agent_mode: str = Field("multi", alias="agentMode", description="AI orchestration mode: single or multi")
    custom_requirements: Optional[str] = Field(None, alias="customRequirements", description="Additional custom instructions")

    class Config:
        populate_by_name = True

class ChatRequest(BaseModel):
    prompt: str = Field(..., description="User prompt or query")
    project_id: Optional[str] = Field(None, alias="projectId", description="Associated Project UUID")
    user_id: Optional[str] = Field(None, alias="userId", description="Clerk User ID")
    conversation_history: Optional[List[Dict[str, str]]] = Field(default_factory=list, alias="conversationHistory")

    class Config:
        populate_by_name = True

# ==========================================
# OUTPUT SCHEMAS
# ==========================================
class FeatureItem(BaseModel):
    title: str
    description: str
    priority: str = Field("high", description="high, medium, or low")

class TechStackItem(BaseModel):
    category: str
    item: str
    rationale: str

class ArchitectureSpec(BaseModel):
    summary: str
    components: List[str]
    diagramDescription: str = Field(..., alias="diagramDescription")

    class Config:
        populate_by_name = True

class DatasetItem(BaseModel):
    name: str
    source: str
    description: str

class ResearchReferenceItem(BaseModel):
    title: str
    authors: str
    year: str
    link: Optional[str] = None

class RoadmapPhase(BaseModel):
    phase: str
    duration: str
    tasks: List[str]

class VivaQuestion(BaseModel):
    question: str
    answer: str
    category: str

class StarterCodeItem(BaseModel):
    file: str
    language: str
    code: str

class AlgorithmSpec(BaseModel):
    name: str
    category: Optional[str] = None
    purpose: str
    input_features: Optional[str] = Field(None, alias="input_features")
    output: Optional[str] = None
    rationale: Optional[str] = None

    class Config:
        populate_by_name = True

class MethodologyStep(BaseModel):
    step_number: Optional[int] = Field(None, alias="step_number")
    title: str
    description: str
    details: Optional[List[str]] = Field(default_factory=list)

    class Config:
        populate_by_name = True

class RealWorldApplication(BaseModel):
    domain: str
    application: str

class BlueprintResponse(BaseModel):
    title: str
    tagline: str
    domain: str
    complexity: str
    agent_mode: str = Field("multi", alias="agent_mode")
    abstract: Optional[str] = Field(None, description="Executive academic abstract")
    problem_statement: str = Field(..., alias="problem_statement")
    literature_review: Optional[str] = Field(None, alias="literature_review", description="Academic literature review & gap analysis")
    methodology: Optional[List[MethodologyStep]] = Field(default_factory=list, description="Step-by-step implementation methodology")
    algorithms_used: Optional[List[AlgorithmSpec]] = Field(default_factory=list, alias="algorithms_used", description="Deep algorithmic breakdowns")
    why_useful: Optional[List[str]] = Field(default_factory=list, alias="why_useful", description="Key utility & productivity benefits")
    real_world_applications: Optional[List[RealWorldApplication]] = Field(default_factory=list, alias="real_world_applications", description="Practical industry deployment domains")
    objectives: List[str]
    features: List[FeatureItem]
    tech_stack: List[TechStackItem] = Field(..., alias="tech_stack")
    architecture: ArchitectureSpec
    datasets: List[DatasetItem] = Field(default_factory=list)
    research_references: List[ResearchReferenceItem] = Field(default_factory=list, alias="research_references")
    roadmap: List[RoadmapPhase]
    viva_questions: List[VivaQuestion] = Field(default_factory=list, alias="viva_questions")
    starter_code: List[StarterCodeItem] = Field(default_factory=list, alias="starter_code")
    uniquifier_suggestions: List[str] = Field(default_factory=list, alias="uniquifier_suggestions")

    class Config:
        populate_by_name = True

class ChatResponse(BaseModel):
    content: str
    intent: str = Field("general_query", description="Detected query intent")
    confidence: float = Field(0.95, description="Confidence score")
    suggested_actions: Optional[List[str]] = Field(default_factory=list, alias="suggestedActions")

    class Config:
        populate_by_name = True
