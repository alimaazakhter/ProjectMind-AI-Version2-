'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText,
  Cpu,
  Layers,
  BookOpen,
  Calendar,
  HelpCircle,
  Code,
  Sparkles,
  Download,
  Check,
  Copy,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { ProjectBlueprint } from '@/types/project';
import { ProjectService } from '@/services/api/projectService';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || 'proj-001';

  const [project, setProject] = useState<ProjectBlueprint | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      const data = await ProjectService.getProjectById(id);
      setProject(data);
    }
    loadProject();
  }, [id]);

  if (!project) {
    return <div className="p-10 text-center text-[#888888]">Loading Project Workspace...</div>;
  }

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'ppt' | 'md') => {
    setExportingFormat(format);
    try {
      const blob = await ProjectService.exportProject(project.id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_blueprint.${format}`;
      a.click();
    } catch (err) {
      alert('Export failed.');
    } finally {
      setExportingFormat(null);
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview & Blueprint', icon: FileText },
    { id: 'architecture', label: 'Architecture', icon: Cpu },
    { id: 'tech', label: 'Tech Stack & Datasets', icon: Layers },
    { id: 'references', label: 'Research Papers', icon: BookOpen },
    { id: 'roadmap', label: 'Roadmap', icon: Calendar },
    { id: 'viva', label: 'Viva Q&A Engine', icon: HelpCircle },
    { id: 'starter-code', label: 'Starter Code', icon: Code },
    { id: 'uniquifier', label: 'Uniquifier', icon: Sparkles },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 font-sans">
      {/* Workspace Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE6DF] pb-6">
        <div className="space-y-1.5">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#666666] hover:text-[#202020] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight">{project.title}</h1>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20">
              {project.complexity}
            </span>
          </div>
          <p className="text-[#555555] text-xs sm:text-sm">{project.tagline}</p>
        </div>

        {/* Export Actions Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['pdf', 'docx', 'ppt', 'md'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              disabled={!!exportingFormat}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F6F2EB] border border-[#EBE6DF] text-xs font-bold text-[#202020] hover:text-[#7A263A] shadow-xs transition-all uppercase"
            >
              <Download className="w-3.5 h-3.5 text-[#7A263A]" />
              <span>{fmt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EBE6DF] no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#7A263A] text-white shadow-xs'
                  : 'bg-white text-[#666666] hover:text-[#202020] hover:bg-[#F6F2EB] border border-[#EBE6DF] shadow-xs'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs min-h-[400px]">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-bold text-[#202020] mb-2">Problem Statement</h3>
              <p className="text-[#333333] text-xs sm:text-sm leading-relaxed bg-[#F6F2EB] p-5 rounded-2xl border border-[#EBE6DF]">
                {project.problemStatement}
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#202020] mb-3">Project Objectives</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.objectives.map((obj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#F6F2EB] border border-[#EBE6DF] flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-[#7A263A]/15 text-[#7A263A] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-[#333333] font-medium leading-relaxed">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#202020] mb-3">Core Features Priority Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.features.map((feat, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#202020]">{feat.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20">
                        {feat.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[#555555] leading-relaxed">{feat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: System Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#202020]">System Architecture & Component Flow</h3>
            <p className="text-[#333333] text-xs sm:text-sm leading-relaxed bg-[#F6F2EB] p-5 rounded-2xl border border-[#EBE6DF]">
              {project.architecture.summary}
            </p>

            <div className="p-6 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-3">
              <h4 className="text-xs font-bold text-[#7A263A] uppercase tracking-widest">Data Flow Sequence</h4>
              <p className="font-mono text-xs text-[#202020] bg-white p-4 rounded-xl border border-[#EBE6DF] leading-relaxed">
                {project.architecture.diagramDescription}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Tech Stack & Datasets */}
        {activeTab === 'tech' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-bold text-[#202020] mb-4">Recommended Technology Stack</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.techStack.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-1.5">
                    <span className="text-xs font-semibold text-[#7A263A]">{item.category}</span>
                    <h4 className="text-sm font-bold text-[#202020]">{item.item}</h4>
                    <p className="text-xs text-[#555555]">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#202020] mb-4">Curated Datasets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.datasets.map((ds, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#202020]">{ds.name}</h4>
                      <span className="text-[10px] font-semibold text-[#875F34] bg-[#C49A6C]/15 px-2 py-0.5 rounded border border-[#C49A6C]/30">{ds.source}</span>
                    </div>
                    <p className="text-xs text-[#555555]">{ds.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Research Papers */}
        {activeTab === 'references' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#202020] mb-2">Academic Research Papers & Citations</h3>
            {project.researchReferences.map((ref, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#202020]">{ref.title}</h4>
                  <p className="text-xs text-[#666666] mt-1">
                    Authors: {ref.authors} ({ref.year})
                  </p>
                </div>
                <a
                  href={ref.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-white text-[#7A263A] hover:text-[#661F30] border border-[#EBE6DF] hover:border-[#7A263A]/40 shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#202020] mb-4">Development Timeline & Phased Roadmap</h3>
            <div className="space-y-4">
              {project.roadmap.map((phase, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-[#202020] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#7A263A]/15 text-[#7A263A] text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {phase.phase}
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20">
                      {phase.duration}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#333333]">
                    {phase.tasks.map((task, tIdx) => (
                      <li key={tIdx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7A263A]" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Viva Q&A Engine */}
        {activeTab === 'viva' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#202020] mb-2">Viva Exam Questions & Answers</h3>
            {project.vivaQuestions.map((q, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7A263A] uppercase tracking-widest">{q.category}</span>
                  <span className="text-[10px] text-[#777777]">Q{idx + 1}</span>
                </div>
                <h4 className="text-sm font-bold text-[#202020]">Q: {q.question}</h4>
                <p className="text-xs text-[#333333] bg-white p-4 rounded-xl border border-[#EBE6DF] leading-relaxed">
                  A: {q.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 7: Starter Code Engine */}
        {activeTab === 'starter-code' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#202020]">Starter Code Scaffolds</h3>
            {project.starterCode.map((codeObj, idx) => (
              <div key={idx} className="rounded-2xl border border-[#EBE6DF] overflow-hidden shadow-xs">
                <div className="p-4 bg-[#F6F2EB] border-b border-[#EBE6DF] flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#7A263A]">{codeObj.file}</span>
                  <button
                    onClick={() => handleCopyCode(codeObj.code, idx)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#202020]"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-6 overflow-x-auto font-mono text-xs text-[#202020] leading-relaxed bg-white">
                  <code>{codeObj.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Tab 8: Uniquifier */}
        {activeTab === 'uniquifier' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#202020] mb-2">Suggestions to Uniquify & Upgrade Your Project</h3>
            {project.uniquifierSuggestions.map((sug, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#7A263A] shrink-0 mt-0.5" />
                <p className="text-xs text-[#333333] leading-relaxed font-medium">{sug}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
