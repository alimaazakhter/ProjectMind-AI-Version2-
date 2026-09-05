'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser, useAuth } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Sparkles,
  Bot,
  History,
  User,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Generator', href: '/generator', icon: Sparkles, badge: 'Wizard' },
  { name: 'AI Assistant', href: '/assistant', icon: Bot, badge: 'Chat' },
  { name: 'Project History', href: '/history', icon: History },
  { name: 'My Profile', href: '/profile', icon: User },
];

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Automatically sync logged-in Clerk profile with Supabase database.
  // The /users/sync route is auth-protected and derives identity from the verified
  // token (never a frontend-supplied id), so we MUST attach the Clerk session token —
  // otherwise the request 401s and the owner profile is never created (which made
  // admin author resolution show "Unknown User").
  React.useEffect(() => {
    if (!isLoaded || !user) return;

    const syncProfile = async () => {
      try {
        const token = await getToken();
        if (!token) return; // Session token not ready yet; effect re-runs on auth change.

        const email = user.primaryEmailAddress?.emailAddress;
        const fullName = user.fullName || user.username || email?.split('@')[0];
        const apiUrl = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:5000/api/v1';

        await fetch(`${apiUrl}/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          // Identity is derived server-side from the token; we only send the display fields.
          body: JSON.stringify({ email, full_name: fullName }),
        });
      } catch (err) {
        console.warn('User profile sync skipped:', err);
      }
    };

    syncProfile();
  }, [isLoaded, user, getToken]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#202020] flex flex-col md:flex-row font-sans">
      {/* Mobile Top Navbar with Sidebar Toggle */}
      <div className="md:hidden bg-[#F6F2EB] border-b border-[#EBE6DF] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7A263A] flex items-center justify-center text-white shadow-xs font-black text-sm leading-none">
            P
          </div>
          <span className="font-bold text-[#202020] text-sm">ProjectMind AI</span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[#666666] hover:bg-[#EBE6DF] hover:text-[#202020] transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`bg-[#F6F2EB] border-r border-[#EBE6DF] flex flex-col shrink-0 transition-all duration-300 ease-in-out z-30 ${
          mobileOpen ? 'block fixed inset-y-0 left-0 w-64 shadow-2xl bg-[#F6F2EB]' : 'hidden md:flex'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Brand Header & Hide / Collapse Toggle Button */}
        <div className="p-4 border-b border-[#EBE6DF] flex items-center justify-between h-16">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#7A263A] flex items-center justify-center text-white shadow-xs shrink-0 font-black text-base leading-none">
                P
              </div>
              <div className="truncate">
                <span className="font-bold text-[#202020] text-sm tracking-tight block leading-none">
                  ProjectMind <span className="text-[#7A263A]">AI</span>
                </span>
                <span className="text-[10px] text-[#777777] font-medium">Project Workspace</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto" title="ProjectMind AI">
              <div className="w-8 h-8 rounded-lg bg-[#7A263A] flex items-center justify-center text-white shadow-xs font-black text-base leading-none">
                P
              </div>
            </Link>
          )}

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:inline-flex p-1.5 rounded-lg text-[#888888] hover:text-[#202020] hover:bg-[#EBE6DF] transition-colors ml-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#888888] uppercase tracking-wider">
              Workspace
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#7A263A]/10 text-[#7A263A] font-bold border border-[#7A263A]/20 shadow-xs'
                    : 'text-[#666666] hover:text-[#202020] hover:bg-[#EBE6DF]'
                } ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#7A263A]' : 'text-[#888888]'}`}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      isActive
                        ? 'bg-[#7A263A] text-white'
                        : 'bg-[#E5DFD5] text-[#666666]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Session Profile Box & Staff Link */}
        <div className="p-3 border-t border-[#EBE6DF] bg-[#F6F2EB] space-y-2">
          <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#EBE6DF] shadow-xs ${isCollapsed ? 'justify-center' : ''}`}>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-7 h-7 ring-1 ring-[#EBE6DF]',
                },
              }}
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#202020] truncate">
                  {isLoaded ? user?.fullName || user?.primaryEmailAddress?.emailAddress : 'Loading...'}
                </p>
                <p className="text-[10px] text-[#777777] truncate">Active Account</p>
              </div>
            )}
          </div>

          {/* Discreet Admin Portal access at bottom */}
          {!isCollapsed && (
            <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-[#777777]">
              <span>Platform</span>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 hover:text-[#7A263A] transition-colors group"
              >
                <Shield className="w-3.5 h-3.5 text-[#888888] group-hover:text-[#7A263A] shrink-0 transition-colors" />
                <span className="leading-none">Admin Access</span>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#FAF8F5] bg-subtle-grid min-h-screen">
        {children}
      </main>
    </div>
  );
}
