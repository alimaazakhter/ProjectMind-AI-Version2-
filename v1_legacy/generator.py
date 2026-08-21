"""
generator.py — Prompt templates and output parsing for the AI Auto Project Generator.

Contains the structured prompts sent to the LLM via LangChain, and helpers
to parse the raw model response into sections.
"""

from langchain_core.prompts import ChatPromptTemplate

# ---------------------------------------------------------------------------
# Section keys (used for parsing & display)
# ---------------------------------------------------------------------------
SECTION_KEYS = [
    "Project Title",
    "Abstract",
    "Problem Statement",
    "Literature Review",
    "Methodology",
    "Algorithms Used",
    "Why This Project Is Useful",
    "Real-World Applications",
    "Technology Stack",
    "Dataset Suggestions",
    "System Architecture",
    "Step-by-Step Implementation",
    "Folder Structure",
    "Future Enhancements",
    "Resume Description",
    "References",
]

SECTION_ICONS = {
    "Project Title": "🏷️",
    "Abstract": "📖",
    "Problem Statement": "🎯",
    "Literature Review": "📚",
    "Methodology": "🔬",
    "Algorithms Used": "⚙️",
    "Why This Project Is Useful": "💡",
    "Real-World Applications": "🌍",
    "Technology Stack": "🛠️",
    "Dataset Suggestions": "📊",
    "System Architecture": "🏗️",
    "Step-by-Step Implementation": "📝",
    "Folder Structure": "📁",
    "Future Enhancements": "🚀",
    "Resume Description": "📄",
    "References": "🔗",
}

# Sections that users can toggle on/off
TOGGLEABLE_SECTIONS = [
    "Abstract",
    "Problem Statement",
    "Literature Review",
    "Methodology",
    "Algorithms Used",
    "Technology Stack",
    "Future Enhancements",
    "References",
]

