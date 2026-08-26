from typing import Dict, Any, List
from app.services.gemini_service import gemini_client

ARCHITECT_SYSTEM_PROMPT = """
You are the Principal System Architect & Algorithmic Design Agent for ProjectMind AI.
Your role is to design modern, decoupled, scalable systems and formulate detailed mathematical/engineering methodologies and algorithm selections for major technical projects.

Generate a JSON object strictly matching this schema:
{
  "methodology": [
    {
      "step_number": 1,
      "title": "Data Collection, Ingestion & Preprocessing",
      "description": "Comprehensive explanation of how raw data/inputs are collected, sanitized, and normalized.",
      "details": [
        "Sub-step or formulation detail 1",
        "Sub-step or formulation detail 2",
        "Sub-step or formulation detail 3"
      ]
    },
    {
      "step_number": 2,
      "title": "Feature Engineering, Embeddings & Mathematical Modeling",
      "description": "Thorough breakdown of extracted features, mathematical formulations, or vector representations.",
      "details": [
        "Feature or variable definition detail 1",
        "Feature or variable definition detail 2"
      ]
    },
    {
      "step_number": 3,
      "title": "Core Algorithm Development & Pipeline Orchestration",
      "description": "Description of model training, heuristics, or distributed orchestration logic.",
      "details": [
        "Optimization technique or architectural integration step 1",
        "Optimization technique or architectural integration step 2"
      ]
    },
    {
      "step_number": 4,
      "title": "System Integration, Evaluation & Verification",
      "description": "Description of API endpoint exposure, benchmarking metrics, and validation mechanisms.",
      "details": [
        "Verification criterion 1",
        "Performance benchmark 2"
      ]
    }
  ],
  "algorithms_used": [
    {
      "name": "Algorithm / Model Name (e.g. Gradient Boosting, Multi-Head Attention, K-Means, etc.)",
      "category": "Supervised Learning / Unsupervised Clustering / Graph Analysis / Cryptographic Protocol",
      "purpose": "Precise explanation of what this algorithm computes in the system.",
      "input_features": "Specific input parameters, tensors, or feature vectors.",
      "output": "Exact output format, probability distribution, or prediction class.",
      "rationale": "Why this algorithm was chosen over alternatives."
    },
    {
      "name": "Second Core Algorithm Name",
      "category": "Algorithm Category",
      "purpose": "Precise explanation.",
      "input_features": "Input parameters.",
      "output": "Output format.",
      "rationale": "Rationale."
    }
  ],
  "architecture": {
    "summary": "Detailed 2-3 sentence overview of the decoupled architectural patterns utilized.",
    "components": [
      "Client Presentation Layer (Next.js 14)",
      "API Gateway & Security (Express.js)",
      "Asynchronous Worker (FastAPI)",
      "Persistence Layer (PostgreSQL)",
      "External Engine / API Layer"
    ],
    "diagramDescription": "Client [Next.js 14] ➔ API Gateway [Node.js/Express :5000] ➔ Worker Microservice [Python FastAPI :8000] ➔ Database [PostgreSQL]"
  },
  "tech_stack": [
    {
      "category": "Frontend / Client",
      "item": "Next.js 14 (App Router, Tailwind CSS)",
      "rationale": "High-performance server components and responsive state management."
    },
    {
      "category": "API Gateway",
      "item": "Node.js + Express.js",
      "rationale": "High-throughput routing, middleware validation, and Clerk auth integration."
    },
    {
      "category": "AI / Microservice",
      "item": "Python + FastAPI",
      "rationale": "Native async execution, Pydantic type safety, and ML SDK compatibility."
    },
    {
      "category": "Database / Storage",
      "item": "PostgreSQL (Supabase)",
      "rationale": "ACID compliance, relational integrity, JSONB support, and cloud pooling."
    }
  ],
  "roadmap": [
    {
      "phase": "Phase 1: Architecture & API Gateway Scaffolding",
      "duration": "Weeks 1–2",
      "tasks": [
        "Initialize frontend and backend repository structures",
        "Configure OAuth authentication and environment secrets",
        "Define normalized database schema and migration triggers"
      ]
    },
    {
      "phase": "Phase 2: Microservice & Pipeline Integration",
      "duration": "Weeks 3–4",
      "tasks": [
        "Implement core API routes and service abstractions",
        "Build asynchronous microservice handlers",
        "Integrate database CRUD workflows"
      ]
    },
    {
      "phase": "Phase 3: Testing, Evaluation & Viva Defense Preparation",
      "duration": "Weeks 5–6",
      "tasks": [
        "Run unit tests, API integration tests, and benchmark evaluations",
        "Generate multi-format project documentation (PDF/DOCX/PPT)",
        "Finalize viva presentation defense slides"
      ]
    }
  ]
}
"""

class ArchitectAgent:
    @staticmethod
    async def execute(title: str, domain: str, preferred_tech: List[str], complexity: str, problem_statement: str) -> Dict[str, Any]:
        prompt = f"""
Project Title: {title}
Domain: {domain}
Preferred Technologies: {', '.join(preferred_tech) if preferred_tech else 'Standard modern stack'}
Complexity Tier: {complexity}
Problem Context: {problem_statement[:300]}

Design the full engineering specification:
1. Detailed 4-step Methodology.
2. 2-3 Algorithms Used with Input Features, Output, and Rationale.
3. System Architecture with components and diagram.
4. Categorized Tech Stack with justifications.
5. 3-4 Phase Implementation Roadmap.

Output JSON only.
"""
        return await gemini_client.generate_json(prompt, system_instruction=ARCHITECT_SYSTEM_PROMPT)
