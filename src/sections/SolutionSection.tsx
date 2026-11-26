import React, { useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Layers } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { WORKFLOW_STAGES } from '../data/projectContent';
import { useSectionReveal } from '../hooks/useGsapAnimations';

const SOLUTION_PRINCIPLES = [
  'The model learns patterns from normal advertising sessions.',
  'It attempts to reconstruct input features.',
  'Reconstruction error measures the difference between original and reconstructed data.',
  'Unusually high errors can indicate potentially anomalous sessions.',
  'The detection threshold determines which sessions are flagged.',
];

export const SolutionSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);
  const [activeStageId, setActiveStageId] = useState<string>(WORKFLOW_STAGES[2].id);

  const activeStage =
    WORKFLOW_STAGES.find((stage) => stage.id === activeStageId) ?? WORKFLOW_STAGES[0];

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/[0.06] bg-[#0A0C10] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="The Solution"
          title="Learn normal. Detect abnormal."
          description="AdGuard AI learns normal advertising behavior using an unsupervised PyTorch autoencoder, avoiding reliance on rigid hand-written rules."
        />

        {/* Interactive Pipeline Visualization */}
        <div
          data-reveal
          className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5 sm:p-7"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Interactive Detection Workflow — Click any stage to inspect</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">
              Stage {activeStage.step} of 06
            </span>
          </div>

          {/* Interactive Stage Pills */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
            {WORKFLOW_STAGES.map((stage, index) => {
              const isSelected = stage.id === activeStage.id;
              return (
                <div key={stage.id} className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveStageId(stage.id)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400/60 bg-emerald-500/12 shadow-[0_0_24px_rgba(16,185,129,0.14)]'
                        : 'border-white/[0.08] bg-[#12161F] hover:border-white/20 hover:bg-[#161B26]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          isSelected ? 'text-lime-300' : 'text-zinc-500'
                        }`}
                      >
                        {stage.step}
                      </span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      )}
                    </div>
                    <p
                      className={`mt-2 text-sm font-semibold ${
                        isSelected ? 'text-white' : 'text-zinc-200'
                      }`}
                    >
                      {stage.shortLabel}
                    </p>
                  </button>
                  {index < WORKFLOW_STAGES.length - 1 && (
                    <ArrowRight
                      className="mx-1 hidden h-4 w-4 shrink-0 text-zinc-600 lg:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Stage Detail Panel */}
          <div className="mt-6 grid grid-cols-1 gap-6 rounded-xl border border-white/[0.08] bg-[#090B0F] p-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-emerald-300">
                <span>STAGE {activeStage.step}</span>
                <span className="text-zinc-600">/</span>
                <span>{activeStage.title}</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">
                {activeStage.summary}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                {activeStage.details}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  Stage Input
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-200">
                  {activeStage.inputSample}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                  Stage Output
                </p>
                <p className="mt-1 font-mono text-xs text-emerald-200">
                  {activeStage.outputSample}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Five Core Mechanism Principles */}
        <div data-reveal className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-5">
          {SOLUTION_PRINCIPLES.map((principle, idx) => (
            <div
              key={principle}
              className="flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#0D1016] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-zinc-500">
                  0{idx + 1}
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                {principle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
