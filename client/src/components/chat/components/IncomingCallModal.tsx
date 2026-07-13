'use client';

import { Button } from '@/components/ui/button';
import type { IncomingCallPayload } from '@/components/chat/hooks/useChatSocket';

/**
 * IncomingCallModal displays an incoming call prompt.
 * It highlights who is calling and offers accept or decline actions.
 */
type IncomingCallModalProps = {
  call: IncomingCallPayload;
  onAccept: () => void;
  onDecline: () => void;
};

export default function IncomingCallModal({ call, onAccept, onDecline }: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Incoming call</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Call from {call.from ?? 'Someone'}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button className="bg-emerald-600" onClick={onAccept}>
            Accept
          </Button>
          <Button variant="ghost" onClick={onDecline}>
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
