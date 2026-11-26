import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  compact?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  compact = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Minimal precision shield outline */}
          <path
            d="M12 2.5L4.5 5.8V11.6C4.5 16.4 7.7 20.6 12 21.8C16.3 20.6 19.5 16.4 19.5 11.6V5.8L12 2.5Z"
            stroke="#34D399"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Embedded telemetry anomaly pulse line */}
          <path
            d="M7.2 12.6H9.6L11 9.2L13.1 15.1L14.6 11.8H16.8"
            stroke="#A3E635"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-base font-semibold tracking-tight text-white">
              AdGuard
            </span>
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-emerald-300 border border-emerald-500/25">
              AI
            </span>
          </div>
          {!compact && (
            <span className="mt-1 text-[11px] font-medium tracking-wide text-zinc-400">
              Ad Spend Anomaly Detector
            </span>
          )}
        </div>
      )}
    </div>
  );
};
