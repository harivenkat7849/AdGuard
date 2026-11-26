import { useEffect, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animates elements matching `[data-reveal]` within a section container on scroll.
 */
export function useSectionReveal(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const targets = container.querySelectorAll('[data-reveal]');
      if (targets.length === 0) return;

      gsap.fromTo(
        targets,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: container,
            start: 'top 84%',
            once: true,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [containerRef]);
}
