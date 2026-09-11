import { ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import PortalPanel from './PortalPanel';
import SectionHeading from './SectionHeading';
import { useToast } from '../../../context/ToastContext';
import { DISTRICTS, SEVERITY_STYLES } from './DemoData';

/** District-wise monitoring status as an accessible government table. */
export default function DistrictStatus() {
  const toast = useToast();

  return (
    <section id="district-status" aria-labelledby="district-heading" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="district-heading"
          eyebrow="Regional Overview"
          title="District-wise landslide risk status"
          meta="Sample data · risk levels shown for five demo districts"
        />

        <div className="mt-8">
          <PortalPanel
            title="Risk Registry"
            action={
              <button
                type="button"
                onClick={() => toast.info('The full district registry is not part of this demo.')}
                className="inline-flex items-center gap-1 rounded-md border border-white/40 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                View All Districts
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <caption className="sr-only">
                  District-wise landslide risk status with active alerts and last updated time
                </caption>
                <thead>
                  <tr className="border-b bg-secondary-100 text-xs uppercase tracking-wider text-secondary-600">
                    <th scope="col" className="px-5 py-3 font-semibold">District</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Risk</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Active alerts</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Last updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {DISTRICTS.map((district) => (
                    <tr key={district.id} className="transition-colors hover:bg-secondary-50">
                      <th scope="row" className="px-5 py-3.5 font-semibold text-[#0a2f5a]">
                        {district.name}
                      </th>
                      <td className="px-5 py-3.5">
                        <Badge variant={SEVERITY_STYLES[district.risk]?.badge ?? 'neutral'}>
                          {district.riskLabel}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-secondary-800">{district.alerts}</td>
                      <td className="px-5 py-3.5 tabular-nums text-secondary-600">{district.updated} IST</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PortalPanel>
        </div>
      </div>
    </section>
  );
}
