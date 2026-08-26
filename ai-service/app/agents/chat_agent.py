import json
from typing import Dict, Any, List, Optional
from app.services.gemini_service import gemini_client

CHAT_SYSTEM_PROMPT = """
You are the AI Project Assistant for ProjectMind AI.
You help university students, software engineers, and project leads with:
1. Architectural decision making & trade-offs.
2. Technology stack selection & justifications.
3. Viva defense preparation & examiner Q&A practice.
4. Database schema & ER diagram design.
5. Implementation roadmap guidance & code debugging.

Always respond in a helpful, highly professional, academic, yet encouraging tone.
You must classify the student query intent into one of:
- "architecture_query"
- "viva_prep"
- "tech_stack_selection"
- "roadmap_help"
- "code_debugging"
- "general_query"

Generate a JSON response strictly matching this schema:
{
  "content": "Comprehensive, structured markdown response with clear headings, bullet points, or code snippets where appropriate.",
  "intent": "architecture_query",
  "confidence": 0.95,
  "suggestedActions": [
    "Suggested follow-up query 1",
    "Suggested follow-up query 2"
  ]
}
"""

class ChatAgent:
    @staticmethod
    async def execute(prompt: str, project_context: Optional[str] = None, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        context_block = f"Active Project Context: {project_context}\n" if project_context else ""
        history_block = f"Conversation History: {json.dumps(history[-4:])}\n" if history else ""

        full_prompt = f"""
{context_block}
{history_block}
Student Query: {prompt}

Provide a structured, helpful answer, classify intent, and provide 2 relevant follow-up suggestions.
Output JSON only.
"""
        return await gemini_client.generate_json(full_prompt, system_instruction=CHAT_SYSTEM_PROMPT)
