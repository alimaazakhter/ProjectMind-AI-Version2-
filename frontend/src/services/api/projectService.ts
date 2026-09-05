import { ProjectBlueprint } from '@/types/project';

const EXPRESS_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:5000/api/v1';

export class ProjectService {
  /**
   * Fetch all projects belonging to the authenticated user from Express backend.
   */
  static async getAllProjects(token?: string | null, _userId?: string | null): Promise<ProjectBlueprint[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${EXPRESS_BASE_URL}/projects`, {
        headers,
        cache: 'no-store',
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return [];
        }
        throw new Error(`Failed to fetch projects (HTTP ${res.status})`);
      }

      const data = await res.json();
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('User project query error, returning empty list:', err);
      return [];
    }
  }

  /**
   * Fetch single project blueprint by ID with ownership verification.
   */
  static async getProjectById(id: string, token?: string | null, _userId?: string | null): Promise<ProjectBlueprint | null> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${EXPRESS_BASE_URL}/projects/${id}`, {
        headers,
        cache: 'no-store',
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 403) return null;
        throw new Error(`Project fetch failed (HTTP ${res.status})`);
      }

      const data = await res.json();
      return data.data || data || null;
    } catch (err) {
      console.warn('Failed to load project by ID:', err);
      return null;
    }
  }

  /**
   * Request export file download from backend export service.
   */
  static async exportProject(
    id: string,
    format: 'pdf' | 'docx' | 'ppt' | 'md',
    token?: string | null,
    _userId?: string | null
  ): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${EXPRESS_BASE_URL}/export/${id}/${format}`, { headers });
    if (!res.ok) throw new Error('Export download failed');
    return await res.blob();
  }
}
