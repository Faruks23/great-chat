'use client';

import { useMemo, useState } from 'react';
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
  Share2,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { BackgroundSettings } from './BackgroundSettings';
import { ScreenShareModal } from './ScreenShareModal';
import { RecordingIndicator } from './RecordingIndicator';

interface OneToOneCallProps {
  remoteUserName?: string;
  callDuration?: string;
  localVideoRef?: React.RefObject<HTMLVideoElement>;
  remoteVideoRef?: React.RefObject<HTMLVideoElement>;
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
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
}

export function OneToOneCall({
  remoteUserName = 'Sarah Johnson',
  callDuration = '02:45',
  localVideoRef,
  remoteVideoRef,
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
}: OneToOneCallProps) {
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenShareModalOpen, setIsScreenShareModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      message: 'Hey! Great to see you!',
      timestamp: new Date(Date.now() - 120000),
      isOwn: false,
    },
  ]);

  const statusTone = useMemo(() => {
    if (permissionError) return 'text-red-300';
    if (connectionState === 'connected') return 'text-emerald-300';
    if (connectionState === 'joining') return 'text-amber-300';
    return 'text-slate-200';
  }, [connectionState, permissionError]);

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      message,
      timestamp: new Date(),
      isOwn: true,
    };
    setMessages((current) => [...current, newMessage]);
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Background Video Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-4 gap-4 w-full h-full p-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* Main Remote Video Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Remote User Video */}
        <div className="relative w-full h-full">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=900&fit=crop"
            alt={remoteUserName}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {hasRemoteMedia ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 px-6 text-center text-slate-100">
              <div>
                <p className="text-lg font-semibold">Waiting for remote video</p>
                <p className="mt-1 text-sm text-slate-300">The other participant will appear here once the call is connected.</p>
              </div>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          {/* User Info */}
          <div className="absolute left-0 right-0 top-8 z-10 flex flex-col items-center gap-2 text-white">
            <h2 className="text-balance text-3xl font-bold md:text-4xl">{remoteUserName}</h2>
            <div className="flex items-center gap-2 text-lg text-slate-200 md:text-xl">
              <div className={`h-2 w-2 rounded-full ${connectionState === 'connected' ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{connectionStatus} • {callDuration}</span>
            </div>
            <p className={`text-sm ${statusTone}`}>{statusMessage}</p>
            {permissionError ? <p className="max-w-md text-center text-sm text-red-300">{permissionError}</p> : null}
            {permissionHint ? <p className="max-w-md text-center text-xs text-slate-300">{permissionHint}</p> : null}
          </div>

          {/* Local User PIP (Picture in Picture) */}
          <div className="absolute bottom-6 right-6 h-40 w-32 overflow-hidden rounded-2xl border-4 border-white bg-slate-700 shadow-2xl md:bottom-8 md:right-8 md:h-56 md:w-40">
            {isVideoEnabled && hasLocalMedia ? (
              <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-800 px-2 text-center text-sm text-slate-300">
                {hasLocalMedia ? 'Camera off' : 'Camera unavailable'}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[11px] text-white">You</div>
          </div>

          {/* Top Right Controls */}
          <div className="absolute top-6 right-6 md:top-8 md:right-8 flex gap-3 z-10 flex-wrap justify-end">
            {/* Recording Indicator */}
            <RecordingIndicator
              isRecording={isRecording}
              onToggleRecording={() => setIsRecording(!isRecording)}
              recordingDuration={0}
            />

            {/* Screen Share Button */}
            <button
              onClick={() => setIsScreenShareModalOpen(true)}
              className={`rounded-full p-3 md:p-4 transition-all duration-200 ${isScreenSharing
                ? 'bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/50'
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
                } text-white`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <Share2 className="w-6 h-6" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsBackgroundOpen(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 md:p-4 transition-all duration-200 text-white"
              title="Background settings"
            >
              <Settings className="w-6 h-6" />
            </button>

            {/* More Options */}
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 md:p-4 transition-all duration-200 text-white">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 md:px-8 py-6 md:py-8">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 md:gap-4 flex-wrap">
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

          {/* Chat Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`rounded-full p-4 md:p-5 transition-all duration-200 transform hover:scale-110 relative ${isChatOpen
              ? 'bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/50'
              : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
              } text-white`}
            title="Chat"
          >
            <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
            {messages.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full text-xs font-bold flex items-center justify-center">
                {messages.length}
              </span>
            )}
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
        isSharing={isScreenSharing}
        onStartSharing={() => setIsScreenSharing(true)}
        onStopSharing={() => setIsScreenSharing(false)}
      />
    </div>
  );
}
