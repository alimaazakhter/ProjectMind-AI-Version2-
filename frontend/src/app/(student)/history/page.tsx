'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, Search, ArrowRight, Clock, Sparkles, FolderGit2 } from 'lucide-react';
import { ProjectBlueprint } from '@/types/project';
import { ProjectService } from '@/services/api/projectService';

export default function HistoryPage() {
  const [projects, setProjects] = useState<ProjectBlueprint[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await ProjectService.getAllProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load project history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = projects.filter((p) => {
    const title = p.title || '';
    const domain = p.domain || '';
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      domain.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE6DF] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#202020] tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-[#7A263A]" />
            Project History & Catalog
          </h1>
          <p className="text-[#555555] text-xs sm:text-sm mt-1">
            Reopen previously generated blueprints, roadmaps, and code artifacts stored in your workspace.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or domain..."
            className="w-full bg-white border border-[#EBE6DF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A] shadow-xs font-medium"
          />
        </div>
      </div>

      {isLoading && (
        <div className="p-16 text-center text-[#888888] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#7A263A] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-[#666666]">Loading Project History...</span>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="p-12 text-center bg-white border border-[#EBE6DF] rounded-2xl space-y-3 shadow-xs">
          <FolderGit2 className="w-10 h-10 text-[#888888] mx-auto" />
          <h3 className="text-sm font-bold text-[#202020]">No projects found</h3>
          <p className="text-xs text-[#666666]">
            {search ? 'Try refining your search keyword.' : 'Generate your first project blueprint to see it in your history catalog.'}
          </p>
          <Link
            href="/generator"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7A263A] text-white text-xs font-bold hover:bg-[#661F30] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Blueprint</span>
          </Link>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((proj) => {
            const desc = proj.problemStatement || proj.problem_statement || proj.tagline || '';
            const rawDate = proj.createdAt || proj.created_at || Date.now();
            const formattedDate = new Date(rawDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={proj.id}
                className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs hover:border-[#7A263A]/40 hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20">
                      {proj.domain}
                    </span>
                    <span className="text-xs font-semibold text-[#777777]">{proj.complexity}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#202020] leading-snug">{proj.title}</h3>
                  <p className="text-xs text-[#555555] leading-relaxed line-clamp-3">{desc}</p>
                </div>

                <div className="pt-4 border-t border-[#EAE6DF] flex items-center justify-between">
                  <span className="text-xs text-[#777777] flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#7A263A]" />
                    {formattedDate}
                  </span>
                  <Link
                    href={`/workspace/${proj.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A263A] hover:text-[#661F30] group"
                  >
                    <span>Reopen Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
