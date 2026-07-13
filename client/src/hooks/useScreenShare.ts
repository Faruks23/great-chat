import { useRef, useCallback, useState } from 'react';

export interface UseScreenShareProps {
  onScreenShare?: (stream: MediaStream | null) => void;
}

export function useScreenShare({ onScreenShare }: UseScreenShareProps = {}) {
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScreenShare = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser');
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always' as const,
        },
        audio: false,
      });

      screenStreamRef.current = displayStream;
      setIsSharing(true);
      setError(null);

      // Handle when user stops sharing from browser UI
      displayStream.getTracks().forEach((track) => {
        track.onended = () => {
          stopScreenShare();
        };
      });

      if (onScreenShare) {
        onScreenShare(displayStream);
      }

      return displayStream;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        // User cancelled screen sharing
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start screen sharing';
        setError(errorMessage);
      }
      setIsSharing(false);
      return null;
    }
  }, [onScreenShare]);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setIsSharing(false);
    setError(null);

    if (onScreenShare) {
      onScreenShare(null);
    }
  }, [onScreenShare]);

  const getScreenStream = useCallback(() => screenStreamRef.current, []);

  return {
    screenStream: screenStreamRef.current,
    isSharing,
    error,
    startScreenShare,
    stopScreenShare,
    getScreenStream,
  };
}
