import { Badge } from '../../../components/ui/Badge';
import useNow from './useNow';
import { SEVERITY_STYLES } from './DemoData';

const LEVELS = ['NORMAL', 'MONITORING', 'WATCH', 'WARNING', 'CRITICAL'];
const CURRENT = 'WATCH';

const LEVEL_NOTES = {
  NORMAL: 'No significant conditions reported.',
  MONITORING: 'Routine surveillance across all stations.',
  WATCH: 'Elevated conditions detected in selected districts.',
  WARNING: 'Potential hazard detected — restrictions possible.',
  CRITICAL: 'Immediate attention required.',
};

/** Current regional risk status with the government warning-level hierarchy. */
export default function RegionalStatus() {
  const now = useNow(30000);
  const style = SEVERITY_STYLES[CURRENT];

  return (
    <section id="regional-status" aria-labelledby="regional-status-heading" className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-xl border-l-4 border-amber-400 bg-secondary-50 p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary-500">
              Current regional status
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-lg font-extrabold tracking-wide text-white ${style.bar}`}
              >
                {CURRENT}
              </span>
              <p className="max-w-xl text-sm text-secondary-700">{LEVEL_NOTES[CURRENT]}</p>
            </div>
            <p className="mt-2 text-xs text-secondary-400">
              Regional aggregate · Last updated{' '}
              {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · Demo data
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
              Warning levels
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Warning level scale">
              {LEVELS.map((level) => (
                <li key={level}>
                  <Badge variant={level === CURRENT ? SEVERITY_STYLES[level].badge : 'neutral'}>
                    {level === CURRENT && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
                    {level}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
