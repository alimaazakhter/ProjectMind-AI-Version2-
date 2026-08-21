import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'ProjectMind AI — Professional AI-Powered Project Planning Platform',
  description:
    'Transform your project ideas into complete blueprints, system architecture, research references, roadmaps, viva Q&As, and starter code with multi-agent AI.',
  keywords: [
    'AI Project Generator',
    'Project Blueprint',
    'Engineering Projects',
    'System Architecture Generator',
    'Viva Defense Preparation',
    'Starter Code Scaffolding',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased h-full`}
      >
        <body
          suppressHydrationWarning
          className="min-h-screen bg-[#FAF8F5] text-[#202020] font-sans selection:bg-[#7A263A] selection:text-white flex flex-col"
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
