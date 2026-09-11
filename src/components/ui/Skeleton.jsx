import { cn } from '../../lib/utils';

/** shadcn/ui Skeleton. */
function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
export default Skeleton;
