import { useNavigate } from 'react-router-dom';
import { PhoneCall, Search } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';

/** Ashoka Chakra — 24-spoke wheel used as the Indian national emblem placeholder. */
function AshokaChakra({ className }) {
  const spokes = Array.from({ length: 24 }, (_, index) => index * 15);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      {spokes.map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="50"
          x2="50"
          y2="9"
          stroke="currentColor"
          strokeWidth="2.5"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
    </svg>
  );
}

/** HimRakshak brand mark: navy shield, watchful peak, radar arcs, saffron base. */
function HimRakshakLogo({ className }) {
  return (
    <svg viewBox="0 0 64 74" className={className} role="img" aria-label="HimRakshak logo">
      <defs>
        <linearGradient id="hr-shield-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#134b8a" />
          <stop offset="1" stopColor="#0a2f5a" />
        </linearGradient>
      </defs>
      {/* shield */}
      <path
        d="M32 3 L59 11 V37 C59 53 46 64 32 71 C18 64 5 53 5 37 V11 Z"
        fill="url(#hr-shield-bg)"
        stroke="#fbbf24"
        strokeWidth="2.5"
      />
      {/* radar arcs */}
      <path d="M20 24 a13 13 0 0 1 24 0" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M15 19 a20 20 0 0 1 34 0" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
      {/* watch point */}
      <circle cx="32" cy="27" r="2.5" fill="#f87171" />
      {/* monitored peak */}
      <path d="M13 46 L25 30 L32 40 L38 33 L51 46 Z" fill="#ffffff" opacity="0.95" />
      <path d="M23.5 33.5 L25 30 L26.5 33.5 L25 36 Z" fill="#cbd5e1" />
      {/* stability base */}
      <rect x="13" y="51" width="38" height="3.5" rx="1.75" fill="#fbbf24" />
      {/* tricolor base rule */}
      <g aria-hidden="true">
        <rect x="5" y="59" width="18" height="2.5" fill="#FF9933" opacity="0.9" />
        <rect x="23" y="59" width="18" height="2.5" fill="#e2e8f0" />
        <rect x="41" y="59" width="18" height="2.5" fill="#138808" opacity="0.9" />
      </g>
    </svg>
  );
}

/**
 * Institutional header in the three-part government layout: national emblem
 * corner (left), search + emergency actions (centre), HimRakshak logo corner
 * (right). Identifies the project as a prototype, not an official property.
 */
export default function GovHeader() {
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(ROUTES.MONITORING);
  };

  return (
    <header className="border-b-2 border-amber-400 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10 lg:px-8">
        {/* LEFT CORNER — Indian national emblem (Ashoka Chakra) */}
        <div className="flex items-center gap-3.5">
          <AshokaChakra className="h-14 w-14 shrink-0 text-[#06038d] sm:h-16 sm:w-16" />
          <div>
            <p className="text-base font-bold leading-tight text-secondary-900">भारत सरकार</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary-500">
              Government of India
            </p>
            <p className="mt-0.5 text-[10px] text-secondary-400">Project demonstration</p>
          </div>
        </div>

        {/* CENTRE — search + emergency, with open space around it */}
        <div className="flex items-center justify-center gap-4">
          <form onSubmit={handleSearch} role="search" className="hidden flex-1 items-center md:flex">
            <label htmlFor="portal-search" className="sr-only">
              Search the portal
            </label>
            <input
              id="portal-search"
              type="search"
              placeholder="Search stations, districts, alerts…"
              className="h-10 w-56 rounded-l-md border border-r-0 border-secondary-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring lg:w-64"
            />
            <button
              type="submit"
              aria-label="Search"
              className="inline-flex h-10 items-center gap-2 rounded-r-md bg-[#0a2f5a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#134b8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
          </form>
          <a
            href="tel:112"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border-2 border-red-600 px-3.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            Emergency 112
          </a>
        </div>

        {/* RIGHT CORNER — HimRakshak brand logo */}
        <div className="flex items-center gap-3 lg:justify-self-end">
          <HimRakshakLogo className="h-14 w-auto shrink-0 sm:h-16" />
          <div>
            <p className="text-xs font-semibold text-primary-700">हिमरक्षक</p>
            <p className="text-xl font-extrabold leading-tight tracking-tight text-[#0a2f5a] sm:text-2xl">
              HIMRAKSHAK
            </p>
            <p className="text-[11px] font-medium text-secondary-500">
              Landslide Early Warning System
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
