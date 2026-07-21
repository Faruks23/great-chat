'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type PageShellProps = {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function PageShell({
  title,
  description,
  backHref = '/chat',
  action,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 safe-top', className)}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href={backHref}
            className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 md:hidden"
            aria-label="Back to chat"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
