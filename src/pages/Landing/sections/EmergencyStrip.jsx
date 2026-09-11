import { TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';

/** Government-style emergency advisory strip. Shown while a demo advisory is active. */
export default function EmergencyStrip() {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  return (
    <div className="border-b-2 border-red-600 bg-amber-50" role="alert">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div className="flex-1 text-sm">
          <p className="font-bold uppercase tracking-wide text-red-700">Important Alert</p>
          <p className="text-secondary-800">
            Heavy rainfall expected in selected Himalayan districts over the next 48 hours. Citizens
            are advised to avoid unnecessary travel through identified high-risk corridors.
            <span className="ml-2 rounded bg-secondary-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-700">
              Demo advisory
            </span>
          </p>
        </div>
        <a
          href="#active-alerts"
          className="shrink-0 self-center rounded-md border border-[#0a2f5a] px-3 py-1.5 text-xs font-semibold text-[#0a2f5a] transition-colors hover:bg-[#0a2f5a] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View Advisory
        </a>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss advisory"
          className="shrink-0 self-center inline-flex h-7 w-7 items-center justify-center rounded-md text-secondary-500 hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
