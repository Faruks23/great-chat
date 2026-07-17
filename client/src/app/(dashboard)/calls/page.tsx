'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OneToOneCall } from '@/components/call/OneToOneCall';
import { GroupCall } from '@/components/call/GroupCall';
import { useCallSession, type CallKind, type CallMode } from '@/hooks/useCallSession';

const makeRoom = () => `great-chat-${Math.random().toString(36).slice(2, 8)}`;

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const room = searchParams.get('room') || makeRoom();
  const mode = (searchParams.get('mode') === 'voice' ? 'voice' : 'video') as CallMode;
  const kind = (searchParams.get('type') === 'group' ? 'group' : 'direct') as CallKind;
  const remoteName = searchParams.get('name') ?? undefined;
  const hasCallTarget = Boolean(searchParams.get('room'));

  const [view, setView] = useState<'idle' | 'one-to-one' | 'group'>(
    hasCallTarget ? (kind === 'group' ? 'group' : 'one-to-one') : 'idle'
  );
  const [callConfig, setCallConfig] = useState<{ room: string; mode: CallMode; kind: CallKind }>({
    room,
    mode,
    kind,
  });

  const callSession = useCallSession({
    room: callConfig.room,
    mode: callConfig.mode,
    kind: callConfig.kind,
  });

  useEffect(() => {
    const nextRoom = searchParams.get('room') || makeRoom();
    const nextMode = (searchParams.get('mode') === 'voice' ? 'voice' : 'video') as CallMode;
    const nextKind = (searchParams.get('type') === 'group' ? 'group' : 'direct') as CallKind;
    const nextHasCallTarget = Boolean(searchParams.get('room'));

    setCallConfig({ room: nextRoom, mode: nextMode, kind: nextKind });
    setView(nextHasCallTarget ? (nextKind === 'group' ? 'group' : 'one-to-one') : 'idle');
  }, [searchParams]);

  useEffect(() => {
    if (view === 'idle' && callSession.callStarted) {
      callSession.hangupCall();
    }
  }, [callSession.callStarted, callSession.hangupCall, view]);

  const redirectToConversation = () => {
    const conversationId = searchParams.get('room');
    const target = conversationId ? `/chat?conversationId=${encodeURIComponent(conversationId)}` : '/chat';
    router.push(target);
  };

  const handleCancelCall = () => {
    callSession.hangupCall();
    setView('idle');
    redirectToConversation();
  };

  const shouldShowJoinOverlay = (view === 'one-to-one' || view === 'group') && !callSession.callStarted;

  const renderCallOverlay = () => {
    if (!shouldShowJoinOverlay) {
      return null;
    }

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90 backdrop-blur-md p-4 sm:p-6">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">

          {/* Top Icon */}
          <div className="flex justify-center pt-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-8 ring-emerald-500/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.55-2.27A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.89L15 14m-9 4h6a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8 pt-6 text-center sm:px-10">

            <h2 className="text-3xl font-bold tracking-tight text-white">
              Join the Call
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
              {callSession.permissionError
                ? "Camera or microphone permission is required before joining this meeting."
                : "Allow your camera and microphone so everyone can see and hear you."}
            </p>

            {/* Permission Error */}
            {callSession.permissionError && (
              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-red-400">
                    ⚠️
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-300">
                      Permission Required
                    </h4>

                    <p className="mt-1 text-sm text-red-200">
                      {callSession.permissionError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            {!callSession.permissionError && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left">
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <span>🎤</span>
                    <span>Microphone access</span>
                  </li>

                  <li className="flex items-center gap-2">
                    <span>📷</span>
                    <span>Camera access</span>
                  </li>

                  <li className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>Your media stays private until you join.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={() => void callSession.startCall()}
                className="flex-1 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-400 active:scale-95"
              >
                {callSession.permissionError
                  ? "Try Again"
                  : "Join Now"}
              </button>

              <button
                onClick={handleCancelCall}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-white/10 active:scale-95"
              >
                Cancel
              </button>

            </div>

            {/* Footer */}
            <p className="mt-6 text-xs text-slate-500">
              By joining, you agree to allow camera and microphone access for this meeting.
            </p>

          </div>
        </div>
      </div>
    );
  };

  if (view === 'one-to-one') {
    return (
      <div className="relative min-h-screen">
        <button
          onClick={handleCancelCall}
          className="absolute left-4 top-4 z-50 rounded-full bg-white/20 p-3 text-white backdrop-blur transition-all hover:bg-white/30"
        >
          ← Back
        </button>
        {renderCallOverlay()}
        <OneToOneCall
          remoteUserName={remoteName ?? callSession.remoteParticipantName ?? 'Remote Participant'}
          callDuration={callSession.callDuration}
          localVideoRef={callSession.localVideoRef}
          remoteVideoRef={callSession.remoteVideoRef}
          connectionStatus={callSession.connectionStatus}
          connectionState={callSession.connectionState}
          statusMessage={callSession.statusMessage}
          permissionError={callSession.permissionError}
          permissionHint={callSession.permissionHint}
          isMuted={callSession.isMuted}
          isVideoEnabled={callSession.isVideoEnabled}
          hasLocalMedia={callSession.hasLocalMedia}
          hasRemoteMedia={callSession.hasRemoteMedia}
          onToggleMute={callSession.toggleMute}
          onToggleCamera={callSession.toggleCamera}
          onEndCall={handleCancelCall}
          startScreenShare={callSession.startScreenShare}
          stopScreenShare={callSession.stopScreenShare}
          isScreenSharing={callSession.isScreenSharing}
        />
      </div>
    );
  }

  if (view === 'group') {
    return (
      <div className="relative min-h-screen">
        <button
          onClick={handleCancelCall}
          className="absolute left-4 top-4 z-50 rounded-full bg-white/20 p-3 text-white backdrop-blur transition-all hover:bg-white/30"
        >
          ← Back
        </button>
        {renderCallOverlay()}
        <GroupCall
          groupName={searchParams.get('name') ? `Group call: ${searchParams.get('name')}` : searchParams.get('room') ? `Group call: ${searchParams.get('room')}` : 'Group call'}
          callDuration={callSession.callDuration}
          localVideoRef={callSession.localVideoRef}
          remoteVideoRef={callSession.remoteVideoRef}
          connectionStatus={callSession.connectionStatus}
          connectionState={callSession.connectionState}
          statusMessage={callSession.statusMessage}
          permissionError={callSession.permissionError}
          permissionHint={callSession.permissionHint}
          isMuted={callSession.isMuted}
          isVideoEnabled={callSession.isVideoEnabled}
          hasLocalMedia={callSession.hasLocalMedia}
          hasRemoteMedia={callSession.hasRemoteMedia}
          onToggleMute={callSession.toggleMute}
          onToggleCamera={callSession.toggleCamera}
          onEndCall={handleCancelCall}
          startScreenShare={callSession.startScreenShare}
          stopScreenShare={callSession.stopScreenShare}
          isScreenSharing={callSession.isScreenSharing}
        />
      </div>
    );
  }

  return (
    <></>
  );
}
