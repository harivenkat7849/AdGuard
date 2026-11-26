import React, { useRef } from 'react';
import { Award } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { EVALUATION_CRITERIA } from '../data/projectContent';
import { useSectionReveal } from '../hooks/useGsapAnimations';

export const EvaluationCriteriaSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  const totalWeight = EVALUATION_CRITERIA.reduce((sum, c) => sum + c.weight, 0);

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/[0.06] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Evaluation Framework"
          title="Assessment & Grading Weight Breakdown"
          description="Balanced evaluation across data engineering, PyTorch autoencoder modeling, anomaly analysis, API deployment, and documentation."
          rightSlot={
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
              <Award className="h-4 w-4 text-emerald-300" />
              <span className="font-mono text-sm font-semibold text-white">
                Total: {totalWeight}%
              </span>
            </div>
          }
        />

        {/* Proportional Stacked Bar Visualization */}
        <div
          data-reveal
          className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5"
        >
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-300">
              Proportional Criterion Distribution
            </span>
            <span className="font-mono text-emerald-300">100% Combined Weight</span>
          </div>

          <div
            className="flex h-4 w-full overflow-hidden rounded-full bg-white/[0.05] p-0.5"
            role="img"
            aria-label="Evaluation criteria percentage breakdown totaling 100%"
          >
            {EVALUATION_CRITERIA.map((criterion) => (
              <div
                key={criterion.name}
                title={`${criterion.name}: ${criterion.weight}%`}
                style={{
                  width: `${criterion.weight}%`,
                  backgroundColor: criterion.color,
                }}
                className="h-full first:rounded-l-full last:rounded-r-full border-r border-[#08090C] last:border-r-0 transition-opacity hover:opacity-85"
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-400">
            {EVALUATION_CRITERIA.map((c) => (
              <div key={`legend-${c.name}`} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.name}</span>
                <span className="font-mono text-zinc-200">{c.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Criteria Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EVALUATION_CRITERIA.map((criterion) => (
            <article
              key={criterion.name}
              data-reveal
              className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5 transition-colors hover:border-white/20"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-base font-semibold text-white">
                  {criterion.name}
                </h3>
                <span
                  className="shrink-0 rounded-lg border px-2.5 py-1 font-mono text-sm font-semibold"
                  style={{
                    borderColor: `${criterion.color}44`,
                    backgroundColor: `${criterion.color}18`,
                    color: criterion.color,
                  }}
                >
                  {criterion.weight}%
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                {criterion.description}
              </p>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(criterion.weight / 25) * 100}%`,
                    backgroundColor: criterion.color,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
