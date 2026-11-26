import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useActiveSection } from '../hooks/useActiveSection';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'technology', label: 'Technology' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'documentation', label: 'Documentation' },
];

const OBSERVED_SECTIONS = ['overview', 'how-it-works', 'technology', 'analytics', 'documentation'];

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection(OBSERVED_SECTIONS);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboardRoute = location.pathname === '/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return;
    }

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLaunchDashboard = () => {
    setMobileOpen(false);
    if (isDashboardRoute) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    scrollToSection('analytics');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/[0.08] bg-[#08090C]/85 backdrop-blur-xl'
          : 'border-b border-white/[0.04] bg-[#08090C]/60 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
          aria-label="AdGuard AI Home"
        >
          <Logo compact />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = !isDashboardRoute && activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-emerald-300 bg-emerald-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute inset-x-3.5 -bottom-[1px] h-[2px] rounded-full bg-emerald-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/dashboard"
            className={`rounded-lg border px-3 py-2 text-xs font-mono transition-colors ${
              isDashboardRoute
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:text-white'
            }`}
          >
            Console View
          </Link>
          <button
            type="button"
            onClick={handleLaunchDashboard}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_rgba(52,211,153,0.22)] transition-all hover:bg-emerald-300 active:scale-[0.98] cursor-pointer"
          >
            Launch Dashboard
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white md:hidden cursor-pointer"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/[0.08] bg-[#0B0D11] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = !isDashboardRoute && activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.06]"
            >
              Standalone Console (/dashboard)
            </Link>
            <button
              type="button"
              onClick={handleLaunchDashboard}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-zinc-950"
            >
              Launch Dashboard
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
