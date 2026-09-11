import { cn } from '../../../lib/utils';

/**
 * Government-portal content box: navy gradient title bar with white
 * uppercase text, saffron rule, bordered body. The signature NDMA-style
 * panel used across the landing page.
 */
export default function PortalPanel({ title, icon: Icon, action, children, className, bodyClassName }) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-secondary-300 bg-white shadow-sm', className)}>
      <div className="flex items-center justify-between gap-3 border-b-2 border-amber-400 bg-gradient-to-r from-[#0a2f5a] to-[#134b8a] px-4 py-2.5">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />}
          {title}
        </h3>
        {action}
      </div>
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </div>
  );
}
