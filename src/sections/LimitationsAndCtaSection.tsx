import React, { useRef } from 'react';
import { AlertOctagon, ArrowRight } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { PROJECT_LIMITATIONS } from '../data/projectContent';
import { useSectionReveal } from '../hooks/useGsapAnimations';

export const LimitationsAndCtaSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  const scrollToAnalytics = () => {
    document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={sectionRef as React.RefObject<HTMLDivElement>}>
      {/* Section 15: Project Limitations */}
      <section className="border-b border-white/[0.06] bg-[#0A0C10] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Scope & Limitations"
            title="Transparent Boundaries of Unsupervised Detection"
            description="Responsible machine learning engineering requires clearly communicating assumptions, threshold trade-offs, and evaluation dependencies."
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PROJECT_LIMITATIONS.map((item) => (
              <article
                key={item.title}
                data-reveal
                className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5"
              >
                <div className="flex items-center gap-2.5 text-amber-300">
                  <AlertOctagon className="h-4 w-4 shrink-0" />
                  <h3 className="font-display text-base font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Section 16: Final CTA */}
      <section className="relative overflow-hidden py-24 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.14),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div data-reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Detect the unusual. Protect the budget.
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Don&apos;t let unusual activity drain your advertising budget.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Explore how machine learning can help identify suspicious advertising behavior.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={scrollToAnalytics}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_32px_rgba(52,211,153,0.28)] transition-all hover:bg-emerald-300 active:scale-[0.98] cursor-pointer"
              >
                Explore AdGuard AI
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
