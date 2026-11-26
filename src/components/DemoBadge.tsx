import React from 'react';

interface DemoBadgeProps {
  label?: string;
  variant?: 'demo' | 'live' | 'illustrative';
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = 'DEMO DATA',
  variant = 'demo',
  className = '',
}) => {
  const styles = {
    demo: 'border-lime-400/30 bg-lime-400/10 text-lime-300',
    live: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-300',
    illustrative: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  }[variant];

  const dotColor = {
    demo: 'bg-lime-400',
    live: 'bg-emerald-400 animate-pulse',
    illustrative: 'bg-amber-400',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest ${styles} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      {label}
    </span>
  );
};
