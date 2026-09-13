import { FileText } from 'lucide-react';
import SectionHeading from './SectionHeading';
import CitizenReportForm from '../../../components/CitizenReportForm';

const HAZARD_TYPES = ['Landslide', 'Rockfall', 'Road blockage', 'Cracks in ground', 'Slope movement', 'Other hazard'];

/**
 * Citizen reporting section — live camera capture, auto-detected location and
 * auto-filled reporter identity, posted to /api/citizen-reports. Positioned
 * prominently near the end of the page (above the emergency band / footer).
 */
export default function ReportLandslide() {
  return (
    <section id="report-landslide" aria-labelledby="report-heading" className="scroll-mt-24 bg-secondary-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SectionHeading
              id="report-heading"
              eyebrow="Citizen Service"
              title="Report a landslide"
              description="Seen a landslide, rockfall or new cracks? Capture a live photo on the spot — your location is detected automatically and monitoring teams verify every report."
            />

            <p className="mt-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900">
              📸 Live photo capture only — no upload feature. 📍 Location will be auto-detected.
            </p>

            <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-secondary-500">
              What you can report
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-secondary-600">
              {HAZARD_TYPES.map((type) => (
                <li key={type} className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-700" aria-hidden="true" />
                  {type}
                </li>
              ))}
            </ul>

            <p className="mt-8 rounded-md border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800">
              For life-threatening emergencies, call <strong>112</strong> immediately. This form is
              for non-emergency reporting.
            </p>
          </div>

          <div className="lg:col-span-3">
            <CitizenReportForm />
          </div>
        </div>
      </div>
    </section>
  );
}
