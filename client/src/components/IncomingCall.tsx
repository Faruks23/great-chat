import { Button } from '@/components/ui/button';

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
  const callerName = caller.name ?? 'Someone';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-6 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-3xl font-semibold text-white ring-2 ring-emerald-500/20">
          {caller.avatar ? (
            <img src={caller.avatar} alt={callerName} className="h-full w-full object-cover" />
          ) : (
            callerName.charAt(0).toUpperCase()
          )}
        </div>

        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Incoming {callType} call</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">{callerName}</h2>
        <p className="mt-2 text-sm text-slate-400">Join now to connect with them.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            size="default"
            className="border-rose-500 text-rose-500 hover:bg-rose-500/10"
            onClick={() => onReject?.()}
          >
            Decline
          </Button>
          <Button
            size="default"
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={() => onAccept?.(callType)}
          >
            Accept
          </Button>
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 px-4 py-3 text-left text-sm text-slate-300 ring-1 ring-white/10">
          <p className="font-medium text-white">Call details</p>
          <p className="mt-2 text-slate-400">{callerName} is inviting you to a {callType} call.</p>
        </div>
      </div>
    </div>
  );
}
