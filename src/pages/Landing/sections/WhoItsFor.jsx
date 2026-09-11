import { Building2, Bus, Users } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';

const AUDIENCES = [
  {
    icon: Building2,
    title: 'Disaster management authorities',
    description:
      'A single operating picture of zone risk across your district, with alerts your teams can acknowledge and act on.',
  },
  {
    icon: Bus,
    title: 'Mountain & road corridor operators',
    description:
      'Know which stretches are at risk before dispatching vehicles or reopening routes after heavy rain.',
  },
  {
    icon: Users,
    title: 'Local communities & panchayats',
    description:
      'Clear, color-coded warnings in plain language — no technical interpretation required.',
  },
];

/** Three wide audience cards. */
export default function WhoItsFor() {
  return (
    <section aria-labelledby="audience-heading" className="bg-white pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="audience-heading" className="text-3xl font-extrabold tracking-tight text-secondary-900">
            Built for the people who respond
          </h2>
          <p className="mt-3 text-lg text-secondary-600">
            HimRakshak is designed for the teams and communities that live with mountain risk.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-secondary-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-secondary-600">{description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
