from typing import Dict, Any
from app.services.gemini_service import gemini_client

RESEARCH_SYSTEM_PROMPT = """
You are the Academic Research & Dataset Curation Agent for ProjectMind AI.
Your role is to discover and format genuine-sounding, academically rigorous research references (arXiv style) and real-world benchmark datasets (Kaggle, Hugging Face, Open Data Hub).

Generate a JSON object strictly matching this schema:
{
  "datasets": [
    {
      "name": "Exact Dataset Name",
      "source": "Kaggle / Hugging Face / UCI / IEEE DataPort",
      "description": "Thorough 2-sentence description of the dataset structure, records count, and evaluation utility."
    }
  ],
  "research_references": [
    {
      "title": "Academic Paper Title",
      "authors": "Author 1 et al.",
      "year": "2023",
      "link": "https://arxiv.org/abs/2301.00000"
    }
  ]
}
Provide 2-3 high-quality datasets and 2-3 relevant peer-reviewed/arXiv research citations.
"""

class ResearchAgent:
    @staticmethod
    async def execute(title: str, domain: str, problem_statement: str) -> Dict[str, Any]:
        prompt = f"""
Project Title: {title}
Domain: {domain}
Problem Context: {problem_statement[:300]}

Find 2-3 benchmark datasets and 2-3 academic research paper references relevant to this project.
Output JSON only.
"""
        return await gemini_client.generate_json(prompt, system_instruction=RESEARCH_SYSTEM_PROMPT)
