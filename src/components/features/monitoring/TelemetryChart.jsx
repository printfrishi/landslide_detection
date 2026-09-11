import { useId } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { cn } from '../../../lib/utils';
import { seriesStats } from './telemetryData';

const W = 320;
const H = 150;
const PAD = { l: 34, r: 10, t: 12, b: 20 };

/**
 * SVG telemetry chart: area+line series with threshold line, grid, axis
 * labels and a pulsing live point. Deterministic demo series only.
 */
export default function TelemetryChart({ title, unit, description, points, threshold, color }) {
  const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const stats = seriesStats(points);

  const lo = Math.min(...points, threshold ?? Infinity);
  const hi = Math.max(...points, threshold ?? -Infinity);
  const span = (hi - lo) * 0.12 || 1;
  const yMin = lo - span;
  const yMax = hi + span;

  const x = (i) => PAD.l + (i / (points.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

  const linePath = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${x(points.length - 1).toFixed(1)},${(H - PAD.b).toFixed(1)} L${PAD.l},${(H - PAD.b).toFixed(1)} Z`;

  const delta = stats.last - points[Math.max(0, points.length - 7)];
  const TrendIcon = delta >= 0 ? TrendingUp : TrendingDown;
  const xLabels = ['00:00', '06:00', '12:00', '18:00', 'Now'];
  const xLabelPos = [0, 6, 12, 18, points.length - 1];

  return (
    <div className="rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#0a2f5a]">
            {title} <span className="font-medium text-secondary-400">({unit})</span>
          </h3>
          <p className="mt-0.5 truncate text-xs text-secondary-500">{description}</p>
        </div>
        <Badge variant="neutral">Demo</Badge>
      </div>

      <div className="px-4 pt-3">
        <div className="flex items-end justify-between">
          <p className="text-2xl font-extrabold tabular-nums tracking-tight text-secondary-900">
            {stats.last}
            <span className="ml-1 text-sm font-medium text-secondary-500">{unit}</span>
          </p>
          <span
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
              delta >= 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {delta >= 0 ? '+' : ''}
            {delta.toFixed(1)} {unit} / 6 h
          </span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`${title} trend over the last 24 hours, currently ${stats.last} ${unit}`}>
          <defs>
            <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* grid + y labels */}
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

          {/* threshold */}
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

          {/* live point */}
          <circle
            cx={x(points.length - 1)}
            cy={y(stats.last)}
            r="7"
            fill={color}
            className="animate-ping"
            opacity="0.35"
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
          <circle cx={x(points.length - 1)} cy={y(stats.last)} r="3.5" fill={color} stroke="#ffffff" strokeWidth="1.5" />

          {/* x labels */}
          {xLabels.map((label, index) => (
            <text
              key={label}
              x={x(xLabelPos[index])}
              y={H - 6}
              fontSize="8"
              textAnchor={index === 0 ? 'start' : index === xLabels.length - 1 ? 'end' : 'middle'}
              fill="#94a3b8"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-secondary-500">
        <span>
          24 h range: <span className="font-semibold text-secondary-700">{stats.min} – {stats.max} {unit}</span>
        </span>
        <span>Sample data · hourly</span>
      </div>
    </div>
  );
}
