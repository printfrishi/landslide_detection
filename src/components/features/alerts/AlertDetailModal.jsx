import { MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/Dialog';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { RISK_LEVELS, riskLevelLabel } from '../../../constants/riskLevels';
import { formatDateTime } from '../../../utils/formatters';

/** Full alert detail dialog, with an acknowledge shortcut for new alerts. */
export default function AlertDetailModal({ alert, onClose, onAcknowledge }) {
  if (!alert) return null;
  const isUnacknowledged = !alert.acknowledged;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{alert.title}</DialogTitle>
          <DialogDescription>
            Raised {formatDateTime(alert.createdAt)} for {alert.zone}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={RISK_LEVELS[alert.riskLevel]?.variant ?? 'neutral'}>
            {riskLevelLabel(alert.riskLevel)} risk
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {alert.zone}
          </span>
          {isUnacknowledged ? (
            <Badge variant="warning">Unacknowledged</Badge>
          ) : (
            <Badge variant="secondary">Acknowledged</Badge>
          )}
        </div>
        <p className="text-sm leading-6 text-foreground">{alert.message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isUnacknowledged && (
            <Button onClick={() => onAcknowledge(alert)}>Acknowledge alert</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
