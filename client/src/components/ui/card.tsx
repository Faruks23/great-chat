'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn('rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/20 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none', className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('mb-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h1 className={cn('text-2xl font-semibold text-zinc-900 dark:text-zinc-100', className)} {...props} />;
}

export function CardDescription({ className, ...props }: CardProps) {
  return <p className={cn('mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400', className)} {...props} />;
}
