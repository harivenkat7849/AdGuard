import React, { useRef, useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DemoBadge } from '../components/DemoBadge';
import { SectionHeader } from '../components/SectionHeader';
import { EXPLAINER_COMPARISONS } from '../data/demoSessions';
import { useSectionReveal } from '../hooks/useGsapAnimations';

export const AnomalyExplainerSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);
  const [selectedCase, setSelectedCase] = useState<'normal' | 'suspicious'>('normal');

  const activeData = EXPLAINER_COMPARISONS[selectedCase];
  const isSuspicious = selectedCase === 'suspicious';

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/[0.06] bg-[#0A0C10] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Reconstruction Error Explained"
          title="Measuring how far a session strays from normal."
          description="Reconstruction Error = Difference between original input and reconstructed output. Compare a typical session against an unusual burst below."
          rightSlot={<DemoBadge label="ILLUSTRATIVE DEMO" variant="illustrative" />}
        />

        <div
          data-reveal
          className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-6"
        >
          {/* Toggle Controls & Formula Pill */}
          <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-5 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex rounded-xl border border-white/10 bg-[#080A0E] p-1">
              <button
                type="button"
                onClick={() => setSelectedCase('normal')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  selectedCase === 'normal'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Normal Session (Low Error)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCase('suspicious')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  selectedCase === 'suspicious'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/35'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Suspicious Session (High Error)
              </button>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080A0E] px-3.5 py-2 font-mono text-xs text-zinc-300">
              MSE(x, x̂) = <span className="text-emerald-300">1/n</span> Σ (xᵢ − x̂ᵢ)²
            </div>
          </div>

          {/* Interactive Comparison Layout */}
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Info & Delta Table */}
            <div className="lg:col-span-5 space-y-5">
              <div
                className={`rounded-xl border p-4 ${
                  isSuspicious
                    ? 'border-rose-500/25 bg-rose-500/[0.05]'
                    : 'border-emerald-500/25 bg-emerald-500/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-300">
                    {activeData.sessionId}
                  </span>
                  <span
                    className={`font-mono text-sm font-semibold ${
                      isSuspicious ? 'text-rose-300' : 'text-emerald-300'
                    }`}
                  >
                    Error: {activeData.reconstructionError.toFixed(2)}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-white">
                  {activeData.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                  {activeData.summary}
                </p>
              </div>

              <div className="space-y-2">
                {activeData.features.map((item) => (
                  <div
                    key={item.feature}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#080A0E] px-3.5 py-2.5 text-xs"
                  >
                    <span className="font-medium text-zinc-200">{item.feature}</span>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-zinc-400">
                        x: <span className="text-white">{item.original.toFixed(2)}</span>
                      </span>
                      <span className="text-zinc-400">
                        x̂: <span className="text-emerald-300">{item.reconstructed.toFixed(2)}</span>
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 ${
                          item.delta > 0.2
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        Δ {item.delta.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual Chart */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#080A0E] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-display text-sm font-semibold text-white">
                    Normalized Feature Comparison: Original vs. Reconstructed
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Closer bar pairs indicate patterns familiar to the trained autoencoder.
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activeData.features}
                    margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="feature"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 1]}
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111318',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#F3F4F6',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="original"
                      name="Original Input (x)"
                      fill={isSuspicious ? '#FB7185' : '#A3E635'}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="reconstructed"
                      name="Reconstructed Output (x̂)"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-zinc-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p>
                  <strong className="text-white">Important interpretation note:</strong>{' '}
                  Reconstruction error is an <span className="text-emerald-300">anomaly signal</span>, not definitive proof of fraud. Flagged sessions warrant human or downstream verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          data-reveal
          className="mt-4 flex items-center gap-2 text-xs text-zinc-500"
        >
          <AlertCircle className="h-3.5 w-3.5 text-zinc-400" />
          <span>
            Normalized values shown above represent illustrative feature magnitudes from DEMO DATA for conceptual clarity.
          </span>
        </div>
      </div>
    </section>
  );
};
