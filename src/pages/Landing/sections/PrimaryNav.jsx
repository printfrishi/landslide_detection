import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogIn, Menu, X } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import { useToast } from '../../../context/ToastContext';

const NAV = [
  { label: 'Home', to: ROUTES.HOME },
  {
    label: 'Live Monitoring',
    children: [
      { label: 'Live Dashboard', to: ROUTES.DASHBOARD },
      { label: 'Sensor Network', to: ROUTES.MONITORING },
      { label: 'Monitoring Stations', href: '#live-monitoring' },
      { label: 'Current Conditions', href: '#regional-status' },
    ],
  },
  {
    label: 'Landslide Alerts',
    children: [
      { label: 'Active Alerts', to: ROUTES.ALERTS },
      { label: 'Warning Levels', href: '#regional-status' },
      { label: 'Alert History', to: ROUTES.ALERTS },
      { label: 'Safety Advisory', href: '#safety' },
    ],
  },
  { label: 'Risk Map', href: '#risk-map' },
  {
    label: 'Reports & Documents',
    children: [
      { label: 'Incident Reports', href: '#report-landslide' },
      { label: 'Notices & Updates', href: '#notices' },
      { label: 'Downloads', href: '#documents' },
    ],
  },
  { label: 'Safety', href: '#safety' },
  { label: 'Contact', href: '#emergency' },
];

function DropdownItems({ items, onNavigate }) {
  return (
    <div className="invisible absolute left-0 top-full z-40 min-w-[14rem] rounded-b-md border border-t-2 border-t-amber-400 bg-white py-1 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      {items.map((item) =>
        item.to ? (
          <Link
            key={item.label}
            to={item.to}
            onClick={onNavigate}
            className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 hover:text-[#0a2f5a]"
          >
            {item.label}
          </Link>
        ) : (
          <a
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 hover:text-[#0a2f5a]"
          >
            {item.label}
          </a>
        )
      )}
    </div>
  );
}

/** Primary government-style navigation with hover/focus dropdowns and a mobile panel. */
export default function PrimaryNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toast = useToast();

  return (
    <nav className="sticky top-0 z-40 bg-[#0a2f5a] text-white shadow-md" aria-label="Primary">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <ul className="hidden items-center lg:flex">
          {NAV.map((item) =>
            item.children ? (
              <li key={item.label} className="group relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" aria-hidden="true" />
                </button>
                <DropdownItems items={item.children} />
              </li>
            ) : (
              <li key={item.label}>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="block px-4 py-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="block px-4 py-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            )
          )}
        </ul>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="primary-mobile-nav"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>

        <Link
          to={ROUTES.LOGIN}
          className="hidden items-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-[#0a2f5a] transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:inline-flex"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Officer Login
        </Link>
      </div>

      {mobileOpen && (
        <div id="primary-mobile-nav" className="border-t border-white/10 bg-[#0a2f5a] px-4 pb-4 pt-2 lg:hidden">
          {NAV.map((item) =>
            item.children ? (
              <details key={item.label} className="border-b border-white/10">
                <summary className="flex cursor-pointer select-none items-center justify-between py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {item.label}
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </summary>
                <div className="pb-2 pl-3">
                  {item.children.map((child) =>
                    child.to ? (
                      <Link
                        key={child.label}
                        to={child.to}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1.5 text-sm text-white/80 hover:text-amber-400"
                      >
                        {child.label}
                      </Link>
                    ) : (
                      <a
                        key={child.label}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1.5 text-sm text-white/80 hover:text-amber-400"
                      >
                        {child.label}
                      </a>
                    )
                  )}
                </div>
              </details>
            ) : (
              <div key={item.label} className="border-b border-white/10">
                {item.to ? (
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium">
                    {item.label}
                  </a>
                )}
              </div>
            )
          )}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              toast.info('Officer login is on the sign-in page (demo).');
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#0a2f5a]"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Officer Login
          </button>
        </div>
      )}
    </nav>
  );
}
