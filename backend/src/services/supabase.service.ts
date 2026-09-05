import { randomUUID } from 'crypto';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { ProjectBlueprint, ProjectRequirement, ProjectHistoryEntity } from '../models/project.types.js';
import { ChatMessage, ChatSessionEntity, ChatMessageEntity } from '../models/chat.types.js';
import { UserProfile } from '../models/user.types.js';

// In-Memory Fallback Storage for zero-downtime development
const inMemoryProjects: Map<string, any> = new Map();
const inMemoryRequirements: Map<string, any> = new Map();
const inMemoryBlueprints: Map<string, any> = new Map();
const inMemoryTechStack: Map<string, any[]> = new Map();
const inMemoryRoadmaps: Map<string, any[]> = new Map();
const inMemoryReferences: Map<string, any[]> = new Map();
const inMemoryHistory: ProjectHistoryEntity[] = [];
const inMemoryProfiles: Map<string, UserProfile> = new Map();
const inMemorySessions: Map<string, ChatSessionEntity> = new Map();
const inMemoryMessages: ChatMessageEntity[] = [];
const inMemoryExports: { id: string; user_id: string; project_id: string; format: string; created_at: string }[] = [];

// Seed Demo Project
const DEMO_PROJECT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_ID = 'user_demo';

const DEMO_BLUEPRINT: ProjectBlueprint = {
  id: DEMO_PROJECT_ID,
  user_id: DEMO_USER_ID,
  title: 'Autonomous Code Reviewer & Security Auditor',
  tagline: 'Multi-Agent Static Analysis & Automated Pull Request Vulnerability Patching',
  domain: 'Artificial Intelligence & Software Engineering',
  complexity: 'Production Grade Architecture',
  agent_mode: 'multi',
  status: 'completed',
  problem_statement:
    'Manual peer reviews are slow, prone to oversight, and frequently miss OWASP Top 10 vulnerabilities. Existing static analysis tools lack generative context to propose verified refactoring patches automatically.',
  objectives: [
    'Deconstruct pull request diffs into AST nodes and contextual embeddings.',
    'Classify security vulnerabilities against CWE/OWASP benchmarks with confidence scores > 90%.',
    'Generate automated git patch suggestions with multi-agent verification pipeline.',
    'Provide high-throughput REST API gateway with low latency auditing.',
  ],
  features: [
    { title: 'AST & Diff Parser', description: 'Parses multivariable git diffs across JavaScript, Python, and Go.', priority: 'high' },
    { title: 'Multi-Agent Auditor', description: 'Coordinated Planner, Inspector, and Formatter agents analyze logic flaws.', priority: 'high' },
    { title: 'Auto Patch Generator', description: 'Produces clean, formatted git patch files ready for merge reviews.', priority: 'medium' },
  ],
  tech_stack: [
    { category: 'Frontend', item: 'Next.js 14 (App Router, Tailwind CSS)', rationale: 'Server-side rendering, speed, and responsive UI' },
    { category: 'API Gateway', item: 'Node.js + Express.js', rationale: 'High concurrency REST routing and Clerk auth security' },
    { category: 'AI Microservice', item: 'Python + FastAPI', rationale: 'Native async machine learning execution and Gemini integration' },
    { category: 'Database', item: 'Supabase PostgreSQL', rationale: 'ACID compliance, JSONB schema support, and real-time syncing' },
  ],
  architecture: {
    summary: 'Decoupled 3-tier microservice architecture: Next.js Client → Express REST Gateway → FastAPI Worker → Gemini API.',
    components: ['Next.js Client', 'Express REST API', 'FastAPI Worker', 'Gemini Cloud API', 'Supabase Database'],
    diagramDescription: 'Client [Next.js] ➔ REST Gateway [Express :5000] ➔ Worker [FastAPI :8000] ➔ Multi-Agent Pipeline [Gemini API] ➔ Database [PostgreSQL]',
  },
  datasets: [
    { name: 'Kaggle OWASP CWE Dataset', source: 'Kaggle / OWASP Foundation', description: '50,000+ verified code snippets with labeled security vulnerabilities.' },
    { name: 'BigCode Commit-Pack-FT', source: 'Hugging Face', description: 'Curated dataset of real pull request diffs and code review comments.' },
  ],
  research_references: [
    { title: 'Language Models for Automated Vulnerability Detection', authors: 'Chen et al.', year: '2023', link: 'https://arxiv.org/abs/2304.12345' },
    { title: 'Multi-Agent Collaboration in Automated Software Engineering', authors: 'Vaswani et al.', year: '2024', link: 'https://arxiv.org/abs/2401.56789' },
  ],
  roadmap: [
    { phase: 'Phase 1: Architecture & API Gateway Scaffolding', duration: 'Weeks 1–2', tasks: ['Setup Next.js & Express REST API', 'Configure Clerk authentication', 'Define database schemas'] },
    { phase: 'Phase 2: FastAPI AI Worker & Pipeline Integration', duration: 'Weeks 3–4', tasks: ['Build FastAPI microservice', 'Implement multi-agent prompting', 'Integrate Gemini API'] },
    { phase: 'Phase 3: Testing & Viva Defense Preparation', duration: 'Weeks 5–6', tasks: ['Run benchmark evaluations', 'Export documentation into PDF/DOCX', 'Finalize defense prep'] },
  ],
  viva_questions: [
    { question: 'Why separate AI processing into FastAPI instead of doing it in Express?', answer: 'FastAPI provides native async Python execution for ML SDKs, Pydantic type validation, and high-concurrency streaming directly with the Gemini API without blocking Express.', category: 'Architecture Defense' },
    { question: 'How is user data isolation guaranteed?', answer: 'Every database query strictly filters by the authenticated Clerk userId extracted via server-side session token verification.', category: 'Security' },
  ],
  starter_code: [
    {
      file: 'server.py (FastAPI Microservice)',
      language: 'python',
      code: 'from fastapi import FastAPI\nimport google.generativeai as genai\n\napp = FastAPI(title="ProjectMind AI Service")\n\n@app.post("/api/v1/ai/audit")\nasync def audit_code(snippet: str):\n    model = genai.GenerativeModel("gemini-1.5-flash")\n    return {"audit": model.generate_content(snippet).text}',
    },
  ],
  uniquifier_suggestions: [
    'Integrate CI/CD Webhook for automatic PR review comments on GitHub repositories.',
    'Add automated performance benchmarking metrics alongside security vulnerability checks.',
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

inMemoryProjects.set(DEMO_PROJECT_ID, {
  id: DEMO_PROJECT_ID,
  user_id: DEMO_USER_ID,
  title: DEMO_BLUEPRINT.title,
  domain: DEMO_BLUEPRINT.domain,
  complexity: DEMO_BLUEPRINT.complexity,
  agent_mode: DEMO_BLUEPRINT.agent_mode,
  status: 'completed',
  created_at: DEMO_BLUEPRINT.created_at,
  updated_at: DEMO_BLUEPRINT.updated_at,
});
inMemoryBlueprints.set(DEMO_PROJECT_ID, DEMO_BLUEPRINT);
inMemoryTechStack.set(DEMO_PROJECT_ID, DEMO_BLUEPRINT.tech_stack);
inMemoryRoadmaps.set(DEMO_PROJECT_ID, DEMO_BLUEPRINT.roadmap);
inMemoryReferences.set(DEMO_PROJECT_ID, [
  ...DEMO_BLUEPRINT.datasets.map((d) => ({ ...d, type: 'dataset' })),
  ...DEMO_BLUEPRINT.research_references.map((r) => ({ ...r, type: 'research_paper' })),
]);

export class SupabaseService {
  /**
   * Fetch all projects belonging to the authenticated user.
   */
  static async getProjectsByUser(userId: string): Promise<ProjectBlueprint[]> {
    if (!userId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select(`
            id,
            user_id,
            title,
            domain,
            complexity,
            agent_mode,
            status,
            created_at,
            updated_at,
            blueprints (*),
            project_tech_stack (*),
            project_roadmaps (*),
            project_references (*)
          `)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && projects) {
          return projects.map((p: any) => this.assembleBlueprint(p));
        }
      } catch (err: any) {
        console.warn('Supabase getProjectsByUser query warning (falling back to memory):', err.message);
      }
    }

    // In-memory fallback
    const matchedProjects = Array.from(inMemoryProjects.values()).filter(
      (p) => p.user_id === userId
    );

    return matchedProjects.map((p) => {
      const bp = inMemoryBlueprints.get(p.id) || {};
      const tech = inMemoryTechStack.get(p.id) || [];
      const road = inMemoryRoadmaps.get(p.id) || [];
      const refs = inMemoryReferences.get(p.id) || [];

      return {
        ...bp,
        id: p.id,
        user_id: p.user_id,
        title: p.title,
        domain: p.domain,
        complexity: p.complexity,
        agent_mode: p.agent_mode,
        status: p.status,
        tech_stack: tech,
        roadmap: road,
        datasets: refs.filter((r: any) => r.type === 'dataset'),
        research_references: refs.filter((r: any) => r.type === 'research_paper'),
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    });
  }

  /**
   * Fetch a single project blueprint with strict ownership validation.
   */
  static async getProjectById(id: string, userId: string, isAdmin: boolean = false): Promise<ProjectBlueprint | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: project, error } = await supabase
          .from('projects')
          .select(`
            id,
            user_id,
            title,
            domain,
            complexity,
            agent_mode,
            status,
            created_at,
            updated_at,
            blueprints (*),
            project_tech_stack (*),
            project_roadmaps (*),
            project_references (*)
          `)
          .eq('id', id)
          .single();

        if (!error && project) {
          if (!isAdmin && project.user_id !== userId) {
            throw new Error('Forbidden: You do not have permission to access this project.');
          }
          return this.assembleBlueprint(project);
        }
      } catch (err: any) {
        if (err.message?.includes('Forbidden')) throw err;
        console.warn('Supabase getProjectById query warning (falling back to memory):', err.message);
      }
    }

    // In-memory fallback
    const p = inMemoryProjects.get(id);
    if (!p) return null;

    if (!isAdmin && p.user_id !== userId) {
      throw new Error('Forbidden: You do not have permission to access this project.');
    }

    const bp = inMemoryBlueprints.get(p.id) || {};
    const tech = inMemoryTechStack.get(p.id) || [];
    const road = inMemoryRoadmaps.get(p.id) || [];
    const refs = inMemoryReferences.get(p.id) || [];

    return {
      ...bp,
      id: p.id,
      user_id: p.user_id,
      title: p.title,
      domain: p.domain,
      complexity: p.complexity,
      agent_mode: p.agent_mode,
      status: p.status,
      tech_stack: tech,
      roadmap: road,
      datasets: refs.filter((r: any) => r.type === 'dataset'),
      research_references: refs.filter((r: any) => r.type === 'research_paper'),
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  }

  /**
   * Save a newly generated or created project across normalized PostgreSQL tables with valid UUIDs.
   */
  static async createProject(
    data: Omit<ProjectBlueprint, 'id' | 'created_at' | 'updated_at'>,
    userId: string,
    requirements?: ProjectRequirement
  ): Promise<ProjectBlueprint> {
    // Belt-and-suspenders: guarantee an owner profile row exists so admin author
    // resolution never shows "Unknown User" for a real owner. The full profile
    // (real email / name) is written by POST /users/sync on login.
    await this.ensureUserProfileExists(userId);

    const projectId = randomUUID();
    const blueprintId = randomUUID();
    const now = new Date().toISOString();

    const projectEntity = {
      id: projectId,
      user_id: userId,
      title: data.title,
      domain: data.domain,
      complexity: data.complexity,
      agent_mode: data.agent_mode,
      status: 'completed',
      created_at: now,
      updated_at: now,
    };

    const blueprintEntity = {
      id: blueprintId,
      project_id: projectId,
      tagline: data.tagline,
      problem_statement: data.problem_statement,
      objectives: data.objectives,
      features: data.features,
      architecture: {
        ...(data.architecture || {}),
        abstract: data.abstract || '',
        literature_review: data.literature_review || '',
        methodology: data.methodology || [],
        algorithms_used: data.algorithms_used || [],
        why_useful: data.why_useful || [],
        real_world_applications: data.real_world_applications || [],
      },
      viva_questions: data.viva_questions,
      starter_code: data.starter_code,
      uniquifier_suggestions: data.uniquifier_suggestions,
      created_at: now,
      updated_at: now,
    };

    // Always persist to in-memory store for instant zero-downtime availability
    inMemoryProjects.set(projectId, projectEntity);
    inMemoryBlueprints.set(projectId, blueprintEntity);
    inMemoryTechStack.set(projectId, data.tech_stack || []);
    inMemoryRoadmaps.set(projectId, data.roadmap || []);
    inMemoryReferences.set(projectId, [
      ...(data.datasets || []).map((d) => ({ ...d, type: 'dataset' })),
      ...(data.research_references || []).map((r) => ({ ...r, type: 'research_paper' })),
    ]);
    inMemoryHistory.push({
      id: `hist-${Date.now()}`,
      project_id: projectId,
      user_id: userId,
      action: 'PROJECT_CREATED',
      version_tag: 'v1.0',
      changes_summary: `Initial blueprint generated with ${data.agent_mode.toUpperCase()}-agent mode.`,
      created_at: now,
    });

    if (isSupabaseConfigured && supabase) {
      try {
        // supabase-js does NOT throw on row-level errors — it returns { error }.
        // Every insert is therefore checked explicitly and throws on failure, so a
        // silent partial write can never be reported back to the caller as a saved
        // project (this was the root cause of history vanishing after re-login).

        // 1. Insert projects
        const { error: projectErr } = await supabase.from('projects').insert([projectEntity]);
        if (projectErr) throw new Error(`projects insert failed: ${projectErr.message}`);

        // 2. Insert project_requirements
        if (requirements) {
          const { error: reqErr } = await supabase.from('project_requirements').insert([{
            id: randomUUID(),
            project_id: projectId,
            raw_input: requirements.raw_input || data.title,
            skill_level: requirements.skillLevel || 'intermediate',
            preferred_tech: requirements.preferredTech || [],
            complexity_level: data.complexity,
            agent_mode: data.agent_mode,
            custom_requirements: requirements.customRequirements || null,
            created_at: now,
          }]);
          if (reqErr) throw new Error(`project_requirements insert failed: ${reqErr.message}`);
        }

        // 3. Insert blueprints
        const { error: blueprintErr } = await supabase.from('blueprints').insert([blueprintEntity]);
        if (blueprintErr) throw new Error(`blueprints insert failed: ${blueprintErr.message}`);

        // 4. Insert project_tech_stack
        if (data.tech_stack?.length > 0) {
          const techRows = data.tech_stack.map((t) => ({
            id: randomUUID(),
            project_id: projectId,
            category: t.category,
            technology_name: t.item,
            justification: t.rationale,
            created_at: now,
          }));
          const { error: techErr } = await supabase.from('project_tech_stack').insert(techRows);
          if (techErr) throw new Error(`project_tech_stack insert failed: ${techErr.message}`);
        }

        // 5. Insert project_roadmaps
        if (data.roadmap?.length > 0) {
          const roadmapRows = data.roadmap.map((r, i) => ({
            id: randomUUID(),
            project_id: projectId,
            phase_number: i + 1,
            phase_title: r.phase,
            duration: r.duration,
            tasks: r.tasks,
            created_at: now,
          }));
          const { error: roadErr } = await supabase.from('project_roadmaps').insert(roadmapRows);
          if (roadErr) throw new Error(`project_roadmaps insert failed: ${roadErr.message}`);
        }

        // 6. Insert project_references
        const referenceRows: any[] = [];
        data.datasets?.forEach((d) => {
          referenceRows.push({
            id: randomUUID(),
            project_id: projectId,
            type: 'dataset',
            title: d.name,
            source_url: d.source,
            description: d.description,
            created_at: now,
          });
        });
        data.research_references?.forEach((r) => {
          referenceRows.push({
            id: randomUUID(),
            project_id: projectId,
            type: 'research_paper',
            title: r.title,
            authors: r.authors,
            year: r.year,
            source_url: r.link,
            created_at: now,
          });
        });
        if (referenceRows.length > 0) {
          const { error: refErr } = await supabase.from('project_references').insert(referenceRows);
          if (refErr) throw new Error(`project_references insert failed: ${refErr.message}`);
        }

        // 7. Insert project_history
        const { error: histErr } = await supabase.from('project_history').insert([{
          id: randomUUID(),
          project_id: projectId,
          user_id: userId,
          action: 'PROJECT_CREATED',
          version_tag: 'v1.0',
          changes_summary: `Initial blueprint generated with ${data.agent_mode.toUpperCase()}-agent mode.`,
          created_at: now,
        }]);
        if (histErr) throw new Error(`project_history insert failed: ${histErr.message}`);

        // Return the record as actually persisted (database is the source of truth),
        // so the caller/UI opens the real stored blueprint by its stable ID.
        const persisted = await this.getProjectById(projectId, userId, true);
        if (persisted) return persisted;
      } catch (err: any) {
        // Roll back any partial normalized graph (FK ON DELETE CASCADE clears children)
        // and drop the optimistic in-memory copy, so a failed persist never lingers or
        // gets served as if it were saved.
        await supabase.from('projects').delete().eq('id', projectId);
        inMemoryProjects.delete(projectId);
        inMemoryBlueprints.delete(projectId);
        inMemoryTechStack.delete(projectId);
        inMemoryRoadmaps.delete(projectId);
        inMemoryReferences.delete(projectId);
        throw new Error(`Project persistence failed: ${err.message}`);
      }
    }

    return {
      ...data,
      id: projectId,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Update an existing project blueprint with ownership validation.
   */
  static async updateProject(id: string, updates: Partial<ProjectBlueprint>, userId: string): Promise<ProjectBlueprint | null> {
    const existing = await this.getProjectById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      if (updates.title || updates.domain || updates.complexity || updates.status) {
        await supabase
          .from('projects')
          .update({
            ...(updates.title && { title: updates.title }),
            ...(updates.domain && { domain: updates.domain }),
            ...(updates.complexity && { complexity: updates.complexity }),
            ...(updates.status && { status: updates.status }),
            updated_at: now,
          })
          .eq('id', id)
          .eq('user_id', userId);
      }

      await supabase
        .from('blueprints')
        .update({
          ...(updates.problem_statement && { problem_statement: updates.problem_statement }),
          ...(updates.objectives && { objectives: updates.objectives }),
          ...(updates.features && { features: updates.features }),
          ...(updates.architecture && { architecture: updates.architecture }),
          ...(updates.viva_questions && { viva_questions: updates.viva_questions }),
          ...(updates.starter_code && { starter_code: updates.starter_code }),
          ...(updates.uniquifier_suggestions && { uniquifier_suggestions: updates.uniquifier_suggestions }),
          updated_at: now,
        })
        .eq('project_id', id);

      await supabase.from('project_history').insert([{
        id: randomUUID(),
        project_id: id,
        user_id: userId,
        action: 'BLUEPRINT_UPDATED',
        version_tag: 'v1.1',
        changes_summary: 'Project blueprint specification updated.',
        created_at: now,
      }]);
    } else {
      const p = inMemoryProjects.get(id);
      if (p) {
        inMemoryProjects.set(id, { ...p, ...updates, updated_at: now });
      }
      const b = inMemoryBlueprints.get(id);
      if (b) {
        inMemoryBlueprints.set(id, { ...b, ...updates, updated_at: now });
      }
      inMemoryHistory.push({
        id: `hist-${Date.now()}`,
        project_id: id,
        user_id: userId,
        action: 'BLUEPRINT_UPDATED',
        version_tag: 'v1.1',
        changes_summary: 'Project blueprint specification updated.',
        created_at: now,
      });
    }

    return await this.getProjectById(id, userId);
  }

  /**
   * Delete a project with cascade deletion across child tables.
   */
  static async deleteProject(id: string, userId: string): Promise<boolean> {
    const existing = await this.getProjectById(id, userId);
    if (!existing) return false;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error(`Supabase delete failed: ${error.message}`);
      return true;
    }

    inMemoryProjects.delete(id);
    inMemoryBlueprints.delete(id);
    inMemoryTechStack.delete(id);
    inMemoryRoadmaps.delete(id);
    inMemoryReferences.delete(id);
    return true;
  }

  /**
   * Log AI Assistant Chat message inside a structured session.
   */
  static async logChatMessage(
    chat: { user_id: string; project_id?: string | null; session_id?: string | null; sender: 'user' | 'assistant' | 'system'; content: string; intent?: string | null; confidence?: number | null }
  ): Promise<ChatMessage> {
    const now = new Date().toISOString();
    let sessionId: string | null = chat.session_id && chat.session_id.length === 36 ? chat.session_id : null;

    const validProjectId = chat.project_id && chat.project_id.length === 36 ? chat.project_id : null;
    const derivedTitle = chat.content.substring(0, 48) + (chat.content.length > 48 ? '…' : '');

    if (isSupabaseConfigured && supabase) {
      // Use the caller-supplied session if it exists AND belongs to this user; otherwise
      // start a NEW session. This is what makes "New Chat" work — each new conversation
      // gets its own session instead of everything piling into one.
      if (sessionId) {
        const { data: owned } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('id', sessionId)
          .eq('user_id', chat.user_id)
          .maybeSingle();
        if (!owned) sessionId = null;
      }

      if (!sessionId) {
        sessionId = randomUUID();
        await supabase.from('chat_sessions').insert([{
          id: sessionId,
          project_id: validProjectId,
          user_id: chat.user_id,
          title: derivedTitle,
          created_at: now,
          updated_at: now,
        }]);
      } else {
        // Keep the session sorted to the top of the history list.
        await supabase.from('chat_sessions').update({ updated_at: now }).eq('id', sessionId);
      }

      // Insert message
      const msgId = randomUUID();
      await supabase.from('chat_messages').insert([
        {
          id: msgId,
          session_id: sessionId,
          sender: chat.sender,
          content: chat.content,
          intent: chat.intent || null,
          confidence: chat.confidence || null,
          created_at: now,
        },
      ]);

      return {
        id: msgId,
        session_id: sessionId,
        sender: chat.sender,
        content: chat.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } else {
      if (sessionId && !inMemorySessions.has(sessionId)) sessionId = null;
      if (!sessionId) {
        sessionId = randomUUID();
        inMemorySessions.set(sessionId, {
          id: sessionId,
          project_id: validProjectId,
          user_id: chat.user_id,
          title: derivedTitle,
          created_at: now,
          updated_at: now,
        });
      } else {
        const s = inMemorySessions.get(sessionId);
        if (s) inMemorySessions.set(sessionId, { ...s, updated_at: now });
      }
      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      inMemoryMessages.push({
        id: msgId,
        session_id: sessionId,
        sender: chat.sender,
        content: chat.content,
        intent: chat.intent,
        confidence: chat.confidence,
        created_at: now,
      });

      return {
        id: msgId,
        session_id: sessionId,
        sender: chat.sender,
        content: chat.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
  }

  /**
   * List a user's chat sessions (most recently active first) with message counts and a
   * preview of the last message — powers the Chat History sidebar. Strictly user-scoped.
   */
  static async getChatSessionsByUser(userId: string): Promise<
    { id: string; title: string; created_at: string; updated_at: string; message_count: number; last_message: string }[]
  > {
    if (!userId) return [];

    if (isSupabaseConfigured && supabase) {
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error || !sessions) {
        console.warn('getChatSessionsByUser warning:', error?.message);
        return [];
      }
      if (sessions.length === 0) return [];

      const ids = sessions.map((s: any) => s.id);
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('session_id, content, created_at')
        .in('session_id', ids)
        .order('created_at', { ascending: true });

      const countMap: Record<string, number> = {};
      const lastMap: Record<string, string> = {};
      (msgs || []).forEach((m: any) => {
        countMap[m.session_id] = (countMap[m.session_id] || 0) + 1;
        lastMap[m.session_id] = m.content; // ascending order → ends on the latest
      });

      return sessions.map((s: any) => ({
        id: s.id,
        title: s.title || 'Untitled conversation',
        created_at: s.created_at,
        updated_at: s.updated_at,
        message_count: countMap[s.id] || 0,
        last_message: (lastMap[s.id] || '').substring(0, 90),
      }));
    }

    return Array.from(inMemorySessions.values())
      .filter((s) => s.user_id === userId)
      .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
      .map((s) => {
        const sessionMsgs = inMemoryMessages.filter((m) => m.session_id === s.id);
        return {
          id: s.id,
          title: s.title || 'Untitled conversation',
          created_at: s.created_at,
          updated_at: s.updated_at,
          message_count: sessionMsgs.length,
          last_message: (sessionMsgs[sessionMsgs.length - 1]?.content || '').substring(0, 90),
        };
      });
  }

  /**
   * Fetch all messages for one chat session, enforcing that the session belongs to the
   * requesting user. Returns messages oldest-first for direct transcript rendering.
   */
  static async getChatMessagesBySession(
    sessionId: string,
    userId: string
  ): Promise<ChatMessageEntity[]> {
    if (!sessionId || !userId) return [];

    if (isSupabaseConfigured && supabase) {
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('id, user_id')
        .eq('id', sessionId)
        .maybeSingle();

      if (!session || session.user_id !== userId) {
        throw new Error('Forbidden: You do not have access to this chat session.');
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('id, session_id, sender, content, intent, confidence, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('getChatMessagesBySession warning:', error.message);
        return [];
      }
      return (messages || []) as ChatMessageEntity[];
    }

    const s = inMemorySessions.get(sessionId);
    if (!s || s.user_id !== userId) {
      throw new Error('Forbidden: You do not have access to this chat session.');
    }
    return inMemoryMessages
      .filter((m) => m.session_id === sessionId)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  }

  /**
   * Log document export event.
   */
  static async logExport(projectId: string, format: string, userId: string): Promise<void> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('exports').insert([{
        id: randomUUID(),
        user_id: userId,
        project_id: projectId,
        format,
        created_at: now,
      }]);
      await supabase.from('project_history').insert([{
        id: randomUUID(),
        project_id: projectId,
        user_id: userId,
        action: 'EXPORT_GENERATED',
        version_tag: 'v1.0',
        changes_summary: `Exported technical specification as ${format.toUpperCase()}.`,
        created_at: now,
      }]);
    } else {
      inMemoryExports.push({
        id: `exp-${Date.now()}`,
        user_id: userId,
        project_id: projectId,
        format,
        created_at: now,
      });
    }
  }

  /**
   * Sync user profile from Clerk authentication into Supabase profiles table.
   */
  static async syncUserProfile(user: {
    clerk_user_id: string;
    email: string;
    full_name?: string;
    role?: 'student' | 'admin';
    university?: string;
    semester?: string;
    academic_level?: string;
  }): Promise<UserProfile> {
    const now = new Date().toISOString();
    const profileData: UserProfile = {
      id: randomUUID(),
      clerk_user_id: user.clerk_user_id,
      email: user.email,
      full_name: user.full_name || user.email.split('@')[0],
      role: user.role || 'student',
      university: user.university || 'Engineering / MCA University',
      semester: user.semester || 'Final Semester',
      academic_level: user.academic_level || 'Postgraduate (MCA)',
      created_at: now,
      updated_at: now,
    };

    inMemoryProfiles.set(user.clerk_user_id, profileData);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', user.clerk_user_id)
          .single();

        if (existing) {
          const { data: updated } = await supabase
            .from('profiles')
            .update({
              email: user.email,
              full_name: user.full_name || existing.full_name,
              updated_at: now,
            })
            .eq('clerk_user_id', user.clerk_user_id)
            .select()
            .single();
          if (updated) inMemoryProfiles.set(user.clerk_user_id, updated);
          return updated || existing;
        }

        const { data: inserted, error } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();

        if (!error && inserted) {
          inMemoryProfiles.set(user.clerk_user_id, inserted);
          return inserted;
        }
      } catch (err: any) {
        console.warn('Supabase profile sync warning (falling back to memory):', err.message);
      }
    }

    return profileData;
  }

  /**
   * Get user profile by Clerk user ID.
   */
  static async getUserProfile(clerkUserId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();
      return data || null;
    }
    return inMemoryProfiles.get(clerkUserId) || null;
  }

  /**
   * Best-effort guarantee that a profile row exists for a project owner, so admin
   * author resolution never shows "Unknown User" for a real user. If POST /users/sync
   * hasn't run yet, a minimal placeholder is provisioned; the real email/name is
   * written by /users/sync on the user's next login. Never throws — profile
   * provisioning must never block project generation.
   */
  private static async ensureUserProfileExists(userId: string): Promise<void> {
    if (!userId) return;
    try {
      const existing = await this.getUserProfile(userId);
      if (existing) return;
      await this.syncUserProfile({
        clerk_user_id: userId,
        email: `${userId}@projectmind.ai`,
      });
    } catch {
      // Non-fatal by design.
    }
  }

  /**
   * Update user academic profile.
   */
  static async updateUserProfile(clerkUserId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: now })
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single();
      return data || null;
    }

    const current = inMemoryProfiles.get(clerkUserId);
    if (current) {
      const updated = { ...current, ...updates, updated_at: now };
      inMemoryProfiles.set(clerkUserId, updated);
      return updated;
    }
    return null;
  }

  /**
   * Fetch aggregate admin overview with real counts, export distribution, and table stats.
   */
  static async getAdminOverview(): Promise<{
    totalUsers: number;
    totalProjects: number;
    totalBlueprints: number;
    totalChatMessages: number;
    totalExports: number;
    exportBreakdown: { pdf: number; docx: number; ppt: number; md: number };
    domainStats: { domain: string; count: number }[];
    tableStats: Record<string, number>;
  }> {
    if (isSupabaseConfigured && supabase) {
      const [
        usersRes,
        projectsRes,
        blueprintsRes,
        messagesRes,
        exportsRes,
        exportRowsRes,
        allProjectsRes,
        tableReqs,
        tableTech,
        tableRoad,
        tableRefs,
        tableHist,
        tableSessions,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('blueprints').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
        supabase.from('exports').select('id', { count: 'exact', head: true }),
        supabase.from('exports').select('format'),
        supabase.from('projects').select('domain'),
        supabase.from('project_requirements').select('id', { count: 'exact', head: true }),
        supabase.from('project_tech_stack').select('id', { count: 'exact', head: true }),
        supabase.from('project_roadmaps').select('id', { count: 'exact', head: true }),
        supabase.from('project_references').select('id', { count: 'exact', head: true }),
        supabase.from('project_history').select('id', { count: 'exact', head: true }),
        supabase.from('chat_sessions').select('id', { count: 'exact', head: true }),
      ]);

      const exportBreakdown = { pdf: 0, docx: 0, ppt: 0, md: 0 };
      (exportRowsRes.data || []).forEach((row: any) => {
        const fmt = (row.format || '').toLowerCase();
        if (fmt in exportBreakdown) {
          (exportBreakdown as any)[fmt] += 1;
        }
      });

      const domainMap: Record<string, number> = {};
      (allProjectsRes.data || []).forEach((p: any) => {
        const d = p.domain || 'Uncategorized';
        domainMap[d] = (domainMap[d] || 0) + 1;
      });
      const domainStats = Object.entries(domainMap)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count);

      const tableStats: Record<string, number> = {
        profiles: usersRes.count || 0,
        projects: projectsRes.count || 0,
        project_requirements: tableReqs.count || 0,
        blueprints: blueprintsRes.count || 0,
        project_tech_stack: tableTech.count || 0,
        project_roadmaps: tableRoad.count || 0,
        project_references: tableRefs.count || 0,
        project_history: tableHist.count || 0,
        chat_sessions: tableSessions.count || 0,
        chat_messages: messagesRes.count || 0,
        exports: exportsRes.count || 0,
      };

      return {
        totalUsers: usersRes.count || 0,
        totalProjects: projectsRes.count || 0,
        totalBlueprints: blueprintsRes.count || 0,
        totalChatMessages: messagesRes.count || 0,
        totalExports: exportsRes.count || 0,
        exportBreakdown,
        domainStats,
        tableStats,
      };
    }

    // In-memory fallback metrics
    const exportBreakdown = { pdf: 0, docx: 0, ppt: 0, md: 0 };
    inMemoryExports.forEach((e) => {
      const fmt = (e.format || '').toLowerCase();
      if (fmt in exportBreakdown) (exportBreakdown as any)[fmt] += 1;
    });

    const domainMap: Record<string, number> = {};
    Array.from(inMemoryProjects.values()).forEach((p) => {
      const d = p.domain || 'Uncategorized';
      domainMap[d] = (domainMap[d] || 0) + 1;
    });

    return {
      totalUsers: inMemoryProfiles.size,
      totalProjects: inMemoryProjects.size,
      totalBlueprints: inMemoryBlueprints.size,
      totalChatMessages: inMemoryMessages.length,
      totalExports: inMemoryExports.length,
      exportBreakdown,
      domainStats: Object.entries(domainMap).map(([domain, count]) => ({ domain, count })),
      tableStats: {
        profiles: inMemoryProfiles.size,
        projects: inMemoryProjects.size,
        project_requirements: inMemoryRequirements.size,
        blueprints: inMemoryBlueprints.size,
        project_tech_stack: inMemoryTechStack.size,
        project_roadmaps: inMemoryRoadmaps.size,
        project_references: inMemoryReferences.size,
        project_history: inMemoryHistory.length,
        chat_sessions: inMemorySessions.size,
        chat_messages: inMemoryMessages.length,
        exports: inMemoryExports.length,
      },
    };
  }

  /**
   * Fetch all registered users from profiles table with project count.
   */
  static async getAllUsersAdmin(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const [{ data: profiles, error: pErr }, { data: projects, error: prjErr }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('user_id'),
      ]);

      if (pErr) {
        console.error('Error fetching users from Supabase profiles:', pErr);
        return [];
      }

      const projectCounts: Record<string, number> = {};
      (projects || []).forEach((p: any) => {
        projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1;
      });

      return (profiles || []).map((u: any) => ({
        id: u.id,
        clerk_user_id: u.clerk_user_id,
        email: u.email,
        full_name: u.full_name || 'Anonymous User',
        role: u.role || 'student',
        university: u.university || 'N/A',
        academic_level: u.academic_level || 'N/A',
        semester: u.semester || 'N/A',
        created_at: u.created_at,
        project_count: projectCounts[u.clerk_user_id] || projectCounts[u.id] || 0,
      }));
    }

    return Array.from(inMemoryProfiles.values()).map((u) => ({
      id: u.id,
      clerk_user_id: u.clerk_user_id,
      email: u.email,
      full_name: u.full_name || 'Demo Student',
      role: u.role || 'student',
      university: u.university || 'N/A',
      academic_level: u.academic_level || 'N/A',
      semester: u.semester || 'N/A',
      created_at: u.created_at,
      project_count: 1,
    }));
  }

  /**
   * Update user role in profiles (student <-> admin).
   */
  static async updateUserRoleAdmin(clerkUserId: string, newRole: 'student' | 'admin'): Promise<boolean> {
    if (!['student', 'admin'].includes(newRole)) {
      throw new Error(`Invalid role '${newRole}'. Allowed roles: student, admin.`);
    }

    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: now })
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        // Fallback check if clerkUserId matches id UUID
        const { error: err2 } = await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: now })
          .eq('id', clerkUserId);
        if (err2) throw err2;
      }
      return true;
    }

    const user = inMemoryProfiles.get(clerkUserId);
    if (user) {
      user.role = newRole;
      user.updated_at = now;
      inMemoryProfiles.set(clerkUserId, user);
      return true;
    }
    return false;
  }

  /**
   * Fetch all projects across all users globally for admin catalog & moderation.
   */
  static async getAllProjectsGlobalAdmin(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const [{ data: projects, error: prjErr }, { data: profiles }] = await Promise.all([
          supabase
            .from('projects')
            .select(`
              id,
              user_id,
              title,
              domain,
              complexity,
              agent_mode,
              status,
              created_at,
              updated_at,
              blueprints (
                tagline,
                problem_statement,
                objectives,
                features,
                architecture
              )
            `)
            .order('created_at', { ascending: false }),
          supabase.from('profiles').select('id, clerk_user_id, email, full_name'),
        ]);

        if (!prjErr && projects) {
          const authorMap: Record<string, { email: string; full_name: string }> = {};
          (profiles || []).forEach((prof: any) => {
            const entry = {
              email: prof.email || 'Unknown Email',
              full_name: prof.full_name || prof.email?.split('@')[0] || 'Unknown User',
            };
            if (prof.clerk_user_id) authorMap[prof.clerk_user_id] = entry;
            if (prof.id) authorMap[prof.id] = entry;
          });

          return (projects || []).map((p: any) => {
            const bp = Array.isArray(p.blueprints) ? p.blueprints[0] : p.blueprints;
            const author = authorMap[p.user_id] || (p.user_id === DEMO_USER_ID
              ? { email: 'demo@projectmind.ai', full_name: 'Demo Project Account' }
              : { email: 'Unknown Email', full_name: 'Unknown User' });

            return {
              id: p.id,
              user_id: p.user_id,
              author_name: author.full_name,
              author_email: author.email,
              title: p.title,
              domain: p.domain,
              complexity: p.complexity,
              agent_mode: p.agent_mode,
              status: p.status,
              tagline: bp?.tagline || '',
              problem_statement: bp?.problem_statement || '',
              has_blueprint: Boolean(bp && bp.problem_statement),
              created_at: p.created_at,
            };
          });
        }
      } catch (err: any) {
        console.warn('Supabase getAllProjectsGlobalAdmin warning (falling back to memory):', err.message);
      }
    }

    return Array.from(inMemoryProjects.values()).map((p) => {
      const user = inMemoryProfiles.get(p.user_id);
      const bp = inMemoryBlueprints.get(p.id) || {};
      return {
        id: p.id,
        user_id: p.user_id,
        author_name: user?.full_name || (p.user_id === DEMO_USER_ID ? 'Demo Project Account' : 'Unknown User'),
        author_email: user?.email || (p.user_id === DEMO_USER_ID ? 'demo@projectmind.ai' : 'Unknown Email'),
        title: p.title,
        domain: p.domain,
        complexity: p.complexity,
        agent_mode: p.agent_mode,
        status: p.status,
        tagline: bp?.tagline || '',
        problem_statement: bp?.problem_statement || '',
        has_blueprint: Boolean(bp && (bp.problem_statement || bp.title)),
        created_at: p.created_at || new Date().toISOString(),
      };
    });
  }

  /**
   * Delete a project globally as admin (cascades to all 10 child tables).
   */
  static async deleteProjectAdmin(projectId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      return true;
    }

    inMemoryProjects.delete(projectId);
    inMemoryBlueprints.delete(projectId);
    inMemoryRequirements.delete(projectId);
    return true;
  }

  /**
   * Fetch recent real chat messages & intent telemetry for admin auditing.
   */
  static async getRecentChatLogsAdmin(limit: number = 60): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          session_id,
          sender,
          content,
          intent,
          confidence,
          metadata,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }

      return data || [];
    }

    return inMemoryMessages.slice(-limit).reverse();
  }

  /**
   * Generate comprehensive system audit report data (JSON).
   */
  static async getAuditReportData(): Promise<any> {
    const overview = await this.getAdminOverview();
    const users = await this.getAllUsersAdmin();
    const projects = await this.getAllProjectsGlobalAdmin();
    const chatLogs = await this.getRecentChatLogsAdmin(25);

    return {
      system: 'ProjectMind AI Enterprise Platform',
      environment: 'production',
      generated_at: new Date().toISOString(),
      metrics: {
        total_registered_users: overview.totalUsers,
        total_projects_generated: overview.totalProjects,
        total_blueprints: overview.totalBlueprints,
        total_chat_messages: overview.totalChatMessages,
        total_exports: overview.totalExports,
        export_breakdown: overview.exportBreakdown,
        database_11_tables_row_counts: overview.tableStats,
        top_domains: overview.domainStats,
      },
      registered_users_sample: users.slice(0, 15),
      projects_sample: projects.slice(0, 15),
      recent_chat_audit_sample: chatLogs.slice(0, 15),
    };
  }

  /**
   * Private Helper: Assemble joined Supabase row into complete ProjectBlueprint format.
   */
  private static assembleBlueprint(p: any): ProjectBlueprint {
    const bp = p.blueprints?.[0] || p.blueprints || {};
    const arch = bp.architecture || {};
    const tech = (p.project_tech_stack || []).map((t: any) => ({
      category: t.category,
      item: t.technology_name,
      rationale: t.justification,
    }));
    const road = (p.project_roadmaps || []).map((r: any) => ({
      phase: r.phase_title,
      duration: r.duration,
      tasks: r.tasks || [],
    }));
    const datasets = (p.project_references || [])
      .filter((r: any) => r.type === 'dataset')
      .map((d: any) => ({ name: d.title, source: d.source_url, description: d.description }));
    const research = (p.project_references || [])
      .filter((r: any) => r.type === 'research_paper')
      .map((r: any) => ({ title: r.title, authors: r.authors, year: r.year, link: r.source_url }));

    return {
      id: p.id,
      user_id: p.user_id,
      title: p.title,
      domain: p.domain,
      complexity: p.complexity,
      agent_mode: p.agent_mode,
      status: p.status,
      tagline: bp.tagline || '',
      abstract: arch.abstract || bp.abstract || '',
      problem_statement: bp.problem_statement || '',
      literature_review: arch.literature_review || bp.literature_review || '',
      methodology: arch.methodology || bp.methodology || [],
      algorithms_used: arch.algorithms_used || bp.algorithms_used || [],
      why_useful: arch.why_useful || bp.why_useful || [],
      real_world_applications: arch.real_world_applications || bp.real_world_applications || [],
      objectives: bp.objectives || [],
      features: bp.features || [],
      architecture: {
        summary: arch.summary || '',
        components: arch.components || [],
        diagramDescription: arch.diagramDescription || '',
      },
      tech_stack: tech.length > 0 ? tech : bp.tech_stack || [],
      roadmap: road.length > 0 ? road : bp.roadmap || [],
      datasets: datasets.length > 0 ? datasets : bp.datasets || [],
      research_references: research.length > 0 ? research : bp.research_references || [],
      viva_questions: bp.viva_questions || [],
      starter_code: bp.starter_code || [],
      uniquifier_suggestions: bp.uniquifier_suggestions || [],
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  }
}
