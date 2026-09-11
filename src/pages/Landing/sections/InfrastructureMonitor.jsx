import { Activity } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import PortalPanel from './PortalPanel';
import SectionHeading from './SectionHeading';
import { CORRIDORS, SEVERITY_STYLES } from './DemoData';

/** Critical infrastructure monitoring: corridors and lifelines with advisories. */
export default function InfrastructureMonitor() {
  return (
    <section id="infrastructure" aria-labelledby="infrastructure-heading" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="infrastructure-heading"
          eyebrow="Infrastructure"
          title="Critical infrastructure monitoring"
          description="Corridors and lifelines are tracked individually so restrictions can be targeted instead of blanket."
          meta="Sample corridors — demonstration data"
        />

        <div className="mt-10">
          <PortalPanel title="Corridor & Lifeline Status" icon={Activity} bodyClassName="p-5">
            <ul className="grid gap-5 md:grid-cols-2">
              {CORRIDORS.map((corridor) => (
                <li
                  key={corridor.id}
                  className="flex h-full flex-col rounded-lg border-l-4 bg-secondary-50/60 p-5 ring-1 ring-secondary-200"
                  style={{
                    borderLeftColor:
                      corridor.risk === 'HIGH' ? '#dc2626' : corridor.risk === 'WATCH' ? '#f59e0b' : '#10b981',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-[#0a2f5a]">
                      {corridor.id}{' '}
                      <span className="font-medium text-secondary-600">— {corridor.name}</span>
                    </h3>
                    <Badge variant={SEVERITY_STYLES[corridor.risk]?.badge ?? 'neutral'}>
                      {corridor.risk}
                    </Badge>
                  </div>
                  <dl className="mt-3 grid gap-1.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="w-32 shrink-0 font-medium text-secondary-500">Slope movement</dt>
                      <dd className="text-secondary-800">{corridor.movement}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-32 shrink-0 font-medium text-secondary-500">Travel advisory</dt>
                      <dd className="text-secondary-800">{corridor.advisory}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </PortalPanel>
        </div>
      </div>
    </section>
  );
}
