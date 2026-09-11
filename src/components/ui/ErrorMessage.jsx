import { TriangleAlert, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

/** Error banner (role="alert") with an optional retry action. */
export default function ErrorMessage({ title = 'Something went wrong', message, onRetry, className }) {
  return (
    <div role="alert" className={cn('rounded-lg border border-destructive/30 bg-destructive/10 p-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex flex-1 items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-destructive">{title}</p>
            {message && <p className="mt-1 text-sm text-destructive/90">{message}</p>}
          </div>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
