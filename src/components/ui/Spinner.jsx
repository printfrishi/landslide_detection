import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

/**
 * Spinner built on the shadcn Loader2 pattern. Without `label` it is purely
 * decorative (for use inside buttons); with `label` it becomes a
 * role="status" region; fullPage renders a centered page-level loader.
 */
export default function Spinner({ size = 'md', fullPage = false, label, className }) {
  const icon = (
    <Loader2
      aria-hidden="true"
      className={cn('animate-spin text-primary', SIZES[size] ?? SIZES.md, className)}
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center" role="status">
        <span className="sr-only">{label ?? 'Loading'}</span>
        {icon}
      </div>
    );
  }
  if (label) {
    return (
      <span className="inline-flex items-center gap-2" role="status">
        <span className="sr-only">{label}</span>
        {icon}
      </span>
    );
  }
  return icon;
}
