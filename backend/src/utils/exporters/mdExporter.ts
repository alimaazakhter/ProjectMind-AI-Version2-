import { ProjectBlueprint } from '../../models/project.types.js';

export function generateMarkdown(project: ProjectBlueprint): string {
  return `# ${project.title}
> ${project.tagline || 'Technical Project Blueprint'}

**Domain:** ${project.domain}  
**Complexity:** ${project.complexity}  
**Execution Mode:** ${project.agent_mode.toUpperCase()}-Agent Pipeline  
**Generated Date:** ${new Date(project.created_at).toLocaleDateString()}  

---

## 1. Problem Statement
${project.problem_statement}

---

## 2. Project Objectives
${project.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

---

## 3. Core Features Scope
${project.features.map((feat) => `### ${feat.title} \`[${feat.priority.toUpperCase()}]\`\n${feat.description}`).join('\n\n')}

---

## 4. System Architecture
${project.architecture.summary}

### Data Flow Diagram
\`\`\`
${project.architecture.diagramDescription}
\`\`\`

---

## 5. Technology Stack Rationale
| Category | Component / Library | Rationale |
| :--- | :--- | :--- |
${project.tech_stack.map((t) => `| **${t.category}** | \`${t.item}\` | ${t.rationale} |`).join('\n')}

---

## 6. Curated Benchmark Datasets
${project.datasets.map((d) => `- **${d.name}** (${d.source}): ${d.description}`).join('\n')}

---

## 7. Research References & Literature
${project.research_references.map((r) => `- **${r.title}** by *${r.authors}* (${r.year}) — [Paper Link](${r.link})`).join('\n')}

---

## 8. Phased Development Roadmap
${project.roadmap
  .map(
    (phase, i) => `### Phase ${i + 1}: ${phase.phase} (${phase.duration})
${phase.tasks.map((task) => `- [ ] ${task}`).join('\n')}`
  )
  .join('\n\n')}

---

## 9. Viva Examination Defense Q&A
${project.viva_questions
  .map(
    (q, i) => `#### Q${i + 1}: ${q.question}
> **Category:** \`${q.category}\`
**Answer:** ${q.answer}`
  )
  .join('\n\n')}

---

## 10. Starter Code Scaffolding
${project.starter_code
  .map(
    (c) => `### File: \`${c.file}\`
\`\`\`${c.language}
${c.code}
\`\`\``
  )
  .join('\n\n')}

---
*Generated autonomously by ProjectMind AI Platform.*
`;
}
