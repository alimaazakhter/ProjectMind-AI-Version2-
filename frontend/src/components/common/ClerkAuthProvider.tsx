'use client';

import React, { useState, useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Key, ArrowRight, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const [keyValid, setKeyValid] = useState<boolean>(false);
  const [bypassPreview, setBypassPreview] = useState<boolean>(false);

  useEffect(() => {
    // Check if publishable key is set and not placeholder
    const isValid =
      !!PUBLISHABLE_KEY &&
      PUBLISHABLE_KEY.startsWith('pk_') &&
      !PUBLISHABLE_KEY.includes('placeholder') &&
      PUBLISHABLE_KEY.includes('$');
    setKeyValid(isValid);
  }, []);

  // If a valid key exists, use standard ClerkProvider
  if (keyValid) {
    return <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{children}</ClerkProvider>;
  }

  // If user clicked "Bypass for UI Preview", render children without ClerkProvider (Demo Mode)
  if (bypassPreview) {
    return <>{children}</>;
  }

  // Otherwise, render setup guide card
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern flex items-center justify-center p-4">
      <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Clerk API Key Required</h1>
            <p className="text-xs text-slate-400">Authentication setup for ProjectMind AI v2</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <p className="font-semibold text-white">Why are you seeing this?</p>
          <p>
            ProjectMind AI v2 uses **Clerk** for user accounts, session management, and Google OAuth login.
            The current key in <code className="text-indigo-400 bg-slate-900 px-1.5 py-0.5 rounded">frontend/.env.local</code> is a placeholder.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <p className="font-bold text-white uppercase tracking-wider text-[11px]">Quick Setup (Takes 30 seconds):</p>
          <ol className="space-y-2 text-slate-300 list-decimal list-inside">
            <li>
              Open{' '}
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-bold"
              >
                <span>dashboard.clerk.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>{' '}
              (Free account).
            </li>
            <li>Create an app named <strong>ProjectMind AI</strong>.</li>
            <li>Copy your <strong>Publishable Key</strong> (starts with <code className="text-purple-400">pk_test_...</code>).</li>
            <li>
              Open <code className="text-indigo-400">frontend/.env.local</code> and set:
              <pre className="mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_copied_key_here
              </pre>
            </li>
            <li>Save the file and refresh this browser page!</li>
          </ol>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => setBypassPreview(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Preview UI without Auth (Demo Mode)
          </button>

          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
          >
            <span>Get Clerk Key</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
