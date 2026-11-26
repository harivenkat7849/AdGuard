import React, { useRef } from 'react';
import {
  BrainCircuit,
  Code2,
  Cpu,
  Database,
  GitBranch,
  LayoutDashboard,
  Server,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { TECH_STACK_ITEMS } from '../data/projectContent';
import { useSectionReveal } from '../hooks/useGsapAnimations';
import { TechStackItem } from '../types/anomaly';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Python: Code2,
  PyTorch: Cpu,
  Autoencoder: BrainCircuit,
  'Pandas & NumPy': Database,
  'Scikit-learn': Wrench,
  FastAPI: Server,
  'React + TypeScript': LayoutDashboard,
  'GSAP + ScrollTrigger': Sparkles,
  'Git / GitHub': GitBranch,
};

function getStatusBadgeStyle(status: TechStackItem['status']): string {
  switch (status) {
    case 'Implemented (Frontend)':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    case 'Backend Integration Target':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
    case 'ML Pipeline Architecture':
      return 'border-lime-400/25 bg-lime-400/10 text-lime-300';
  }
}

export const TechStackSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  return (
    <section
      id="technology"
      ref={sectionRef}
      className="border-b border-white/[0.06] bg-[#0A0C10] py-20 sm:py-24 scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Technology Stack"
          title="Built for reproducible ML engineering and clean serving."
          description="Every component is scoped honestly—distinguishing what runs in this interactive frontend today from the PyTorch modeling pipeline and FastAPI serving layer."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.name] ?? Code2;
            return (
              <article
                key={item.name}
                data-reveal
                className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5 transition-colors hover:border-white/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold text-white">
                          {item.name}
                        </h3>
                        <p className="font-mono text-[11px] text-zinc-500">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium text-zinc-200">
                    {item.role}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                    {item.detail}
                  </p>
                </div>

                <div className="mt-4 border-t border-white/[0.06] pt-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium ${getStatusBadgeStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
