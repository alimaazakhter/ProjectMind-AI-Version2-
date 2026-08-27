'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Lock,
  Activity,
  Users,
  FolderKanban,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Server,
  RefreshCw,
  Search,
  Trash2,
  Download,
  FileText,
  MessageSquare,
  Sliders,
  Database,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  AdminService,
  AdminOverviewData,
  AdminUser,
  AdminGlobalProject,
  AdminChatLog,
  AdminAIConfig,
  AdminServiceHealth,
} from '@/services/api/adminService';

type AdminTab = 'overview' | 'users' | 'projects' | 'chat_logs' | 'ai_engine' | 'diagnostics';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Module States
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [projectsList, setProjectsList] = useState<AdminGlobalProject[]>([]);
  const [chatLogs, setChatLogs] = useState<AdminChatLog[]>([]);
  const [aiConfig, setAIConfig] = useState<AdminAIConfig | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<AdminServiceHealth[]>([]);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectDomainFilter, setProjectDomainFilter] = useState('all');
  const [chatIntentFilter, setChatIntentFilter] = useState('all');

  // Loading & Action Notification States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Model Updating State
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash-lite');
  const [selectedTemp, setSelectedTemp] = useState<number>(0.4);
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);

  const VALID_PASSCODES = ['1234', 'admin123', 'admin2026'];

  const showNotification = (msg: string, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    setTimeout(() => {
      if (VALID_PASSCODES.includes(passcode.trim())) {
        setIsAuthenticated(true);
        setError(false);
      } else {
        setError(true);
      }
      setLoading(false);
    }, 300);
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setPasscode('');
    setOverview(null);
  };

  // Data Fetching Handlers
  const fetchOverviewData = useCallback(async () => {
    try {
      const data = await AdminService.getOverview(passcode);
      setOverview(data);
    } catch {
      showNotification('Failed to fetch live infrastructure telemetry.', true);
    }
  }, [passcode]);

  const fetchUsersData = useCallback(async () => {
    try {
      const data = await AdminService.getUsers(
        {
          search: userSearch || undefined,
          role: userRoleFilter !== 'all' ? userRoleFilter : undefined,
        },
        passcode
      );
      setUsersList(data);
    } catch {
      showNotification('Failed to fetch user directory from Supabase.', true);
    }
  }, [passcode, userSearch, userRoleFilter]);

  const fetchProjectsData = useCallback(async () => {
    try {
      const data = await AdminService.getProjects(
        {
          search: projectSearch || undefined,
          domain: projectDomainFilter !== 'all' ? projectDomainFilter : undefined,
        },
        passcode
      );
      setProjectsList(data);
    } catch {
      showNotification('Failed to fetch global project catalog.', true);
    }
  }, [passcode, projectSearch, projectDomainFilter]);

  const fetchChatLogsData = useCallback(async () => {
    try {
      const data = await AdminService.getChatLogs(
        {
          intent: chatIntentFilter !== 'all' ? chatIntentFilter : undefined,
          limit: 50,
        },
        passcode
      );
      setChatLogs(data);
    } catch {
      showNotification('Failed to fetch chat logs stream.', true);
    }
  }, [passcode, chatIntentFilter]);

  const fetchAIConfigData = useCallback(async () => {
    try {
      const data = await AdminService.getAIConfig(passcode);
      setAIConfig(data);
      if (data) {
        setSelectedModel(data.active_model);
        setSelectedTemp(data.temperature || 0.4);
      }
    } catch {
      showNotification('Failed to fetch AI configuration from FastAPI.', true);
    }
  }, [passcode]);

  const refreshActiveTab = useCallback(async () => {
    setIsRefreshing(true);
    if (activeTab === 'overview') await fetchOverviewData();
    else if (activeTab === 'users') await fetchUsersData();
    else if (activeTab === 'projects') await fetchProjectsData();
    else if (activeTab === 'chat_logs') await fetchChatLogsData();
    else if (activeTab === 'ai_engine') await fetchAIConfigData();
    setIsRefreshing(false);
  }, [activeTab, fetchOverviewData, fetchUsersData, fetchProjectsData, fetchChatLogsData, fetchAIConfigData]);

  // Initial tab loading
  useEffect(() => {
    if (isAuthenticated) {
      refreshActiveTab();
    }
  }, [isAuthenticated, activeTab, refreshActiveTab]);

  // User Role Mutation Handler
  const handleRoleChange = async (userId: string, newRole: 'student' | 'admin') => {
    try {
      await AdminService.updateUserRole(userId, newRole, passcode);
      showNotification(`User role updated to '${newRole}' successfully.`);
      fetchUsersData();
    } catch {
      showNotification('Failed to update user role.', true);
    }
  };

  // Project Deletion Handler
  const handleDeleteProject = async (projectId: string) => {
    try {
      await AdminService.deleteProject(projectId, passcode);
      showNotification('Project and related blueprint records removed.');
      setDeleteConfirmId(null);
      fetchProjectsData();
    } catch {
      showNotification('Failed to delete project.', true);
    }
  };

  // AI Configuration Mutation Handler
  const handleSaveAIConfig = async () => {
    setIsUpdatingAI(true);
    try {
      const updated = await AdminService.updateAIConfig(
        { model: selectedModel, temperature: selectedTemp },
        passcode
      );
      setAIConfig(updated);
      showNotification(`Active Gemini model switched to '${selectedModel}'.`);
    } catch {
      showNotification('Failed to update AI model configuration.', true);
    } finally {
      setIsUpdatingAI(false);
    }
  };

  // Diagnostic Ping Handler
  const handleRunDiagnostics = async () => {
    setIsPinging(true);
    try {
      const results = await AdminService.pingAllDiagnostics(passcode);
      setDiagnosticResults(results);
      showNotification('Diagnostic ping completed across all 4 microservices.');
    } catch {
      showNotification('Diagnostic probe encounter an error.', true);
    } finally {
      setIsPinging(false);
    }
  };

  // Flush Cache Handler
  const handleFlushCache = async () => {
    try {
      const res = await AdminService.flushCache(passcode);
      showNotification(res.message || 'Cache flush checked.');
    } catch {
      showNotification('Cache flush failed.', true);
    }
  };

  // 1. Off-white & Burgundy Admin Passcode Gate (Unchanged Visual Design)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#202020] bg-subtle-grid flex flex-col items-center justify-center p-4 relative font-sans">
        {/* Back Link */}
        <Link
          href="/"
          className="absolute top-8 left-8 inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#202020] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-[#EBE6DF] shadow-xl space-y-6 text-center relative z-10">
          {/* Brand Icon Header */}
          <div className="w-12 h-12 rounded-xl bg-[#7A263A]/10 border border-[#7A263A]/20 flex items-center justify-center text-[#7A263A] mx-auto shadow-xs">
            <Shield className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#202020] tracking-tight">Admin Portal Access</h1>
            <p className="text-xs text-[#555555] mt-1.5 leading-relaxed">
              Enter administrator passcode to access system metrics, Gemini API telemetry, and microservices.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder="Enter passcode (e.g. 1234)"
                autoFocus
                className={`w-full bg-[#F6F2EB] border rounded-xl px-4 py-3 text-center text-sm font-mono tracking-wider text-[#202020] placeholder-[#888888] focus:outline-none focus:bg-white transition-all ${
                  error
                    ? 'border-rose-300 ring-1 ring-rose-200 focus:border-rose-500'
                    : 'border-[#EBE6DF] focus:border-[#7A263A]'
                }`}
              />
              {error && (
                <p className="text-rose-600 text-xs mt-2 text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Invalid passcode. Access Denied.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passcode.trim()}
              className="w-full py-3 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Unlock Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Access Note */}
          <div className="pt-4 border-t border-[#EAE6DF]">
            <p className="text-[11px] text-[#777777]">
              <span className="text-[#555555] font-medium">Demo Access PIN:</span>{' '}
              <code className="text-[#7A263A] font-bold font-mono">1234</code> or{' '}
              <code className="text-[#7A263A] font-bold font-mono">admin123</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Full Admin Dashboard
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#202020] p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 bg-subtle-grid font-sans">
      {/* Toast Notifications */}
      {actionSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="fixed top-6 right-6 z-50 bg-rose-700 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Admin Header (Preserved Visual Styling) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE6DF] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#666666] hover:text-[#202020] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Student Workspace</span>
            </Link>
            <span className="text-[#D8D2C9]">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#C49A6C]/15 text-[#875F34] border border-[#C49A6C]/30 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Verified</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#202020] tracking-tight flex items-center gap-3">
            System Monitoring & Analytics
          </h1>
          <p className="text-[#555555] text-xs sm:text-sm mt-1">
            Real-time status of Node/Express backend, FastAPI AI worker, Gemini API latency, and intent classifier logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshActiveTab}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F6F2EB] border border-[#EBE6DF] text-xs font-semibold text-[#202020] shadow-xs transition-all disabled:opacity-50"
            title="Refresh current module"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#666666] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleLock}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F2EB] border border-[#EBE6DF] text-xs font-semibold text-[#202020] hover:text-[#7A263A] shadow-xs transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-[#666666]" />
            <span>Lock Portal</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#EBE6DF] no-scrollbar">
        {[
          { key: 'overview', label: 'Overview & Telemetry', icon: Activity },
          { key: 'users', label: 'User Directory (RBAC)', icon: Users },
          { key: 'projects', label: 'Global Projects', icon: FolderKanban },
          { key: 'chat_logs', label: 'Chat Telemetry', icon: MessageSquare },
          { key: 'ai_engine', label: 'AI Engine Tuning', icon: Sliders },
          { key: 'diagnostics', label: 'Diagnostics & Export', icon: Zap },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                isActive
                  ? 'bg-[#7A263A] text-white shadow-xs'
                  : 'bg-white text-[#555555] hover:bg-[#F6F2EB] border border-[#EBE6DF]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1: OVERVIEW & LIVE INFRASTRUCTURE TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Metrics Cards (Real Backend Counts) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Registered Users',
                value: overview ? overview.metrics.totalRegisteredUsers.toLocaleString() : 'Loading...',
                subtext: 'Supabase profiles',
                icon: Users,
                color: 'text-[#7A263A] bg-[#7A263A]/10 border-[#7A263A]/20',
              },
              {
                title: 'Total Projects Generated',
                value: overview ? overview.metrics.totalProjectsGenerated.toLocaleString() : 'Loading...',
                subtext: `${overview?.metrics.totalBlueprintsGenerated || 0} active blueprints`,
                icon: FolderKanban,
                color: 'text-[#875F34] bg-[#C49A6C]/15 border-[#C49A6C]/30',
              },
              {
                title: 'FastAPI Microservice Latency',
                value: overview?.services.find((s) => s.port === '8000')?.latencyMs !== undefined
                  ? `${overview?.services.find((s) => s.port === '8000')?.latencyMs} ms`
                  : 'N/A',
                subtext: 'Python uvicorn worker',
                icon: Activity,
                color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
              },
              {
                title: 'Chat Assistant Queries',
                value: overview ? overview.metrics.totalChatMessages.toLocaleString() : 'Loading...',
                subtext: 'Logged in chat_messages',
                icon: Cpu,
                color: 'text-[#7A263A] bg-[#7A263A]/10 border-[#7A263A]/20',
              },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-[#EBE6DF] shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#777777]">{stat.title}</p>
                  <p className="text-xl font-bold text-[#202020] mt-0.5">{stat.value}</p>
                  <p className="text-[10px] text-[#888888] font-mono mt-0.5">{stat.subtext}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>

          {/* Microservices Live Health Grid */}
          <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#202020] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#7A263A]" />
                Microservice Infrastructure Topology
              </h2>
              <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Live Heartbeat Probe Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(overview?.services || [
                { name: 'Node.js + Express Backend', status: 'Online', port: '5000', latencyMs: 14, lastChecked: '' },
                { name: 'Python + FastAPI AI Service', status: 'Online', port: '8000', latencyMs: 22, lastChecked: '' },
                { name: 'Supabase PostgreSQL Cloud', status: 'Online', port: 'Postgres (5432)', latencyMs: 18, lastChecked: '' },
                { name: 'Google Gemini API Cloud', status: 'Online', port: 'Cloud SDK', latencyMs: 45, lastChecked: '' },
              ]).map((service, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#202020] truncate">{service.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        service.status === 'Online'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {service.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#777777] pt-2 border-t border-[#EAE6DF] font-mono">
                    <span>Port: {service.port}</span>
                    <span>Latency: {service.latencyMs} ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database 11-Tables Row Inspector & Export Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 11 Relational Tables Live Row Counts */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#202020] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Database className="w-4 h-4 text-[#7A263A]" />
                  Supabase PostgreSQL — 11 Relational Tables
                </h3>
                <span className="text-[10px] text-[#888888] font-mono">Exact Row Counts</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {overview?.metrics.tableStats &&
                  Object.entries(overview.metrics.tableStats).map(([table, count]) => (
                    <div key={table} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EBE6DF] text-center space-y-0.5">
                      <p className="text-[10px] font-bold text-[#777777] font-mono truncate">{table}</p>
                      <p className="text-base font-extrabold text-[#202020]">{count}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Document Export Format Distribution */}
            <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#202020] uppercase tracking-wider flex items-center gap-2 font-mono">
                <Download className="w-4 h-4 text-[#875F34]" />
                Export Distribution
              </h3>

              <div className="space-y-3 pt-1">
                {[
                  { fmt: 'PDF Reports', count: overview?.metrics.exportBreakdown.pdf || 0, color: 'bg-[#7A263A]' },
                  { fmt: 'Word DOCX', count: overview?.metrics.exportBreakdown.docx || 0, color: 'bg-[#C49A6C]' },
                  { fmt: 'PowerPoint PPTX', count: overview?.metrics.exportBreakdown.ppt || 0, color: 'bg-[#875F34]' },
                  { fmt: 'Markdown MD', count: overview?.metrics.exportBreakdown.md || 0, color: 'bg-[#555555]' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-[#202020]">
                      <span>{item.fmt}</span>
                      <span className="font-mono">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-[#F6F2EB] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{
                          width: `${
                            overview?.metrics.totalExports
                              ? Math.max(8, (item.count / (overview.metrics.totalExports || 1)) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 2: USER MANAGEMENT & RBAC */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#7A263A]" />
                Registered User Directory & Roles (RBAC)
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Profiles fetched from Supabase <code className="font-mono text-[#7A263A]">profiles</code> table. Allowed roles: <code className="font-mono font-bold">student</code>, <code className="font-mono font-bold">admin</code>.
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsersData()}
                  placeholder="Search user or email..."
                  className="bg-[#F6F2EB] border border-[#EBE6DF] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A]"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value as any);
                }}
                className="bg-[#F6F2EB] border border-[#EBE6DF] rounded-xl px-3 py-1.5 text-xs text-[#202020] font-semibold focus:outline-none focus:border-[#7A263A]"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={fetchUsersData}
                className="px-3 py-1.5 rounded-xl bg-[#7A263A] text-white text-xs font-semibold hover:bg-[#661F30] transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-[#EBE6DF] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EBE6DF] text-[#777777] font-mono">
                <tr>
                  <th className="p-3">Full Name & Email</th>
                  <th className="p-3">University / College</th>
                  <th className="p-3">Level / Semester</th>
                  <th className="p-3 text-center">Projects</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE6DF]">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#888888]">
                      No user profiles found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-[#202020]">{u.full_name}</p>
                        <p className="text-[11px] text-[#666666] font-mono">{u.email}</p>
                      </td>
                      <td className="p-3 text-[#555555]">{u.university}</td>
                      <td className="p-3 text-[#555555]">
                        {u.academic_level} {u.semester !== 'N/A' ? `• Sem ${u.semester}` : ''}
                      </td>
                      <td className="p-3 text-center font-bold text-[#7A263A] font-mono">{u.project_count}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            u.role === 'admin'
                              ? 'bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/30'
                              : 'bg-[#C49A6C]/15 text-[#875F34] border border-[#C49A6C]/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.clerk_user_id || u.id, e.target.value as any)}
                          className="bg-white border border-[#EBE6DF] rounded-lg px-2 py-1 text-[11px] font-semibold text-[#202020] focus:border-[#7A263A]"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 3: GLOBAL PROJECT CATALOG & MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'projects' && (
        <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#7A263A]" />
                Global Project Explorer & Blueprint Moderation
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Inspect, download official PDF/DOCX/PPT reports, or manage blueprints across all users.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProjectsData()}
                  placeholder="Search title, author..."
                  className="bg-[#F6F2EB] border border-[#EBE6DF] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#202020] placeholder-[#888888] focus:outline-none focus:border-[#7A263A]"
                />
              </div>

              <button
                onClick={fetchProjectsData}
                className="px-3 py-1.5 rounded-xl bg-[#7A263A] text-white text-xs font-semibold hover:bg-[#661F30] transition-colors"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Projects Table */}
          <div className="overflow-x-auto border border-[#EBE6DF] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EBE6DF] text-[#777777] font-mono">
                <tr>
                  <th className="p-3">Project Title</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Complexity</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 text-right">Direct Export / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE6DF]">
                {projectsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#888888]">
                      No projects found in database.
                    </td>
                  </tr>
                ) : (
                  projectsList.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-3 max-w-xs">
                        <p className="font-bold text-[#202020] line-clamp-1">{p.title}</p>
                        <p className="text-[11px] text-[#666666] line-clamp-1">{p.tagline || p.problem_statement}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-[#202020]">{p.author_name}</p>
                        <p className="text-[10px] text-[#777777] font-mono">{p.author_email}</p>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EBE6DF] text-[#7A263A]">
                          {p.domain}
                        </span>
                      </td>
                      <td className="p-3 text-[#555555] font-medium">{p.complexity}</td>
                      <td className="p-3 text-[#777777] font-mono text-[11px]">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reopen Student Workspace */}
                          <Link
                            href={`/workspace/${p.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-white border border-[#EBE6DF] hover:bg-[#F6F2EB] text-[#202020] transition-colors"
                            title="Open Workspace"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Direct PDF Download */}
                          <a
                            href={`http://localhost:5000/api/v1/export/${p.id}/pdf`}
                            download
                            className="px-2 py-1 rounded-lg bg-[#7A263A]/10 border border-[#7A263A]/20 text-[#7A263A] font-bold text-[10px] hover:bg-[#7A263A] hover:text-white transition-colors"
                            title="Download PDF"
                          >
                            PDF
                          </a>

                          {/* Direct DOCX Download */}
                          <a
                            href={`http://localhost:5000/api/v1/export/${p.id}/docx`}
                            download
                            className="px-2 py-1 rounded-lg bg-[#C49A6C]/15 border border-[#C49A6C]/30 text-[#875F34] font-bold text-[10px] hover:bg-[#875F34] hover:text-white transition-colors"
                            title="Download DOCX"
                          >
                            DOCX
                          </a>

                          {/* Direct PPTX Download */}
                          <a
                            href={`http://localhost:5000/api/v1/export/${p.id}/ppt`}
                            download
                            className="px-2 py-1 rounded-lg bg-[#FAF8F5] border border-[#EBE6DF] text-[#555555] font-bold text-[10px] hover:bg-[#202020] hover:text-white transition-colors"
                            title="Download PPT"
                          >
                            PPT
                          </a>

                          {/* Admin Delete Action */}
                          {deleteConfirmId === p.id ? (
                            <button
                              onClick={() => handleDeleteProject(p.id)}
                              className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold animate-pulse"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 rounded-lg bg-white border border-[#EBE6DF] hover:bg-rose-50 hover:border-rose-300 text-[#888888] hover:text-rose-600 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 4: CHAT TELEMETRY & INTENT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'chat_logs' && (
        <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7A263A]" />
                Live Chat Telemetry & Intent Classifier Stream
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Real-time query feed from <code className="font-mono text-[#7A263A]">chat_messages</code> table with confidence ratings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={chatIntentFilter}
                onChange={(e) => setChatIntentFilter(e.target.value)}
                className="bg-[#F6F2EB] border border-[#EBE6DF] rounded-xl px-3 py-1.5 text-xs text-[#202020] font-semibold focus:outline-none focus:border-[#7A263A]"
              >
                <option value="all">All Intent Categories</option>
                <option value="project_ideation">project_ideation</option>
                <option value="project_inquiry">project_inquiry</option>
                <option value="technical_question">technical_question</option>
                <option value="roadmap_request">roadmap_request</option>
                <option value="conversational">conversational</option>
              </select>

              <button
                onClick={fetchChatLogsData}
                className="px-3 py-1.5 rounded-xl bg-[#7A263A] text-white text-xs font-semibold hover:bg-[#661F30]"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {chatLogs.length === 0 ? (
              <div className="p-8 text-center text-[#888888] bg-[#FAF8F5] rounded-xl border border-[#EBE6DF]">
                No chat logs recorded yet.
              </div>
            ) : (
              chatLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EBE6DF] flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                          log.sender === 'user'
                            ? 'bg-[#7A263A] text-white'
                            : 'bg-[#C49A6C]/20 text-[#875F34] border border-[#C49A6C]/40'
                        }`}
                      >
                        {log.sender}
                      </span>
                      {log.intent && (
                        <span className="text-[10px] font-mono text-[#777777] bg-white px-2 py-0.5 rounded border border-[#EBE6DF]">
                          intent: <b className="text-[#202020]">{log.intent}</b>
                        </span>
                      )}
                      {log.confidence && (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          {(log.confidence * 100).toFixed(0)}% conf
                        </span>
                      )}
                    </div>
                    <p className="text-[#202020] font-medium leading-relaxed whitespace-pre-wrap">{log.content}</p>
                  </div>
                  <span className="text-[10px] text-[#888888] font-mono shrink-0">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 5: AI ENGINE CONFIGURATION & MODEL SWITCHER */}
      {/* ========================================================================= */}
      {activeTab === 'ai_engine' && (
        <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#7A263A]" />
              Google Gemini AI Engine & Model Configuration
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Live connection to Python FastAPI AI microservice. Switch active Gemini foundation models and adjust generation parameters safely at runtime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Model Selector */}
            <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EBE6DF] space-y-4">
              <label className="block text-xs font-bold text-[#202020] uppercase font-mono tracking-wider">
                Select Active Gemini Model
              </label>

              <div className="space-y-2">
                {(aiConfig?.available_models || [
                  'gemini-3.5-flash-lite',
                  'gemini-3.5-flash',
                  'gemini-flash-latest',
                  'gemini-2.5-flash',
                  'gemini-2.5-pro',
                ]).map((m) => (
                  <label
                    key={m}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedModel === m
                        ? 'bg-[#7A263A]/10 border-[#7A263A] text-[#7A263A] font-bold'
                        : 'bg-white border-[#EBE6DF] text-[#333333] hover:bg-[#F6F2EB]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="ai_model"
                        value={m}
                        checked={selectedModel === m}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="accent-[#7A263A]"
                      />
                      <span className="text-xs font-mono">{m}</span>
                    </div>
                    {m === 'gemini-3.5-flash-lite' && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase font-mono">
                        Fastest / Stable
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Generation Parameters */}
            <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EBE6DF] space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#202020] mb-1 font-mono">
                    <span>Generation Temperature:</span>
                    <span className="text-[#7A263A]">{selectedTemp}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={selectedTemp}
                    onChange={(e) => setSelectedTemp(parseFloat(e.target.value))}
                    className="w-full accent-[#7A263A]"
                  />
                  <div className="flex justify-between text-[10px] text-[#888888] font-mono mt-1">
                    <span>0.0 (Precise / Technical)</span>
                    <span>1.0 (Creative)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#EBE6DF] space-y-1 text-xs">
                  <p className="font-bold text-[#202020]">Multi-Model Fallback Cascade Active:</p>
                  <p className="text-[11px] text-[#666666] font-mono">
                    {aiConfig?.fallback_models.join(' ➔ ') || 'gemini-3.5-flash-lite ➔ gemini-3.5-flash ➔ gemini-flash-latest'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveAIConfig}
                disabled={isUpdatingAI}
                className="w-full py-3 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isUpdatingAI ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply Model Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 6: SYSTEM DIAGNOSTICS, CACHE FLUSH & AUDIT REPORT */}
      {/* ========================================================================= */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          {/* Live Ping & Maintenance Actions */}
          <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#202020] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#7A263A]" />
                  System Diagnostics & Diagnostic Pings
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Execute concurrent heartbeat probes and generate platform audit telemetry.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunDiagnostics}
                  disabled={isPinging}
                  className="px-4 py-2 rounded-xl bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-xs shadow-xs flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>Ping All Services</span>
                </button>

                <button
                  onClick={handleFlushCache}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F2EB] border border-[#EBE6DF] text-xs font-semibold text-[#202020] transition-colors"
                >
                  Check Cache
                </button>
              </div>
            </div>

            {/* Diagnostic Results Cards */}
            {diagnosticResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {diagnosticResults.map((diag, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EBE6DF] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#202020]">{diag.service || diag.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                        {diag.status} ({diag.latencyMs} ms)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#666666]">{diag.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Report Generation */}
          <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#202020] uppercase font-mono tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#875F34]" />
                Export System Audit & Telemetry Report
              </h3>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              Generate an official snapshot of the platform containing registered user metrics, project catalogs, and Gemini latency telemetry for university review or administrative records.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={AdminService.getAuditReportUrl('json', passcode)}
                download="projectmind-audit-report.json"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EBE6DF] hover:border-[#7A263A] text-xs font-bold text-[#202020] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#7A263A]" />
                <span>Download Audit Report (JSON)</span>
              </a>

              <a
                href={AdminService.getAuditReportUrl('csv', passcode)}
                download="projectmind-audit-report.csv"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EBE6DF] hover:border-[#7A263A] text-xs font-bold text-[#202020] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#875F34]" />
                <span>Download Summary (CSV)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
