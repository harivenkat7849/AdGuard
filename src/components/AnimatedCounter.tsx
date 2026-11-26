import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../hooks/useGsapAnimations';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const proxyRef = useRef<{ val: number }>({ val: 0 });
  const hasAnimatedOnce = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayValue(value);
      return;
    }

    const startVal = hasAnimatedOnce.current ? proxyRef.current.val : 0;
    proxyRef.current.val = startVal;
    hasAnimatedOnce.current = true;

    const tween = gsap.to(proxyRef.current, {
      val: value,
      duration: 0.7,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayValue(proxyRef.current.val);
      },
    });

    return () => {
      tween.kill();
    };
  }, [value]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
