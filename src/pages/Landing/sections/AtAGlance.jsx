import { Activity, MapPinned, RadioTower, Route, Siren, Zap } from 'lucide-react';
import SectionHeading from './SectionHeading';
import useCountUp from '../useCountUp';

const METRICS = [
  { icon: RadioTower, target: 128, suffix: '+', decimals: 0, label: 'Monitoring stations' },
  { icon: MapPinned, target: 13, suffix: '', decimals: 0, label: 'Districts covered' },
  { icon: Activity, target: 96, suffix: '%', decimals: 0, label: 'Active sensors' },
  { icon: Siren, target: 2450, suffix: '+', decimals: 0, label: 'Landslide events monitored' },
  { icon: Route, target: 6, suffix: '', decimals: 0, label: 'Critical corridors' },
  { icon: Zap, target: null, suffix: '', label: 'Data updates', staticValue: 'Real time' },
];

function Metric({ icon: Icon, target, suffix, decimals, label, staticValue }) {
  const [ref, display] = target === null ? [null, null] : useCountUp(target, { decimals });
  const content = staticValue ?? display;

  return (
    <div ref={ref} className="rounded-lg border-t-2 border-amber-400 bg-white p-5 text-center shadow-sm">
      <Icon className="mx-auto h-5 w-5 text-[#0a2f5a]" aria-hidden="true" />
      <p className="mt-2 text-2xl font-extrabold tabular-nums tracking-tight text-[#0a2f5a] sm:text-3xl">
        {content}
        {suffix}
      </p>
      <p className="mt-1 text-xs text-secondary-600">{label}</p>
    </div>
  );
}

/** "HimRakshak at a glance" — institutional network metrics. */
export default function AtAGlance() {
  return (
    <section id="at-a-glance" aria-labelledby="glance-heading" className="scroll-mt-24 bg-secondary-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="glance-heading"
          center
          eyebrow="Monitoring Network"
          title="HimRakshak at a glance"
          meta="Illustrative figures — demonstration data"
        />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {METRICS.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
