import PDFDocument from 'pdfkit';
import { ProjectBlueprint } from '../../models/project.types.js';

export async function generatePDF(project: ProjectBlueprint): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Colors
      const primaryColor = '#7A263A'; // Burgundy
      const charcoal = '#202020';
      const mutedText = '#666666';

      // Document Header
      doc.fontSize(20).fillColor(primaryColor).font('Helvetica-Bold').text(project.title, { align: 'left' });
      doc.moveDown(0.25);
      doc.fontSize(10).fillColor(mutedText).font('Helvetica').text(`Domain: ${project.domain}  |  Complexity: ${project.complexity}  |  Agent Mode: ${(project.agent_mode || 'multi').toUpperCase()}`);
      doc.moveDown(0.5);
      doc.strokeColor('#E5E0D7').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.8);

      // Tagline
      if (project.tagline) {
        doc.fontSize(11).fillColor(charcoal).font('Helvetica-Oblique').text(`"${project.tagline}"`);
        doc.moveDown(0.75);
      }

      // Section 1: Abstract
      if (project.abstract) {
        doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('1. Abstract');
        doc.moveDown(0.25);
        doc.fontSize(9.5).fillColor(charcoal).font('Helvetica').text(project.abstract, { lineGap: 3 });
        doc.moveDown(0.8);
      }

      // Section 2: Problem Statement
      doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('2. Problem Statement');
      doc.moveDown(0.25);
      doc.fontSize(9.5).fillColor(charcoal).font('Helvetica').text(project.problem_statement, { lineGap: 3 });
      doc.moveDown(0.8);

      // Section 3: Literature Review
      if (project.literature_review) {
        doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('3. Literature Review & Gap Analysis');
        doc.moveDown(0.25);
        doc.fontSize(9.5).fillColor(charcoal).font('Helvetica').text(project.literature_review, { lineGap: 3 });
        doc.moveDown(0.8);
      }

      // Section 4: Objectives
      doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('4. Project Objectives');
      doc.moveDown(0.25);
      project.objectives.forEach((obj) => {
        doc.fontSize(9.5).fillColor(charcoal).font('Helvetica').text(`•  ${obj}`, { indent: 10, lineGap: 2 });
      });
      doc.moveDown(0.8);

      // Section 5: Methodology
      if (project.methodology && project.methodology.length > 0) {
        doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('5. System Methodology & Pipeline');
        doc.moveDown(0.25);
        project.methodology.forEach((step, idx) => {
          doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold').text(`${idx + 1}. ${step.title}`);
          doc.fontSize(9).fillColor(charcoal).font('Helvetica').text(step.description, { indent: 10, lineGap: 2 });
          if (step.details) {
            step.details.forEach((d) => {
              doc.fontSize(8.5).fillColor(mutedText).font('Helvetica').text(`- ${d}`, { indent: 20 });
            });
          }
          doc.moveDown(0.3);
        });
        doc.moveDown(0.6);
      }

      // Section 6: Algorithms Used
      if (project.algorithms_used && project.algorithms_used.length > 0) {
        doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('6. Algorithms & Mathematical Models');
        doc.moveDown(0.25);
        project.algorithms_used.forEach((alg) => {
          doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold').text(`• ${alg.name}${alg.category ? ` (${alg.category})` : ''}`);
          doc.fontSize(9).fillColor(charcoal).font('Helvetica').text(`Purpose: ${alg.purpose}`, { indent: 10 });
          if (alg.input_features) doc.fontSize(8.5).fillColor(mutedText).font('Helvetica').text(`Input: ${alg.input_features}`, { indent: 10 });
          if (alg.output) doc.fontSize(8.5).fillColor(mutedText).font('Helvetica').text(`Output: ${alg.output}`, { indent: 10 });
          doc.moveDown(0.3);
        });
        doc.moveDown(0.6);
      }

      // Section 7: Why This Project Is Useful
      if (project.why_useful && project.why_useful.length > 0) {
        doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('7. Why This Project Is Useful');
        doc.moveDown(0.25);
        project.why_useful.forEach((u) => {
          doc.fontSize(9.5).fillColor(charcoal).font('Helvetica').text(`•  ${u}`, { indent: 10, lineGap: 2 });
        });
        doc.moveDown(0.8);
      }

      // Section 8: Real-World Applications
      if (project.real_world_applications && project.real_world_applications.length > 0) {
        doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('8. Real-World Applications');
        doc.moveDown(0.25);
        project.real_world_applications.forEach((app) => {
          doc.fontSize(9.5).fillColor(charcoal).font('Helvetica-Bold').text(`•  ${app.domain}: `, { continued: true });
          doc.font('Helvetica').text(app.application, { lineGap: 2 });
        });
        doc.moveDown(0.8);
      }

      // Section 9: Architecture Summary
      doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('9. System Architecture & Component Flow');
      doc.moveDown(0.25);
      doc.fontSize(9.5).fillColor(charcoal).font('Helvetica').text(project.architecture.summary, { lineGap: 3 });
      doc.moveDown(0.4);
      doc.fontSize(8.5).fillColor(primaryColor).font('Courier-Bold').text(`Data Flow: ${project.architecture.diagramDescription}`, { indent: 10 });
      doc.moveDown(0.8);

      // Section 10: Tech Stack
      doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('10. Recommended Technology Stack');
      doc.moveDown(0.25);
      project.tech_stack.forEach((tech) => {
        doc.fontSize(9.5).fillColor(charcoal).font('Helvetica-Bold').text(`${tech.category}: `, { continued: true });
        doc.font('Helvetica').text(`${tech.item} — ${tech.rationale}`, { lineGap: 2 });
      });
      doc.moveDown(0.8);

      // Section 11: Roadmap
      doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('11. Phased Development Roadmap');
      doc.moveDown(0.25);
      project.roadmap.forEach((phase) => {
        doc.fontSize(9.5).fillColor(primaryColor).font('Helvetica-Bold').text(`${phase.phase} (${phase.duration})`);
        phase.tasks.forEach((t) => {
          doc.fontSize(8.5).fillColor(charcoal).font('Helvetica').text(`  - ${t}`, { indent: 10 });
        });
        doc.moveDown(0.3);
      });
      doc.moveDown(0.6);

      // Section 12: Viva Defense Q&A
      doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('12. Viva Examination Defense Q&A');
      doc.moveDown(0.25);
      project.viva_questions.forEach((vq, i) => {
        doc.fontSize(9.5).fillColor(charcoal).font('Helvetica-Bold').text(`Q${i + 1} (${vq.category}): ${vq.question}`);
        doc.fontSize(9).fillColor(mutedText).font('Helvetica').text(`Ans: ${vq.answer}`, { indent: 10, lineGap: 2 });
        doc.moveDown(0.3);
      });
      doc.moveDown(0.6);

      // Section 13: Uniquifiers
      if (project.uniquifier_suggestions && project.uniquifier_suggestions.length > 0) {
        doc.fontSize(13).fillColor(primaryColor).font('Helvetica-Bold').text('13. Project Innovation & Uniquifiers');
        doc.moveDown(0.25);
        project.uniquifier_suggestions.forEach((u) => {
          doc.fontSize(9.5).fillColor(charcoal).font('Helvetica').text(`•  ${u}`, { indent: 10, lineGap: 2 });
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
