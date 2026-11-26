import React, { useRef } from 'react';
import { Bot, DollarSign, MousePointerClick } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { useSectionReveal } from '../hooks/useGsapAnimations';

const PROBLEM_CARDS = [
  {
    icon: Bot,
    title: 'Bot Traffic',
    description: 'Automated sessions that imitate genuine user activity.',
    detail:
      'Headless browsers and scripted agents simulate scrolling or clicks while distorting campaign engagement signals.',
    tag: 'Behavioral mimicry',
  },
  {
    icon: MousePointerClick,
    title: 'Click Fraud',
    description: 'Repeated or suspicious click patterns.',
    detail:
      'Coordinated click bursts inflate traffic metrics without genuine conversion intent, skewing campaign optimization.',
    tag: 'Cadence anomaly',
  },
  {
    icon: DollarSign,
    title: 'Abnormal Ad Spend',
    description: 'Unusual spending activity that may indicate campaign abuse.',
    detail:
      'Sudden cost spikes or disproportionate spend relative to session duration can silently drain daily campaign budgets.',
    tag: 'Budget exposure',
  },
];

export const ProblemSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/[0.06] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="The Challenge"
          title="Advertising fraud doesn't always look suspicious."
          description="Marketing teams need to identify bot traffic, click fraud, and unusual advertising spend that can rapidly consume campaign budgets. Static rules and fixed thresholds can fail to detect evolving or previously unseen fraud patterns."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROBLEM_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                data-reveal
                className="group relative rounded-2xl border border-white/[0.08] bg-[#0D1016] p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#11151D]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-emerald-300 transition-colors group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    {card.tag}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-xl font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-zinc-200">
                  {card.description}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {card.detail}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
