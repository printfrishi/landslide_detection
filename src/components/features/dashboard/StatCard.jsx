import { BellRing, RadioTower, TriangleAlert } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/Card';
import { cn } from '../../../lib/utils';

const TONES = {
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-amber-500/15 text-amber-600',
  danger: 'bg-destructive/10 text-destructive',
  neutral: 'bg-muted text-muted-foreground',
};

/** Dashboard KPI tile in the shadcn stat-card pattern. */
export default function StatCard({ label, value, icon: Icon, tone = 'primary', hint }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-medium">{label}</CardDescription>
        <span
          className={cn('flex h-9 w-9 items-center justify-center rounded-md', TONES[tone] ?? TONES.primary)}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
