import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const TEXT_SIZES = { A: 1, 'A+': 1.1, 'A-': 0.9 };

const SOCIAL = [
  { label: 'Facebook (demo)', Icon: Facebook },
  { label: 'Twitter / X (demo)', Icon: Twitter },
  { label: 'YouTube (demo)', Icon: Youtube },
  { label: 'Instagram (demo)', Icon: Instagram },
];

/**
 * Thin institutional utility bar: skip link, accessibility & info links,
 * social icons, language toggle, and text-size controls. Zoom applies to the
 * landing root.
 */
export default function UtilityBar({ zoom, onZoomChange }) {
  const toast = useToast();

  const demoAction = (label) =>
    toast.info(`${label} — available in the full version of this demo.`);

  return (
    <div className="bg-[#0a2f5a] text-[11px] text-white/85">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 sm:px-6 lg:px-8">
        <a
          href="#main-content"
          className="rounded px-1 py-0.5 font-medium underline-offset-2 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Skip to Main Content
        </a>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-2" aria-label="Social media (demo)">
            {SOCIAL.map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={() => demoAction('Social media links')}
                className="rounded p-0.5 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ))}
          </span>
          <button
            type="button"
            onClick={() => demoAction('Screen reader access')}
            className="rounded px-1 py-0.5 underline-offset-2 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Screen Reader Access
          </button>
          <button
            type="button"
            onClick={() => demoAction('Sitemap')}
            className="rounded px-1 py-0.5 underline-offset-2 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Sitemap
          </button>
          <button
            type="button"
            onClick={() => demoAction('Help')}
            className="rounded px-1 py-0.5 underline-offset-2 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Help
          </button>
          <span className="flex items-center gap-2" role="group" aria-label="Text size">
            {Object.entries(TEXT_SIZES).map(([label, scale]) => (
              <button
                key={label}
                type="button"
                aria-label={`Text size ${label}`}
                aria-pressed={zoom === scale}
                onClick={() => onZoomChange(scale)}
                className={zoom === scale ? 'rounded bg-amber-400 px-1.5 font-bold text-[#0a2f5a]' : 'rounded px-1.5 hover:bg-white/10'}
              >
                {label}
              </button>
            ))}
          </span>
          <span className="flex items-center gap-1.5" role="group" aria-label="Language">
            <button
              type="button"
              aria-pressed="true"
              className="rounded bg-white/15 px-1.5 py-0.5 font-semibold text-white"
            >
              English
            </button>
            <button
              type="button"
              onClick={() => toast.info('हिन्दी संस्करण जल्द उपलब्ध होगा। (Hindi version coming soon in this demo.)')}
              className="rounded px-1.5 py-0.5 hover:bg-white/10"
            >
              हिन्दी
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
