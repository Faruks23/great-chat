'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MoreVertical,
  Volume2,
  VolumeX,
  Users,
  Plus,
  Share2,
  MessageSquare,
  Settings,
  Hand,
} from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { BackgroundSettings } from './BackgroundSettings';
import { ScreenShareModal } from './ScreenShareModal';
import { HandRaiseIndicator } from './HandRaiseIndicator';
import { RecordingIndicator } from './RecordingIndicator';
import socket from '@/lib/socket';

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  isActive?: boolean;
  isMuted?: boolean;
}

interface GroupCallProps {
  groupName?: string;
  members?: GroupMember[];
  callDuration?: string;
  localVideoRef?: React.RefObject<HTMLVideoElement>;
  remoteVideoRef?: React.RefObject<HTMLVideoElement>;
  remoteScreenShareRef?: React.RefObject<HTMLVideoElement>;
  peerConnection?: RTCPeerConnection | null;
  connectionStatus?: string;
  connectionState?: string;
  statusMessage?: string;
  permissionError?: string | null;
  permissionHint?: string | null;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  hasLocalMedia?: boolean;
  hasRemoteMedia?: boolean;
  onToggleMute?: () => void;
  onToggleCamera?: () => void;
  onEndCall?: () => void;
  // New: screen sharing control from call session
  startScreenShare?: () => Promise<MediaStream | null>;
  stopScreenShare?: () => Promise<void> | void;
  isScreenSharing?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
}

interface HandRaiseNotification {
  id: string;
  name: string;
  avatar: string;
  timestamp: Date;
}

const defaultMembers: GroupMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    isActive: true,
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    isActive: true,
    isMuted: true,
  },
  {
    id: '3',
    name: 'Emma Davis',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    isActive: true,
  },
  {
    id: '4',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    isActive: true,
  },
];

