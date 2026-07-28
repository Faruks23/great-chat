'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OneToOneCall } from '@/components/call/OneToOneCall';
import { GroupCall } from '@/components/call/GroupCall';

import { useCallSession, type CallKind, type CallMode } from '@/hooks/useCallSession';
import { Phone, Clock } from 'lucide-react';
import { CallsLog } from '@/components/call/CallsLog';

const makeRoom = () => `great-chat-${Math.random().toString(36).slice(2, 8)}`;

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const room = searchParams.get('room') || makeRoom();
  const mode = (searchParams.get('mode') === 'voice' ? 'voice' : 'video') as CallMode;
  const kind = (searchParams.get('type') === 'group' ? 'group' : 'direct') as CallKind;
  const remoteName = searchParams.get('name') ?? undefined;
  const hasCallTarget = Boolean(searchParams.get('room'));

  const [view, setView] = useState<'idle' | 'one-to-one' | 'group' | 'history'>(
    hasCallTarget ? (kind === 'group' ? 'group' : 'one-to-one') : 'history'
  );
  const [activeTab, setActiveTab] = useState<'calls' | 'history'>(
    hasCallTarget ? 'calls' : 'history'
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
    const newView = nextHasCallTarget ? (nextKind === 'group' ? 'group' : 'one-to-one') : 'history';
    setView(newView);
    setActiveTab(nextHasCallTarget ? 'calls' : 'history');
  }, [searchParams]);

  useEffect(() => {
    if (view === 'history' && callSession.callStarted) {
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
    setView('history');
    setActiveTab('history');
  };

  const handleTabChange = (tab: 'calls' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history') {
      setView('history');
      if (callSession.callStarted) {
        callSession.hangupCall();
      }
    }
  };

  const shouldShowJoinOverlay = (view === 'one-to-one' || view === 'group') && !callSession.callStarted;

  const renderCallOverlay = () => {
    if (!shouldShowJoinOverlay) {
      return null;
    }
  };

  // Call Interface View
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

  // History View with Tabs
  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700/50 bg-slate-900/30 backdrop-blur">
        <button
          onClick={() => handleTabChange('calls')}
          className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${activeTab === 'calls'
              ? 'border-b-2 border-blue-500 text-white'
              : 'text-slate-400 hover:text-slate-300'
            }`}
        >
          <Phone className="h-5 w-5" />
          Recent Calls
        </button>
        <button
          onClick={() => handleTabChange('history')}
          className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${activeTab === 'history'
              ? 'border-b-2 border-blue-500 text-white'
              : 'text-slate-400 hover:text-slate-300'
            }`}
        >
          <Clock className="h-5 w-5" />
          All History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'calls' ? (
          <div className="h-full">
            <CallsLog calls={[]} onCallClick={() => { }} />
          </div>
        ) : (
          <CallsLog />
        )}
      </div>
    </div>
  );
}
