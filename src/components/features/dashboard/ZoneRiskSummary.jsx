import { Badge } from '../../ui/Badge';
import { RISK_LEVELS, riskLevelLabel } from '../../../constants/riskLevels';

/**
 * Per-zone risk summary rows. `zones` is [{ zone, riskLevel, total }] with
 * riskLevel being the most severe reading in that zone.
 */
export default function ZoneRiskSummary({ zones }) {
  return (
    <ul className="divide-y divide-border">
      {zones.map(({ zone, riskLevel, total }) => (
        <li key={zone} className="flex items-center justify-between gap-3 px-6 py-3.5">
          <div>
            <p className="text-sm font-medium">{zone}</p>
            <p className="text-xs text-muted-foreground">
              {total} sensor{total === 1 ? '' : 's'} deployed
            </p>
          </div>
          <Badge variant={RISK_LEVELS[riskLevel]?.variant ?? 'neutral'}>
            {riskLevelLabel(riskLevel)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