# ---------------------------------------------------------------------------
# Planner prompt — produces a concise project brief
# ---------------------------------------------------------------------------
PLANNER_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a senior academic project advisor for MCA and Engineering students. "
            "Your job is to brainstorm a unique, practical, and industry-relevant project idea.\n"
            "Think step by step:\n"
            "1. Consider the student's domain, skill level, preferred technologies, and complexity.\n"
            "2. Identify a real-world problem that can be solved.\n"
            "3. Propose ONE clear project concept in 3-4 sentences.\n"
            "Respond ONLY with the project concept — no other commentary.",
        ),
        (
            "human",
            "Domain: {domain}\n"
            "Skill Level: {skill_level}\n"
            "Preferred Technologies: {technologies}\n"
            "Project Complexity: {complexity}\n\n"
            "Generate a unique, interesting project idea that is implementable in 4-8 weeks.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Custom project prompt — user provides their own description
# ---------------------------------------------------------------------------
CUSTOM_PROJECT_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a senior academic project advisor for MCA and Engineering students. "
            "The student has described their project idea. Extract the core concept and expand "
            "it into a clear, implementable project brief in 3-4 sentences.\n"
            "Respond ONLY with the refined project concept — no other commentary.",
        ),
        (
            "human",
            "Student's project idea: {custom_idea}\n\n"
            "Domain: {domain}\n"
            "Skill Level: {skill_level}\n"
            "Preferred Technologies: {technologies}\n"
            "Project Complexity: {complexity}\n\n"
            "Refine this into a clear, implementable project concept.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Generator prompt — expands the brief into structured sections
# ---------------------------------------------------------------------------
GENERATOR_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a professional project blueprint generator for MCA/Engineering students.\n"
            "Given a project concept, you must produce a COMPLETE project blueprint with "
            "the following numbered sections. Use the EXACT section headers shown below.\n\n"
            "{section_list}\n\n"
            "Rules:\n"
            "- Be specific and detailed — no vague suggestions.\n"
            "- Technology stack must match the student's preferred technologies.\n"
            "- Folder structure should use a tree-like format.\n"
            "- Resume description should be 2-3 bullet points ready to paste into a resume.\n"
            "- The project must be completable in 4-8 weeks.\n"
            "- Make the idea practical, unique, and industry-relevant.\n"
            "- Use markdown formatting within each section.",
        ),
        (
            "human",
            "Project concept:\n{concept}\n\n"
            "Student details:\n"
            "- Domain: {domain}\n"
            "- Skill Level: {skill_level}\n"
            "- Technologies: {technologies}\n"
            "- Complexity: {complexity}\n\n"
            "Generate the full project blueprint now.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Reviewer prompt — for multi-agent mode
# ---------------------------------------------------------------------------
REVIEWER_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a senior academic project reviewer. Your job is to review a project "
            "blueprint and improve it. You should:\n"
            "1. Fix any inconsistencies or vague points.\n"
            "2. Improve clarity and depth of each section.\n"
            "3. Ensure the technology stack is coherent.\n"
            "4. Add more specific details where needed.\n"
            "5. Keep the EXACT SAME section headers and format.\n\n"
            "Return the improved blueprint with the same section structure.",
        ),
        (
            "human",
            "Here is the project blueprint to review and improve:\n\n{blueprint}\n\n"
            "Student details:\n"
            "- Domain: {domain}\n"
            "- Skill Level: {skill_level}\n"
            "- Technologies: {technologies}\n"
            "- Complexity: {complexity}\n\n"
            "Please review and return the improved blueprint.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Regenerate a single section
# ---------------------------------------------------------------------------
REGENERATE_SECTION_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a professional project blueprint generator. You need to regenerate "
            "ONLY the '{section_name}' section of a project blueprint.\n"
            "Use the project context provided to generate a fresh, improved version.\n"
            "Respond with ONLY the content for that section — no headers, no other sections.",
        ),
        (
            "human",
            "Project Title: {title}\n"
            "Domain: {domain}\n"
            "Existing content for context:\n{existing_content}\n\n"
            "Please regenerate the '{section_name}' section with fresh, improved content.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Viva Questions
# ---------------------------------------------------------------------------
VIVA_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an academic examiner preparing viva questions for a student project.\n"
            "Generate 8-10 viva/oral exam questions with detailed answers.\n"
            "Format as:\n"
            "**Q1:** [question]\n"
            "**A1:** [detailed answer]\n\n"
            "Cover: project concept, technical choices, methodology, challenges, and future scope.",
        ),
        (
            "human",
            "Project Title: {title}\n"
            "Project Overview:\n{overview}\n\n"
            "Generate viva questions with answers for this project.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Starter Code
# ---------------------------------------------------------------------------
STARTER_CODE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a code generator for academic projects. Generate a working Python "
            "starter code template for the given project.\n"
            "Include:\n"
            "- Necessary imports\n"
            "- Basic project structure (classes/functions)\n"
            "- Comments explaining each part\n"
            "- Placeholder data processing and model training if applicable\n"
            "- A main() function\n\n"
            "The code should be ready to run with minor modifications. Use proper Python best practices.",
        ),
        (
            "human",
            "Project Title: {title}\n"
            "Technology Stack: {tech_stack}\n"
            "Project Overview:\n{overview}\n\n"
            "Generate complete, working starter code for this project.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Timeline
# ---------------------------------------------------------------------------
TIMELINE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an academic project planner. Generate a detailed week-by-week "
            "project timeline for completion in 4-8 weeks.\n"
            "Format as:\n"
            "**Week 1:** [task description]\n"
            "**Week 2:** [task description]\n"
            "... etc.\n\n"
            "Include milestones and deliverables for each week.",
        ),
        (
            "human",
            "Project Title: {title}\n"
            "Complexity: {complexity}\n"
            "Project Overview:\n{overview}\n\n"
            "Generate a detailed project timeline.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Tech Stack Recommendation
# ---------------------------------------------------------------------------
TECH_STACK_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a technology advisor for academic projects. Recommend a complete "
            "technology stack for the given project.\n"
            "Format your response as:\n"
            "**Frontend:** [recommendations with reasons]\n"
            "**Backend:** [recommendations with reasons]\n"
            "**ML/AI Libraries:** [recommendations with reasons]\n"
            "**Database:** [recommendations with reasons]\n"
            "**DevOps/Deployment:** [recommendations with reasons]\n"
            "**Testing:** [recommendations with reasons]\n\n"
            "Explain WHY each technology is chosen.",
        ),
        (
            "human",
            "Project Title: {title}\n"
            "Domain: {domain}\n"
            "Skill Level: {skill_level}\n"
            "Project Overview:\n{overview}\n\n"
            "Recommend a complete technology stack.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Architecture Overview
# ---------------------------------------------------------------------------
ARCHITECTURE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a system architect. Generate a detailed architecture overview "
            "for the given project.\n"
            "Include:\n"
            "1. A text-based system flow diagram using arrows (→)\n"
            "   Example: User → Frontend → API Gateway → Backend → ML Model → Database\n"
            "2. Description of each component\n"
            "3. Data flow explanation\n"
            "4. Key design decisions\n\n"
            "Use clear formatting with markdown.",
        ),
        (
            "human",
            "Project Title: {title}\n"
            "Technology Stack: {tech_stack}\n"
            "Project Overview:\n{overview}\n\n"
            "Generate a detailed architecture overview.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Make it Unique
# ---------------------------------------------------------------------------
MAKE_UNIQUE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a creative academic project advisor. Your job is to take an existing "
            "project blueprint and make it MORE UNIQUE and innovative.\n"
            "You should:\n"
            "1. Suggest a more creative project title\n"
            "2. Add innovative features that differentiate this project\n"
            "3. Propose novel approaches or methodologies\n"
            "4. Suggest unique datasets or use cases\n"
            "5. Add cutting-edge tech or techniques\n\n"
            "Return the complete improved blueprint with the SAME section format.\n"
            "Make sure the output is original and plagiarism-resistant.",
        ),
        (
            "human",
            "Here is the existing project blueprint:\n\n{blueprint}\n\n"
            "Make this project more unique, innovative, and original. "
            "Keep the same section structure.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# References / Research Papers
# ---------------------------------------------------------------------------
REFERENCES_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an academic research assistant. Generate a list of relevant "
            "research topics and references for the given project.\n"
            "Format as IEEE-style references:\n"
            "[1] Author(s), \"Title,\" Journal/Conference, vol. X, no. Y, pp. Z, Year.\n\n"
            "Include 8-12 references covering:\n"
            "- Core methodology papers\n"
            "- Related work in the domain\n"
            "- Technology-specific papers\n"
            "- Recent surveys or reviews\n\n"
            "Note: These are suggested reference topics and formats. Students should verify "
            "and find actual papers from IEEE Xplore, Google Scholar, or arXiv.",
        ),
        (
            "human",
            "Project Title: {title}\n"
            "Domain: {domain}\n"
            "Project Overview:\n{overview}\n\n"
            "Generate relevant references in IEEE format.",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Smart Suggestions — domain → project ideas
# ---------------------------------------------------------------------------
SMART_SUGGEST_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a project idea generator. Given a domain, suggest exactly 3 "
            "concise project ideas.\n"
            "Format each as a single line:\n"
            "1. [Brief project title and one-line description]\n"
            "2. [Brief project title and one-line description]\n"
            "3. [Brief project title and one-line description]\n\n"
            "Keep each suggestion under 15 words. Be creative and practical.",
        ),
        (
            "human",
            "Domain: {domain}\n"
            "Skill Level: {skill_level}\n\n"
            "Suggest 3 project ideas.",
        ),
    ]
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def build_section_list(selected_sections: list[str] | None = None) -> str:
    """Build a numbered section list string for the generator prompt."""
    if selected_sections is None:
        selected_sections = SECTION_KEYS

    lines = []
    for i, key in enumerate(selected_sections, 1):
        lines.append(f"## {i}. {key}")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Output parsing
