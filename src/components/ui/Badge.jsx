import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow',
        outline: 'text-foreground',
        /* Domain variants shared by risk levels and sensor statuses. */
        success: 'border-emerald-600/20 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-600/20 bg-amber-50 text-amber-700',
        danger: 'border-red-600/20 bg-red-50 text-red-700',
        critical: 'border-transparent bg-red-600 text-white shadow',
        neutral: 'border-transparent bg-secondary text-secondary-foreground',
        info: 'border-sky-600/20 bg-sky-50 text-sky-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/** shadcn/ui Badge with the app's domain variants (risk levels, statuses). */
function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
