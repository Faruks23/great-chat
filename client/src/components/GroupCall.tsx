import React from 'react';

type GroupCallProps = {
  groupName?: string;
  callDuration?: string;
};

export function GroupCall({ groupName = 'Group Call', callDuration = '00:00' }: GroupCallProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-white">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{groupName}</h2>
            <p className="text-sm text-slate-300">Live • {callDuration}</p>
          </div>
          <button className="rounded-full bg-rose-500 px-4 py-2 text-sm transition hover:bg-rose-600">
            End Call
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {['A', 'B', 'C', 'D'].map((letter, index) => (
            <div key={letter} className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 text-lg font-medium">
              Participant {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
