'use client';

import { useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import type { CallMode } from '@/hooks/useCallSession';

interface IncomingCallProps {
  caller: {
    name: string;
    avatar: string;
  };
  callType: CallMode;
  onAccept: (type: CallMode) => void;
  onReject: () => void;
}

export function IncomingCall({ caller, callType, onAccept, onReject }: IncomingCallProps) {
  const [ringing, setRinging] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/30 rounded-full animate-pulse delay-75" />
      </div>

      {/* Call card */}
      <div className="relative bg-gradient-to-b from-card to-card/80 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 backdrop-blur-lg border border-white/10">
        {/* Caller avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src={caller.avatar}
              alt={caller.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-secondary shadow-lg"
            />
            <div className={`absolute -bottom-2 -right-2 w-5 h-5 rounded-full border-2 border-card ${callType === 'video' ? 'bg-secondary' : 'bg-primary'}`} />
          </div>
        </div>

        {/* Caller name */}
        <h1 className="text-center text-3xl font-bold mb-2">{caller.name}</h1>

        {/* Call type indicator */}
        <p className="text-center text-muted-foreground text-sm mb-8">
          {callType === 'video' ? 'Video Call' : 'Audio Call'} Incoming...
        </p>

        {/* Ringing animation */}
        {ringing && (
          <div className="flex justify-center gap-1 mb-8">
            <div className="w-2 h-8 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-8 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-8 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-6 justify-center">
          {/* Reject button */}
          <button
            onClick={onReject}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-lg transition-all hover:scale-110 active:scale-95"
            title="Reject call"
          >
            <PhoneOff size={32} />
          </button>

          {/* Accept button */}
          <button
            onClick={() => {
              setRinging(false);
              onAccept(callType);
            }}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-secondary/90 text-white shadow-lg transition-all hover:scale-110 active:scale-95"
            title="Accept call"
          >
            <Phone size={32} />
          </button>
        </div>

        {/* Decline options */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-4">Decline with message</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['I&apos;m busy', 'Call me later', 'Can&apos;t talk now'].map((msg) => (
              <button
                key={msg}
                onClick={onReject}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
