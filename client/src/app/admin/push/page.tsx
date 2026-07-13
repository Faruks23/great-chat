'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/pwa';
import { broadcastTest, sendSocketNotification } from '@/services/notificationService';

export default function PushAdminPage() {
  const [status, setStatus] = useState<string>('unknown');

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!mounted) return;
        setStatus(sub ? 'subscribed' : 'not-subscribed');
      } catch (e) {
        console.warn(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Push Admin</h2>
      <p className="mb-4">Subscription status: <strong>{status}</strong></p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={async () => { setStatus('subscribing'); const s = await subscribeToPush(); setStatus(s ? 'subscribed' : 'not-subscribed'); }}>Subscribe</Button>
        <Button onClick={async () => { setStatus('unsubscribing'); const ok = await unsubscribeFromPush(); setStatus(ok ? 'not-subscribed' : 'error'); }}>Unsubscribe</Button>
        <Button onClick={async () => { await broadcastTest({ title: 'Test', body: 'Hello from admin' }); }}>Send Test Broadcast</Button>
        <Button onClick={async () => { await sendSocketNotification({ type: 'message', title: 'Socket Notification', body: 'This notification was sent via socket event.', data: { url: '/chat', conversationId: 'manual-test' } }); }}>Send Socket Notification</Button>
      </div>
    </div>
  );
}
