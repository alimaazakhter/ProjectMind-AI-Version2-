'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const VALID_PASSCODES = ['1234', 'admin123', 'admin2026'];

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
    }, 350);
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setPasscode('');
  };

  // 1. Off-white & Burgundy Admin Passcode Gate
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
              <span className="text-[#555555] font-medium">Demo Access PIN:</span> <code className="text-[#7A263A] font-bold font-mono">1234</code> or <code className="text-[#7A263A] font-bold font-mono">admin123</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Full Admin Dashboard (Off-white & Burgundy)
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#202020] p-6 lg:p-10 max-w-7xl mx-auto space-y-8 bg-subtle-grid font-sans">
      {/* Admin Header */}
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
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#C49A6C]/15 text-[#875F34] border border-[#C49A6C]/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Verified</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight flex items-center gap-3">
            System Monitoring & Analytics
          </h1>
          <p className="text-[#555555] text-xs sm:text-sm mt-1">
            Real-time status of Node/Express backend, FastAPI AI worker, Gemini API latency, and intent classifier logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLock}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F2EB] border border-[#EBE6DF] text-xs font-semibold text-[#202020] hover:text-[#7A263A] shadow-xs transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-[#666666]" />
            <span>Lock Portal</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Registered Users', value: '1,248', icon: Users, color: 'text-[#7A263A] bg-[#7A263A]/10 border-[#7A263A]/20' },
          { title: 'Total Projects Generated', value: '4,890', icon: FolderKanban, color: 'text-[#875F34] bg-[#C49A6C]/15 border-[#C49A6C]/30' },
          { title: 'FastAPI Microservice Latency', value: '142 ms', icon: Activity, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { title: 'Intent Classifier Accuracy', value: '98.4%', icon: Cpu, color: 'text-[#7A263A] bg-[#7A263A]/10 border-[#7A263A]/20' },
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

      {/* Microservices Live Health Grid */}
      <div className="p-6 rounded-2xl bg-white border border-[#EBE6DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#202020] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#7A263A]" />
            Microservice Infrastructure Topology
          </h2>
          <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            All Systems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Node.js + Express Backend', status: 'Healthy', port: '5000', uptime: '99.98%' },
            { name: 'Python + FastAPI AI Service', status: 'Healthy', port: '8000', uptime: '99.95%' },
            { name: 'Google Gemini API Cloud', status: 'Healthy', port: 'Cloud API', uptime: '100%' },
          ].map((service, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#F6F2EB] border border-[#EBE6DF] space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#202020]">{service.name}</h3>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {service.status}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#777777] pt-2 border-t border-[#EAE6DF]">
                <span>Port: {service.port}</span>
                <span>Uptime: {service.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
