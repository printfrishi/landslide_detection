import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Crosshair } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import SectionHeading from './SectionHeading';
import { useToast } from '../../../context/ToastContext';
import { DISTRICTS, SEVERITY_STYLES } from './DemoData';
import { ROUTES } from '../../../constants/routes';

/**
 * Citizen service: check the current landslide risk for a district.
 * Results come from a local demo dataset; nothing is transmitted.
 */
export default function CheckYourArea() {
  const toast = useToast();
  const navigate = useNavigate();
  const [districtId, setDistrictId] = useState('tehri');
  const [place, setPlace] = useState('');
  const [located, setLocated] = useState(false);

  const district = DISTRICTS.find((item) => item.id === districtId) ?? DISTRICTS[1];
  const style = SEVERITY_STYLES[district.risk];

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setDistrictId('tehri');
        setLocated(true);
        toast.info('Nearest demo district selected: Tehri Garhwal (simulated).');
      },
      () => toast.error('Unable to read your location. Please select a district manually.'),
      { timeout: 8000 }
    );
  };

  const rows = [
    { label: 'Rainfall (24 h)', value: district.rainfall },
    { label: 'Soil moisture', value: district.soil },
    { label: 'Slope stability', value: district.slope },
    { label: 'Recent incidents', value: district.incidents },
  ];

  return (
    <section id="check-your-area" aria-labelledby="check-area-heading" className="scroll-mt-24 bg-secondary-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="check-area-heading"
          eyebrow="Citizen Service"
          title="Check landslide risk in your area"
          description="Select your district to see the current conditions and the advisory that applies to you."
          meta="Demonstration data — results are illustrative"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          {/* Query card */}
          <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="area-district">District</Label>
                <select
                  id="area-district"
                  value={districtId}
                  onChange={(event) => setDistrictId(event.target.value)}
                  className="mt-1.5 block h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {DISTRICTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="area-place">Location or landmark (optional)</Label>
                <input
                  id="area-place"
                  type="text"
                  value={place}
                  onChange={(event) => setPlace(event.target.value)}
                  placeholder="e.g. near Pratapnagar"
                  className="mt-1.5 block h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={handleLocate} className="flex-1">
                  <Crosshair aria-hidden="true" />
                  Use my location
                </Button>
                <Button type="button" onClick={() => navigate(ROUTES.MONITORING)} className="flex-1">
                  View Detailed Risk
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
              {located && (
                <p className="rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-800" role="status">
                  Location read successfully — matched to the nearest demo district.
                </p>
              )}
            </div>
          </div>

          {/* Result card */}
          <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-3" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">
                  Your area
                </p>
                <h3 className="text-xl font-bold text-[#0a2f5a]">
                  {district.name}
                  {place.trim() && <span className="text-secondary-500"> · near {place.trim()}</span>}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">
                  Current risk
                </p>
                <Badge variant={style.badge} className="mt-1 px-3 py-1 text-sm">
                  {district.riskLabel}
                </Badge>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-secondary-100 rounded-lg border">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="font-medium text-secondary-600">{row.label}</dt>
                  <dd className="text-right text-secondary-900">{row.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 rounded-md border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-semibold">Travel advisory: </span>
              {district.advisory}
            </p>
            <p className="mt-3 text-xs text-secondary-400">
              Sample data · Updated {district.updated} · Not a substitute for official instructions
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
