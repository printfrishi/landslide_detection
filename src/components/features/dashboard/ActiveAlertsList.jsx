import { Link } from 'react-router-dom';
import { ArrowRight, CircleCheck, MapPin } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import EmptyState from '../../ui/EmptyState';
import { ROUTES } from '../../../constants/routes';
import { RISK_LEVELS, riskLevelLabel } from '../../../constants/riskLevels';
import { timeAgo } from '../../../utils/formatters';

/** Card listing currently unacknowledged alerts, newest first. */
export default function ActiveAlertsList({ alerts }) {
  const active = alerts.filter((alert) => !alert.acknowledged);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Active alerts</CardTitle>
          <CardDescription>Alerts awaiting acknowledgement</CardDescription>
        </div>
        {active.length > 0 ? (
          <Badge variant="destructive">{active.length}</Badge>
        ) : (
          <Badge variant="success">Clear</Badge>
        )}
      </CardHeader>
      {active.length === 0 ? (
        <CardContent className="flex-1">
          <EmptyState
            icon={CircleCheck}
            title="No active alerts"
            description="All zones are currently calm. New warnings will appear here as sensors raise them."
            className="border-0 p-0"
          />
        </CardContent>
      ) : (
        <>
          <CardContent className="flex-1 px-0 pt-0">
            <ul className="divide-y divide-border border-t">
              {active.map((alert) => (
                <li key={alert.id} className="flex items-start gap-3 px-6 py-4">
                  <Badge variant={RISK_LEVELS[alert.riskLevel]?.variant ?? 'neutral'}>
                    {riskLevelLabel(alert.riskLevel)}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{alert.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {alert.zone}
                      <span aria-hidden="true">·</span>
                      {timeAgo(alert.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t py-3">
            <Link
              to={ROUTES.ALERTS}
              className="inline-flex items-center gap-1 rounded text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View all alerts
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
