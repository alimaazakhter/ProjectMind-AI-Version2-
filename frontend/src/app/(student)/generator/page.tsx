'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Bot,
  UserCheck,
} from 'lucide-react';
import { AgentMode, ProjectLevel } from '@/types/project';
import { AIService } from '@/services/api/aiService';

export default function GeneratorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [titleIdea, setTitleIdea] = useState('');
  const [domain, setDomain] = useState('Artificial Intelligence & Machine Learning');
  const [skillLevel, setSkillLevel] = useState<ProjectLevel>('intermediate');
  const [preferredTech, setPreferredTech] = useState<string[]>(['Next.js', 'Python', 'FastAPI', 'PostgreSQL']);
  const [complexity, setComplexity] = useState('Production Grade Architecture');
  const [agentMode, setAgentMode] = useState<AgentMode>('multi');
  const [customRequirements, setCustomRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);

  const DOMAINS = [
    'Artificial Intelligence & Machine Learning',
    'Full Stack Web Applications & SaaS',
    'Cybersecurity & Network Defense',
    'Cloud Architecture & DevOps',
    'Distributed Systems & Blockchain',
    'Data Engineering & Big Data Analytics',
    'Internet of Things (IoT) & Embedded Systems',
  ];

  const TECH_OPTIONS = ['React', 'Next.js', 'Node.js', 'Express.js', 'Python', 'FastAPI', 'PyTorch', 'TensorFlow', 'PostgreSQL', 'Docker', 'AWS'];

  const toggleTech = (tech: string) => {
    if (preferredTech.includes(tech)) {
      setPreferredTech(preferredTech.filter((t) => t !== tech));
    } else {
      setPreferredTech([...preferredTech, tech]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPipelineProgress(20);

    const timer1 = setTimeout(() => setPipelineProgress(50), 600);
    const timer2 = setTimeout(() => setPipelineProgress(85), 1200);

    try {
      const blueprint = await AIService.generateBlueprint({
        titleIdea,
        domain,
        skillLevel,
        preferredTech,
        complexity,
        agentMode,
        customRequirements,
      });

      setPipelineProgress(100);
      setTimeout(() => {
        router.push(`/workspace/${blueprint.id}`);
      }, 500);
    } catch (err) {
      alert('Generation failed. Please try again.');
      setIsGenerating(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7A263A]/10 text-[#7A263A] text-xs font-semibold border border-[#7A263A]/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7A263A]" />
            <span>Structured Generation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight">AI Project Generator</h1>
          <p className="text-[#555555] text-xs sm:text-sm mt-1">
            Build a complete technical blueprint tailored to your exact domain and architecture requirements.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 bg-white border border-[#EBE6DF] p-1.5 rounded-2xl shadow-xs shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                step === i
                  ? 'bg-[#7A263A] text-white shadow-xs'
                  : step > i
                  ? 'bg-[#C49A6C]/15 text-[#7A263A] border border-[#C49A6C]/30'
                  : 'bg-[#F6F2EB] text-[#888888]'
              }`}
            >
              {step > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : i}
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs relative">
        {/* Step 1: Domain & Basic Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#7A263A]/10 text-[#7A263A] text-xs font-bold flex items-center justify-center border border-[#7A263A]/20">
                1
              </span>
              Domain & Working Title Idea
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                Working Title / Keyword Concept (Optional)
              </label>
              <input
                type="text"
                value={titleIdea}
                onChange={(e) => setTitleIdea(e.target.value)}
                placeholder="e.g. Autonomous AI Code Reviewer, E-Commerce Recommendation Engine, IoT Smart Campus"
                className="w-full bg-[#F6F2EB] border border-[#EBE6DF] rounded-xl px-4 py-2.5 text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A] focus:bg-white text-xs sm:text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202020] mb-2">Select Primary Domain</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDomain(d)}
                    className={`p-3.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                      domain === d
                        ? 'bg-[#7A263A]/10 border-[#7A263A] text-[#7A263A] shadow-xs'
                        : 'bg-white border-[#EBE6DF] text-[#555555] hover:border-[#7A263A]/40 hover:bg-[#F6F2EB]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-semibold text-xs shadow-xs transition-all"
              >
                <span>Next: Tech Stack</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Tech Stack Selection */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#7A263A]/10 text-[#7A263A] text-xs font-bold flex items-center justify-center border border-[#7A263A]/20">
                2
              </span>
              Preferred Technologies & Custom Constraints
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#202020] mb-2">Select Preferred Technologies</label>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map((tech) => {
                  const isSelected = preferredTech.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-[#7A263A]/10 text-[#7A263A] border-[#7A263A] shadow-xs'
                          : 'bg-white border-[#EBE6DF] text-[#555555] hover:border-[#7A263A]/40 hover:bg-[#F6F2EB]'
                      }`}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202020] mb-1.5">Custom Guidance / Requirements</label>
              <textarea
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                placeholder="Mention specific algorithms, APIs, architectural constraints, or database requirements..."
                rows={3}
                className="w-full bg-[#F6F2EB] border border-[#EBE6DF] rounded-xl p-3.5 text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A] focus:bg-white text-xs transition-all"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#EBE6DF] text-[#202020] font-semibold text-xs hover:bg-[#F6F2EB] shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-semibold text-xs shadow-xs transition-all"
              >
                <span>Next: Agent Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Agent Mode Selection */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#7A263A]/10 text-[#7A263A] text-xs font-bold flex items-center justify-center border border-[#7A263A]/20">
                3
              </span>
              AI Agent Execution Mode
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Single Agent Card */}
              <div
                onClick={() => setAgentMode('single')}
                className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                  agentMode === 'single'
                    ? 'bg-[#7A263A]/5 border-[#7A263A] shadow-xs'
                    : 'bg-white border-[#EBE6DF] hover:border-[#7A263A]/40 hover:bg-[#F6F2EB]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F6F2EB] flex items-center justify-center text-[#555555]">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  {agentMode === 'single' && <CheckCircle2 className="w-4 h-4 text-[#7A263A]" />}
                </div>
                <h3 className="text-sm font-bold text-[#202020] mb-1">Single Agent Mode</h3>
                <p className="text-[#555555] text-xs leading-relaxed">
                  Fast single-pass generation engine. Ideal for quick blueprint ideas and preliminary project scope drafts.
                </p>
              </div>

              {/* Multi Agent Card */}
              <div
                onClick={() => setAgentMode('multi')}
                className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                  agentMode === 'multi'
                    ? 'bg-[#7A263A]/5 border-[#7A263A] shadow-xs'
                    : 'bg-white border-[#EBE6DF] hover:border-[#7A263A]/40 hover:bg-[#F6F2EB]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7A263A]/10 border border-[#7A263A]/20 flex items-center justify-center text-[#7A263A]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#C49A6C]/15 text-[#875F34] border border-[#C49A6C]/30">
                    Recommended
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#202020] mb-1">Multi-Agent Pipeline</h3>
                <p className="text-[#555555] text-xs leading-relaxed">
                  Planner, Inspector, Formatter, and Defense agents collaborate to produce comprehensive blueprints, starter code, and viva Q&As.
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#EBE6DF] text-[#202020] font-semibold text-xs hover:bg-[#F6F2EB] shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-semibold text-xs shadow-xs transition-all"
              >
                <span>Review & Launch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Summary Review & Generation Progress */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#7A263A]/10 text-[#7A263A] text-xs font-bold flex items-center justify-center border border-[#7A263A]/20">
                4
              </span>
              Review Parameters & Trigger Generation
            </h2>

            <div className="p-5 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-2.5 text-xs text-[#333333]">
              <div className="flex justify-between border-b border-[#EAE6DF] pb-2">
                <span className="text-[#777777]">Domain:</span>
                <span className="font-bold text-[#202020]">{domain}</span>
              </div>
              <div className="flex justify-between border-b border-[#EAE6DF] pb-2">
                <span className="text-[#777777]">Agent Mode:</span>
                <span className="font-bold text-[#7A263A] capitalize">{agentMode}-Agent Pipeline</span>
              </div>
              <div className="flex justify-between border-b border-[#EAE6DF] pb-2">
                <span className="text-[#777777]">Tech Stack:</span>
                <span className="font-bold text-[#202020]">{preferredTech.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">AI Model Engine:</span>
                <span className="font-bold text-[#875F34]">Google Gemini API</span>
              </div>
            </div>

            {/* Generation Progress Bar */}
            {isGenerating && (
              <div className="p-6 rounded-2xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-3 text-center">
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-[#7A263A] border-t-transparent animate-spin" />
                  <span className="text-xs font-semibold text-[#7A263A]">
                    Multi-Agent Pipeline Processing... ({pipelineProgress}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-[#EBE6DF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7A263A] transition-all duration-300"
                    style={{ width: `${pipelineProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#777777]">
                  Orchestrating Gemini prompt agents, structuring architecture maps, and assembling Viva Q&As...
                </p>
              </div>
            )}

            {!isGenerating && (
              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#EBE6DF] text-[#202020] font-semibold text-xs hover:bg-[#F6F2EB] shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-xs shadow-xs transition-all"
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
