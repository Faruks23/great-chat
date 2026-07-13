'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'icon' | 'default';
};

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 dark:bg-emerald-500 dark:hover:bg-emerald-400',
  ghost:
    'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
  outline:
    'border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  icon: 'h-9 w-9',
  default: 'h-9 px-4 py-2',
};

export function Button({ className, variant = 'default', size = 'icon', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-95',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
