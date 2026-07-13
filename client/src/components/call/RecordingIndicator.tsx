'use client';

import { useEffect, useState } from 'react';
import { CircleDot } from 'lucide-react';

interface RecordingIndicatorProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  recordingDuration?: number;
}

export function RecordingIndicator({
  isRecording,
  onToggleRecording,
  recordingDuration = 0,
}: RecordingIndicatorProps) {
  const [duration, setDuration] = useState(recordingDuration);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    setDuration(recordingDuration);
  }, [recordingDuration]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30">
          <CircleDot size={12} className="text-destructive animate-pulse" />
          <span className="text-xs font-semibold text-destructive">
            Recording: {formatDuration(duration)}
          </span>
        </div>
      )}

      <button
        onClick={onToggleRecording}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full transition-all
          ${isRecording
            ? 'bg-destructive/20 hover:bg-destructive/30 text-destructive border-2 border-destructive/50'
            : 'bg-muted hover:bg-muted/80 text-foreground'
          }
        `}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <CircleDot size={18} />
      </button>
    </div>
  );
}
