import { TriangleAlert, Crosshair, Building2, School } from 'lucide-react';
import SectionHeading from './SectionHeading';

const SUSCEPTIBILITY = [
  { name: 'Very high', fill: 'fill-red-600/35 stroke-red-700', label: [382, 310], d: 'M422,262 L496,222 L516,328 L440,378 L364,332 Z', note: 'Rudraprayag' },
  { name: 'High', fill: 'fill-orange-500/30 stroke-orange-600', label: [368, 160], d: 'M360,62 L478,102 L498,218 L420,258 L342,220 L322,126 Z', note: 'Chamoli upper' },
  { name: 'Moderate', fill: 'fill-amber-400/30 stroke-amber-600', label: [246, 350], d: 'M244,302 L318,224 L362,334 L282,362 Z', note: 'Tehri' },
  { name: 'Low', fill: 'fill-emerald-500/25 stroke-emerald-600', label: [300, 440], d: 'M284,366 L362,336 L438,382 L418,478 L342,518 L286,470 Z', note: 'Pauri' },
];

const LEGEND = [
  { label: 'Low susceptibility', swatch: 'bg-emerald-500/30 ring-emerald-600' },
  { label: 'Moderate susceptibility', swatch: 'bg-amber-400/30 ring-amber-600' },
  { label: 'High susceptibility', swatch: 'bg-orange-500/30 ring-orange-600' },
  { label: 'Very high susceptibility', swatch: 'bg-red-600/35 ring-red-700' },
  { label: 'Historical landslide (sample)', swatch: 'bg-secondary-800 [clip-path:polygon(50%_0,100%_100%,0_100%)]' },
  { label: 'Critical facility', swatch: 'bg-white ring-1 ring-secondary-700' },
];

const LANDSLIDES = [
  [470, 320], [430, 350], [492, 290], [322, 250], [300, 330],
];

/** Landslide susceptibility map preview with a scientific 4-class legend. */
export default function RiskMapPreview() {
  return (
    <section id="risk-map" aria-labelledby="risk-map-heading" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="risk-map-heading"
          eyebrow="Geospatial Assessment"
          title="Landslide risk map"
          description="Susceptibility classes derived from terrain, rainfall exposure and historical events. Use the legend to read each zone."
          meta="Sample susceptibility model — illustrative boundaries only"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border bg-[#e8eef2] shadow-sm lg:col-span-2">
            <svg viewBox="0 0 760 640" className="h-[420px] w-full sm:h-[500px]" role="img" aria-label="Landslide susceptibility map with four risk classes, historical landslide markers and critical facilities">
              <g stroke="#94a3b8" strokeWidth="1" opacity="0.3" fill="none">
                <path d="M60,140 C 220,110 380,160 540,130 S 700,110 745,140" />
                <path d="M60,520 C 220,490 380,540 540,510 S 700,490 745,520" />
              </g>
              <path
                d="M380,30 L520,80 L560,200 L540,340 L460,480 L380,560 L300,540 L230,430 L200,300 L260,120 Z"
                fill="#f1f5f4"
                stroke="#475569"
                strokeWidth="3"
              />
              {SUSCEPTIBILITY.map((zone) => (
                <g key={zone.name}>
                  <path d={zone.d} className={zone.fill} strokeDasharray="none" strokeWidth="2" />
                  <text x={zone.label[0]} y={zone.label[1]} fontSize="12" fontWeight="600" fill="#1e293b" style={{ pointerEvents: 'none' }}>
                    {zone.note}
                  </text>
                </g>
              ))}
              {/* historical landslides */}
              {LANDSLIDES.map(([x, y], index) => (
                <polygon key={index} points={`${x},${y - 7} ${x + 6},${y + 5} ${x - 6},${y + 5}`} fill="#1e293b" />
              ))}
              {/* critical facilities */}
              <g>
                <circle cx="330" cy="430" r="9" fill="#ffffff" stroke="#334155" strokeWidth="2" />
                <path d="M330 425 v10 M325 430 h10" stroke="#dc2626" strokeWidth="2.5" />
                <circle cx="450" cy="410" r="9" fill="#ffffff" stroke="#334155" strokeWidth="2" />
                <path d="M446 406 l8 8 M454 406 l-8 8" stroke="#0a2f5a" strokeWidth="2.5" />
              </g>
              <g fontSize="12" fill="#475569">
                <text x="40" y="594" fontWeight="600">Scale (approx.)</text>
                <line x1="40" y1="616" x2="140" y2="616" stroke="#475569" strokeWidth="3" />
                <text x="52" y="608">0</text>
                <text x="118" y="608">25 km</text>
              </g>
            </svg>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2f5a]">Legend</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-secondary-700">
                {LEGEND.map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5">
                    <span className={cnSwatch(item.swatch)} aria-hidden="true" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2f5a]">Map notes</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-secondary-600">
                <li className="flex gap-2">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  Susceptibility is not a prediction — it shows where conditions favour landslides.
                </li>
                <li className="flex gap-2">
                  <Crosshair className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" aria-hidden="true" />
                  Historical markers are sample inventory points for the demo.
                </li>
                <li className="flex gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                  <span className="flex items-center gap-1.5">
                    Critical facility <School className="h-3.5 w-3.5 text-[#0a2f5a]" aria-hidden="true" /> markers indicate hospitals and schools.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function cnSwatch(classes) {
  return `h-3.5 w-6 rounded-sm ring-1 ${classes}`;
}
