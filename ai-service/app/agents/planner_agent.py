from typing import Dict, Any, List
from app.services.gemini_service import gemini_client

PLANNER_SYSTEM_PROMPT = """
You are the Lead Project Formulation & Academic Planner Agent for ProjectMind AI.
Your role is to formulate high-impact, university-accredited, production-grade project foundations.

You will receive:
- Title / Core Topic
- Domain
- Target Skill Level
- Complexity Tier
- Custom User Requirements

Generate a JSON object strictly matching this schema:
{
  "tagline": "A concise, catchy one-line technical subtitle",
  "problem_statement": "A thorough, 2-3 paragraph academic problem formulation highlighting current limitations and the gap addressed.",
  "objectives": [
    "Specific, measurable technical objective 1",
    "Specific, measurable technical objective 2",
    "Specific, measurable technical objective 3",
    "Specific, measurable technical objective 4"
  ],
  "features": [
    {
      "title": "Feature Title",
      "description": "Comprehensive technical description of what this feature achieves",
      "priority": "high" // or "medium" or "low"
    }
  ]
}
Ensure the objectives and features are rigorous, highly technical, and appropriate for final-year engineering / MCA project evaluations.
"""

class PlannerAgent:
    @staticmethod
    async def execute(title: str, domain: str, skill_level: str, complexity: str, custom_req: str = None) -> Dict[str, Any]:
        prompt = f"""
Project Title: {title}
Domain: {domain}
Target Skill Level: {skill_level}
Complexity Tier: {complexity}
Custom Constraints / Instructions: {custom_req or 'None'}

Formulate the academic problem statement, research objectives, and 4-6 prioritized technical features.
Output JSON only.
"""
        return await gemini_client.generate_json(prompt, system_instruction=PLANNER_SYSTEM_PROMPT)
