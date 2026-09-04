'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser, useAuth } from '@clerk/nextjs';
import {
  Sparkles,
  Bot,
  FolderKanban,
  ArrowRight,
  Cpu,
  FileText,
  Clock,
  Zap,
  PlusCircle,
} from 'lucide-react';
import { ProjectBlueprint } from '@/types/project';
import { ProjectService } from '@/services/api/projectService';

export default function StudentDashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<ProjectBlueprint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!isLoaded) return;
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const data = await ProjectService.getAllProjects(token, user.id);
      setProjects(data);
    } catch (err) {
      console.warn('Dashboard project load error:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user, getToken]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-white border border-[#EBE6DF] p-7 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7A263A]/10 text-[#7A263A] text-xs font-semibold border border-[#7A263A]/20 mb-3">
            <Zap className="w-3 h-3 text-[#7A263A]" />
            <span>Workspace Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight">
            Welcome back, {user?.firstName || user?.fullName || 'Builder'}! 👋
          </h1>
          <p className="text-[#555555] text-xs sm:text-sm mt-2 leading-relaxed">
            Ready to turn your project idea into a complete build-ready implementation? Generate blueprints, system architectures, roadmaps, and starter code with multi-agent AI.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-semibold text-xs shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate New Project</span>
            </Link>

            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F6F2EB] text-[#202020] font-semibold text-xs border border-[#EBE6DF] shadow-xs transition-all"
            >
              <Bot className="w-3.5 h-3.5 text-[#7A263A]" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Projects', value: loading ? '...' : projects.length, icon: FolderKanban, color: 'text-[#7A263A] bg-[#7A263A]/10 border-[#7A263A]/20' },
          { title: 'AI Agent Mode', value: 'Multi-Agent', icon: Sparkles, color: 'text-[#875F34] bg-[#C49A6C]/15 border-[#C49A6C]/30' },
          { title: 'Export Formats', value: 'PDF, DOCX, PPT, MD', icon: FileText, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { title: 'AI Engine', value: 'Gemini API', icon: Cpu, color: 'text-[#7A263A] bg-[#7A263A]/10 border-[#7A263A]/20' },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-[#EBE6DF] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-[#777777]">{stat.title}</p>
              <p className="text-xl font-bold text-[#202020] mt-0.5">{stat.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl border ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Structured Generator Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs hover:border-[#7A263A]/40 hover:shadow-sm transition-all group">
          <div className="w-10 h-10 rounded-xl bg-[#7A263A]/10 border border-[#7A263A]/20 flex items-center justify-center text-[#7A263A] mb-4 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#202020] mb-1.5">Structured AI Project Generator</h3>
          <p className="text-[#555555] text-xs mb-5 leading-relaxed">
            Specify domain, complexity, preferred tech stack, and choose Single or Multi-Agent mode to generate complete blueprints.
          </p>
          <Link
            href="/generator"
            className="inline-flex items-center gap-1.5 text-[#7A263A] font-semibold text-xs hover:text-[#661F30] group-hover:translate-x-0.5 transition-all"
          >
            <span>Launch Generator Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Conversational Assistant Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs hover:border-[#C49A6C]/50 hover:shadow-sm transition-all group">
          <div className="w-10 h-10 rounded-xl bg-[#C49A6C]/15 border border-[#C49A6C]/30 flex items-center justify-center text-[#875F34] mb-4 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#202020] mb-1.5">Conversational AI Assistant</h3>
          <p className="text-[#555555] text-xs mb-5 leading-relaxed">
            Chat with an AI assistant equipped with intent classification to discuss ideas, refine architectures, or prepare for defenses.
          </p>
          <Link
            href="/assistant"
            className="inline-flex items-center gap-1.5 text-[#875F34] font-semibold text-xs hover:text-[#6E4924] group-hover:translate-x-0.5 transition-all"
          >
            <span>Open Chat Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Projects Catalog */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#202020]">Recent Project Workspaces</h2>
          {projects.length > 0 && (
            <Link href="/history" className="text-xs font-semibold text-[#7A263A] hover:text-[#661F30]">
              View All History →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#EBE6DF]">
            <div className="w-6 h-6 border-2 border-[#7A263A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs font-semibold text-[#777777]">Loading your project workspaces...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-[#EBE6DF] text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#7A263A]/10 border border-[#7A263A]/20 flex items-center justify-center text-[#7A263A] mx-auto">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202020]">No Project Workspaces Yet</h3>
              <p className="text-xs text-[#666666] max-w-md mx-auto mt-1">
                You haven&apos;t generated any project blueprints yet. Launch the AI Generator to create your first build-ready academic project!
              </p>
            </div>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-semibold text-xs transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 6).map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs hover:border-[#7A263A]/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20">
                      {proj.domain}
                    </span>
                    <span className="text-[11px] font-medium text-[#777777]">{proj.complexity}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#202020] mb-1.5 line-clamp-1">{proj.title}</h3>
                  <p className="text-[#555555] text-xs line-clamp-2 leading-relaxed mb-3.5">
                    {proj.problemStatement || proj.problem_statement}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE6DF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#777777] text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{proj.created_at ? new Date(proj.created_at).toLocaleDateString() : proj.createdAt || 'Recent'}</span>
                  </div>
                  <Link
                    href={`/workspace/${proj.id}`}
                    className="font-semibold text-[#7A263A] hover:text-[#661F30] inline-flex items-center gap-1 text-xs"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
