import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/ui class helper: conditional classes + Tailwind conflict resolution. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
