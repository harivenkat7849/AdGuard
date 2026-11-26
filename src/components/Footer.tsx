import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const goToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#06070A]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Detect the unusual. Protect the budget. Unsupervised anomaly detection for advertising traffic and spend patterns.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-300">
              Quick Navigation
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'how-it-works', label: 'How It Works' },
                { id: 'technology', label: 'Technology' },
                { id: 'analytics', label: 'Analytics Dashboard' },
                { id: 'documentation', label: 'API Documentation' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => goToSection(item.id)}
                    className="hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/dashboard" className="hover:text-emerald-300 transition-colors">
                  Standalone Console
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-300">
              Technology Stack
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>Python &amp; PyTorch Autoencoder</li>
              <li>Pandas, NumPy &amp; Scikit-learn</li>
              <li>FastAPI Inference Service</li>
              <li>React, TypeScript &amp; Tailwind CSS</li>
              <li>GSAP Motion &amp; Recharts</li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-300">
              Project Information
            </h3>
            <div className="mt-4 space-y-2.5 text-sm text-zinc-400">
              <p>Product: AdGuard AI</p>
              <p>Domain: Generative AI &amp; Machine Learning</p>
              <p>Method: Unsupervised Reconstruction Error</p>
              <div className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-zinc-300">
                Academic project — machine learning-based anomaly detection prototype.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <p>AdGuard AI — Ad Spend Anomaly Detector</p>
          <p>Academic project — machine learning-based anomaly detection prototype.</p>
        </div>
      </div>
    </footer>
  );
};
