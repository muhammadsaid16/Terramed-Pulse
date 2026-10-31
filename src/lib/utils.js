import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard shadcn class merger utility combining clsx conditional joining
 * with tailwind-merge conflict resolution.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
