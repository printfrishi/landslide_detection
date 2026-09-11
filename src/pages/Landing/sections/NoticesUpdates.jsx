import { ArrowUpRight, FileText, Megaphone } from 'lucide-react';
import PortalPanel from './PortalPanel';
import SectionHeading from './SectionHeading';
import { useToast } from '../../../context/ToastContext';
import { NOTICES } from './DemoData';

/** Government-style notices list + auto-scrolling "What's New" box. */
export default function NoticesUpdates() {
  const toast = useToast();

  return (
    <section id="notices" aria-labelledby="notices-heading" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="notices-heading"
          eyebrow="Notice Board"
          title="Latest updates & notices"
          description="Official-style communications from the monitoring cell."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <PortalPanel title="What's New" icon={Megaphone}>
            <div className="notices-pause h-48 overflow-hidden">
              <ul className="animate-notices motion-reduce:animate-none">
                {[...NOTICES, ...NOTICES, ...NOTICES, ...NOTICES].map((notice, index) => (
                  <li
                    key={`${notice.title}-${index}`}
                    aria-hidden={index >= NOTICES.length * 2}
                    className="border-b border-dashed border-secondary-200 px-1 py-2.5 text-sm"
                  >
                    <span className="mr-2 inline-flex items-center rounded bg-red-600 px-1.5 py-0.5 align-middle text-[9px] font-bold uppercase text-white">
                      New
                    </span>
                    <span className="text-secondary-700">{notice.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </PortalPanel>

          <PortalPanel title="Notices & Orders" icon={FileText} bodyClassName="p-0">
            <ul className="divide-y divide-secondary-200">
              {NOTICES.map((notice) => (
                <li key={notice.title}>
                  <div className="flex items-start gap-4 p-4">
                    <div className="w-20 shrink-0 rounded-md bg-secondary-100 py-2 text-center">
                      <p className="text-lg font-extrabold leading-none text-[#0a2f5a]">
                        {notice.date.split(' ')[0]}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-500">
                        {notice.date.split(' ').slice(1).join(' ')}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                        {notice.category}
                      </p>
                      <h4 className="mt-1 text-sm font-semibold text-secondary-900">{notice.title}</h4>
                      <p className="mt-0.5 text-xs text-secondary-500">{notice.authority}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info('Notice contents are not included in this demo.')}
                      className="inline-flex shrink-0 items-center gap-1 self-center rounded text-sm font-semibold text-primary-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      View
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </PortalPanel>
        </div>
      </div>
    </section>
  );
}