export function GroupCall({
  groupName = 'Team Meeting',
  members = defaultMembers,
  callDuration = '00:00',
  localVideoRef,
  remoteVideoRef,
  remoteScreenShareRef,
  peerConnection,
  connectionStatus = 'Ready',
  connectionState = 'idle',
  statusMessage = 'Ready to connect',
  permissionError,
  permissionHint,
  isMuted = false,
  isVideoEnabled = true,
  hasLocalMedia = false,
  hasRemoteMedia = false,
  onToggleMute,
  onToggleCamera,
  onEndCall,
  startScreenShare,
  stopScreenShare,
  isScreenSharing = false,
}: GroupCallProps) {
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);
  const [isScreenShareModalOpen, setIsScreenShareModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(null);
  const remoteScreenTrackIdsRef = useRef<Set<string>>(new Set());
  const [handsRaised, setHandsRaised] = useState<HandRaiseNotification[]>([]);
  const [isRaisingHand, setIsRaisingHand] = useState(false);
  const screenShareError = null;
  const statusTone = useMemo(() => {
    if (permissionError) return 'text-red-300';
    if (connectionState === 'connected') return 'text-emerald-300';
    if (connectionState === 'joining') return 'text-amber-300';
    return 'text-slate-200';
  }, [connectionState, permissionError]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      message: 'Great meeting, everyone!',
      timestamp: new Date(Date.now() - 120000),
      isOwn: false,
    },
  ]);

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      message,
      timestamp: new Date(),
      isOwn: true,
    };
    setMessages([...messages, newMessage]);
  };

  const handleStartScreenShare = async () => {
    try {
      if (typeof startScreenShare === 'function') {
        const stream = await startScreenShare();
        if (stream) {
          setScreenShareStream(stream);
        }
        socket.emit('screen:start', { userId: 'current-user-id', isSharing: true });
        setIsScreenShareModalOpen(false);
      } else {
        console.warn('startScreenShare not provided by call session');
      }
    } catch (err) {
      console.error('Failed to start screen sharing:', err);
    }
  };

  const handleStopScreenShare = async () => {
    try {
      if (typeof stopScreenShare === 'function') {
        await stopScreenShare();
      }
      socket.emit('screen:stop', { userId: 'current-user-id', isSharing: false });
      setScreenShareStream(null);
    } catch (err) {
      console.error('Failed to stop screen sharing:', err);
    }
  };

  useEffect(() => {
    const handleRemoteScreenShare = (data: { userId: string; isSharing: boolean }) => {
      if (!data.isSharing) {
        setRemoteScreenStream(null);
        // clear seen remote screen track ids when sharing stops
        remoteScreenTrackIdsRef.current?.clear?.();
      }
    };

    socket.on('screen:start', handleRemoteScreenShare);
    socket.on('screen:stop', handleRemoteScreenShare);

    return () => {
      socket.off('screen:start', handleRemoteScreenShare);
      socket.off('screen:stop', handleRemoteScreenShare);
    };
  }, []);

  // Handle remote screen tracks from peer connection
  useEffect(() => {
    if (!peerConnection) return;

    const handleTrack = (event: RTCTrackEvent) => {
      const isScreenTrack = event.track.kind === 'video' && event.track.label.toLowerCase().includes('screen');
      if (!isScreenTrack) return;

      // dedupe by track id to prevent multiple screen copies
      if (remoteScreenTrackIdsRef.current.has(event.track.id)) return;
      remoteScreenTrackIdsRef.current.add(event.track.id);

      const stream = new MediaStream([event.track]);
      setRemoteScreenStream(stream);
      if (remoteScreenShareRef?.current) {
        remoteScreenShareRef.current.srcObject = stream;
      }
    };

    peerConnection.addEventListener('track', handleTrack);
    return () => {
      peerConnection.removeEventListener('track', handleTrack);
      remoteScreenTrackIdsRef.current.clear();
    };
  }, [peerConnection, remoteScreenShareRef, remoteScreenStream]);

  const handleToggleHandRaise = () => {
    if (isRaisingHand) {
      setIsRaisingHand(false);
    } else {
      setIsRaisingHand(true);
      const notification: HandRaiseNotification = {
        id: Date.now().toString(),
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        timestamp: new Date(),
      };
      setHandsRaised([...handsRaised, notification]);
    }
  };

  return (
    <div className="group w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Remote Screen Share Overlay */}
      {remoteScreenStream && remoteScreenShareRef && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95">
          <video
            ref={remoteScreenShareRef}
            autoPlay
            playsInline
            className="h-full w-full object-contain"
          />
          <div className="absolute top-8 left-8 bg-blue-600/90 px-4 py-2 rounded-full text-sm text-white font-medium">
            Screen Share from {members[0]?.name || 'Participant'}
          </div>
          <button
            onClick={() => setRemoteScreenStream(null)}
            className="absolute top-8 right-8 bg-slate-700/90 hover:bg-slate-600 px-4 py-2 rounded-full text-sm text-white font-medium transition-colors"
          >
            Exit Screen Share
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary/80 text-white px-4 md:px-6 py-4 md:py-5 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{groupName}</h1>
              <p className="text-xs md:text-sm text-white/80">
                {members.length} participants
                <span className="ml-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  • {callDuration}
                </span>
              </p>
              <p className={`mt-1 text-xs ${statusTone}`}>{statusMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Chat Badge */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="relative bg-white/20 hover:bg-white/30 backdrop-blur rounded-full p-3 transition-all"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-xs font-bold flex items-center justify-center">
                  {messages.length}
                </span>
              )}
            </button>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-full p-3 transition-all">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isGridView ? (
          // Grid View
          <div className="w-full h-full p-3 md:p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 md:gap-4 auto-rows-auto h-full">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className={`relative rounded-2xl overflow-hidden bg-slate-700 shadow-lg group transition-all hover:shadow-xl ${index === 0 ? 'row-span-1 col-span-1' : ''
                    }`}
                >
                  {/* Member Video */}
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Member Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                    <p className="font-semibold text-sm md:text-base text-balance">
                      {member.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-white/80">
                      {member.isMuted && (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>Muted</span>
                        </>
                      )}
                      {!member.isMuted && (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span>Speaking</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {member.isActive && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span>Active</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Member Button */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-700/50 shadow-lg hover:shadow-xl transition-all border-2 border-dashed border-white/20 hover:border-white/40 flex items-center justify-center group cursor-pointer">
                <div className="flex flex-col items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                  <Plus className="w-8 h-8 md:w-10 md:h-10" />
                  <p className="text-sm md:text-base font-medium">Add Member</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Speaker View (Focus on first member, show others as pills)
          <div className="w-full h-full flex flex-col">
            {/* Main Speaker */}
            <div className="flex-1 relative">
              <img
                src={members[0].avatar}
                alt={members[0].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 text-white">
                <h2 className="text-2xl md:text-3xl font-bold">{members[0].name}</h2>
                <p className="text-white/80 text-sm md:text-base">Speaking</p>
              </div>
            </div>

            {/* Secondary Participants Carousel */}
            <div className="bg-slate-800/95 backdrop-blur px-4 md:px-6 py-4 overflow-x-auto">
              <div className="flex gap-3 md:gap-4 min-w-min">
                {members.slice(1).map((member) => (
                  <div
                    key={member.id}
                    className="relative w-20 h-28 md:w-24 md:h-32 rounded-lg overflow-hidden shadow-lg flex-shrink-0 border-2 border-white/20 hover:border-white/40 transition-all group"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-semibold truncate">
                      {member.name.split(' ')[0]}
                    </div>
                    {member.isMuted && (
                      <div className="absolute top-1 right-1 bg-red-500 rounded-full p-1">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-gradient-to-t from-black/80 to-black/40 px-4 md:px-6 py-6 md:py-8 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          {/* View Toggle Button */}
          <button
            onClick={() => setIsGridView(!isGridView)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-4 md:p-5 transition-all duration-200 transform hover:scale-110 text-white"
            title={isGridView ? 'Switch to speaker view' : 'Switch to grid view'}
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isGridView ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              )}
            </svg>
          </button>

          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            className={`rounded-full p-4 md:p-5 transition-all duration-200 transform hover:scale-110 ${isMuted
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
              : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
              } text-white`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 md:w-7 md:h-7" />
            ) : (
              <Mic className="w-6 h-6 md:w-7 md:h-7" />
            )}
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`rounded-full p-4 md:p-5 transition-all duration-200 transform hover:scale-110 ${isSpeakerOn
              ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
              : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/50'
              } text-white`}
            title={isSpeakerOn ? 'Speaker on' : 'Speaker off'}
          >
            {isSpeakerOn ? (
              <Volume2 className="w-6 h-6 md:w-7 md:h-7" />
            ) : (
              <VolumeX className="w-6 h-6 md:w-7 md:h-7" />
            )}
          </button>

          {/* Video Button */}
          <button
            onClick={onToggleCamera}
            className={`rounded-full p-4 md:p-5 transition-all duration-200 transform hover:scale-110 ${isVideoEnabled
              ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
              : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
              } text-white`}
            title={isVideoEnabled ? 'Camera on' : 'Camera off'}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 md:w-7 md:h-7" />
            ) : (
              <VideoOff className="w-6 h-6 md:w-7 md:h-7" />
            )}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={() => setIsScreenShareModalOpen(true)}
            className={`rounded-full p-4 md:p-5 transition-all duration-200 transform hover:scale-110 ${(isScreenSharing || Boolean(screenShareStream))
              ? 'bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/50'
              : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
              } text-white`}
            title={(isScreenSharing || Boolean(screenShareStream)) ? 'Stop sharing' : 'Share screen'}
          >
            <Share2 className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* Recording Indicator */}
          <div className="hidden sm:block">
            <RecordingIndicator
              isRecording={isRecording}
              onToggleRecording={() => setIsRecording(!isRecording)}
              recordingDuration={recordingDuration}
            />
          </div>

          {/* Hand Raise (mobile hidden in control bar, shown as notification) */}
          <button
            onClick={handleToggleHandRaise}
            className={`rounded-full p-4 md:p-5 transition-all duration-200 transform hover:scale-110 ${isRaisingHand
              ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/50'
              : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
              } text-white`}
            title={isRaisingHand ? 'Lower hand' : 'Raise hand'}
          >
            <Hand className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* Background Settings Button */}
          <button
            onClick={() => setIsBackgroundOpen(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-4 md:p-5 transition-all duration-200 transform hover:scale-110 text-white hidden md:flex"
            title="Background settings"
          >
            <Settings className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="rounded-full bg-red-500 p-4 text-white shadow-lg shadow-red-500/50 transition-all duration-200 hover:scale-110 hover:bg-red-600 md:p-5"
          >
            <PhoneOff className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentUserName="You"
        currentUserAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
      />

      {/* Background Settings Modal */}
      <BackgroundSettings
        isOpen={isBackgroundOpen}
        onClose={() => setIsBackgroundOpen(false)}
        onApply={(type, value) => {
          console.log('[v0] Background applied:', type, value);
        }}
        currentBackground={null}
      />

      {/* Screen Share Modal */}
      <ScreenShareModal
        isOpen={isScreenShareModalOpen}
        onClose={() => setIsScreenShareModalOpen(false)}
        isSharing={isScreenSharing || Boolean(screenShareStream)}
        onStartSharing={handleStartScreenShare}
        onStopSharing={handleStopScreenShare}
      />
      {screenShareError && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
          Screen sharing error: {screenShareError}
        </div>
      )}

      {/* Hand Raise Indicator */}
      <HandRaiseIndicator
        handsRaised={handsRaised}
        onLowerHand={(id) => setHandsRaised(handsRaised.filter(h => h.id !== id))}
        isRaisingHand={isRaisingHand}
        onToggleHandRaise={handleToggleHandRaise}
      />
    </div>
  );
}
