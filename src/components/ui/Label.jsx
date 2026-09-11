import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

/** shadcn/ui Label. */
const Label = forwardRef(function Label({ className, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
});

export { Label };
