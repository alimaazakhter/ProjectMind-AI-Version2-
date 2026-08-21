"""
agent.py — Agentic LLM pipeline for the AI Auto Project Generator.

Workflow (Single Agent):
  User Input → Planner Agent → Project Generator Agent → Parsed Sections

Workflow (Multi-Agent):
  User Input → Planner Agent → Content Generator Agent → Reviewer Agent → Parsed Sections

Uses LangChain's ChatOllama to call a local Ollama model.
"""

from __future__ import annotations

from collections.abc import Callable

from langchain_google_genai import ChatGoogleGenerativeAI  # pyre-ignore[21]

# --- OLLAMA IMPORT (Commented out for Cloud Deployment) ---
# from langchain_ollama import ChatOllama  # pyre-ignore[21]

from generator import (  # pyre-ignore[21]
    PLANNER_PROMPT,
    CUSTOM_PROJECT_PROMPT,
    GENERATOR_PROMPT,
    REVIEWER_PROMPT,
    REGENERATE_SECTION_PROMPT,
    VIVA_PROMPT,
    STARTER_CODE_PROMPT,
    TIMELINE_PROMPT,
    TECH_STACK_PROMPT,
    ARCHITECTURE_PROMPT,
    MAKE_UNIQUE_PROMPT,
    REFERENCES_PROMPT,
    SMART_SUGGEST_PROMPT,
    SECTION_KEYS,
    build_section_list,
    parse_sections,
)


# ---------------------------------------------------------------------------
# Model helpers
# ---------------------------------------------------------------------------
import os
try:
    import streamlit as st
    _sekret = st.secrets.get("GOOGLE_API_KEY", None)
except Exception:
    _sekret = None

GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY") or _sekret


# --- GOOGLE GEMINI CONFIGURATION ---
PREFERRED_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro"]


def _get_llm(model: str = "gemini-2.0-flash", temperature: float = 0.7) -> ChatGoogleGenerativeAI:
    """Return a ChatGoogleGenerativeAI instance."""
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=GEMINI_API_KEY,
        temperature=temperature,
        max_output_tokens=4096,
    )

# --- OLLAMA LOCAL CONFIGURATION (COMMENTED OUT) ---
# PREFERRED_MODELS = ["gemma3:1b", "llama3", "mistral"]
#
# def _get_llm(model: str = "llama3", temperature: float = 0.7) -> ChatOllama:
#     """Return a ChatOllama instance."""
#     return ChatOllama(
#         model=model,
#         temperature=temperature,
#         num_predict=4096,
#     )


