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
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-6 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-center text-white shadow-2xl">
          <h2 className="text-2xl font-semibold">Join the call</h2>
          <p className="mt-2 text-sm text-slate-300">
            {callSession.permissionError
              ? 'Camera or microphone access needs to be enabled before the call can start.'
              : 'Use this button to allow camera and microphone access for the call.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => void callSession.startCall()}
              className="rounded-full bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-400"
            >
              {callSession.permissionError ? 'Try again' : 'Start call'}
            </button>
            <button
              onClick={handleCancelCall}
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-medium text-slate-100 transition hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
          {callSession.permissionError ? (
            <p className="mt-4 text-sm text-red-300">{callSession.permissionError}</p>
          ) : null}
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
          remoteUserName="Sarah Johnson"
          callDuration="02:45"
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
          groupName={searchParams.get('room') ? `Group call: ${searchParams.get('room')}` : 'Group call'}
          callDuration="12:34"
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
        />
      </div>
    );
  }

  return (
    <></>
  );
}
