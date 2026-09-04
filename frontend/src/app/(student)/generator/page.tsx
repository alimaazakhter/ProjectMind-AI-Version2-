'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Bot,
  UserCheck,
  Lightbulb,
  CheckSquare,
  Square,
  Layers,
  Cpu,
  Shield,
  Code2,
  Database,
  Cloud,
  Activity,
  Boxes,
  Zap,
} from 'lucide-react';
import { AgentMode, ProjectLevel } from '@/types/project';
import { AIService } from '@/services/api/aiService';

interface DomainConfig {
  name: string;
  icon: any;
  suggestions: { title: string; tech: string[]; constraints: string }[];
}

export default function GeneratorPage() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [titleIdea, setTitleIdea] = useState('');
  const [domain, setDomain] = useState('Artificial Intelligence & Machine Learning');
  const [skillLevel, setSkillLevel] = useState<ProjectLevel>('intermediate');
  const [preferredTech, setPreferredTech] = useState<string[]>(['Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'PyTorch']);
  const [complexity, setComplexity] = useState('Major Project (Production-Grade)');
  const [agentMode, setAgentMode] = useState<AgentMode>('multi');
  const [customRequirements, setCustomRequirements] = useState('');
  
  // Section Control State (Screenshot 4)
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({
    abstract: true,
    problemStatement: true,
    literatureReview: true,
    methodology: true,
    algorithmsUsed: true,
    techStack: true,
    roadmapSDLC: true,
    references: true,
    vivaQA: true,
    starterCode: true,
    uniquifier: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const DOMAINS: DomainConfig[] = [
    {
      name: 'Artificial Intelligence & Machine Learning',
      icon: Cpu,
      suggestions: [
        {
          title: 'Adaptive AI Task Prioritizer: Machine Learning-Driven Productivity Engine',
          tech: ['Python', 'Next.js', 'FastAPI', 'XGBoost', 'PostgreSQL', 'Scikit-Learn'],
          constraints: 'Include gradient boosting regressors, DBSCAN clustering, and dynamic urgency heuristics.',
        },
        {
          title: 'Automated Radiology Diagnostic Assistant using Vision Transformers & Grad-CAM',
          tech: ['Python', 'PyTorch', 'FastAPI', 'Next.js', 'PostgreSQL', 'OpenCV'],
          constraints: 'Integrate Vision Transformer (ViT), DICOM image parsing, and explainable AI heatmaps.',
        },
        {
          title: 'Multi-Modal RAG Knowledge Assistant with Hybrid Dense-Sparse Search',
          tech: ['Python', 'FastAPI', 'Next.js', 'Pinecone', 'LangChain', 'PostgreSQL'],
          constraints: 'Implement BM25 sparse + BGE dense vector embeddings with cross-encoder reranking.',
        },
      ],
    },
    {
      name: 'Cybersecurity & Network Defense',
      icon: Shield,
      suggestions: [
        {
          title: 'Autonomous AI Code Reviewer & Static Security Vulnerability Auditor',
          tech: ['Python', 'FastAPI', 'Next.js', 'PostgreSQL', 'Docker'],
          constraints: 'Audit OWASP Top 10 vulnerabilities (SQLi, SSRF, IDOR) using AST parsing and LLM heuristics.',
        },
        {
          title: 'Real-Time Zero-Trust Network Anomaly Detection with Graph Neural Networks',
          tech: ['Python', 'PyTorch', 'FastAPI', 'Kafka', 'PostgreSQL'],
          constraints: 'Process PCAP network packet streams with PyTorch Geometric GNNs for intrusion detection.',
        },
      ],
    },
    {
      name: 'Full Stack Cloud SaaS & Distributed Systems',
      icon: Cloud,
      suggestions: [
        {
          title: 'High-Throughput Event-Driven Microservice Platform with CQRS & Event Sourcing',
          tech: ['Node.js', 'Express.js', 'Go', 'Next.js', 'Kafka', 'PostgreSQL', 'Redis'],
          constraints: 'Implement CQRS write/read splitting, distributed tracing, and transactional outbox patterns.',
        },
        {
          title: 'Autonomous Multi-Tenant DevOps CI/CD Orchestrator with Canary Deployments',
          tech: ['Go', 'Docker', 'Kubernetes', 'Next.js', 'PostgreSQL', 'FastAPI'],
          constraints: 'Provide automated blue-green rollouts, Prometheus metric scraping, and container telemetry.',
        },
      ],
    },
    {
      name: 'Blockchain, Cryptography & Web3',
      icon: Boxes,
      suggestions: [
        {
          title: 'Zero-Knowledge Proofs for Verifiable Private Machine Learning Inference (zk-SNARKs)',
          tech: ['Python', 'FastAPI', 'Next.js', 'Solidity', 'PostgreSQL', 'WebAssembly'],
          constraints: 'Implement Circom zk-SNARK circuits for verifiable model inference without revealing weights.',
        },
        {
          title: 'Decentralized Cross-Chain Liquidity Protocol with MEV-Resistant Batch Auctions',
          tech: ['Solidity', 'Rust', 'Next.js', 'PostgreSQL', 'Ethers.js'],
          constraints: 'Design automated market maker (AMM) with batch clearing to prevent front-running.',
        },
      ],
    },
    {
      name: 'Healthcare AI & Biomedical Engineering',
      icon: Activity,
      suggestions: [
        {
          title: 'Federated Learning Framework for Privacy-Preserving Clinical EHR Analytics',
          tech: ['Python', 'PyTorch', 'FastAPI', 'Next.js', 'PostgreSQL'],
          constraints: 'Implement Flower framework federated averaging with differential privacy epsilon guarantees.',
        },
        {
          title: 'Real-Time Wearable ECG Arrhythmia Classification using 1D-CNN & Bi-LSTM',
          tech: ['Python', 'TensorFlow', 'FastAPI', 'Next.js', 'PostgreSQL'],
          constraints: 'Process PhysioNet MIT-BIH dataset with 1D-CNN and lightweight edge quantization.',
        },
      ],
    },
    {
      name: 'IoT, Robotics & Edge Computing',
      icon: Zap,
      suggestions: [
        {
          title: 'Autonomous Drone Swarm Collision Avoidance with Decentralized Reinforcement Learning',
          tech: ['Python', 'PyTorch', 'ROS2', 'FastAPI', 'Next.js', 'PostgreSQL'],
          constraints: 'Utilize Multi-Agent PPO (MAPPO) with decentralized actor-critic architecture in Gazebo.',
        },
      ],
    },
  ];

  const TECH_CATEGORIES = [
    {
      category: 'Frontend & Client',
      items: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'React Native', 'Flutter', 'Vue.js'],
    },
    {
      category: 'Backend & APIs',
      items: ['Node.js', 'Express.js', 'Python', 'FastAPI', 'Django', 'Go', 'Rust', 'Spring Boot'],
    },
    {
      category: 'AI / Machine Learning',
      items: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'XGBoost', 'LangChain', 'HuggingFace', 'OpenCV', 'YOLOv8'],
    },
    {
      category: 'Databases & Vector Stores',
      items: ['PostgreSQL', 'Supabase', 'MongoDB', 'Redis', 'Pinecone', 'Qdrant', 'Neo4j'],
    },
    {
      category: 'Cloud & Infrastructure',
      items: ['Docker', 'Kubernetes', 'AWS', 'Kafka', 'WebAssembly', 'Solidity'],
    },
  ];

  const SECTION_OPTIONS = [
    { key: 'abstract', label: 'Executive Abstract', desc: 'Comprehensive academic summary & background' },
    { key: 'problemStatement', label: 'Problem Statement & Gap Analysis', desc: 'Real-world challenges & research justification' },
    { key: 'literatureReview', label: 'Literature Review & Prior Art', desc: 'State-of-the-art tool comparison & deficiencies' },
    { key: 'methodology', label: 'System Methodology (SDLC)', desc: '4-phase engineering pipeline & feature formulations' },
    { key: 'algorithmsUsed', label: 'Algorithms Used & Mathematical Models', desc: 'Inputs, outputs, equations, and rationales' },
    { key: 'techStack', label: 'Technology Stack & Justifications', desc: 'Categorized architectural component rationales' },
    { key: 'roadmapSDLC', label: 'Phased SDLC Implementation Roadmap', desc: 'Weeks 1–12 timeline with milestone tasks' },
    { key: 'references', label: 'Academic Citations & Benchmark Datasets', desc: 'arXiv papers and Kaggle/HuggingFace datasets' },
    { key: 'vivaQA', label: 'Examiner Viva Defense Q&A Engine', desc: 'Categorized professor questions & model answers' },
    { key: 'starterCode', label: 'Working Starter Code Scaffolding', desc: 'Production boilerplate files with copy tools' },
    { key: 'uniquifier', label: 'Make It Unique / Innovations', desc: 'Competitive edge and differentiator proposals' },
  ];

  const toggleTech = (tech: string) => {
    if (preferredTech.includes(tech)) {
      setPreferredTech(preferredTech.filter((t) => t !== tech));
    } else {
      setPreferredTech([...preferredTech, tech]);
    }
  };

  const toggleSection = (key: string) => {
    setSelectedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applySuggestion = (sug: { title: string; tech: string[]; constraints: string }, domainName: string) => {
    setTitleIdea(sug.title);
    setDomain(domainName);
    setPreferredTech(sug.tech);
    setCustomRequirements(sug.constraints);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPipelineProgress(15);
    setStatusMessage('1/4: Initializing Planner Agent (Abstract, Literature Review, Objectives)...');

    const timer1 = setTimeout(() => {
      setPipelineProgress(45);
      setStatusMessage('2/4: Running Architect Agent (System Methodology, Algorithms, 3-Tier Flow)...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setPipelineProgress(75);
      setStatusMessage('3/4: Curating Research Papers (arXiv), Benchmark Datasets, and Viva Q&As...');
    }, 2800);

    const timer3 = setTimeout(() => {
      setPipelineProgress(90);
      setStatusMessage('4/4: Persisting 11-table relational blueprint to Supabase Cloud PostgreSQL...');
    }, 4500);

    try {
      const token = await getToken();
      const effectiveTitle = titleIdea.trim() || currentDomainConfig.suggestions[0]?.title || `${domain} Intelligent System Architecture`;
      const effectiveTech = preferredTech.length > 0 ? preferredTech : currentDomainConfig.suggestions[0]?.tech || ['Next.js 14', 'Node.js/Express', 'Python FastAPI', 'PostgreSQL'];
      const effectiveConstraints = customRequirements.trim() || currentDomainConfig.suggestions[0]?.constraints || '';

      const blueprint = await AIService.generateBlueprint({
        titleIdea: effectiveTitle,
        domain,
        skillLevel,
        preferredTech: effectiveTech,
        complexity,
        agentMode,
        customRequirements: `${effectiveConstraints} | Included Sections: ${Object.keys(selectedSections).filter((k) => selectedSections[k]).join(', ')}`,
        userId: user?.id,
      }, token);

      setPipelineProgress(100);
      setStatusMessage('🎉 Complete! Opening your project workspace...');
      setTimeout(() => {
        router.push(`/workspace/${blueprint.id}`);
      }, 500);
    } catch {
      alert('Generation failed. Please check your backend connection.');
      setIsGenerating(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }
  };

  const currentDomainConfig = DOMAINS.find((d) => d.name === domain) || DOMAINS[0];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE6DF] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7A263A]/10 text-[#7A263A] text-xs font-semibold border border-[#7A263A]/20 mb-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#7A263A]" />
            <span>AI Auto Project Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#202020] tracking-tight">AI Project Generator</h1>
          <p className="text-[#555555] text-xs sm:text-sm mt-1">
            Instantly generate complete academic project blueprints powered by Google Gemini Multi-Agent Orchestration.
          </p>
        </div>

        {/* Wizard Steps */}
        <div className="flex items-center gap-1.5 bg-white border border-[#EBE6DF] p-1.5 rounded-2xl shadow-xs shrink-0">
          {[1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => !isGenerating && setStep(i)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                step === i
                  ? 'bg-[#7A263A] text-white shadow-xs'
                  : step > i
                  ? 'bg-[#C49A6C]/15 text-[#7A263A] border border-[#C49A6C]/30'
                  : 'bg-[#F6F2EB] text-[#888888]'
              }`}
            >
              {step > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i}</span>}
              <span className="hidden sm:inline">
                {i === 1 ? 'Topic & Domain' : i === 2 ? 'Tech & Sections' : 'Agent & Launch'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs relative space-y-6">
        {/* ========================================================= */}
        {/* STEP 1: DOMAIN & SMART WORKING TITLE SUGGESTIONS */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#7A263A] text-white text-xs font-bold flex items-center justify-center">1</span>
                Domain & Working Title Idea
              </h2>
              <span className="text-xs font-semibold text-[#888888] font-mono">Step 1 of 3</span>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider font-mono">
                Project Working Title / Topic (Optional)
              </label>
              <input
                type="text"
                value={titleIdea}
                onChange={(e) => setTitleIdea(e.target.value)}
                placeholder="e.g. Adaptive AI Task Prioritizer with XGBoost, or leave blank to auto-generate"
                className="w-full bg-[#F6F2EB] border border-[#EBE6DF] rounded-xl px-4 py-3 text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A] focus:bg-white text-xs sm:text-sm font-medium transition-all"
              />
            </div>

            {/* Domain Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider font-mono">
                Select Academic / Technology Domain
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {DOMAINS.map((d) => {
                  const Icon = d.icon;
                  const isSelected = domain === d.name;
                  return (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => setDomain(d.name)}
                      className={`p-3 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-[#7A263A]/10 border-[#7A263A] text-[#7A263A] shadow-xs'
                          : 'bg-white border-[#EBE6DF] text-[#555555] hover:border-[#7A263A]/40 hover:bg-[#F6F2EB]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#7A263A] text-white' : 'bg-[#F6F2EB] text-[#666666]'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">{d.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Suggestions / Example Prompts for Selected Domain */}
            {currentDomainConfig.suggestions.length > 0 && (
              <div className="space-y-2.5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DF]">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#875F34]" />
                  <span className="text-xs font-bold text-[#202020] uppercase tracking-wider font-mono">
                    Smart Suggestions for {domain.split('&')[0]} (Click to Auto-Fill)
                  </span>
                </div>
                <div className="space-y-2">
                  {currentDomainConfig.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applySuggestion(sug, currentDomainConfig.name)}
                      className="w-full text-left p-3 rounded-xl bg-white border border-[#EBE6DF] hover:border-[#7A263A] hover:bg-[#F6F2EB] transition-all flex items-start justify-between gap-3 shadow-xs group"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#202020] group-hover:text-[#7A263A] transition-colors">
                          {sug.title}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {sug.tech.map((t, tIdx) => (
                            <span key={tIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F6F2EB] text-[#666666] font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#7A263A] shrink-0 mt-1 uppercase font-mono">Auto-Fill ➔</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Complexity & Skill Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider font-mono">Project Complexity Tier</label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  className="w-full bg-[#F6F2EB] border border-[#EBE6DF] rounded-xl px-3 py-2.5 text-xs text-[#202020] font-semibold focus:outline-none focus:border-[#7A263A]"
                >
                  <option value="Mini Project (Coursework Grade)">Mini Project (Coursework Grade)</option>
                  <option value="Major Project (Production-Grade)">Major Project (Production-Grade)</option>
                  <option value="Research / Capstone Tier (Publication Ready)">Research / Capstone Tier (Publication Ready)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider font-mono">Developer Skill Level</label>
                <div className="flex gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSkillLevel(lvl)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                        skillLevel === lvl
                          ? 'bg-[#7A263A] text-white border-[#7A263A]'
                          : 'bg-[#F6F2EB] border-[#EBE6DF] text-[#666666] hover:bg-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-xs shadow-xs transition-all"
              >
                <span>Next: Tech Stack & Section Control</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: PREFERRED TECH & SECTION CONTROL (CHECKBOXES) */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#7A263A] text-white text-xs font-bold flex items-center justify-center">2</span>
                Preferred Technologies & Section Control
              </h2>
              <span className="text-xs font-semibold text-[#888888] font-mono">Step 2 of 3</span>
            </div>

            {/* Categorized Tech Stack */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider font-mono">
                Select Preferred Technologies
              </label>
              <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EBE6DF]">
                {TECH_CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#7A263A] uppercase tracking-wider font-mono">{cat.category}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((tech) => {
                        const isSelected = preferredTech.includes(tech);
                        return (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => toggleTech(tech)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-[#7A263A] text-white border-[#7A263A] shadow-xs'
                                : 'bg-white border-[#EBE6DF] text-[#555555] hover:border-[#7A263A]/40 hover:bg-[#F6F2EB]'
                            }`}
                          >
                            {tech}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Control (Checkboxes matching Screenshot 4) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider font-mono">
                📋 Section Control (Select which sections to include in the blueprint)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF]">
                {SECTION_OPTIONS.map((sec) => {
                  const isChecked = selectedSections[sec.key];
                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => toggleSection(sec.key)}
                      className={`p-3 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-white border-[#7A263A] text-[#202020] shadow-xs'
                          : 'bg-white/50 border-[#EBE6DF] text-[#888888]'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#7A263A] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-[#AAAAAA] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className={`text-xs font-bold block ${isChecked ? 'text-[#202020]' : 'text-[#777777]'}`}>
                          {sec.label}
                        </span>
                        <span className="text-[10px] text-[#666666] leading-tight block">{sec.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Constraints */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider font-mono">
                Custom Constraints & Specific Algorithms (Optional)
              </label>
              <textarea
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                placeholder="e.g. Must include linear regression, clustering algorithms, DICOM metadata handling, latency below 200ms, and PostgreSQL indexes..."
                rows={3}
                className="w-full bg-[#F6F2EB] border border-[#EBE6DF] rounded-xl p-3.5 text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A] focus:bg-white text-xs transition-all font-medium"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#EBE6DF] text-[#202020] font-semibold text-xs hover:bg-[#F6F2EB] shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-xs shadow-xs transition-all"
              >
                <span>Next: Agent Mode & Generate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: AGENT MODE & DIRECT GENERATION LAUNCH */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#7A263A] text-white text-xs font-bold flex items-center justify-center">3</span>
                AI Agent Pipeline & Direct Launch
              </h2>
              <span className="text-xs font-semibold text-[#888888] font-mono">Step 3 of 3</span>
            </div>

            {/* Agent Mode Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setAgentMode('multi')}
                className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                  agentMode === 'multi'
                    ? 'bg-[#7A263A]/5 border-[#7A263A] shadow-xs ring-1 ring-[#7A263A]'
                    : 'bg-white border-[#EBE6DF] hover:border-[#7A263A]/40 hover:bg-[#F6F2EB]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#7A263A] text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C49A6C]/20 text-[#875F34] border border-[#C49A6C]/30 font-mono">
                    RECOMMENDED
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#202020] mb-1">Multi-Agent AI Pipeline</h3>
                <p className="text-[#555555] text-xs leading-relaxed">
                  Planner, Architect, Research & Viva agents execute in coordinated parallel passes to generate high-depth academic specifications.
                </p>
              </div>

              <div
                onClick={() => setAgentMode('single')}
                className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                  agentMode === 'single'
                    ? 'bg-[#7A263A]/5 border-[#7A263A] shadow-xs ring-1 ring-[#7A263A]'
                    : 'bg-white border-[#EBE6DF] hover:border-[#7A263A]/40 hover:bg-[#F6F2EB]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#F6F2EB] text-[#666666] flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                    FAST PASS
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#202020] mb-1">Single-Agent Engine</h3>
                <p className="text-[#555555] text-xs leading-relaxed">
                  Fast single-pass generation engine. Ideal for quick preliminary scope drafts and high-level concept overviews.
                </p>
              </div>
            </div>

            {/* Selected Configuration Summary */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DF] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#777777] font-mono">Target Topic:</span>
                <span className="font-bold text-[#202020]">{titleIdea || 'Auto-Synthesize from Domain'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777] font-mono">Domain:</span>
                <span className="font-bold text-[#7A263A]">{domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777] font-mono">Selected Tech:</span>
                <span className="font-bold text-[#202020]">{preferredTech.slice(0, 5).join(', ')}{preferredTech.length > 5 ? ` +${preferredTech.length - 5} more` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777] font-mono">AI Engine:</span>
                <span className="font-bold text-emerald-700">Google Gemini Multi-Agent</span>
              </div>
            </div>

            {/* Live Progress Bar when generating */}
            {isGenerating && (
              <div className="p-6 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-3 text-center">
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-5 h-5 rounded-full border-2 border-[#7A263A] border-t-transparent animate-spin" />
                  <span className="text-xs font-bold text-[#7A263A] font-mono">
                    {statusMessage}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-[#EBE6DF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7A263A] transition-all duration-300 rounded-full"
                    style={{ width: `${pipelineProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#777777] font-mono">
                  Synthesizing Abstract, Literature Review, Methodology, Algorithms, Viva Q&A, and SDLC Roadmap...
                </p>
              </div>
            )}

            {!isGenerating && (
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#EBE6DF] text-[#202020] font-semibold text-xs hover:bg-[#F6F2EB] shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-sm shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Project Blueprint</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
