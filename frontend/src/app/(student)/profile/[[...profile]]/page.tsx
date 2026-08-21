'use client';

import React from 'react';
import { UserProfile, useUser, SignOutButton } from '@clerk/nextjs';
import { User, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="p-10 text-center text-[#888888]">Loading User Profile...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE6DF] pb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#666666] hover:text-[#202020] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight flex items-center gap-3">
            <User className="w-7 h-7 text-[#7A263A]" />
            Account & Security Management
          </h1>
          <p className="text-[#555555] text-xs sm:text-sm mt-1">
            Manage your password, connected Google & GitHub accounts, and profile security.
          </p>
        </div>

        <SignOutButton>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs transition-all shadow-xs">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      </div>

      {/* Clerk UserProfile Component with Hash Routing & Warm Burgundy Styling */}
      <div className="rounded-2xl overflow-hidden border border-[#EBE6DF] shadow-xs bg-white p-4 sm:p-6">
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: 'w-full',
              cardBox: 'bg-white border-0 shadow-none text-[#202020] w-full max-w-full',
              card: 'bg-white p-0 shadow-none',
              navbar: 'border-r border-[#EBE6DF] bg-[#F6F2EB] p-4',
              navbarButton: 'text-[#666666] hover:text-[#202020] hover:bg-[#EBE6DF] rounded-xl text-xs font-semibold',
              navbarButtonActive: 'bg-[#7A263A] text-white shadow-xs',
              headerTitle: 'text-[#202020] font-bold text-lg',
              headerSubtitle: 'text-[#666666] text-xs',
              profilePage: 'bg-white p-6',
              sectionTitleText: 'text-[#202020] font-bold text-sm border-b border-[#EBE6DF] pb-2 mb-4',
              formFieldLabel: 'text-[#333333] font-semibold text-xs',
              formFieldInput: 'bg-white border-[#EBE6DF] text-[#202020] text-xs focus:border-[#7A263A]',
              formButtonPrimary: 'bg-[#7A263A] hover:bg-[#661F30] text-white font-bold text-xs py-2 px-4 shadow-xs',
              badge: 'bg-[#7A263A]/10 text-[#7A263A] border border-[#7A263A]/20 text-[10px]',
              identityPreviewText: 'text-[#202020] text-xs',
              avatarImage: 'rounded-xl',
            },
          }}
        />
      </div>
    </div>
  );
}
