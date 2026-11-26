import React, { useRef } from 'react';
import { GraduationCap, Target } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { PROJECT_OBJECTIVES } from '../data/projectContent';
import { useSectionReveal } from '../hooks/useGsapAnimations';
import { ProjectObjective } from '../types/anomaly';

function getBloomBadgeClass(level: ProjectObjective['bloomLevel']): string {
  switch (level) {
    case 'Understand':
      return 'border-sky-400/30 bg-sky-400/10 text-sky-300';
    case 'Apply':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300';
    case 'Create':
      return 'border-lime-400/35 bg-lime-400/12 text-lime-300';
    case 'Evaluate':
      return 'border-amber-400/30 bg-amber-400/10 text-amber-300';
  }
}

export const ObjectivesAndBloomSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/[0.06] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Academic Alignment"
          title="Project Objectives & Bloom's Taxonomy Mapping"
          description="Six clear engineering and ML milestones mapped directly to cognitive learning outcomes."
        />

        {/* Project Objectives Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROJECT_OBJECTIVES.map((obj, idx) => (
            <article
              key={obj.id}
              data-reveal
              className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D1016] p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
                    <Target className="h-3.5 w-3.5 text-emerald-400" />
                    OBJECTIVE 0{idx + 1}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${getBloomBadgeClass(
                      obj.bloomLevel
                    )}`}
                  >
                    {obj.bloomLevel}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold text-white">
                  {obj.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {obj.description}
                </p>
              </div>

              <div className="mt-4 border-t border-white/[0.06] pt-3 text-xs text-zinc-400">
                {obj.bloomRationale}
              </div>
            </article>
          ))}
        </div>

        {/* Dedicated Bloom's Taxonomy Visual Mapping Table */}
        <div
          data-reveal
          className="mt-10 rounded-2xl border border-white/[0.08] bg-[#0D1016] p-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="h-5 w-5 text-lime-300" />
              <h3 className="font-display text-lg font-semibold text-white">
                Bloom&apos;s Taxonomy Alignment Matrix
              </h3>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              6 Objectives · 4 Cognitive Tiers
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {PROJECT_OBJECTIVES.map((obj) => (
              <div
                key={`bloom-${obj.id}`}
                className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#080A0E] px-4 py-3"
              >
                <span className="text-sm font-medium text-zinc-200">
                  {obj.title}
                </span>
                <span
                  className={`ml-3 shrink-0 rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold ${getBloomBadgeClass(
                    obj.bloomLevel
                  )}`}
                >
                  {obj.bloomLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
