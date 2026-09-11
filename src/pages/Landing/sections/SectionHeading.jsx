import { cn } from '../../../lib/utils';

/** Government-portal section heading: navy title, saffron underline, optional meta. */
export default function SectionHeading({ id, eyebrow, title, description, meta, dark = false, center = false }) {
  return (
    <div className={cn('max-w-3xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <p className={cn('text-xs font-semibold uppercase tracking-[0.25em]', dark ? 'text-amber-400' : 'text-primary-700')}>
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          'mt-2 text-2xl font-bold tracking-tight sm:text-3xl',
          dark ? 'text-white' : 'text-[#0a2f5a]'
        )}
      >
        {title}
      </h2>
      <span
        className={cn('mt-3 block h-1 w-20 rounded-full bg-amber-400', center && 'mx-auto')}
        aria-hidden="true"
      />
      {description && (
        <p className={cn('mt-4 leading-7', dark ? 'text-secondary-300' : 'text-secondary-600')}>{description}</p>
      )}
      {meta && <p className="mt-3 text-xs text-secondary-400">{meta}</p>}
    </div>
  );
}
