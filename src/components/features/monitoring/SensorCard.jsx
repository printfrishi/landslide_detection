import { Activity, CloudRain, Droplets, MapPin, Waves } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { RISK_LEVELS, riskLevelLabel } from '../../../constants/riskLevels';
import {
  SENSOR_STATUS_VARIANTS,
  SENSOR_STATUS_LABELS,
  SENSOR_TYPE_LABELS,
} from '../../../constants/sensors';
import { sensorTrend } from './telemetryData';
import { timeAgo } from '../../../utils/formatters';

const TYPE_ICONS = {
  rainfall: CloudRain,
  'soil-moisture': Droplets,
  movement: Activity,
  groundwater: Waves,
};

/** Tile describing one field sensor: reading, 24 h sparkline, risk, status. */
export default function SensorCard({ sensor }) {
  const TypeIcon = TYPE_ICONS[sensor.type] ?? Activity;
  const trend = sensorTrend(sensor);
  const sparkW = 96;
  const sparkH = 30;
  const lo = Math.min(...trend.points);
  const hi = Math.max(...trend.points);
  const span = hi - lo || 1;
  const sparkPath = trend.points
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / (trend.points.length - 1)) * sparkW).toFixed(1)},${(sparkH - ((v - lo) / span) * (sparkH - 4) - 2).toFixed(1)}`)
    .join(' ');

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex-1 pt-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <TypeIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{sensor.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {sensor.zone} · {SENSOR_TYPE_LABELS[sensor.type] ?? sensor.type}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="truncate">
            <span className="text-2xl font-semibold tabular-nums tracking-tight">
              {sensor.lastReading}
            </span>{' '}
            <span className="text-sm text-muted-foreground">{sensor.unit}</span>
          </p>
          <Badge variant={RISK_LEVELS[sensor.riskLevel]?.variant ?? 'neutral'}>
            {riskLevelLabel(sensor.riskLevel)}
          </Badge>
        </div>

        {/* 24 h sparkline */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2">
          <svg viewBox={`0 0 ${sparkW} ${sparkH}`} className="h-7 w-24" role="img" aria-label={`24 hour trend for ${sensor.name}`}>
            <path d={sparkPath} fill="none" stroke="#0a2f5a" strokeWidth="1.8" strokeLinecap="round" />
            <circle
              cx={sparkW}
              cy={(sparkH - ((trend.points[trend.points.length - 1] - lo) / span) * (sparkH - 4) - 2).toFixed(1)}
              r="2.5"
              fill="#f59e0b"
            />
          </svg>
          <p className="text-[11px] text-muted-foreground">
            24 h{' '}
            <span
              className={`font-semibold ${
                trend.direction === 'up' ? 'text-red-600' : trend.direction === 'down' ? 'text-emerald-600' : 'text-secondary-600'
              }`}
            >
              {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '■'} {trend.changePct}%
            </span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t py-3">
        <Badge variant={SENSOR_STATUS_VARIANTS[sensor.status] ?? 'neutral'}>
          {SENSOR_STATUS_LABELS[sensor.status] ?? sensor.status}
        </Badge>
        <p className="text-xs text-muted-foreground">Updated {timeAgo(sensor.updatedAt)}</p>
      </CardFooter>
    </Card>
  );
}

