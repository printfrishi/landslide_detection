import { MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { RISK_LEVELS, riskLevelLabel } from '../../../constants/riskLevels';
import { timeAgo } from '../../../utils/formatters';

/** One alert in the feed, with detail and acknowledge actions. */
export default function AlertCard({ alert, onView, onAcknowledge }) {
  const isUnacknowledged = !alert.acknowledged;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={RISK_LEVELS[alert.riskLevel]?.variant ?? 'neutral'}>
            {riskLevelLabel(alert.riskLevel)}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {alert.zone}
          </span>
          <span className="text-xs text-muted-foreground" title={alert.createdAt}>
            {timeAgo(alert.createdAt)}
          </span>
          {!isUnacknowledged && <Badge variant="secondary">Acknowledged</Badge>}
        </div>

        <h3 className="mt-3 text-base font-semibold">{alert.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{alert.message}</p>
      </CardContent>
      <CardFooter className="gap-2 border-t py-3">
        <Button variant="ghost" size="sm" onClick={() => onView(alert)}>
          View details
        </Button>
        {isUnacknowledged && (
          <Button size="sm" onClick={() => onAcknowledge(alert)}>
            Acknowledge
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
