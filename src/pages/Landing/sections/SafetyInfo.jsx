import { BookOpenCheck, CarFront, CloudRain, Home, PhoneCall, ShieldAlert, TriangleAlert } from 'lucide-react';
import PortalPanel from './PortalPanel';
import SectionHeading from './SectionHeading';

const TOPICS = [
  {
    icon: Home,
    title: 'Before a landslide',
    points: ['Know your zone risk and nearest shelter.', 'Keep emergency supplies and documents ready.'],
  },
  {
    icon: TriangleAlert,
    title: 'During a landslide',
    points: ['Move uphill or away from the slope path.', 'Do not return for belongings.'],
  },
  {
    icon: BookOpenCheck,
    title: 'After a landslide',
    points: ['Stay clear of weakened slopes and debris.', 'Report damage and blocked routes promptly.'],
  },
  {
    icon: CarFront,
    title: 'Travel safety',
    points: ['Do not stop your vehicle near unstable slopes during heavy rainfall.', 'Follow diversions without argument.'],
  },
  {
    icon: CloudRain,
    title: 'Monsoon safety',
    points: ['Expect rapid changes in hill conditions.', 'Avoid night travel on identified corridors.'],
  },
  {
    icon: PhoneCall,
    title: 'Emergency contacts',
    points: ['Emergency: 112 · Ambulance: 108', 'Verify district control-room numbers locally.'],
  },
];

/** Plain-language landslide safety guidance. */
export default function SafetyInfo() {
  return (
    <section id="safety" aria-labelledby="safety-heading" className="scroll-mt-24 bg-secondary-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="safety-heading"
          eyebrow="Public Safety"
          title="Landslide safety"
          description="Clear guidance for before, during and after a landslide. Share it with your family and community."
        />

        <div className="mt-10">
          <PortalPanel title="Safety Guidelines" icon={BookOpenCheck} bodyClassName="p-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TOPICS.map(({ icon: Icon, title, points }) => (
                <div key={title} className="rounded-lg border bg-secondary-50/60 p-4">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-5 w-5 text-primary-700" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-[#0a2f5a]">{title}</h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-secondary-600">
                    {points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </PortalPanel>
        </div>
      </div>
    </section>
  );
}
