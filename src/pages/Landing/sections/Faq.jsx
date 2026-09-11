import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'How does HimRakshak detect landslide risk?',
    answer:
      'Field sensors stream rainfall, soil moisture and movement readings that are fused into a single color-coded risk level per zone. When readings cross configured thresholds, an alert is raised on the dashboard and in the alert feed.',
  },
  {
    question: 'What happens when a sensor goes offline?',
    answer:
      'The device is flagged on the monitoring page so teams can schedule maintenance. Neighbouring sensors continue to cover the zone, and risk levels are recalculated from the remaining live readings.',
  },
  {
    question: 'Who receives the alerts?',
    answer:
      'Everyone with an account on this deployment sees the shared alert feed. Response teams acknowledge alerts from the alerts page, and each acknowledgement is recorded so the whole team can see who handled what.',
  },
  {
    question: 'Is my region covered?',
    answer:
      'This demo ships with three mock zones (A, B and C). The frontend is built to be pointed at a real sensor network later, so additional zones can be added without changing the interface.',
  },
];

/** Accessible FAQ using native details/summary elements. */
export default function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="bg-secondary-50 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight text-secondary-900">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-lg text-secondary-600">
            Straight answers about how the system works today.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {FAQS.map(({ question, answer }) => (
            <details key={question} className="group rounded-xl border bg-white">
              <summary className="flex cursor-pointer select-none items-center justify-between gap-4 p-4 font-medium text-secondary-900 [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-secondary-500 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-4 pb-4 text-sm leading-6 text-secondary-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
