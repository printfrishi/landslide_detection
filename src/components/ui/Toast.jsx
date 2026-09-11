import { useEffect } from 'react';
import { CircleCheck, CircleX, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const ICONS = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
};

const ICON_CLASSES = {
  success: 'text-emerald-600',
  error: 'text-destructive',
  info: 'text-sky-600',
};

const ROLES = {
  success: 'status',
  error: 'alert',
  info: 'status',
};

/** Single toast notification (shadcn card styling); auto-dismisses after durationMs. */
export default function Toast({ type = 'info', message, onDismiss, durationMs = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  const Icon = ICONS[type] ?? Info;

  return (
    <div
      role={ROLES[type] ?? 'status'}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-background p-4 text-foreground shadow-lg animate-toast-in'
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', ICON_CLASSES[type] ?? ICON_CLASSES.info)} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-m-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
