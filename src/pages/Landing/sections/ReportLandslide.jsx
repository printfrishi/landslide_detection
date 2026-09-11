import { useState } from 'react';
import { CheckCircle2, FileText, Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import SectionHeading from './SectionHeading';
import { DISTRICTS } from './DemoData';

const HAZARD_TYPES = ['Landslide', 'Rockfall', 'Road blockage', 'Cracks in ground', 'Slope movement', 'Other hazard'];

/**
 * Citizen incident reporting form. Demo only — submissions are validated
 * locally and never transmitted anywhere.
 */
export default function ReportLandslide() {
  const [values, setValues] = useState({
    type: 'Landslide',
    district: 'Tehri Garhwal',
    location: '',
    description: '',
    datetime: '',
    contact: '',
  });
  const [errors, setErrors] = useState({});
  const [reference, setReference] = useState(null);

  const setValue = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: null }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {
      location: values.location.trim() ? null : 'Location is required.',
      description:
        values.description.trim().length >= 10
          ? null
          : 'Please describe the hazard in at least 10 characters.',
    };
    if (nextErrors.location || nextErrors.description) {
      setErrors(nextErrors);
      return;
    }
    const id = `HR-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    setReference(id);
  };

  const inputClasses =
    'mt-1.5 block h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

  if (reference) {
    return (
      <section id="report-landslide" aria-labelledby="report-heading" className="scroll-mt-24 bg-secondary-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm" role="status">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
            <h3 className="mt-4 text-xl font-bold text-[#0a2f5a]">Report recorded</h3>
            <p className="mt-2 text-sm text-secondary-600">
              Your report has been logged locally with reference{' '}
              <span className="font-mono font-bold text-secondary-900">{reference}</span>.
            </p>
            <p className="mt-2 text-xs text-secondary-400">
              Demonstration only — nothing was transmitted. In a real incident, always call 112.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => setReference(null)}>
              File another report
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="report-landslide" aria-labelledby="report-heading" className="scroll-mt-24 bg-secondary-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SectionHeading
              id="report-heading"
              eyebrow="Citizen Service"
              title="Report a landslide"
              description="Seen a landslide, rockfall or new cracks? Report it here so monitoring teams can verify the site."
            />
            <ul className="mt-6 space-y-2 text-sm text-secondary-600">
              {HAZARD_TYPES.map((type) => (
                <li key={type} className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-700" aria-hidden="true" />
                  {type}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-md border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800">
              For life-threatening emergencies, call <strong>112</strong> immediately. This form is
              for non-emergency reporting.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="report-type">Hazard type</Label>
                <select id="report-type" value={values.type} onChange={setValue('type')} className={inputClasses}>
                  {HAZARD_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="report-district">District</Label>
                <select id="report-district" value={values.district} onChange={setValue('district')} className={inputClasses}>
                  {DISTRICTS.map((district) => (
                    <option key={district.id}>{district.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Input
                  id="report-location"
                  label="Location"
                  placeholder="e.g. 2 km from Narendra Nagar on SH-62"
                  value={values.location}
                  onChange={setValue('location')}
                  error={errors.location}
                />
              </div>
              <div>
                <Label htmlFor="report-datetime">Date &amp; time observed</Label>
                <input
                  id="report-datetime"
                  type="datetime-local"
                  value={values.datetime}
                  onChange={setValue('datetime')}
                  className={inputClasses}
                />
              </div>
              <div>
                <Input
                  id="report-contact"
                  label="Contact (optional)"
                  placeholder="Phone or email"
                  value={values.contact}
                  onChange={setValue('contact')}
                  hint="Only used if verification is needed."
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="report-description">Description</Label>
                <textarea
                  id="report-description"
                  rows="4"
                  value={values.description}
                  onChange={setValue('description')}
                  placeholder="Describe what you saw — size, slope, proximity to the road, water seepage…"
                  aria-invalid={errors.description ? true : undefined}
                  className={`mt-1.5 block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.description ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.description && <p className="mt-1.5 text-sm text-destructive">{errors.description}</p>}
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-xs text-secondary-400">Demonstration form — reports are not transmitted.</p>
              <Button type="submit">
                <Send aria-hidden="true" />
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
