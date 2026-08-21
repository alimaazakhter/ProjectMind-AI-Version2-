'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  Sparkles,
  Cpu,
  Layers,
  FileText,
  HelpCircle,
  Code2,
  BookOpen,
  ArrowRight,
  Download,
  Compass,
  Bot,
  Calendar,
  FolderKanban,
  ChevronDown,
  Copy,
  Check,
  Shield,
  Server,
  Database,
  Lock,
  Workflow,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [activePreviewTab, setActivePreviewTab] = useState<'blueprint' | 'architecture' | 'roadmap' | 'viva' | 'code'>('blueprint');
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#202020] bg-subtle-grid relative flex flex-col font-sans selection:bg-[#7A263A] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5] border-b border-[#E5E0D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#7A263A] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#202020]">
              ProjectMind <span className="text-[#7A263A]">AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#6B6862]">
            <a href="#how-it-works" className="hover:text-[#202020] transition-colors">
              How It Works
            </a>
            <a href="#outputs" className="hover:text-[#202020] transition-colors">
              Outputs
            </a>
            <a href="#features" className="hover:text-[#202020] transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-[#202020] transition-colors">
              Architecture
            </a>
            <a href="#faq" className="hover:text-[#202020] transition-colors">
              FAQ
            </a>
          </nav>

          {/* User / Auth Actions */}
          <div className="flex items-center gap-3">
            {isLoaded && isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-md bg-white hover:bg-[#F2ECE4] text-[#202020] border border-[#E5E0D7] transition-colors shadow-xs"
                >
                  Go to Dashboard
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-7 h-7 ring-1 ring-[#E5E0D7]',
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/sign-in"
                  className="text-xs font-semibold text-[#6B6862] hover:text-[#202020] transition-colors px-2.5 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#7A263A] hover:bg-[#661F30] px-3.5 py-1.5 rounded-md shadow-xs transition-colors"
                >
                  <span>Start Building</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Flow */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-14 pb-12 md:pt-20 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#7A263A] mb-4">
            Autonomous Project Planning & Architecture Platform
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#202020] tracking-tight leading-[1.08] mb-6">
            From Idea to <br className="hidden sm:inline" />
            <span className="text-[#7A263A]">Implementation.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#6B6862] max-w-2xl mx-auto mb-8 leading-relaxed">
            Turn your project idea into a structured, build-ready plan — from architecture and technology choices to development roadmaps, documentation, and viva preparation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-white bg-[#7A263A] hover:bg-[#661F30] px-5 py-3 rounded-md shadow-xs transition-colors"
            >
              <span>Start Building</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#202020] bg-white hover:bg-[#F2ECE4] border border-[#E5E0D7] px-5 py-3 rounded-md shadow-xs transition-colors"
            >
              <Compass className="w-4 h-4 text-[#7A263A]" />
              <span>Explore Workspace</span>
            </Link>
          </div>

          {/* Real Application Workspace Preview */}
          <div className="max-w-4xl mx-auto rounded-xl bg-white border border-[#E5E0D7] shadow-sm overflow-hidden text-left">
            {/* Top Workspace Header Bar */}
            <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#E5E0D7] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E0D7]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E0D7]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E0D7]" />
                <span className="font-mono text-[11px] text-[#6B6862] ml-1">projectmind.workspace / preview</span>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 bg-[#EBE6DF] p-0.5 rounded-md">
                {(['blueprint', 'architecture', 'roadmap', 'viva', 'code'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePreviewTab(tab)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] capitalize transition-all ${
                      activePreviewTab === tab
                        ? 'bg-white text-[#7A263A] font-bold shadow-xs'
                        : 'text-[#6B6862] hover:text-[#202020]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Window Content */}
            <div className="p-6 text-xs text-[#202020] min-h-[220px]">
              {activePreviewTab === 'blueprint' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D7] pb-3">
                    <div>
                      <h3 className="font-bold text-[#202020] text-sm">Autonomous Code Auditor & Architecture Reviewer</h3>
                      <p className="text-[11px] text-[#6B6862]">Domain: Artificial Intelligence & Software Engineering</p>
                    </div>
                    <span className="inline-flex items-center self-start text-[10px] font-semibold px-2 py-0.5 rounded bg-[#C49A6C]/15 text-[#875F34] border border-[#C49A6C]/30 font-mono">
                      Production Ready
                    </span>
                  </div>

                  <p className="text-[#6B6862] text-xs leading-relaxed">
                    <strong className="text-[#202020]">Problem Statement:</strong> Manual architectural reviews are slow and inconsistent across teams. This system decomposes PR diffs, cross-references security benchmarks, and generates remediation roadmaps.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E0D7]">
                      <span className="text-[10px] text-[#6B6862] uppercase font-mono tracking-wider block mb-1">Recommended Stack</span>
                      <span className="text-[#202020] font-semibold text-xs">Next.js 14, Node/Express, FastAPI, Gemini API, PostgreSQL</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E0D7]">
                      <span className="text-[10px] text-[#6B6862] uppercase font-mono tracking-wider block mb-1">Curated Dataset</span>
                      <span className="text-[#202020] font-semibold text-xs">Kaggle OWASP Top 10 Vulnerability Benchmark Dataset</span>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'architecture' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A263A] font-bold">// System Architecture Pipeline</span>
                    <span className="text-[10px] text-[#6B6862]">Decoupled Microservice Topology</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#E5E0D7] space-y-1.5 text-xs text-[#202020]">
                    <p className="text-[#7A263A] font-semibold">[Client Layer] Next.js 14 App Router + Clerk Auth</p>
                    <p className="text-[#875F34]">↓ REST API Gateway [Node.js + Express.js]</p>
                    <p className="text-[#593E22]">↓ AI Microservice [Python + FastAPI Worker]</p>
                    <p className="text-[#7A263A]">↓ Multi-Agent Pipeline [Planner, Inspector, Formatter] → Google Gemini API</p>
                    <p className="text-[#6B6862]">↓ Persistence [PostgreSQL via Supabase Database]</p>
                  </div>
                </div>
              )}

              {activePreviewTab === 'roadmap' && (
                <div className="space-y-3">
                  <span className="font-bold text-[#202020] text-xs block">Development Timeline & Milestones</span>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E0D7] flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-[#202020] text-xs">Phase 1: Architecture & API Gateway Scaffolding</span>
                        <p className="text-[11px] text-[#6B6862]">Configure Next.js layout, Express routes, Clerk middleware</p>
                      </div>
                      <span className="text-[#6B6862] font-mono text-[11px]">Week 1–2</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E0D7] flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-[#202020] text-xs">Phase 2: FastAPI AI Worker & Gemini Pipeline</span>
                        <p className="text-[11px] text-[#6B6862]">Intent classification, multi-agent generator, code scaffolding</p>
                      </div>
                      <span className="text-[#6B6862] font-mono text-[11px]">Week 3–4</span>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'viva' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#E5E0D7] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#7A263A] uppercase tracking-widest font-mono">Viva Defense Q&A</span>
                      <span className="text-[10px] text-[#6B6862]">Sample Question 1 of 12</span>
                    </div>
                    <p className="font-bold text-[#202020] text-xs">Q: Why separate AI processing into FastAPI instead of doing it in Express?</p>
                    <p className="text-[#6B6862] text-xs leading-relaxed">
                      A: FastAPI provides native async Python execution for machine learning SDKs, Pydantic type validation, and high-concurrency streaming directly with the Gemini API without blocking the main API gateway.
                    </p>
                  </div>
                </div>
              )}

              {activePreviewTab === 'code' && (
                <div className="space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B6862] text-[11px]">// main_agent.py (FastAPI AI Microservice)</span>
                    <button
                      onClick={() => handleCopy(`from fastapi import FastAPI\nimport google.generativeai as genai\n\napp = FastAPI(title="ProjectMind AI Service")\n\n@app.post("/api/v1/ai/audit")\nasync def audit_code(snippet: str):\n    model = genai.GenerativeModel('gemini-1.5-flash')\n    return {"audit": model.generate_content(snippet).text}`)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#6B6862] hover:text-[#202020]"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] text-[#202020] overflow-x-auto p-3 bg-[#FAF8F5] rounded-lg border border-[#E5E0D7]">
{`from fastapi import FastAPI
import google.generativeai as genai

app = FastAPI(title="ProjectMind AI Service")

@app.post("/api/v1/ai/audit")
async def audit_code(snippet: str):
    model = genai.GenerativeModel('gemini-1.5-flash')
    return {"audit": model.generate_content(snippet).text}`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 01 / HOW IT WORKS (EDITORIAL FLOW) */}
        <section id="how-it-works" className="py-16 md:py-24 border-t border-[#E5E0D7]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#7A263A] uppercase tracking-wider block mb-2">
                  01 / Methodology
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202020] tracking-tight">
                  How ProjectMind Works
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#6B6862] max-w-md">
                A structured four-step pipeline that transforms raw project concepts into concrete, defense-ready software systems.
              </p>
            </div>

            {/* 4 Steps Editorial Process */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  number: '01',
                  name: 'Define',
                  desc: 'Describe your idea, requirements, target complexity, and preferred technology stack.',
                },
                {
                  number: '02',
                  name: 'Generate',
                  desc: 'ProjectMind coordinates specialized AI agents to generate blueprints, component architectures, and datasets.',
                },
                {
                  number: '03',
                  name: 'Refine',
                  desc: 'Use the AI Assistant to discuss architectural trade-offs, tweak timelines, and explore edge cases.',
                },
                {
                  number: '04',
                  name: 'Build',
                  desc: 'Export formal documentation (PDF, DOCX, PPT) and starter scaffolding code to begin implementation.',
                },
              ].map((step, idx) => (
                <div key={idx} className="border-t-2 border-[#7A263A] pt-4 space-y-2">
                  <span className="font-mono text-2xl font-bold text-[#7A263A] block">{step.number}</span>
                  <h3 className="text-base font-bold text-[#202020]">{step.name}</h3>
                  <p className="text-xs text-[#6B6862] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02 / OUTPUTS SHOWCASE */}
        <section id="outputs" className="py-16 md:py-24 border-t border-[#E5E0D7]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#7A263A] uppercase tracking-wider block mb-2">
                  02 / Deliverables
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202020] tracking-tight">
                  What You Can Create
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#6B6862] max-w-md">
                Every asset needed to architect, document, defend, and code a comprehensive software project.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Project Blueprint',
                  desc: 'Formal problem statements, measurable objectives, and prioritized feature scope matrices.',
                  icon: FileText,
                },
                {
                  title: 'System Architecture',
                  desc: 'Data flow sequences, microservice topology, component interactions, and stack rationales.',
                  icon: Cpu,
                },
                {
                  title: 'Development Roadmap',
                  desc: 'Phased milestone timelines with week-by-week implementation task breakdowns.',
                  icon: Calendar,
                },
                {
                  title: 'Research References',
                  desc: 'Curated scholarly research citations and relevant benchmark open-source datasets.',
                  icon: BookOpen,
                },
                {
                  title: 'Technical Documentation',
                  desc: 'Evaluation-ready documentation summaries formatted for presentations and project reports.',
                  icon: FolderKanban,
                },
                {
                  title: 'Viva Preparation',
                  desc: 'Domain-specific examiner questions, defense rationale, and architectural trade-off prep.',
                  icon: HelpCircle,
                },
                {
                  title: 'Starter Code',
                  desc: 'Foundational backend scaffolding, API route handlers, and environment config starter files.',
                  icon: Code2,
                },
                {
                  title: 'Project Workspace',
                  desc: 'A persistent digital workspace to inspect, organize, and export all generated project assets.',
                  icon: Layers,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-lg border border-[#E5E0D7] bg-[#FAF8F5] hover:border-[#7A263A] transition-colors space-y-2.5"
                >
                  <div className="w-8 h-8 rounded-md bg-white border border-[#E5E0D7] flex items-center justify-center text-[#7A263A]">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#202020]">{item.title}</h3>
                  <p className="text-xs text-[#6B6862] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 / CORE FEATURES (EDITORIAL HIERARCHY) */}
        <section id="features" className="py-16 md:py-24 border-t border-[#E5E0D7]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mb-12">
              <span className="font-mono text-xs font-bold text-[#7A263A] uppercase tracking-wider block mb-2">
                03 / Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202020] tracking-tight">
                Engineered for Serious Projects
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6862] mt-3 leading-relaxed">
                Structured generation without the chaos of switching between separate chatbots, diagrams, and formatting tools.
              </p>
            </div>

            {/* Asymmetrical Feature Showcase */}
            <div className="space-y-6">
              {/* Top 2 Featured Spotlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-7 rounded-xl bg-white border border-[#E5E0D7] space-y-4">
                  <div className="w-10 h-10 rounded-md bg-[#7A263A]/10 border border-[#7A263A]/20 flex items-center justify-center text-[#7A263A]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#202020] mb-1.5">Structured Multi-Agent Generator</h3>
                    <p className="text-xs text-[#6B6862] leading-relaxed">
                      Instead of a single prompt, specialized AI agents collaborate: a Planner Agent decomposes requirements, an Inspector Agent audits security, and a Formatter Agent prepares production blueprints.
                    </p>
                  </div>
                  <ul className="space-y-2 pt-2 border-t border-[#E5E0D7] text-xs text-[#202020] font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7A263A]" />
                      <span>Single & Multi-Agent execution modes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7A263A]" />
                      <span>Domain & complexity-specific custom constraints</span>
                    </li>
                  </ul>
                </div>

                <div className="p-7 rounded-xl bg-white border border-[#E5E0D7] space-y-4">
                  <div className="w-10 h-10 rounded-md bg-[#7A263A]/10 border border-[#7A263A]/20 flex items-center justify-center text-[#7A263A]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#202020] mb-1.5">Conversational Project Assistant</h3>
                    <p className="text-xs text-[#6B6862] leading-relaxed">
                      Equipped with intent classification to guide you through architectural questions, evaluate trade-offs, troubleshoot database schemas, and prepare for academic defense questions.
                    </p>
                  </div>
                  <ul className="space-y-2 pt-2 border-t border-[#E5E0D7] text-xs text-[#202020] font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7A263A]" />
                      <span>Real-time intent guarding and query routing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7A263A]" />
                      <span>Contextual project guidance & viva tips</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 4 Supporting Feature Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: Cpu,
                    title: 'System Architecture',
                    desc: 'Clear data flow mappings, component relationships, and microservice topology blueprints.',
                  },
                  {
                    icon: BookOpen,
                    title: 'Papers & Datasets',
                    desc: 'Domain-matched research paper citations and open-source benchmark dataset recommendations.',
                  },
                  {
                    icon: HelpCircle,
                    title: 'Viva Defense Engine',
                    desc: 'Technical questions, conceptual breakdowns, and defense answers tailored to your stack.',
                  },
                  {
                    icon: Download,
                    title: 'Multi-Format Export',
                    desc: 'One-click export into clean PDF, DOCX, PowerPoint (PPT), or Markdown documentation.',
                  },
                ].map((feat, idx) => (
                  <div key={idx} className="p-5 rounded-lg bg-white border border-[#E5E0D7] space-y-2">
                    <feat.icon className="w-4 h-4 text-[#7A263A]" />
                    <h4 className="text-xs font-bold text-[#202020]">{feat.title}</h4>
                    <p className="text-[11px] text-[#6B6862] leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 04 / ARCHITECTURE & PLATFORM ENGINEERING */}
        <section id="architecture" className="py-16 md:py-24 border-t border-[#E5E0D7]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#7A263A] uppercase tracking-wider block mb-2">
                  04 / Technical Architecture
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202020] tracking-tight">
                  How the Platform is Built
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#6B6862] max-w-md">
                A decoupled, production-grade microservice architecture designed for performance, modularity, and scalability.
              </p>
            </div>

            {/* Architecture Topology Box */}
            <div className="rounded-xl border border-[#E5E0D7] bg-[#FAF8F5] p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-white border border-[#E5E0D7] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7A263A] font-mono">
                    <Workflow className="w-3.5 h-3.5" />
                    <span>01 / Frontend</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#202020]">Next.js 14 Web App</h4>
                  <p className="text-xs text-[#6B6862]">
                    App Router, React Server Components, Tailwind CSS styling, and Clerk session auth.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E5E0D7] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7A263A] font-mono">
                    <Server className="w-3.5 h-3.5" />
                    <span>02 / API Gateway</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#202020]">Node.js + Express</h4>
                  <p className="text-xs text-[#6B6862]">
                    REST API gateway, rate limiting, request validation, and project export dispatcher.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E5E0D7] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7A263A] font-mono">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>03 / AI Service</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#202020]">Python + FastAPI</h4>
                  <p className="text-xs text-[#6B6862]">
                    Async multi-agent pipeline orchestrating Gemini API for generation & intent classification.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E5E0D7] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7A263A] font-mono">
                    <Database className="w-3.5 h-3.5" />
                    <span>04 / Database</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#202020]">PostgreSQL Storage</h4>
                  <p className="text-xs text-[#6B6862]">
                    Persistent project storage, relational schema management, and user history tracking.
                  </p>
                </div>
              </div>

              {/* Monospace Pipeline Representation */}
              <div className="p-4 rounded-lg bg-[#202020] text-[#FAF8F5] font-mono text-xs overflow-x-auto space-y-1">
                <p className="text-[#C49A6C]">// Request Pipeline Flow</p>
                <p className="text-slate-200">
                  Client [Next.js] ➔ REST Gateway [Express :5000] ➔ Worker [FastAPI :8000] ➔ Multi-Agent Pipeline [Gemini API] ➔ Database [PostgreSQL]
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 05 / FAQ */}
        <section id="faq" className="py-16 md:py-24 border-t border-[#E5E0D7]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="font-mono text-xs font-bold text-[#7A263A] uppercase tracking-wider block mb-2">
                05 / Questions
              </span>
              <h2 className="text-3xl font-extrabold text-[#202020] tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'What is ProjectMind AI?',
                  a: 'ProjectMind AI is a structured platform that helps students, developers, and project teams plan, architect, document, and execute complex technical projects from scratch.',
                },
                {
                  q: 'Who is ProjectMind AI for?',
                  a: 'It is built for MCA and engineering students preparing major/final-year projects, as well as software developers and researchers who need complete technical documentation and architecture blueprints.',
                },
                {
                  q: 'Can I use my own custom project idea and tech stack?',
                  a: 'Yes. You can enter any custom concept and choose your preferred frontend, backend, database, and machine learning technologies or let the generator recommend an optimal stack.',
                },
                {
                  q: 'What deliverables does the AI generate?',
                  a: 'The system generates a full project blueprint with problem statements, measurable objectives, prioritized feature matrices, system architecture diagrams, roadmaps, research citations, viva Q&As, and starter code.',
                },
                {
                  q: 'Can I refine a generated project blueprint?',
                  a: 'Yes. You can use the built-in AI Assistant to ask technical questions, adjust milestones, evaluate alternative architecture choices, or add custom requirements.',
                },
                {
                  q: 'Does ProjectMind store and let me export my projects?',
                  a: 'Yes. All generated projects are saved to your project catalog and can be exported at any time into PDF, DOCX, PowerPoint (PPT), or Markdown formats.',
                },
                {
                  q: 'What authentication methods are supported?',
                  a: 'We support instant direct login with Google, GitHub, and standard Email / Password through Clerk authentication.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-white border border-[#E5E0D7] overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-[#202020] hover:text-[#7A263A] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#6B6862] transition-transform ${openFaq === idx ? 'rotate-180 text-[#7A263A]' : ''}`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-[#6B6862] leading-relaxed border-t border-[#E5E0D7] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="p-8 sm:p-12 rounded-xl bg-[#202020] text-[#FAF8F5] text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Turn Your Idea into a Real Project?
            </h2>
            <p className="text-xs sm:text-sm text-[#C4BEB4] max-w-xl mx-auto leading-relaxed">
              Create an account to start generating complete blueprints, architecture diagrams, viva questions, and starter code.
            </p>
            <div className="pt-2">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-[#7A263A] hover:bg-[#661F30] px-6 py-3 rounded-md shadow-xs transition-colors"
              >
                <span>Start Building</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* PROFESSIONAL FOOTER */}
      <footer className="bg-white border-t border-[#E5E0D7] pt-14 pb-10 px-4 sm:px-6 lg:px-8 text-xs text-[#6B6862]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#7A263A] flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[#202020] text-base tracking-tight">ProjectMind AI</span>
              </div>
              <p className="text-xs text-[#6B6862] max-w-sm leading-relaxed">
                From idea to implementation. An autonomous project planning and architecture platform for students, developers, and project teams.
              </p>
            </div>

            {/* Product Column */}
            <div className="md:col-span-3 space-y-2.5">
              <span className="font-bold text-[#202020] uppercase tracking-wider text-[11px] block font-mono">Product</span>
              <ul className="space-y-2">
                <li><Link href="/generator" className="hover:text-[#202020] transition-colors">AI Generator</Link></li>
                <li><Link href="/assistant" className="hover:text-[#202020] transition-colors">AI Assistant</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#202020] transition-colors">Project Workspace</Link></li>
                <li><Link href="/history" className="hover:text-[#202020] transition-colors">Project History</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="md:col-span-2 space-y-2.5">
              <span className="font-bold text-[#202020] uppercase tracking-wider text-[11px] block font-mono">Resources</span>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="hover:text-[#202020] transition-colors">How It Works</a></li>
                <li><a href="#outputs" className="hover:text-[#202020] transition-colors">Outputs</a></li>
                <li><a href="#architecture" className="hover:text-[#202020] transition-colors">Architecture</a></li>
                <li><a href="#faq" className="hover:text-[#202020] transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Account & Legal Column */}
            <div className="md:col-span-2 space-y-2.5">
              <span className="font-bold text-[#202020] uppercase tracking-wider text-[11px] block font-mono">Account</span>
              <ul className="space-y-2">
                <li><Link href="/sign-in" className="hover:text-[#202020] transition-colors">Sign In</Link></li>
                <li><Link href="/sign-up" className="hover:text-[#202020] transition-colors">Start Building</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#202020] transition-colors">Dashboard</Link></li>
                <li><Link href="/" className="hover:text-[#202020] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/" className="hover:text-[#202020] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar with Discreet Admin Portal Link */}
          <div className="pt-8 border-t border-[#E5E0D7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6862]">
            <p>© {new Date().getFullYear()} ProjectMind AI. Built for students, developers and project teams.</p>
            <div className="flex items-center gap-3.5 text-[11px]">
              <Link href="/" className="hover:text-[#202020] transition-colors">Privacy</Link>
              <span className="text-[#D8D2C9]">·</span>
              <Link href="/" className="hover:text-[#202020] transition-colors">Terms</Link>
              <span className="text-[#D8D2C9]">·</span>
              <Link
                href="/admin/dashboard"
                className="hover:text-[#7A263A] transition-colors inline-flex items-center gap-1 font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-[#7A263A]" />
                <span>Admin Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
