import { BellRing, MapPinned, RadioTower, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import useFetch from '../../hooks/useFetch';
import sensorService from '../../services/sensorService';
import alertService from '../../services/alertService';
import StatCard from '../../components/features/dashboard/StatCard';
import ZoneRiskSummary from '../../components/features/dashboard/ZoneRiskSummary';
import ActiveAlertsList from '../../components/features/dashboard/ActiveAlertsList';
import SensorStatusSummary from '../../components/features/dashboard/SensorStatusSummary';
import Skeleton from '../../components/ui/Skeleton';
import ErrorMessage from '../../components/ui/ErrorMessage';
import {
  Card,
  CardContent,
  CardHeader,
} from '../../components/ui/Card';
import {
  HIGH_RISK_THRESHOLD,
  RISK_LEVELS,
  highestRiskLevel,
} from '../../constants/riskLevels';

/** Overview: KPI stat cards, zone risk summary, active alerts, sensor status. */
export default function Dashboard() {
  const sensorsQuery = useFetch(() => sensorService.getSensors(), []);
  const alertsQuery = useFetch(() => alertService.getAlerts(), []);

  const isLoading = sensorsQuery.isLoading || alertsQuery.isLoading;
  const error = sensorsQuery.error ?? alertsQuery.error;

  const stats = useMemo(() => {
    const sensors = sensorsQuery.data ?? [];
    const alerts = alertsQuery.data ?? [];

    const byZone = new Map();
    for (const sensor of sensors) {
      if (!byZone.has(sensor.zone)) byZone.set(sensor.zone, []);
      byZone.get(sensor.zone).push(sensor.riskLevel);
    }
    const zones = [...byZone.entries()]
      .map(([zone, levels]) => ({
        zone,
        riskLevel: highestRiskLevel(levels),
        total: levels.length,
      }))
      .sort((a, b) => a.zone.localeCompare(b.zone));

    return {
      activeSensors: sensors.filter((sensor) => sensor.status === 'online').length,
      totalSensors: sensors.length,
      highRiskZones: zones.filter((zone) => RISK_LEVELS[zone.riskLevel].rank >= HIGH_RISK_THRESHOLD)
        .length,
      unacknowledged: alerts.filter((alert) => !alert.acknowledged).length,
      zones,
      sensors,
      alerts,
    };
  }, [sensorsQuery.data, alertsQuery.data]);

  const refetchAll = () => {
    sensorsQuery.refetch();
    alertsQuery.refetch();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live overview of sensor health and zone risk across monitored areas.
          </p>
        </div>

        <Link
          to="/map"
          className="inline-flex items-center gap-2 rounded-md bg-[#0a2f5a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#134b8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MapPinned className="h-4 w-4" aria-hidden="true" />
          Open Risk Map
        </Link>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : error ? (
        <ErrorMessage
          title="Could not load the dashboard"
          message="We couldn't reach the sensor and alert services. Check your connection and try again."
          onRetry={refetchAll}
          className="mt-6"
        />
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Active sensors"
              value={stats.activeSensors}
              hint={`of ${stats.totalSensors} deployed`}
              icon={RadioTower}
              tone="primary"
            />
            <StatCard
              label="High-risk zones"
              value={stats.highRiskZones}
              hint="risk level High or above"
              icon={TriangleAlert}
              tone="danger"
            />
            <StatCard
              label="Unacknowledged alerts"
              value={stats.unacknowledged}
              hint="need a response team"
              icon={BellRing}
              tone="warning"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ActiveAlertsList alerts={stats.alerts} />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <h2 className="text-base font-semibold leading-none tracking-tight">
                      Zone risk summary
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Most severe reading per zone
                    </p>
                  </div>
                  <Link
                    to="/map"
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0a2f5a] underline-offset-2 hover:underline"
                  >
                    <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
                    View on map
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  <ZoneRiskSummary zones={stats.zones} />
                </CardContent>
              </Card>
              <SensorStatusSummary sensors={stats.sensors} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-6 space-y-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Card key={index}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div className="divide-y divide-border border-t">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-3 px-6 py-4">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          {[0, 1].map((index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-44" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center justify-between px-6 py-3.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}