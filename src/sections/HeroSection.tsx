import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Activity,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DemoBadge } from '../components/DemoBadge';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { HERO_ACTIVITY_SERIES } from '../data/demoSessions';
import { prefersReducedMotion } from '../hooks/useGsapAnimations';

export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-stagger]',
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );

      gsap.fromTo(
        '[data-hero-preview]',
        { y: 28, opacity: 0, scale: 0.985 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          delay: 0.25,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );

      // Subtle breathing motion on the radial telemetry glow
      gsap.to('[data-hero-grid-glow]', {
        opacity: 0.85,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="overview"
      ref={heroRef}
      className="relative overflow-hidden border-b border-white/[0.06] pt-16 pb-20 sm:pt-24 sm:pb-28"
    >
      {/* Restrained background grid & controlled emerald glow */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" aria-hidden="true" />
      <div
        data-hero-grid-glow
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] hero-glow opacity-60"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Brand Pitch & CTAs */}
          <div className="lg:col-span-6">
            <div
              data-hero-stagger
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-lime-300" />
              <span>Unsupervised PyTorch Autoencoder Prototype</span>
            </div>

            <h1
              data-hero-stagger
              className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]"
            >
              Your Ad Budget Deserves Better Protection.
            </h1>

            <p
              data-hero-stagger
              className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
            >
              AdGuard AI uses unsupervised machine learning to identify unusual advertising traffic, suspicious click activity, and abnormal spending patterns before they go unnoticed.
            </p>

            <div
              data-hero-stagger
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <button
                type="button"
                onClick={() => scrollTo('analytics')}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_28px_rgba(52,211,153,0.28)] transition-all hover:bg-emerald-300 active:scale-[0.98] cursor-pointer"
              >
                Explore Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollTo('how-it-works')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white cursor-pointer"
              >
                How It Works
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>
            </div>

            <div
              data-hero-stagger
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/[0.08] pt-6 text-xs text-zinc-400"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Detect the unusual. Protect the budget.</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                <span>FastAPI-ready frontend</span>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Dashboard Preview */}
          <div data-hero-preview className="lg:col-span-6">
            <div className="relative rounded-2xl border border-white/[0.1] bg-[#0E1015]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
              {/* Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10">
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Campaign Activity Monitor
                    </p>
                    <p className="font-mono text-[11px] text-zinc-400">
                      CAMPAIGN_01 · Search &amp; Display Telemetry
                    </p>
                  </div>
                </div>
                <DemoBadge label="DEMO DATA" variant="demo" />
              </div>

              {/* Metrics Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <p className="text-[11px] font-medium text-zinc-400">
                    Total Sessions
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-white">
                    <AnimatedCounter value={1868} />
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                    Illustrative window
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <p className="text-[11px] font-medium text-zinc-400">
                    Normal Sessions
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-emerald-300">
                    <AnimatedCounter value={1800} />
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-emerald-500/80">
                    96.4% baseline
                  </p>
                </div>

                <div className="col-span-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3 sm:col-span-1">
                  <p className="text-[11px] font-medium text-rose-200/80">
                    Anomalous Sessions
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-rose-300">
                    <AnimatedCounter value={68} />
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-rose-400/80">
                    Flagged for review
                  </p>
                </div>
              </div>

              {/* Score Telemetry Strip */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#13161D] px-3.5 py-2.5">
                  <span className="text-xs text-zinc-400">Anomaly Score</span>
                  <span className="font-mono text-sm font-semibold text-lime-300">
                    <AnimatedCounter value={0.87} decimals={2} />
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#13161D] px-3.5 py-2.5">
                  <span className="text-xs text-zinc-400">Reconstruction Error</span>
                  <span className="font-mono text-sm font-semibold text-emerald-300">
                    <AnimatedCounter value={0.274} decimals={3} />
                  </span>
                </div>
              </div>

              {/* Subtle Activity Chart */}
              <div className="mt-4 rounded-xl border border-white/[0.07] bg-[#0B0D12] p-3.5">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-zinc-300">
                    Reconstruction Error Trend (24h Illustrative)
                  </span>
                  <span className="font-mono text-zinc-500">Threshold τ = 0.55</span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={HERO_ACTIVITY_SERIES}
                      margin={{ top: 8, right: 6, left: -24, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="heroErrorGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34D399" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="time"
                        stroke="#52525B"
                        tick={{ fill: '#71717A', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 0.8]}
                        stroke="#52525B"
                        tick={{ fill: '#71717A', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111318',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#F3F4F6',
                        }}
                        formatter={(val: number) => [`${val.toFixed(2)} (Demo)`, 'Error']}
                      />
                      <Area
                        type="monotone"
                        dataKey="reconstructionError"
                        stroke="#34D399"
                        strokeWidth={2}
                        fill="url(#heroErrorGrad)"
                        animationDuration={1100}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-zinc-500">
                Illustrative preview using synthetic DEMO DATA. Connect FastAPI in Analytics for live model telemetry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