def _try_invoke(chain, inputs: dict, models: list[str] | None = None) -> str:
    """Try invoking the chain with each model in order until one succeeds."""
    models = models or PREFERRED_MODELS
    errors = []

    for model_name in models:
        try:
            llm = _get_llm(model=model_name)
            bound_chain = chain | llm
            result = bound_chain.invoke(inputs)  # pyre-ignore[16]
            return result.content if hasattr(result, "content") else str(result)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"[{model_name}] failed: {exc}")
            continue

    joined_errors = "\n".join(errors)
    raise ConnectionError(
        # --- GOOGLE GEMINI ERROR ---
        f"Could not reach Google Gemini with any of the requested models. \n\n"
        f"Detailed Diagnostic Errors:\n{joined_errors}\n\n"
        "Make sure your GOOGLE_API_KEY is absolutely correct and has quota available."
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def generate_project(
    domain: str,
    skill_level: str,
    technologies: str,
    complexity: str,
    custom_idea: str = "",
    selected_sections: list[str] | None = None,
    multi_agent: bool = False,
    on_status: Callable | None = None,
) -> dict[str, str]:
    """Run the full agentic pipeline and return parsed sections.

    Parameters
    ----------
    domain, skill_level, technologies, complexity : str
        Standard project parameters.
    custom_idea : str
        Free-text project description from the user (optional).
    selected_sections : list[str], optional
        Which sections to include. Defaults to all SECTION_KEYS.
    multi_agent : bool
        If True, run the 3-agent pipeline (Planner → Generator → Reviewer).
    on_status : callable, optional
        Callback ``fn(message: str)`` to report progress to the UI.

    Returns
    -------
    dict[str, str]
        Keys are section names, values are markdown content.
    """
    if selected_sections is None:
        selected_sections = list(SECTION_KEYS)

    section_list_str = build_section_list(selected_sections)

    inputs = {
        "domain": domain,
        "skill_level": skill_level,
        "technologies": technologies,
        "complexity": complexity,
    }

    # -- Step 1: Planner Agent --
    if on_status:
        on_status("🧠 Planner Agent is brainstorming a project idea…")

    if custom_idea.strip():
        concept = _try_invoke(CUSTOM_PROJECT_PROMPT, {**inputs, "custom_idea": custom_idea})
    else:
        concept = _try_invoke(PLANNER_PROMPT, inputs)

    # -- Step 2: Generator Agent --
    if on_status:
        on_status("📐 Generator Agent is building the full blueprint…")

    gen_inputs = {**inputs, "concept": concept, "section_list": section_list_str}
    raw_blueprint = _try_invoke(GENERATOR_PROMPT, gen_inputs)

    # -- Step 3 (Multi-Agent): Reviewer Agent --
    if multi_agent:
        if on_status:
            on_status("🔍 Reviewer Agent is improving the blueprint…")
        review_inputs = {**inputs, "blueprint": raw_blueprint}
        raw_blueprint = _try_invoke(REVIEWER_PROMPT, review_inputs)

    # -- Step 4: Output parsing --
    if on_status:
        on_status("✅ Formatting output…")

    sections = parse_sections(raw_blueprint)
    return sections


def regenerate_section(
    section_name: str,
    title: str,
    domain: str,
    existing_content: str,
    on_status: Callable | None = None,
) -> str:
    """Regenerate a single section and return its new content."""
    if on_status:
        on_status(f"🔄 Regenerating {section_name}…")

    inputs = {
        "section_name": section_name,
        "title": title,
        "domain": domain,
        "existing_content": existing_content,
    }
    return _try_invoke(REGENERATE_SECTION_PROMPT, inputs)


def generate_viva_questions(
    title: str,
    overview: str,
    on_status: Callable | None = None,
) -> str:
    """Generate viva questions with answers."""
    if on_status:
        on_status("🎓 Generating viva questions…")
    return _try_invoke(VIVA_PROMPT, {"title": title, "overview": overview})


def generate_starter_code(
    title: str,
    tech_stack: str,
    overview: str,
    on_status: Callable | None = None,
) -> str:
    """Generate starter code for the project."""
    if on_status:
        on_status("💻 Generating starter code…")
    return _try_invoke(STARTER_CODE_PROMPT, {
        "title": title,
        "tech_stack": tech_stack,
        "overview": overview,
    })


def generate_timeline(
    title: str,
    complexity: str,
    overview: str,
    on_status: Callable | None = None,
) -> str:
    """Generate a week-by-week project timeline."""
    if on_status:
        on_status("📅 Generating project timeline…")
    return _try_invoke(TIMELINE_PROMPT, {
        "title": title,
        "complexity": complexity,
        "overview": overview,
    })


def generate_tech_stack(
    title: str,
    domain: str,
    skill_level: str,
    overview: str,
    on_status: Callable | None = None,
) -> str:
    """Generate tech stack recommendations."""
    if on_status:
        on_status("🛠️ Generating tech stack recommendations…")
    return _try_invoke(TECH_STACK_PROMPT, {
        "title": title,
        "domain": domain,
        "skill_level": skill_level,
        "overview": overview,
    })


def generate_architecture(
    title: str,
    tech_stack: str,
    overview: str,
    on_status: Callable | None = None,
) -> str:
    """Generate architecture overview with system flow."""
    if on_status:
        on_status("🏗️ Generating architecture overview…")
    return _try_invoke(ARCHITECTURE_PROMPT, {
        "title": title,
        "tech_stack": tech_stack,
        "overview": overview,
    })


def make_unique(
    blueprint_text: str,
    on_status: Callable | None = None,
) -> dict[str, str]:
    """Rewrite blueprint to be more unique and innovative."""
    if on_status:
        on_status("✨ Making the project more unique and innovative…")
    raw = _try_invoke(MAKE_UNIQUE_PROMPT, {"blueprint": blueprint_text})
    return parse_sections(raw)


def generate_references(
    title: str,
    domain: str,
    overview: str,
    on_status: Callable | None = None,
) -> str:
    """Generate IEEE-style references."""
    if on_status:
        on_status("🔗 Generating references…")
    return _try_invoke(REFERENCES_PROMPT, {
        "title": title,
        "domain": domain,
        "overview": overview,
    })


def get_smart_suggestions(
    domain: str,
    skill_level: str,
    on_status: Callable | None = None,
) -> str:
    """Get 2-3 project idea suggestions for a domain."""
    if on_status:
        on_status("💡 Generating smart suggestions…")
    return _try_invoke(SMART_SUGGEST_PROMPT, {
        "domain": domain,
        "skill_level": skill_level,
    })


def chat_with_ai(user_message: str, context: str = "") -> str:
    """Simple chat interaction — send a message and get a response."""
    from langchain_core.prompts import ChatPromptTemplate

    chat_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an intelligent academic project assistant. "
                "Help the user with their project-related questions. "
                "Be detailed, helpful, and use markdown formatting.\n\n"
                "Project context (if available):\n{context}",
            ),
            ("human", "{message}"),
        ]
    )
    return _try_invoke(chat_prompt, {"message": user_message, "context": context})
