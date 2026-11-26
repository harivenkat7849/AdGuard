import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowDown } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { ARCHITECTURE_NODES } from '../data/projectContent';
import { prefersReducedMotion, useSectionReveal } from '../hooks/useGsapAnimations';

export const SystemArchitectureSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to('[data-arch-pulse]', {
        y: 6,
        opacity: 0.45,
        duration: 1.2,
        stagger: 0.14,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/[0.06] bg-[#0A0C10] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="System Architecture"
          title="End-to-End Anomaly Detection Dataflow"
          description="Modular separation between offline PyTorch model training, FastAPI inference serving, and the interactive React analytics interface."
          align="center"
        />

        <div
          data-reveal
          className="mx-auto max-w-3xl rounded-2xl border border-white/[0.08] bg-[#0D1016] p-6 sm:p-8 bg-grid-fine"
        >
          <div className="flex flex-col items-center">
            {ARCHITECTURE_NODES.map((node, index) => {
              const isModelCore = node.layer === 'Model Core';
              const isServing = node.layer === 'Serving' || node.layer === 'Presentation';

              return (
                <React.Fragment key={node.title}>
                  <div
                    className={`w-full max-w-md rounded-xl border px-5 py-3.5 transition-colors ${
                      isModelCore
                        ? 'border-emerald-400/50 bg-emerald-500/12 shadow-[0_0_28px_rgba(16,185,129,0.16)]'
                        : isServing
                          ? 'border-lime-400/35 bg-lime-400/[0.06]'
                          : 'border-white/[0.1] bg-[#090B10]/95'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-sm font-semibold text-white sm:text-base">
                        {node.title}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                          isModelCore
                            ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                            : isServing
                              ? 'border-lime-400/30 bg-lime-400/10 text-lime-300'
                              : 'border-white/10 bg-white/[0.03] text-zinc-400'
                        }`}
                      >
                        {node.layer}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">{node.subtitle}</p>
                  </div>

                  {index < ARCHITECTURE_NODES.length - 1 && (
                    <div
                      className="my-1.5 flex flex-col items-center"
                      aria-hidden="true"
                    >
                      <div className="h-3 w-px bg-emerald-500/40" />
                      <ArrowDown
                        data-arch-pulse
                        className="h-4 w-4 text-emerald-400"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
