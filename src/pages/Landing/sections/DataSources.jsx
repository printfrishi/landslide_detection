import {
  Activity,
  CloudRain,
  Database,
  Droplets,
  LineChart,
  MoveDiagonal,
  RadioTower,
  Satellite,
} from 'lucide-react';
import PortalPanel from './PortalPanel';
import SectionHeading from './SectionHeading';

const SOURCES = [
  { icon: CloudRain, title: 'Rainfall Monitoring', description: 'Tipping-bucket gauges report hourly and event rainfall against district thresholds.' },
  { icon: RadioTower, title: 'Ground Sensors', description: 'Field nodes on vulnerable slopes stream readings over the sensor network.' },
  { icon: Droplets, title: 'Soil Moisture', description: 'Sub-surface probes track saturation — a key precursor of shallow failures.' },
  { icon: MoveDiagonal, title: 'Slope Movement', description: 'Extensometers and tilt sensors measure displacement rates on active faces.' },
  { icon: Satellite, title: 'Satellite Data', description: 'Imagery supports terrain assessment and post-event damage review.' },
  { icon: Activity, title: 'Weather Information', description: 'Forecast feeds extend the warning lead time during wet spells.' },
  { icon: Database, title: 'Historical Landslide Data', description: 'Past events calibrate thresholds and susceptibility classes.' },
  { icon: LineChart, title: 'Geospatial Analysis', description: 'Terrain models combine every source into zone-level risk.' },
];

/** Institutional data-source cards feeding the monitoring pipeline. */
export default function DataSources() {
  return (
    <section id="data-sources" aria-labelledby="sources-heading" className="scroll-mt-24 bg-secondary-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="sources-heading"
          eyebrow="Monitoring Network"
          title="Sources of intelligence"
          description="Multiple independent observations reduce false alarms — no single sensor decides the zone risk."
          meta="This demonstration simulates all sources with sample monitoring data"
        />

        <div className="mt-10">
          <PortalPanel title="Data Sources & Monitoring Network" bodyClassName="p-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SOURCES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-lg border bg-secondary-50/60 p-4 transition-shadow hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0a2f5a]/10 text-[#0a2f5a]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#0a2f5a]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-secondary-600">{description}</p>
                </div>
              ))}
            </div>
          </PortalPanel>
        </div>
      </div>
    </section>
  );
}
