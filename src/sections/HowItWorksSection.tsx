import React, { useRef } from 'react';
import { Terminal } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { TECHNICAL_STEPS } from '../data/projectContent';
import { useSectionReveal } from '../hooks/useGsapAnimations';

export const HowItWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="border-b border-white/[0.06] py-20 sm:py-24 scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Technical Pipeline"
          title="How It Works"
          description="Six structured stages take raw advertising telemetry from tabular preprocessing through PyTorch autoencoder reconstruction and FastAPI inference."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TECHNICAL_STEPS.map((step) => (
            <article
              key={step.number}
              data-reveal
              className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D1016] p-6 transition-colors hover:border-emerald-500/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-300">
                    {step.number}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {step.subtitle}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.description}
                </p>

                <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
                  {step.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-zinc-300"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#080A0E] px-3 py-2 font-mono text-[11px] text-zinc-400">
                <Terminal className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">{step.codeHint}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
