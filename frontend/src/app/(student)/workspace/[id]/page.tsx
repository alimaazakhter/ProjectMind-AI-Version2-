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
  Binary,
  Lightbulb,
  Globe,
  Terminal,
  ChevronRight,
} from 'lucide-react';
import { ProjectBlueprint } from '@/types/project';
import { ProjectService } from '@/services/api/projectService';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || 'proj-001';

  const [project, setProject] = useState<ProjectBlueprint | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      const data = await ProjectService.getProjectById(id);
      setProject(data);
    }
    loadProject();
  }, [id]);

  if (!project) {
    return (
      <div className="p-16 text-center text-[#888888] font-sans flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#7A263A] border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-[#666666]">Loading Project Workspace...</span>
      </div>
    );
  }

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
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
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setExportingFormat(null);
    }
  };

  const problemText = project.problemStatement || project.problem_statement || '';
  const literatureText = project.literatureReview || project.literature_review || '';
  const techList = project.techStack || project.tech_stack || [];
  const researchList = project.researchReferences || project.research_references || [];
  const vivaList = project.vivaQuestions || project.viva_questions || [];
  const codeList = project.starterCode || project.starter_code || [];
  const uniquifiers = project.uniquifierSuggestions || project.uniquifier_suggestions || [];
  const whyUsefulList = project.whyUseful || project.why_useful || [];
  const realWorldList = project.realWorldApplications || project.real_world_applications || [];
  const algorithms = project.algorithmsUsed || project.algorithms_used || [];
  const methodologyList = project.methodology || [];

  const TABS = [
    { id: 'overview', label: 'Overview & Foundation', icon: FileText },
    { id: 'methodology', label: 'Methodology & Algorithms', icon: Binary },
    { id: 'architecture', label: 'Architecture & Flow', icon: Cpu },
    { id: 'tech', label: 'Tech Stack & Datasets', icon: Layers },
    { id: 'references', label: 'Research Papers', icon: BookOpen },
    { id: 'roadmap', label: 'Roadmap & Timeline', icon: Calendar },
    { id: 'viva', label: 'Viva Q&A Engine', icon: HelpCircle },
    { id: 'starter-code', label: 'Starter Code', icon: Code },
    { id: 'uniquifier', label: 'Make It Unique', icon: Sparkles },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6 font-sans">
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#202020] tracking-tight">{project.title}</h1>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20">
              {project.complexity}
            </span>
          </div>
          <p className="text-[#555555] text-xs sm:text-sm font-medium">{project.tagline}</p>
        </div>

        {/* Export Actions Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#666666] uppercase tracking-wider mr-1 font-mono">Export:</span>
          {(['pdf', 'docx', 'ppt', 'md'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              disabled={!!exportingFormat}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F2EB] border border-[#EBE6DF] text-xs font-bold text-[#202020] hover:text-[#7A263A] shadow-xs transition-all uppercase"
            >
              <Download className="w-3.5 h-3.5 text-[#7A263A]" />
              <span>{exportingFormat === fmt ? 'Exporting...' : fmt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Make It Unique Quick Action Banner */}
      {uniquifiers.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#7A263A]/10 via-[#C49A6C]/10 to-[#FAF8F5] border border-[#7A263A]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#7A263A] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#7A263A] uppercase tracking-wider block font-mono">Top Innovation Strategy</span>
              <p className="text-xs sm:text-sm font-semibold text-[#202020] line-clamp-1">{uniquifiers[0]}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('uniquifier')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7A263A] text-white text-xs font-bold hover:bg-[#661F30] transition-colors whitespace-nowrap"
          >
            <span>Explore All Uniquifiers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs Navigation Row */}
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

      {/* Main Tab Panels */}
      <div className="p-5 sm:p-8 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs min-h-[450px]">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & FOUNDATION */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Abstract */}
            {project.abstract && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Executive Abstract</h3>
                  <button
                    onClick={() => handleCopyText(project.abstract || '', 'abstract')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7A263A] transition-colors"
                  >
                    {copiedSection === 'abstract' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'abstract' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] text-xs sm:text-sm text-[#333333] leading-relaxed">
                  {project.abstract}
                </div>
              </div>
            )}

            {/* Problem Statement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Problem Statement</h3>
                <button
                  onClick={() => handleCopyText(problemText, 'problem')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7A263A] transition-colors"
                >
                  {copiedSection === 'problem' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'problem' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] text-xs sm:text-sm text-[#333333] leading-relaxed whitespace-pre-line">
                {problemText}
              </div>
            </div>

            {/* Literature Review */}
            {literatureText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Literature Review & Gap Analysis</h3>
                  <button
                    onClick={() => handleCopyText(literatureText, 'literature')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7A263A] transition-colors"
                  >
                    {copiedSection === 'literature' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'literature' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] text-xs sm:text-sm text-[#333333] leading-relaxed whitespace-pre-line">
                  {literatureText}
                </div>
              </div>
            )}

            {/* Project Objectives */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Project Objectives</h3>
                <button
                  onClick={() => handleCopyText(project.objectives.join('\n'), 'objectives')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7A263A] transition-colors"
                >
                  {copiedSection === 'objectives' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'objectives' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
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

            {/* Core Features */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Core Features Scope & Priority</h3>
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

        {/* ========================================================= */}
        {/* TAB 2: METHODOLOGY & ALGORITHMS */}
        {/* ========================================================= */}
        {activeTab === 'methodology' && (
          <div className="space-y-8">
            {/* Step-by-Step Methodology */}
            {methodologyList.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">System Methodology & Execution Pipeline</h3>
                  <button
                    onClick={() => handleCopyText(JSON.stringify(methodologyList, null, 2), 'methodology')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7A263A] transition-colors"
                  >
                    {copiedSection === 'methodology' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'methodology' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {methodologyList.map((step, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#7A263A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[#202020]">{step.title}</h4>
                      </div>
                      <p className="text-xs text-[#555555] leading-relaxed pl-8">{step.description}</p>
                      {step.details && step.details.length > 0 && (
                        <ul className="pl-12 list-disc space-y-1 text-xs text-[#666666]">
                          {step.details.map((d, dIdx) => (
                            <li key={dIdx}>{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Algorithms Used */}
            {algorithms.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Algorithms & Mathematical Models</h3>
                  <button
                    onClick={() => handleCopyText(JSON.stringify(algorithms, null, 2), 'algorithms')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7A263A] transition-colors"
                  >
                    {copiedSection === 'algorithms' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'algorithms' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {algorithms.map((alg, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#202020]">{alg.name}</h4>
                        {alg.category && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#C49A6C]/15 text-[#875F34] border border-[#C49A6C]/30">
                            {alg.category}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs text-[#555555]">
                        <p><strong className="text-[#202020]">Purpose:</strong> {alg.purpose}</p>
                        {alg.input_features && <p><strong className="text-[#202020]">Input Features:</strong> <code className="bg-white px-1.5 py-0.5 rounded text-[#7A263A] border border-[#EBE6DF]">{alg.input_features}</code></p>}
                        {alg.output && <p><strong className="text-[#202020]">Output:</strong> {alg.output}</p>}
                        {alg.rationale && <p><strong className="text-[#202020]">Rationale:</strong> {alg.rationale}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why This Project Is Useful */}
            {whyUsefulList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Why This Project Is Useful (Utility Impact)</h3>
                <div className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-2">
                  <ul className="space-y-2 text-xs sm:text-sm text-[#333333]">
                    {whyUsefulList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#7A263A] font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Real-World Applications */}
            {realWorldList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Real-World Industry Applications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {realWorldList.map((app, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-1">
                      <h4 className="text-xs font-bold text-[#7A263A]">{app.domain}</h4>
                      <p className="text-xs text-[#555555] leading-relaxed">{app.application}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ARCHITECTURE & DATA FLOW */}
        {/* ========================================================= */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">System Architecture Summary</h3>
              <button
                onClick={() => handleCopyText(project.architecture.summary, 'arch')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7A263A] transition-colors"
              >
                {copiedSection === 'arch' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'arch' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[#333333] text-xs sm:text-sm leading-relaxed bg-[#F6F2EB] p-5 rounded-2xl border border-[#EBE6DF]">
              {project.architecture.summary}
            </p>

            <div className="p-6 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-3">
              <h4 className="text-xs font-bold text-[#7A263A] uppercase tracking-widest font-mono">Component Data Flow Diagram</h4>
              <p className="font-mono text-xs text-[#202020] bg-white p-4 rounded-xl border border-[#EBE6DF] leading-relaxed">
                {project.architecture.diagramDescription}
              </p>
            </div>

            {project.architecture.components && project.architecture.components.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#202020] uppercase tracking-wider font-mono">Component Boundaries</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.architecture.components.map((comp, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#F6F2EB] border border-[#EBE6DF] flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#7A263A]" />
                      <span className="text-xs font-medium text-[#202020]">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TECH STACK & DATASETS */}
        {/* ========================================================= */}
        {activeTab === 'tech' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[#202020] mb-4 uppercase tracking-wider font-mono">Recommended Technology Stack</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {techList.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-1.5">
                    <span className="text-xs font-bold text-[#7A263A]">{item.category}</span>
                    <h4 className="text-sm font-bold text-[#202020]">{item.item}</h4>
                    <p className="text-xs text-[#555555]">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#202020] mb-4 uppercase tracking-wider font-mono">Curated Benchmark Datasets</h3>
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

        {/* ========================================================= */}
        {/* TAB 5: RESEARCH PAPERS */}
        {/* ========================================================= */}
        {activeTab === 'references' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#202020] mb-2 uppercase tracking-wider font-mono">Academic Research Papers & Citations</h3>
            {researchList.map((ref, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#202020]">{ref.title}</h4>
                  <p className="text-xs text-[#666666] mt-1">
                    Authors: {ref.authors} ({ref.year})
                  </p>
                </div>
                {ref.link && (
                  <a
                    href={ref.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-white text-[#7A263A] hover:text-[#661F30] border border-[#EBE6DF] hover:border-[#7A263A]/40 shadow-xs shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ROADMAP & TIMELINE */}
        {/* ========================================================= */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Phased Development Timeline</h3>
            <div className="space-y-4">
              {project.roadmap.map((phase, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#7A263A]">{phase.phase}</h4>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white border border-[#EBE6DF] text-[#666666]">
                      {phase.duration}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#555555]">
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

        {/* ========================================================= */}
        {/* TAB 7: VIVA DEFENSE ENGINE */}
        {/* ========================================================= */}
        {activeTab === 'viva' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Examiner Viva Defense Questions & Model Answers</h3>
              <button
                onClick={() => handleCopyText(JSON.stringify(vivaList, null, 2), 'viva')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7A263A] transition-colors"
              >
                {copiedSection === 'viva' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'viva' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="space-y-4">
              {vivaList.map((vq, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#7A263A]">Q{idx + 1}: {vq.question}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-[#666666] border border-[#EBE6DF] shrink-0">
                      {vq.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#333333] leading-relaxed bg-white p-3.5 rounded-xl border border-[#EBE6DF]">
                    <strong className="text-[#202020]">Answer:</strong> {vq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: STARTER CODE BOILERPLATE */}
        {/* ========================================================= */}
        {activeTab === 'starter-code' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Starter Code Scaffolding Boilerplate</h3>
            {codeList.map((file, idx) => (
              <div key={idx} className="rounded-2xl border border-[#EBE6DF] overflow-hidden bg-[#202020] text-[#FAF8F5]">
                <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#333333] flex items-center justify-between">
                  <span className="font-mono text-xs text-[#A0A0A0]">{file.file}</span>
                  <button
                    onClick={() => handleCopyCode(file.code, idx)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#C49A6C] hover:text-white transition-colors"
                  >
                    {copiedCodeIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeIdx === idx ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-[#E0E0E0]">
                  <code>{file.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: MAKE IT UNIQUE (UNIQUIFIER) */}
        {/* ========================================================= */}
        {activeTab === 'uniquifier' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202020] uppercase tracking-wider font-mono">Project Uniquifier & Competitive Edge Innovations</h3>
              <button
                onClick={() => handleCopyText(uniquifiers.join('\n'), 'uniquifiers')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#666666] hover:text-[#7A263A] transition-colors"
              >
                {copiedSection === 'uniquifiers' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'uniquifiers' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-[#666666]">
              These proposed innovations differentiate your project from generic academic submissions and demonstrate real-world engineering thought leadership.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniquifiers.map((u, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-gradient-to-br from-[#F6F2EB] to-white border border-[#EBE6DF] flex items-start gap-3 shadow-xs">
                  <div className="w-7 h-7 rounded-xl bg-[#7A263A] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#202020]">Innovation #{idx + 1}</h4>
                    <p className="text-xs text-[#555555] leading-relaxed">{u}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
