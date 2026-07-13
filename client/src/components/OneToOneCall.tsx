import React from 'react';

type OneToOneCallProps = {
  remoteUserName?: string;
  callDuration?: string;
};

export function OneToOneCall({ remoteUserName = 'Remote User', callDuration = '00:00' }: OneToOneCallProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-white">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-12 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-3xl font-semibold ring-1 ring-emerald-400/30">
            {remoteUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-semibold">{remoteUserName}</h2>
            <p className="mt-2 text-slate-300">Video call • {callDuration}</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full bg-white/15 px-4 py-2 text-sm transition hover:bg-white/25">
              Mute
            </button>
            <button className="rounded-full bg-rose-500 px-4 py-2 text-sm transition hover:bg-rose-600">
              End Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
