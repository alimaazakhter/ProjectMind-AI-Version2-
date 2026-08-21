import { ProjectBlueprint } from '@/types/project';
import { ChatMessage } from '@/types/ai';

export const MOCK_PROJECTS: ProjectBlueprint[] = [
  {
    id: 'proj-001',
    title: 'Autonomous AI Code Reviewer & Security Auditor',
    tagline: 'Multi-agent LLM system that inspects pull requests, detects OWASP vulnerabilities, and enforces coding standards.',
    domain: 'Artificial Intelligence & Software Engineering',
    complexity: 'Advanced',
    problemStatement:
      'Manual code reviews are slow, error-prone, and often miss complex security vulnerabilities (e.g. SQL injection, SSRF, memory leaks). Engineering students and developers need an automated AI agent pipeline to analyze codebase pull requests instantly.',
    objectives: [
      'Parse AST (Abstract Syntax Tree) from GitHub pull request diffs.',
      'Deploy multi-agent LLM classifier to categorize severity of code smells.',
      'Suggest automated fix patches formatted as inline GitHub comments.',
      'Generate comprehensive compliance and security audit reports in PDF format.',
    ],
    features: [
      {
        title: 'Multi-Agent PR Inspector',
        description: 'Planner agent breaks down diffs, Inspector agent identifies bugs, Formatter agent drafts GitHub comments.',
        priority: 'high',
      },
      {
        title: 'OWASP Security Scanner',
        description: 'Pre-trained classification head that flags top 10 security vulnerabilities before code deployment.',
        priority: 'high',
      },
      {
        title: 'CI/CD Pipeline Integration',
        description: 'GitHub Action plugin and webhook listener for automated trigger on git push.',
        priority: 'medium',
      },
    ],
    techStack: [
      { category: 'Frontend UI', item: 'Next.js 14, Tailwind CSS, TypeScript', rationale: 'Server-side rendering for fast dashboard loading.' },
      { category: 'Main Backend', item: 'Node.js, Express.js', rationale: 'Asynchronous event handling for Webhooks and API orchestration.' },
      { category: 'AI Processing', item: 'Python, FastAPI, LangChain', rationale: 'High performance async Python runtime for Gemini AI model prompting.' },
      { category: 'Database', item: 'Supabase (PostgreSQL)', rationale: 'Relational storage for user projects, audit logs, and pull request history.' },
    ],
    architecture: {
      summary: 'Microservices architecture with Webhook Listener, Express Backend, FastAPI AI Agent Worker, and Supabase database.',
      components: ['Next.js Client', 'Express Webhook Gateway', 'FastAPI Agent Engine', 'Google Gemini API', 'Supabase Postgres'],
      diagramDescription: 'Client -> Webhook Gateway -> Queue Worker -> FastAPI Multi-Agent -> Gemini -> Supabase -> Client Notification',
    },
    datasets: [
      { name: 'Kaggle Vulnerable Code Dataset', source: 'Kaggle', description: 'Over 50,000 labeled C/Python/JS code snippets with known CWE vulnerabilities.' },
      { name: 'Defects4J Benchmark', source: 'GitHub / Academic', description: 'Collection of real bugs and fixes from Java open-source repositories.' },
    ],
    researchReferences: [
      { title: 'Large Language Models for Automated Program Repair', authors: 'Chen et al.', year: '2023', link: 'https://arxiv.org' },
      { title: 'Multi-Agent Collaboration Frameworks in Software Development', authors: 'Zhang & Li', year: '2024', link: 'https://arxiv.org' },
    ],
    roadmap: [
      { phase: 'Phase 1: Research & Requirements', duration: 'Week 1-2', tasks: ['Define AST parser scope', 'Setup Next.js & Express scaffold'] },
      { phase: 'Phase 2: AI Agent & FastAPI Pipeline', duration: 'Week 3-5', tasks: ['Integrate Gemini API', 'Build Intent Classifier & Code Auditor agents'] },
      { phase: 'Phase 3: Integration & Testing', duration: 'Week 6-7', tasks: ['Connect Supabase DB', 'Build GitHub Webhook listener'] },
      { phase: 'Phase 4: Documentation & Defense', duration: 'Week 8', tasks: ['Generate Viva Q&As', 'Export PDF Blueprint & Project report'] },
    ],
    vivaQuestions: [
      { question: 'What is the advantage of using a Multi-Agent system over a single LLM prompt?', answer: 'Multi-agent architectures separate responsibilities (e.g. Planning vs Inspection vs Formatting), reducing hallucination and improving reasoning precision.', category: 'AI & System Design' },
      { question: 'How does your system handle secret API key security?', answer: 'API keys are stored exclusively in server-side environment variables (.env) inside FastAPI/Express, never exposed to client-side JS bundle.', category: 'Security' },
      { question: 'Why use FastAPI for the AI service instead of handling AI logic directly in Express?', answer: 'FastAPI provides native async support for Python AI libraries, typed data validation with Pydantic, and fast integration with Google Gemini SDK.', category: 'Architecture' },
    ],
    starterCode: [
      {
        file: 'main_agent.py',
        language: 'python',
        code: `from fastapi import FastAPI, HTTPException
import google.generativeai as genai
import os

app = FastAPI(title="ProjectMind AI Service")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.post("/api/v1/ai/audit")
async def audit_code(code_snippet: str):
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"Perform a security review of the following code:\\n{code_snippet}"
    response = model.generate_content(prompt)
    return {"status": "success", "audit": response.text}`,
      },
    ],
    uniquifierSuggestions: [
      'Add live AST visualizer showing exact lines flagged with CWE vulnerability codes.',
      'Implement custom auto-fix pull request generation directly back into user GitHub repositories.',
    ],
    createdAt: '2026-08-18',
    updatedAt: '2026-08-19',
  },
];

export const INITIAL_ASSISTANT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    content:
      'Hello! I am your ProjectMind AI Assistant. I can help you choose project ideas, design system architecture, select tech stacks, prepare for Viva exams, or structure your MCA final year documentation. What project topic would you like to explore today?',
    timestamp: '10:00 AM',
  },
];
