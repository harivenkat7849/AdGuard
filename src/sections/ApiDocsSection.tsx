import React, { useRef, useState } from 'react';
import { Check, Copy, FileCode2, ShieldAlert } from 'lucide-react';
import { DemoBadge } from '../components/DemoBadge';
import { SectionHeader } from '../components/SectionHeader';
import { API_EXAMPLE_REQUEST, API_EXAMPLE_RESPONSE } from '../data/projectContent';
import { useSectionReveal } from '../hooks/useGsapAnimations';
import { getApiBaseUrl } from '../services/api';

export const ApiDocsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);
  const [copiedKey, setCopiedKey] = useState<'req' | 'res' | null>(null);

  const handleCopy = async (text: string, key: 'req' | 'res') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  return (
    <section
      id="documentation"
      ref={sectionRef}
      className="border-b border-white/[0.06] py-20 sm:py-24 scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="API Documentation"
          title="FastAPI Integration Contract"
          description="Decoupled REST interface designed to receive session telemetry and return reconstruction-error-based anomaly assessments."
          rightSlot={<DemoBadge label="ILLUSTRATIVE CONTRACT" variant="illustrative" />}
        />

        <div
          data-reveal
          className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-6"
        >
          {/* Endpoint Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300">
                POST
              </span>
              <code className="font-mono text-sm font-semibold text-white">
                /predict
              </code>
              <span className="font-mono text-xs text-zinc-500">
                Base URL: {getApiBaseUrl()}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <FileCode2 className="h-4 w-4 text-emerald-400" />
              <span>Content-Type: application/json</span>
            </div>
          </div>

          {/* Request & Response Side-by-Side */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Request Block */}
            <div className="rounded-xl border border-white/[0.07] bg-[#080A0E] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-zinc-300">
                  Example Request Payload
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopy(API_EXAMPLE_REQUEST, 'req')}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-zinc-300 hover:text-white cursor-pointer"
                >
                  {copiedKey === 'req' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-emerald-200">
                <code>{API_EXAMPLE_REQUEST}</code>
              </pre>
            </div>

            {/* Response Block */}
            <div className="rounded-xl border border-white/[0.07] bg-[#080A0E] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-zinc-300">
                  Example JSON Response
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopy(API_EXAMPLE_RESPONSE, 'res')}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-zinc-300 hover:text-white cursor-pointer"
                >
                  {copiedKey === 'res' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-lime-200">
                <code>{API_EXAMPLE_RESPONSE}</code>
              </pre>
            </div>
          </div>

          {/* Contract Disclaimer */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 text-xs text-amber-200/90">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="font-semibold text-amber-200">
                Illustrative API Contract Notice
              </p>
              <p className="mt-1 leading-relaxed text-amber-100/75">
                This schema is an illustrative API contract until the actual FastAPI backend and trained PyTorch model schema are finalized. Example scores shown above do not represent measured model performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
