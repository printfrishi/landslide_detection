import { useState } from 'react';
import { BellRing, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import SectionHeading from './SectionHeading';
import { DISTRICTS } from './DemoData';

const CHANNELS = ['SMS', 'Email', 'Push notification'];

/** Citizen alert subscription. Demo only — preferences are not persisted. */
export default function AlertSubscription() {
  const [district, setDistrict] = useState('Tehri Garhwal');
  const [channel, setChannel] = useState('SMS');
  const [address, setAddress] = useState('');
  const [types, setTypes] = useState({ warning: true, critical: true, advisory: false });
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const toggleType = (key) => setTypes((current) => ({ ...current, [key]: !current[key] }));

  const handleSubscribe = () => {
    if (!address.trim()) {
      setError(channel === 'Email' ? 'Enter an email address.' : 'Enter a mobile number.');
      return;
    }
    setDone(true);
  };

  const inputClasses =
    'mt-1.5 block h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <section id="subscribe" aria-labelledby="subscribe-heading" className="scroll-mt-24 bg-white pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border-t-2 border-amber-400 bg-secondary-50 p-6 shadow-sm sm:p-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                id="subscribe-heading"
                eyebrow="Stay Informed"
                title="Get alerts for your area"
                description="Choose your district and how you want to be notified when conditions change."
              />
              <p className="mt-6 text-xs text-secondary-400">
                Demonstration only — subscription preferences are not stored or sent anywhere.
              </p>
            </div>

            {done ? (
              <div className="flex items-start gap-3 rounded-xl border bg-white p-6 shadow-sm" role="status">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
                <div>
                  <p className="font-bold text-[#0a2f5a]">Subscription confirmed (demo)</p>
                  <p className="mt-1 text-sm text-secondary-600">
                    {channel} alerts for <strong>{district}</strong> would be sent to{' '}
                    <span className="font-medium">{address}</span>.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setDone(false)}>
                    Modify subscription
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="sub-district">District</Label>
                    <select id="sub-district" value={district} onChange={(event) => setDistrict(event.target.value)} className={inputClasses}>
                      {DISTRICTS.map((item) => (
                        <option key={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="sub-channel">Notify me by</Label>
                    <select id="sub-channel" value={channel} onChange={(event) => setChannel(event.target.value)} className={inputClasses}>
                      {CHANNELS.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      id="sub-address"
                      label={channel === 'Email' ? 'Email address' : 'Mobile number'}
                      type={channel === 'Email' ? 'email' : 'tel'}
                      placeholder={channel === 'Email' ? 'you@example.com' : '+91 XXXXX XXXXX'}
                      value={address}
                      onChange={(event) => {
                        setAddress(event.target.value);
                        setError(null);
                      }}
                      error={error}
                    />
                  </div>
                </div>

                <fieldset className="mt-4">
                  <legend className="text-sm font-medium text-secondary-700">Alert types</legend>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {[
                      { key: 'advisory', label: 'Advisory & above' },
                      { key: 'warning', label: 'Warning' },
                      { key: 'critical', label: 'Critical only' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-secondary-700">
                        <input
                          type="checkbox"
                          checked={types[key]}
                          onChange={() => toggleType(key)}
                          className="h-4 w-4 rounded border-secondary-300 text-primary-700 focus:ring-ring"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Button className="mt-5 w-full sm:w-auto" onClick={handleSubscribe}>
                  <BellRing aria-hidden="true" />
                  Subscribe to Alerts
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
