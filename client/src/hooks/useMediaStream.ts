import { useRef, useCallback, useState } from 'react';

export interface UseMediaStreamProps {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

export function useMediaStream({ audio = true, video = false }: UseMediaStreamProps = {}) {
  const streamRef = useRef<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(!!video);
  const [error, setError] = useState<string | null>(null);

  const requestStream = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audio,
        video: video,
      });

      streamRef.current = stream;
      setError(null);
      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get media stream';
      setError(errorMessage);
      throw err;
    }
  }, [audio, video]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const toggleMute = useCallback((mute?: boolean) => {
    if (!streamRef.current) return;

    const audioTracks = streamRef.current.getAudioTracks();
    const newMutedState = mute !== undefined ? mute : !isMuted;

    audioTracks.forEach((track) => {
      track.enabled = !newMutedState;
    });

    setIsMuted(newMutedState);
  }, [isMuted]);

  const toggleVideo = useCallback((enable?: boolean) => {
    if (!streamRef.current) return;

    const videoTracks = streamRef.current.getVideoTracks();
    const newEnabledState = enable !== undefined ? enable : !isVideoEnabled;

    videoTracks.forEach((track) => {
      track.enabled = newEnabledState;
    });

    setIsVideoEnabled(newEnabledState);
  }, [isVideoEnabled]);

  const replaceTrack = useCallback(
    async (kind: 'audio' | 'video', newTrack: MediaStreamTrack | null) => {
      if (!streamRef.current) throw new Error('No media stream available');

      const tracks = kind === 'audio' ? streamRef.current.getAudioTracks() : streamRef.current.getVideoTracks();

      if (tracks.length === 0 && !newTrack) return;

      if (tracks[0]) {
        tracks[0].stop();
        streamRef.current.removeTrack(tracks[0]);
      }

      if (newTrack) {
        streamRef.current.addTrack(newTrack);
      }
    },
    []
  );

  const getStream = useCallback(() => streamRef.current, []);

  return {
    stream: streamRef.current,
    isMuted,
    isVideoEnabled,
    error,
    requestStream,
    stopStream,
    toggleMute,
    toggleVideo,
    replaceTrack,
    getStream,
  };
}
