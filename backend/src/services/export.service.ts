import { SupabaseService } from './supabase.service.js';
import { generatePDF } from '../utils/exporters/pdfExporter.js';
import { generateDOCX } from '../utils/exporters/docxExporter.js';
import { generatePPT } from '../utils/exporters/pptExporter.js';
import { generateMarkdown } from '../utils/exporters/mdExporter.js';

export interface ExportResult {
  buffer: Buffer | string;
  contentType: string;
  filename: string;
}

export class ExportService {
  /**
   * Coordinate blueprint export by format, verifying user ownership.
   */
  static async exportBlueprint(id: string, format: 'pdf' | 'docx' | 'ppt' | 'md', userId: string): Promise<ExportResult> {
    const project = await SupabaseService.getProjectById(id, userId);

    if (!project) {
      throw new Error('Project not found or you do not have permission to access it.');
    }

    const sanitizedTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);

    let result: ExportResult;

    switch (format) {
      case 'pdf':
        result = {
          buffer: await generatePDF(project),
          contentType: 'application/pdf',
          filename: `${sanitizedTitle}_blueprint.pdf`,
        };
        break;

      case 'docx':
        result = {
          buffer: await generateDOCX(project),
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          filename: `${sanitizedTitle}_blueprint.docx`,
        };
        break;

      case 'ppt':
        result = {
          buffer: await generatePPT(project),
          contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          filename: `${sanitizedTitle}_presentation.pptx`,
        };
        break;

      case 'md':
        result = {
          buffer: generateMarkdown(project),
          contentType: 'text/markdown; charset=utf-8',
          filename: `${sanitizedTitle}_blueprint.md`,
        };
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Log the export event in database
    await SupabaseService.logExport(project.id, format, userId);

    return result;
  }
}
