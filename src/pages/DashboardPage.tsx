import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AnalyticsDashboardSection } from '../sections/AnalyticsDashboardSection';
import { ApiDocsSection } from '../sections/ApiDocsSection';

export const DashboardPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <main className="min-h-screen">
      <div className="border-b border-white/[0.06] bg-[#0B0D12]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-emerald-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Project Overview
          </Link>
          <span className="font-mono text-[11px] text-zinc-500">
            AdGuard AI · Standalone Console Workspace
          </span>
        </div>
      </div>

      <AnalyticsDashboardSection standalone />
      <ApiDocsSection />
    </main>
  );
};
