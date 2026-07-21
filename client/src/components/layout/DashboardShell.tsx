'use client';

import { usePathname } from 'next/navigation';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideBottomNav = pathname.startsWith('/chat') || pathname.startsWith('/calls');

  return (
    <div
      className={cn(
        'min-h-dvh bg-zinc-50 dark:bg-zinc-950',
        !hideBottomNav && 'pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0'
      )}
    >
      {children}
      {!hideBottomNav ? <MobileBottomNav /> : null}
    </div>
  );
}
