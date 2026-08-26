import { ProjectBlueprint } from '../../models/project.types.js';

export function generateMarkdown(project: ProjectBlueprint): string {
  const sections: string[] = [
    `# ${project.title}`,
    `> ${project.tagline || 'Technical Project Blueprint'}`,
    `\n**Domain:** ${project.domain}  \n**Complexity:** ${project.complexity}  \n**Execution Mode:** ${(project.agent_mode || 'multi').toUpperCase()}-Agent Pipeline  \n**Generated Date:** ${new Date(project.created_at || Date.now()).toLocaleDateString()}  \n\n---`
  ];

  // 1. Abstract
  if (project.abstract) {
    sections.push(`## 1. Abstract\n${project.abstract}\n\n---`);
  }

  // 2. Problem Statement
  sections.push(`## 2. Problem Statement\n${project.problem_statement}\n\n---`);

  // 3. Literature Review
  if (project.literature_review) {
    sections.push(`## 3. Literature Review & Gap Analysis\n${project.literature_review}\n\n---`);
  }

  // 4. Objectives
  sections.push(`## 4. Project Objectives\n${project.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\n---`);

  // 5. Methodology
  if (project.methodology && project.methodology.length > 0) {
    const methStr = project.methodology
      .map((m, i) => `### Step ${i + 1}: ${m.title}\n${m.description}\n${(m.details || []).map((d) => `- ${d}`).join('\n')}`)
      .join('\n\n');
    sections.push(`## 5. System Methodology & Pipeline\n${methStr}\n\n---`);
  }

  // 6. Algorithms Used
  if (project.algorithms_used && project.algorithms_used.length > 0) {
    const algStr = project.algorithms_used
      .map((a) => `### ${a.name} ${a.category ? `\`[${a.category}]\`` : ''}\n- **Purpose:** ${a.purpose}\n${a.input_features ? `- **Input Features:** ${a.input_features}\n` : ''}${a.output ? `- **Output:** ${a.output}\n` : ''}${a.rationale ? `- **Rationale:** ${a.rationale}\n` : ''}`)
      .join('\n\n');
    sections.push(`## 6. Algorithms & Mathematical Models\n${algStr}\n\n---`);
  }

  // 7. Why Useful
  if (project.why_useful && project.why_useful.length > 0) {
    sections.push(`## 7. Why This Project Is Useful\n${project.why_useful.map((u) => `- ${u}`).join('\n')}\n\n---`);
  }

  // 8. Real-World Applications
  if (project.real_world_applications && project.real_world_applications.length > 0) {
    sections.push(`## 8. Real-World Applications\n${project.real_world_applications.map((app) => `- **${app.domain}:** ${app.application}`).join('\n')}\n\n---`);
  }

  // 9. Core Features
  sections.push(`## 9. Core Features Scope\n${project.features.map((feat) => `### ${feat.title} \`[${feat.priority.toUpperCase()}]\`\n${feat.description}`).join('\n\n')}\n\n---`);

  // 10. Architecture
  sections.push(`## 10. System Architecture\n${project.architecture.summary}\n\n### Data Flow Diagram\n\`\`\`\n${project.architecture.diagramDescription}\n\`\`\`\n\n---`);

  // 11. Tech Stack
  sections.push(`## 11. Technology Stack Rationale\n| Category | Component / Library | Rationale |\n| :--- | :--- | :--- |\n${project.tech_stack.map((t) => `| **${t.category}** | \`${t.item}\` | ${t.rationale} |`).join('\n')}\n\n---`);

  // 12. Datasets
  if (project.datasets && project.datasets.length > 0) {
    sections.push(`## 12. Curated Benchmark Datasets\n${project.datasets.map((d) => `- **${d.name}** (${d.source}): ${d.description}`).join('\n')}\n\n---`);
  }

  // 13. References
  if (project.research_references && project.research_references.length > 0) {
    sections.push(`## 13. Research References & Literature\n${project.research_references.map((r) => `- **${r.title}** by *${r.authors}* (${r.year}) — [Paper Link](${r.link})`).join('\n')}\n\n---`);
  }

  // 14. Roadmap
  sections.push(`## 14. Phased Development Roadmap\n${project.roadmap.map((phase, i) => `### Phase ${i + 1}: ${phase.phase} (${phase.duration})\n${phase.tasks.map((task) => `- [ ] ${task}`).join('\n')}`).join('\n\n')}\n\n---`);

  // 15. Viva Q&A
  sections.push(`## 15. Viva Examination Defense Q&A\n${project.viva_questions.map((q, i) => `#### Q${i + 1}: ${q.question}\n> **Category:** \`${q.category}\`\n**Answer:** ${q.answer}`).join('\n\n')}\n\n---`);

  // 16. Starter Code
  if (project.starter_code && project.starter_code.length > 0) {
    sections.push(`## 16. Starter Code Scaffolding\n${project.starter_code.map((c) => `### File: \`${c.file}\`\n\`\`\`${c.language}\n${c.code}\n\`\`\``).join('\n\n')}\n\n---`);
  }

  // 17. Uniquifiers
  if (project.uniquifier_suggestions && project.uniquifier_suggestions.length > 0) {
    sections.push(`## 17. Project Innovation & Uniquifiers\n${project.uniquifier_suggestions.map((u) => `- ${u}`).join('\n')}\n\n---`);
  }

  sections.push(`*Generated autonomously by ProjectMind AI Platform.*`);

  return sections.join('\n\n');
}
