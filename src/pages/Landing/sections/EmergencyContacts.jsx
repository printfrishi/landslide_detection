import { Ambulance, PhoneCall, ShieldAlert, Siren } from 'lucide-react';
import SectionHeading from './SectionHeading';

const CONTACTS = [
  { icon: Siren, label: 'National Emergency', number: '112', note: 'Police, fire & medical' },
  { icon: Ambulance, label: 'Ambulance', number: '108', note: 'State ambulance service' },
  { icon: PhoneCall, label: 'Police Control Room', number: '100', note: 'Traffic diversions & rescue' },
  { icon: ShieldAlert, label: 'District Emergency Operations Centre', number: '1070 (placeholder)', note: 'Verify locally before relying on it' },
];

/** Restrained emergency contact strip with call links. Numbers 112/108/100 are
    India's standard emergency lines; district numbers are placeholders. */
export default function EmergencyContacts() {
  return (
    <section id="emergency" aria-labelledby="emergency-heading" className="scroll-mt-24 bg-[#0a2f5a] py-14 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
            Emergency
          </p>
          <h2 id="emergency-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            In a life-threatening situation, call first
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Do not wait for an app during an active emergency. Standard Indian emergency lines are
            listed below; district-level numbers shown here are placeholders — verify them with your
            local administration.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACTS.map(({ icon: Icon, label, number, note }) => (
            <li key={label} className="rounded-xl border border-white/15 bg-white/5 p-5">
              <Icon className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <p className="mt-2.5 text-2xl font-extrabold tabular-nums tracking-tight">{number}</p>
              <p className="mt-0.5 text-sm font-medium text-white/90">{label}</p>
              <p className="mt-1 text-xs text-white/60">{note}</p>
              <a
                href={`tel:${number.replace(/[^0-9]/g, '') || '112'}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                Call
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
