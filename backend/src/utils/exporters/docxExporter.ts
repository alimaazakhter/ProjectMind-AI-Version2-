import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { ProjectBlueprint } from '../../models/project.types.js';

export async function generateDOCX(project: ProjectBlueprint): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Main Title
          new Paragraph({
            text: project.title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
          }),

          // Metadata Tagline
          new Paragraph({
            children: [
              new TextRun({
                text: `Domain: ${project.domain}  |  Complexity: ${project.complexity}  |  Agent Mode: ${project.agent_mode.toUpperCase()}`,
                italics: true,
                color: '666666',
                size: 20,
              }),
            ],
            spacing: { after: 240 },
          }),

          // Problem Statement
          new Paragraph({
            text: '1. Problem Statement',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: project.problem_statement, size: 22 })],
            spacing: { after: 240 },
          }),

          // Objectives
          new Paragraph({
            text: '2. Project Objectives',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          ...project.objectives.map(
            (obj) =>
              new Paragraph({
                children: [new TextRun({ text: `•  ${obj}`, size: 22 })],
                spacing: { after: 80 },
              })
          ),

          // System Architecture
          new Paragraph({
            text: '3. System Architecture & Component Flow',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: project.architecture.summary, size: 22 })],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Data Flow: ${project.architecture.diagramDescription}`,
                bold: true,
                color: '7A263A',
                size: 20,
              }),
            ],
            spacing: { after: 240 },
          }),

          // Tech Stack
          new Paragraph({
            text: '4. Recommended Technology Stack',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          ...project.tech_stack.map(
            (tech) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${tech.category}: `, bold: true, size: 22 }),
                  new TextRun({ text: `${tech.item} — ${tech.rationale}`, size: 22 }),
                ],
                spacing: { after: 80 },
              })
          ),

          // Development Roadmap
          new Paragraph({
            text: '5. Phased Development Roadmap',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          ...project.roadmap.flatMap((phase) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${phase.phase} (${phase.duration})`,
                  bold: true,
                  color: '7A263A',
                  size: 22,
                }),
              ],
              spacing: { before: 120, after: 60 },
            }),
            ...phase.tasks.map(
              (task) =>
                new Paragraph({
                  children: [new TextRun({ text: `  - ${task}`, size: 20 })],
                  spacing: { after: 40 },
                })
            ),
          ]),

          // Viva Q&A
          new Paragraph({
            text: '6. Viva Examination Defense Preparation',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          ...project.viva_questions.flatMap((viva, idx) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Q${idx + 1}: ${viva.question}`,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 120, after: 60 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Answer: ${viva.answer}`,
                  color: '444444',
                  size: 20,
                }),
              ],
              spacing: { after: 120 },
            }),
          ]),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
