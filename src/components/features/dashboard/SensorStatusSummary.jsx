import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/Card';
import { SENSOR_STATUSES, SENSOR_STATUS_LABELS } from '../../../constants/sensors';

const DOT_CLASSES = {
  online: 'bg-emerald-500',
  maintenance: 'bg-amber-500',
  offline: 'bg-destructive',
};

/** Card counting sensors by status (online / maintenance / offline). */
export default function SensorStatusSummary({ sensors }) {
  const counts = SENSOR_STATUSES.map(({ value }) => ({
    value,
    total: sensors.filter((sensor) => sensor.status === value).length,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensor status</CardTitle>
        <CardDescription>Fleet health at a glance</CardDescription>
      </CardHeader>
      <ul className="divide-y divide-border">
        {counts.map(({ value, total }) => (
          <li key={value} className="flex items-center justify-between px-6 py-3.5">
            <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span
                className={`h-2.5 w-2.5 rounded-full ${DOT_CLASSES[value]}`}
                aria-hidden="true"
              />
              {SENSOR_STATUS_LABELS[value]}
            </span>
            <span className="text-sm font-semibold tabular-nums">{total}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