# ---------------------------------------------------------------------------
def parse_sections(raw_text: str) -> dict[str, str]:
    """Parse the raw LLM output into a dict keyed by section name.

    Looks for markdown headers matching ``## N. Section Name`` and splits
    the text accordingly.  Falls back to returning the full text under a
    single "Full Output" key if no sections are detected.
    """
    import re

    sections: dict[str, str] = {}
    # Pattern matches headers like "## 1. Project Title" or "## 1.Project Title"
    header_pattern = re.compile(
        r"^##\s*\d+\.\s*(.+)$", re.MULTILINE
    )

    matches = list(header_pattern.finditer(raw_text))

    if not matches:
        # Fallback: try "**1. Section Name**" style
        header_pattern = re.compile(
            r"^\*\*\d+\.\s*(.+?)\*\*", re.MULTILINE
        )
        matches = list(header_pattern.finditer(raw_text))

    if not matches:
        # Fallback: try "1. **Section Name**" style
        header_pattern = re.compile(
            r"^\d+\.\s*\*\*(.+?)\*\*", re.MULTILINE
        )
        matches = list(header_pattern.finditer(raw_text))

    if not matches:
        return {"Full Output": raw_text.strip()}

    for i, match in enumerate(matches):
        header = match.group(1).strip().rstrip(":")
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(raw_text)
        content = raw_text[start:end].strip()
        # Map to canonical key if possible
        canonical = _match_canonical(header)
        sections[canonical] = content

    return sections


def _match_canonical(header: str) -> str:
    """Best-effort match of a parsed header to our canonical SECTION_KEYS."""
    header_lower = header.lower()
    for key in SECTION_KEYS:
        if key.lower() in header_lower or header_lower in key.lower():
            return key
    # Close-enough match by first significant word
    for key in SECTION_KEYS:
        key_words = set(key.lower().split())
        header_words = set(header_lower.split())
        if len(key_words & header_words) >= 2:
            return key
    return header  # give up — use as-is
