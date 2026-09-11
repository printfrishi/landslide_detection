import { Link } from 'react-router-dom';
import { ArrowRight, Clock, ShieldCheck, Siren } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import PortalPanel from './PortalPanel';
import SectionHeading from './SectionHeading';
import { ACTIVE_ALERTS } from './DemoData';
import { ROUTES } from '../../../constants/routes';

/** Active landslide alerts with severity hierarchy and recommended actions. */
export default function ActiveAlertsPanel() {
  return (
    <section id="active-alerts" aria-labelledby="alerts-heading" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            id="alerts-heading"
            eyebrow="Landslide Alerts"
            title="Active landslide alerts"
            description="Every alert carries its severity, confidence and a recommended action. Acknowledgement is recorded in the operator console."
            meta="Sample alerts — demo data"
          />
          <Button to={ROUTES.ALERTS} variant="outline" className="shrink-0 self-start sm:self-auto">
            Open full alert feed
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-10">
          <PortalPanel title="Current Alert Situation" icon={Siren} bodyClassName="p-5">
            <div className="grid gap-6 lg:grid-cols-3">
              {ACTIVE_ALERTS.map((alert) => (
                <article
                  key={alert.severity + alert.location}
                  className={`flex h-full flex-col rounded-lg border-l-4 bg-white p-5 shadow-sm ring-1 ring-secondary-200 ${
                    alert.severity === 'HIGH'
                      ? 'border-red-600'
                      : alert.severity === 'MODERATE'
                        ? 'border-amber-400'
                        : 'border-sky-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={alert.badge}>{alert.severity} ALERT</Badge>
                    <span className="flex items-center gap-1.5 text-xs text-secondary-500">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {alert.time}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[#0a2f5a]">{alert.location}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-secondary-600">{alert.message}</p>
                  <p className="mt-3 rounded-md bg-secondary-50 px-3 py-2 text-xs text-secondary-700">
                    <span className="font-semibold text-secondary-900">Recommended action: </span>
                    {alert.action}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="flex items-center gap-1.5 text-xs text-secondary-500">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {alert.confidence}
                    </span>
                    <Link
                      to={ROUTES.ALERTS}
                      className="inline-flex items-center gap-1 rounded text-sm font-semibold text-primary-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      View Alert
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </PortalPanel>
        </div>
      </div>
    </section>
  );
}
