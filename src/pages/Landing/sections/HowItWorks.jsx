import { BellRing, Radar, SearchCheck, Radio } from 'lucide-react';
import SectionHeading from './SectionHeading';

const STEPS = [
  {
    number: '01',
    icon: Radio,
    title: 'Monitor',
    description: 'Sensors, rainfall and environmental data continuously monitored.',
  },
  {
    number: '02',
    icon: Radar,
    title: 'Analyze',
    description: 'Geospatial and scientific models assess slope instability.',
  },
  {
    number: '03',
    icon: SearchCheck,
    title: 'Detect',
    description: 'Potential landslide risks and abnormal conditions identified.',
  },
  {
    number: '04',
    icon: BellRing,
    title: 'Alert',
    description: 'Warnings and advisories delivered to authorities and citizens.',
  },
];

/** "How HimRakshak protects communities" — the four-stage early-warning pipeline. */
export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="how-heading"
          center
          eyebrow="Early Warning System"
          title="How HimRakshak protects communities"
          description="One pipeline, four stages — designed so nothing is lost between a sensor reading and a decision on the ground."
        />

        <div className="relative mt-14">
          <div
            className="absolute inset-x-16 top-8 hidden border-t-2 border-dashed border-primary-200 lg:block"
            aria-hidden="true"
          />
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.number} className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <step.icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0a2f5a] text-[11px] font-bold text-white shadow">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-bold uppercase tracking-wider text-[#0a2f5a]">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-secondary-600">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
