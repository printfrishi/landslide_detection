import { BellRing, BookOpenCheck, MapPinned, TriangleAlert } from 'lucide-react';

const SERVICES = [
  { icon: MapPinned, label: 'Check Area Risk', href: '#check-your-area', tone: 'border-amber-300 bg-amber-50 text-amber-800' },
  { icon: TriangleAlert, label: 'Report a Landslide', href: '#report-landslide', tone: 'border-red-200 bg-red-50 text-red-800' },
  { icon: BellRing, label: 'Subscribe to Alerts', href: '#subscribe', tone: 'border-sky-200 bg-sky-50 text-sky-800' },
  { icon: BookOpenCheck, label: 'Safety Guidelines', href: '#safety', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
];

/** NDMA-style quick-service box row directly under the banner. */
export default function QuickServiceTiles() {
  return (
    <section aria-label="Citizen quick services" className="border-b bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {SERVICES.map(({ icon: Icon, label, href, tone }) => (
          <a
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${tone}`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
