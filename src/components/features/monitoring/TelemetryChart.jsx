import { useId } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { cn } from '../../../lib/utils';

const W = 320;
const H = 150;
const PAD = { l: 34, r: 10, t: 12, b: 20 };

const timeLabel = (date) =>
  date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

/**
 * Live telemetry chart plotting REAL polled readings ({t: Date, v: number}).
 * With fewer than two points it shows a collecting placeholder instead of
 * inventing history. Threshold renders as a red dashed line when in range.
 */
export default function TelemetryChart({ title, unit, color, threshold, points = [] }) {
  const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const values = points.map((point) => point.v);
  const hasSeries = values.length >= 2;
  const last = values.length > 0 ? values[values.length - 1] : null;

  let yMin = 0;
  let yMax = 1;
  if (hasSeries) {
    const lo = Math.min(...values, threshold ?? Infinity);
    const hi = Math.max(...values, threshold ?? -Infinity);
    const span = (hi - lo) * 0.12 || 1;
    yMin = lo - span;
    yMax = hi + span;
  }

  const x = (i) => PAD.l + (i / Math.max(values.length - 1, 1)) * (W - PAD.l - PAD.r);
  const y = (v) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

  const linePath = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(point.v).toFixed(1)}`)
    .join(' ');
  const areaPath = hasSeries
    ? `${linePath} L${x(points.length - 1).toFixed(1)},${(H - PAD.b).toFixed(1)} L${PAD.l},${(H - PAD.b).toFixed(1)} Z`
    : '';

  const delta = hasSeries ? last - values[0] : 0;
  const TrendIcon = delta >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#0a2f5a]">
            {title} <span className="font-medium text-secondary-400">({unit})</span>
          </h3>
          <p className="mt-0.5 truncate text-xs text-secondary-500">
            {points.length > 0
              ? `${points.length} live reading${points.length === 1 ? '' : 's'} collected`
              : 'Waiting for the first reading'}
          </p>
        </div>
        <Badge variant="success">Live</Badge>
      </div>

      <div className="px-4 pt-3">
        <div className="flex items-end justify-between">
          <p className="text-2xl font-extrabold tabular-nums tracking-tight text-secondary-900">
            {last === null ? '—' : last}
            <span className="ml-1 text-sm font-medium text-secondary-500">{unit}</span>
          </p>
          {hasSeries && (
            <span
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                delta >= 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {delta >= 0 ? '+' : ''}
              {delta.toFixed(1)} {unit} since first
            </span>
          )}
        </div>

        {hasSeries ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`${title} live readings, currently ${last} ${unit}`}>
            <defs>
              <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((fraction) => {
              const gy = PAD.t + fraction * (H - PAD.t - PAD.b);
              const value = yMax - fraction * (yMax - yMin);
              return (
                <g key={fraction}>
                  <line x1={PAD.l} y1={gy} x2={W - PAD.r} y2={gy} stroke="#e2e8f0" strokeWidth="1" />
                  <text x={PAD.l - 6} y={gy + 3} fontSize="8" textAnchor="end" fill="#94a3b8">
                    {value.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {threshold !== undefined && threshold > yMin && threshold < yMax && (
              <g>
                <line
                  x1={PAD.l}
                  y1={y(threshold)}
                  x2={W - PAD.r}
                  y2={y(threshold)}
                  stroke="#dc2626"
                  strokeWidth="1"
                  strokeDasharray="5 4"
                />
                <text x={W - PAD.r} y={y(threshold) - 4} fontSize="8" textAnchor="end" fill="#dc2626">
                  alert threshold {threshold}
                </text>
              </g>
            )}

            <path d={areaPath} fill={`url(#grad-${gradientId})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

            <circle
              cx={x(points.length - 1)}
              cy={y(last)}
              r="7"
              fill={color}
              className="animate-ping"
              opacity="0.35"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
            <circle
              cx={x(points.length - 1)}
              cy={y(last)}
              r="3.5"
              fill={color}
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            <text x={PAD.l} y={H - 6} fontSize="8" textAnchor="start" fill="#94a3b8">
              {timeLabel(points[0].t)}
            </text>
            <text
              x={x(Math.floor((points.length - 1) / 2))}
              y={H - 6}
              fontSize="8"
              textAnchor="middle"
              fill="#94a3b8"
            >
              {timeLabel(points[Math.floor((points.length - 1) / 2)].t)}
            </text>
            <text x={W - PAD.r} y={H - 6} fontSize="8" textAnchor="end" fill="#94a3b8">
              {timeLabel(points[points.length - 1].t)}
            </text>
          </svg>
        ) : (
          <div
            className="mt-2 flex h-[118px] items-center justify-center rounded-md border border-dashed bg-secondary-50/60"
            role="status"
          >
            <p className="px-4 text-center text-xs text-secondary-500">
              {last === null
                ? 'No reading yet — polling the node…'
                : `First live reading: ${last} ${unit}. Chart builds as more polls arrive (every 15 s).`}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-secondary-500">
        <span>
          {hasSeries
            ? `Range: ${Math.min(...values)} – ${Math.max(...values)} ${unit}`
            : 'Live polling every 15 s'}
        </span>
        <span>Real node data</span>
      </div>
    </div>
  );
}
