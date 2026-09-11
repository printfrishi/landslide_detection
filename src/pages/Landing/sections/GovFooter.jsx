import { Link } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import useNow from './useNow';

const COLUMNS = [
  {
    heading: 'Quick Links',
    links: [
      { label: 'Live Monitoring', href: '#live-monitoring' },
      { label: 'Landslide Alerts', href: '#active-alerts' },
      { label: 'Risk Map', href: '#risk-map' },
      { label: 'Safety Guidelines', href: '#safety' },
      { label: 'Notices & Updates', href: '#notices' },
    ],
  },
  {
    heading: 'Citizen Services',
    links: [
      { label: 'Report a Landslide', href: '#report-landslide' },
      { label: 'Check Your Area', href: '#check-your-area' },
      { label: 'Subscribe to Alerts', href: '#subscribe' },
      { label: 'Emergency Contacts', href: '#emergency' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Reports & Documents', href: '#documents' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'District Status', href: '#district-status' },
      { label: 'Officer Login', to: ROUTES.LOGIN },
      { label: 'Create Account', to: ROUTES.REGISTER },
    ],
  },
  {
    heading: 'Policies',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Accessibility Statement', href: '#' },
      { label: 'Sitemap', href: '#' },
    ],
  },
];

/** Detailed Indian government-style footer with demo-platform disclosure. */
export default function GovFooter() {
  const now = useNow(60000);
  const lastUpdated = now.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <footer className="bg-[#081c33] text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="relative flex h-12 w-12 flex-col overflow-hidden rounded-md border-2 border-white/30">
                <span className="flex flex-1 items-center justify-center bg-[#0a2f5a]">
                  <Mountain className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
                <span className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-slate-100 to-[#138808]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-white">HIMRAKSHAK</p>
                <p className="text-xs text-white/60">Himalayan Landslide Monitoring & Early Warning</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
              An integrated landslide monitoring, risk assessment and early-warning platform for
              Himalayan districts — designed for citizens, responders and authorities.
            </p>
            <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-200">
              Student project / demonstration platform. Not an official Government of India or
              Government of Uttarakhand website. All monitoring data shown is simulated.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map((link) =>
                  link.to ? (
                    <li key={link.label}>
                      <Link to={link.to} className="rounded transition-colors hover:text-amber-400">
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a href={link.href} className="rounded transition-colors hover:text-amber-400">
                        {link.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="grid gap-2 text-xs text-white/50 sm:grid-cols-3">
            <p>
              <span className="font-semibold text-white/70">Last updated:</span> {lastUpdated}
            </p>
            <p>
              <span className="font-semibold text-white/70">Content managed by:</span> HimRakshak project team
            </p>
            <p>
              <span className="font-semibold text-white/70">Designed & developed by:</span> HimRakshak demo build
            </p>
          </div>
          <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/50 sm:flex-row">
            <p>© {new Date().getFullYear()} HimRakshak. Built for safer mountains.</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-1 w-8 rounded-full bg-[#FF9933]" aria-hidden="true" />
              <span className="inline-block h-1 w-8 rounded-full bg-slate-200" aria-hidden="true" />
              <span className="inline-block h-1 w-8 rounded-full bg-[#138808]" aria-hidden="true" />
              <span className="ml-1">Demo data only</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
