'use client';

import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { InstallAppButton } from '@/components/InstallAppButton';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { requestNotificationPermission } from '@/lib/pwa';
import { useState } from 'react';

export default function SettingsPage() {
  const [notificationState, setNotificationState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  const handleNotifications = async () => {
    const status = await requestNotificationPermission();
    setNotificationState(status as typeof notificationState);
  };

  return (
    <PageShell title="Settings" description="Adjust your notification and app preferences.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>Get alerts for new messages even when the app is in the background.</CardDescription>
          </CardHeader>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <Button onClick={() => void handleNotifications()} className="h-11 w-full sm:w-auto">
              {notificationState === 'granted'
                ? 'Notifications enabled'
                : notificationState === 'denied'
                  ? 'Notifications blocked'
                  : 'Enable notifications'}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Install app</CardTitle>
            <CardDescription>Add Great Chat to your home screen or desktop for quick access.</CardDescription>
          </CardHeader>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <InstallAppButton
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 font-semibold text-white transition hover:bg-emerald-600 sm:w-auto"
              installedClassName="inline-flex h-11 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-6 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-300 sm:w-auto"
            />
          </div>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>Manage your profile and workspace settings.</CardDescription>
          </CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/profile"
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:w-auto"
            >
              View profile
            </Link>
            <Link
              href="/chat"
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:w-auto"
            >
              Back to chat
            </Link>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
