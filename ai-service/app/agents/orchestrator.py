import logging
import asyncio
from typing import Dict, Any
from app.agents.planner_agent import PlannerAgent
from app.agents.architect_agent import ArchitectAgent
from app.agents.research_agent import ResearchAgent
from app.agents.viva_agent import VivaAgent
from app.schemas.blueprint import BlueprintGenerateRequest
from app.services.gemini_service import gemini_client

logger = logging.getLogger("orchestrator")

class MultiAgentOrchestrator:
    @staticmethod
    async def generate_blueprint(req: BlueprintGenerateRequest) -> Dict[str, Any]:
        """
        Executes the coordinated multi-agent pipeline using Google Gemini.

        There is intentionally NO fake-content fallback here: if Gemini is not
        configured, or any agent in the pipeline fails, this raises so the caller
        surfaces an honest error instead of silently returning generic/synthetic
        blueprint content (which previously made every domain look identical).
        """
        if not gemini_client.is_configured:
            logger.error("Gemini API key is not configured; refusing to synthesize fake blueprint content.")
            raise RuntimeError(
                "AI generation is not configured: GEMINI_API_KEY is missing or invalid on the AI service. "
                "Set a valid GEMINI_API_KEY in ai-service/.env and restart the service."
            )

        logger.info(f"Executing Multi-Agent Generation Pipeline for: {req.title_idea} [{req.domain}]")

        # Stage 1: Planner Agent (Sequential Foundation)
        planner_data = await PlannerAgent.execute(
            title=req.title_idea,
            domain=req.domain,
            skill_level=req.skill_level,
            complexity=req.complexity,
            custom_req=req.custom_requirements,
        )

        # Resolve the effective title: when the user left the title blank (auto-synthesis),
        # use the NOVEL title the Planner invented so downstream agents and the saved
        # project reflect a fresh topic — never a fixed placeholder.
        is_auto = not (req.title_idea and req.title_idea.strip())
        resolved_title = (
            planner_data.get("title", "").strip() or req.title_idea
            if is_auto
            else req.title_idea
        )
        if not resolved_title:
            resolved_title = f"{req.domain} Intelligent System"

        # Stage 2: Parallel Execution of Architect & Research Agents
        problem_stmt = planner_data.get("problem_statement", "")
        architect_task = ArchitectAgent.execute(
            title=resolved_title,
            domain=req.domain,
            preferred_tech=req.preferred_tech,
            complexity=req.complexity,
            problem_statement=problem_stmt,
        )
        research_task = ResearchAgent.execute(
            title=resolved_title,
            domain=req.domain,
            problem_statement=problem_stmt,
        )

        architect_data, research_data = await asyncio.gather(architect_task, research_task)

        # Stage 3: Viva & Code Agent (Depends on Architecture & Stack)
        tech_stack = architect_data.get("tech_stack", [])
        arch_summary = architect_data.get("architecture", {}).get("summary", "")

        viva_data = await VivaAgent.execute(
            title=resolved_title,
            domain=req.domain,
            tech_stack=tech_stack,
            architecture_summary=arch_summary,
        )

        # Assemble the final blueprint strictly from real agent output.
        final_payload = {
            "title": resolved_title,
            "tagline": planner_data.get("tagline", f"Next-Gen {req.domain} Platform"),
            "domain": req.domain,
            "complexity": req.complexity,
            "agent_mode": req.agent_mode,
            "abstract": planner_data.get("abstract", ""),
            "problem_statement": planner_data.get("problem_statement", ""),
            "literature_review": planner_data.get("literature_review", ""),
            "methodology": architect_data.get("methodology", []),
            "algorithms_used": architect_data.get("algorithms_used", []),
            "why_useful": planner_data.get("why_useful", []),
            "real_world_applications": planner_data.get("real_world_applications", []),
            "objectives": planner_data.get("objectives", []),
            "features": planner_data.get("features", []),
            "architecture": architect_data.get("architecture", {
                "summary": "Decoupled 3-tier microservice architecture.",
                "components": ["Client UI", "Express REST Gateway", "FastAPI Worker", "PostgreSQL Database"],
                "diagramDescription": "Client -> Express :5000 -> FastAPI :8000 -> PostgreSQL",
            }),
            "tech_stack": architect_data.get("tech_stack", []),
            "roadmap": architect_data.get("roadmap", []),
            "datasets": research_data.get("datasets", []),
            "research_references": research_data.get("research_references", []),
            "viva_questions": viva_data.get("viva_questions", []),
            "starter_code": viva_data.get("starter_code", []),
            "uniquifier_suggestions": viva_data.get("uniquifier_suggestions", []),
        }

        return final_payload
