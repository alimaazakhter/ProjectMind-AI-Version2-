import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#202020] bg-subtle-grid flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Back to Home button */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#202020] transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Background warm ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C49A6C]/15 blur-3xl rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-6 text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#7A263A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#661F30] transition-all">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-[#202020] tracking-tight">
            ProjectMind <span className="text-[#7A263A]">AI</span>
          </span>
        </Link>
        <p className="text-[#666666] text-xs sm:text-sm mt-1.5">
          Create your account to start generating AI blueprints & architecture
        </p>
      </div>

      {/* Clerk Sign Up Component with Warm Burgundy Theme */}
      <div className="z-10 shadow-xl rounded-2xl overflow-hidden border border-[#EBE6DF] bg-white">
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto w-full',
              cardBox: 'bg-white border-0 shadow-none text-[#202020] w-full',
              card: 'bg-white p-6 sm:p-8 shadow-none',
              headerTitle: 'text-[#202020] font-bold text-xl',
              headerSubtitle: 'text-[#666666] text-xs',
              socialButtonsBlockButton:
                'bg-white hover:bg-[#F6F2EB] border-[#EBE6DF] text-[#202020] transition-all shadow-xs rounded-xl text-xs font-semibold py-2.5',
              socialButtonsBlockButtonText: 'text-[#202020] font-medium text-xs',
              dividerLine: 'bg-[#EBE6DF]',
              dividerText: 'text-[#888888] text-xs font-medium',
              formFieldLabel: 'text-[#333333] font-semibold text-xs',
              formFieldInput:
                'bg-white border-[#EBE6DF] text-[#202020] text-xs rounded-xl focus:border-[#7A263A] focus:ring-1 focus:ring-[#7A263A]',
              formButtonPrimary:
                'bg-[#7A263A] hover:bg-[#661F30] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs border-0 transition-all text-xs',
              footerActionLink: 'text-[#7A263A] hover:text-[#661F30] font-semibold text-xs',
              identityPreviewText: 'text-[#202020] font-semibold text-xs',
              identityPreviewEditButtonIcon: 'text-[#7A263A]',
            },
          }}
        />
      </div>
    </div>
  );
}
