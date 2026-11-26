import React from 'react';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  rightSlot?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = 'left',
  rightSlot,
}) => {
  const isCentered = align === 'center';

  return (
    <div
      data-reveal
      className={`mb-12 flex flex-col gap-4 ${
        isCentered
          ? 'items-center text-center mx-auto max-w-3xl'
          : 'md:flex-row md:items-end md:justify-between'
      }`}
    >
      <div className={isCentered ? 'max-w-2xl' : 'max-w-2xl'}>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-widest text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-zinc-400 sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
};
