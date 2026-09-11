import { Download, FileText } from 'lucide-react';
import PortalPanel from './PortalPanel';
import SectionHeading from './SectionHeading';
import { useToast } from '../../../context/ToastContext';
import { DOCUMENTS } from './DemoData';

/** Reports & documents list with type, date and size metadata. */
export default function ReportsDocuments() {
  const toast = useToast();

  return (
    <section id="documents" aria-labelledby="documents-heading" className="scroll-mt-24 bg-secondary-50 pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="documents-heading"
          eyebrow="Resources"
          title="Reports & documents"
          meta="All documents are sample placeholders for this demonstration"
        />

        <div className="mt-8">
          <PortalPanel title="Document Repository" icon={FileText} bodyClassName="p-0">
            <ul className="divide-y divide-secondary-200">
              {DOCUMENTS.map((document) => (
                <li
                  key={document.title}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#0a2f5a]" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-secondary-900">{document.title}</p>
                      <p className="mt-0.5 text-xs text-secondary-500">
                        {document.type} · {document.date} · PDF · {document.size}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info('Downloads are disabled in this demo — the file is a placeholder.')}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border px-3.5 py-2 text-xs font-semibold text-[#0a2f5a] transition-colors hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </PortalPanel>
        </div>
      </div>
    </section>
  );
}
