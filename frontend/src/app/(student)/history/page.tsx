'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, Search, ArrowRight, Clock } from 'lucide-react';
import { ProjectBlueprint } from '@/types/project';
import { ProjectService } from '@/services/api/projectService';

export default function HistoryPage() {
  const [projects, setProjects] = useState<ProjectBlueprint[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      const data = await ProjectService.getAllProjects();
      setProjects(data);
    }
    loadData();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE6DF] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-[#7A263A]" />
            Project History & Catalog
          </h1>
          <p className="text-[#555555] text-xs sm:text-sm mt-1">Reopen previously generated project blueprints and roadmaps.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or domain..."
            className="w-full bg-white border border-[#EBE6DF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A] shadow-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((proj) => (
          <div key={proj.id} className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs hover:border-[#7A263A]/40 hover:shadow-sm transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20">
                {proj.domain}
              </span>
              <span className="text-xs font-semibold text-[#777777]">{proj.complexity}</span>
            </div>

            <h3 className="text-base font-bold text-[#202020]">{proj.title}</h3>
            <p className="text-xs text-[#555555] leading-relaxed line-clamp-2">{proj.problemStatement}</p>

            <div className="pt-4 border-t border-[#EAE6DF] flex items-center justify-between">
              <span className="text-xs text-[#777777] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {proj.createdAt}
              </span>
              <Link
                href={`/workspace/${proj.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A263A] hover:text-[#661F30]"
              >
                <span>Reopen Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
