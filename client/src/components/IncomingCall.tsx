import React from 'react';

type IncomingCallProps = {
  caller?: {
    name?: string;
    avatar?: string;
  };
  callType?: 'audio' | 'video';
  onAccept?: (type: 'audio' | 'video') => void;
  onReject?: () => void;
};

export function IncomingCall({
  caller = { name: 'Someone' },
  callType = 'video',
  onAccept,
  onReject,
}: IncomingCallProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-3xl font-semibold">
          {caller.avatar ? (
            <img src={caller.avatar} alt={caller.name} className="h-full w-full object-cover" />
          ) : (
            caller.name?.charAt(0).toUpperCase()
          )}
        </div>
        <h2 className="text-3xl font-semibold">{caller.name}</h2>
        <p className="mt-2 text-slate-300">Incoming {callType} call</p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => onReject?.()}
            className="rounded-full bg-rose-500 px-5 py-3 font-medium transition hover:bg-rose-600"
          >
            Decline
          </button>
          <button
            onClick={() => onAccept?.(callType)}
            className="rounded-full bg-emerald-500 px-5 py-3 font-medium transition hover:bg-emerald-600"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
