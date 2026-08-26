from typing import Dict, Any, List
from app.services.gemini_service import gemini_client

VIVA_SYSTEM_PROMPT = """
You are the Senior Viva Defense & Code Engineering Agent for ProjectMind AI.
Your role is to formulate challenging examiner-level Viva Defense questions with model answers, clean boilerplate starter code, and project "Uniquifiers" (distinguishing features to help students secure top marks).

Generate a JSON object strictly matching this schema:
{
  "viva_questions": [
    {
      "question": "Challenging architectural or algorithmic defense question",
      "answer": "Comprehensive, technically defensible answer explaining trade-offs and rationale.",
      "category": "Architecture Defense" // or "Security & Auth", "Database Design", "Scalability", "Evaluation Metrics"
    }
  ],
  "starter_code": [
    {
      "file": "server.py (FastAPI AI Worker)",
      "language": "python",
      "code": "# Working boilerplate code snippet demonstrating core logic\\nfrom fastapi import FastAPI\\n..."
    }
  ],
  "uniquifier_suggestions": [
    "Innovative feature idea 1 that differentiates this project from generic clones",
    "Innovative feature idea 2 that adds real-world value"
  ]
}
Provide 3-4 comprehensive viva defense questions, 1-2 clean starter code snippets, and 2-3 unique project innovation proposals.
"""

class VivaAgent:
    @staticmethod
    async def execute(title: str, domain: str, tech_stack: List[Dict[str, str]], architecture_summary: str) -> Dict[str, Any]:
        prompt = f"""
Project Title: {title}
Domain: {domain}
Tech Stack: {tech_stack}
Architecture Summary: {architecture_summary}

Generate examiner viva defense Q&As, working boilerplate starter code, and uniquifier suggestions.
Output JSON only.
"""
        return await gemini_client.generate_json(prompt, system_instruction=VIVA_SYSTEM_PROMPT)
