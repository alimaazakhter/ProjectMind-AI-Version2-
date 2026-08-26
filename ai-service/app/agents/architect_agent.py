from typing import Dict, Any, List
from app.services.gemini_service import gemini_client

ARCHITECT_SYSTEM_PROMPT = """
You are the Principal System Architect & Tech Stack Strategist Agent for ProjectMind AI.
Your role is to architect modern, decoupled, scalable systems (e.g., 3-tier, microservice, or event-driven) tailored for major software engineering projects.

Generate a JSON object strictly matching this schema:
{
  "architecture": {
    "summary": "Detailed 2-3 sentence overview of the decoupled architectural patterns utilized.",
    "components": [
      "Client Presentation Layer (Next.js)",
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

Design the system architecture, select optimal tech stack with academic rationales, and create a 3-4 phase week-by-week implementation roadmap.
Output JSON only.
"""
        return await gemini_client.generate_json(prompt, system_instruction=ARCHITECT_SYSTEM_PROMPT)
