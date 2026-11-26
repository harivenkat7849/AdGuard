import React, { useRef } from 'react';
import { Calendar, FileCheck2 } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { ROADMAP_WEEKS } from '../data/projectContent';
import { useSectionReveal } from '../hooks/useGsapAnimations';

export const RoadmapSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/[0.06] bg-[#0A0C10] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Execution Timeline"
          title="Four-Week Project Roadmap"
          description="Structured weekly milestones progressing from raw clickstream feature engineering to FastAPI deployment and evaluation."
        />

        {/* Desktop horizontal timeline rail / Mobile vertical timeline rail */}
        <div data-reveal className="relative">
          {/* Horizontal connector line on desktop */}
          <div
            className="pointer-events-none absolute top-7 left-0 right-0 hidden h-[2px] bg-gradient-to-r from-emerald-500/40 via-lime-400/40 to-emerald-500/20 lg:block"
            aria-hidden="true"
          />
          {/* Vertical connector line on mobile/tablet */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-5 w-[2px] bg-gradient-to-b from-emerald-500/40 via-lime-400/35 to-emerald-500/10 lg:hidden"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {ROADMAP_WEEKS.map((item, idx) => (
              <article
                key={item.week}
                className="relative pl-14 lg:pl-0 lg:pt-14"
              >
                {/* Node dot */}
                <div
                  className="absolute top-3 left-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400 bg-[#08090C] font-mono text-[10px] font-bold text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.35)] lg:top-4 lg:left-6"
                  aria-hidden="true"
                >
                  {idx + 1}
                </div>

                <div className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5 transition-colors hover:border-emerald-500/30">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs font-semibold text-lime-300">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{item.week}</span>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      {item.summary}
                    </p>

                    <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
                      {item.tasks.map((task) => (
                        <li
                          key={task}
                          className="flex items-start gap-2 text-xs text-zinc-300"
                        >
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400"
                            aria-hidden="true"
                          />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                      <FileCheck2 className="h-3.5 w-3.5" />
                      <span>Deliverable</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-white">
                      {item.deliverable}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
