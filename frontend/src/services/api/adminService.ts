/**
 * Admin Service — API Client for ProjectMind AI Enterprise Administration
 *
 * SECURITY: the admin passcode is ONLY ever sent via the `x-admin-passcode` request
 * header (see getHeaders). It is never placed in a URL query string, which would leak
 * the secret into browser history, server access logs, and proxy caches.
 */

const EXPRESS_BASE_URL =
  process.env.NEXT_PUBLIC_EXPRESS_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface AdminServiceHealth {
  name?: string;
  service?: string;
  status: 'Online' | 'Offline' | 'Degraded';
  port: string;
  latencyMs: number;
  lastChecked: string;
  details?: string;
}

export interface AdminOverviewData {
  metrics: {
    totalRegisteredUsers: number;
    totalProjectsGenerated: number;
    totalBlueprintsGenerated: number;
    totalChatMessages: number;
    totalExports: number;
    exportBreakdown: { pdf: number; docx: number; ppt: number; md: number };
    domainDistribution: { domain: string; count: number }[];
    tableStats: Record<string, number>;
  };
  services: AdminServiceHealth[];
}

export interface AdminUser {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  university: string;
  academic_level: string;
  semester: string;
  created_at: string;
  project_count: number;
}

export interface AdminGlobalProject {
  id: string;
  user_id: string;
  author_name: string;
  author_email: string;
  title: string;
  domain: string;
  complexity: string;
  agent_mode: string;
  status: string;
  tagline: string;
  problem_statement: string;
  has_blueprint: boolean;
  created_at: string;
}

export interface AdminChatLog {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  confidence?: number;
  metadata?: any;
  created_at: string;
}

export interface AdminAIConfig {
  active_model: string;
  fallback_models: string[];
  available_models: string[];
  temperature: number;
  is_configured: boolean;
}

export class AdminService {
  private static authToken: string | null = null;

  static setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private static getHeaders(passcode?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (passcode) {
      headers['x-admin-passcode'] = passcode;
    }
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * Fetch Live Overview, Telemetry, Table Stats, and Microservice Status.
   */
  static async getOverview(passcode?: string): Promise<AdminOverviewData> {
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/overview`, {
      headers: this.getHeaders(passcode),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch admin overview`);
    const data = await res.json();
    return data.data;
  }

  /**
   * Fetch Registered Users with Project Counts.
   */
  static async getUsers(params?: { search?: string; role?: string }, passcode?: string): Promise<AdminUser[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);

    const qs = query.toString();
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/users${qs ? `?${qs}` : ''}`, {
      headers: this.getHeaders(passcode),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.data;
  }

  /**
   * Update User Role (student <-> admin).
   */
  static async updateUserRole(userId: string, role: 'student' | 'admin', passcode?: string): Promise<boolean> {
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: this.getHeaders(passcode),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Failed to update user role');
    return true;
  }

  /**
   * Fetch Global Projects Catalog.
   */
  static async getProjects(
    params?: { search?: string; domain?: string; complexity?: string },
    passcode?: string
  ): Promise<AdminGlobalProject[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.domain) query.set('domain', params.domain);
    if (params?.complexity) query.set('complexity', params.complexity);

    const qs = query.toString();
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/projects${qs ? `?${qs}` : ''}`, {
      headers: this.getHeaders(passcode),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch global projects');
    const data = await res.json();
    return data.data;
  }

  /**
   * Delete Project as Administrator.
   */
  static async deleteProject(projectId: string, passcode?: string): Promise<boolean> {
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: this.getHeaders(passcode),
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return true;
  }

  /**
   * Fetch Real Chat Stream & Intent Logs.
   */
  static async getChatLogs(params?: { intent?: string; limit?: number }, passcode?: string): Promise<AdminChatLog[]> {
    const query = new URLSearchParams();
    if (params?.intent) query.set('intent', params.intent);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/chat-logs${qs ? `?${qs}` : ''}`, {
      headers: this.getHeaders(passcode),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch chat telemetry logs');
    const data = await res.json();
    return data.data;
  }

  /**
   * Fetch AI Model Configuration.
   */
  static async getAIConfig(passcode?: string): Promise<AdminAIConfig> {
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/ai-config`, {
      headers: this.getHeaders(passcode),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch AI configuration');
    const data = await res.json();
    return data.data;
  }

  /**
   * Update AI Model Configuration.
   */
  static async updateAIConfig(
    payload: { model?: string; temperature?: number },
    passcode?: string
  ): Promise<AdminAIConfig> {
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/ai-config`, {
      method: 'POST',
      headers: this.getHeaders(passcode),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update AI configuration');
    const data = await res.json();
    return data.data;
  }

  /**
   * Run Live Diagnostic Health Ping for all 4 microservices.
   */
  static async pingAllDiagnostics(passcode?: string): Promise<AdminServiceHealth[]> {
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/diagnostics/ping-all`, {
      method: 'POST',
      headers: this.getHeaders(passcode),
    });
    if (!res.ok) throw new Error('Failed to execute diagnostic ping');
    const data = await res.json();
    return data.data;
  }

  /**
   * Flush in-memory application caches.
   */
  static async flushCache(passcode?: string): Promise<{ message: string }> {
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/cache/flush`, {
      method: 'POST',
      headers: this.getHeaders(passcode),
    });
    if (!res.ok) throw new Error('Failed to flush cache');
    return await res.json();
  }

  /**
   * Download the System Audit & Telemetry Report (JSON / CSV).
   *
   * Uses a header-authenticated fetch (passcode via x-admin-passcode header — never in
   * the URL) and streams the response into a blob so the browser saves it locally with
   * the correct filename. `format` is not a secret and is passed as a query param.
   */
  static async downloadAuditReport(format: 'json' | 'csv', passcode?: string): Promise<void> {
    const res = await fetch(`${EXPRESS_BASE_URL}/admin/audit-report?format=${format}`, {
      headers: this.getHeaders(passcode),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to download audit report (HTTP ${res.status})`);

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projectmind-audit-report.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
