import { useRef, useCallback, useEffect } from 'react';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
};

export interface UseWebRTCPeerProps {
  onTrack?: (event: RTCTrackEvent) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
}

export function useWebRTCPeer({ onTrack, onConnectionStateChange, onIceCandidate }: UseWebRTCPeerProps) {
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (onIceCandidate) {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          onIceCandidate(event.candidate);
        }
      };
    }

    if (onTrack) {
      pc.ontrack = onTrack;
    }

    if (onConnectionStateChange) {
      pc.onconnectionstatechange = () => {
        onConnectionStateChange(pc.connectionState);
      };
    }

    pcRef.current = pc;
    return pc;
  }, [onIceCandidate, onTrack, onConnectionStateChange]);

  const addStream = useCallback((stream: MediaStream) => {
    const pc = pcRef.current || createPeerConnection();
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
  }, [createPeerConnection]);

  const removeStream = useCallback((stream: MediaStream) => {
    if (!pcRef.current) return;
    stream.getTracks().forEach((track) => {
      const sender = pcRef.current!.getSenders().find((s) => s.track === track);
      if (sender) {
        pcRef.current!.removeTrack(sender);
      }
    });
  }, []);

  const createOffer = useCallback(async () => {
    const pc = pcRef.current || createPeerConnection();
    if (pc.signalingState !== 'stable') {
      throw new Error('Cannot create offer in non-stable signaling state');
    }
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }, [createPeerConnection]);

  const createAnswer = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) throw new Error('Peer connection not initialized');
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }, []);

  const setRemoteDescription = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      const pc = pcRef.current || createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    },
    [createPeerConnection]
  );

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current;
    if (!pc) throw new Error('Peer connection not initialized');
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  const close = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }, []);

  const getPeerConnection = useCallback(() => {
    return pcRef.current || createPeerConnection();
  }, [createPeerConnection]);

  return {
    createPeerConnection,
    addStream,
    removeStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    close,
    getPeerConnection,
    peerConnection: pcRef.current,
  };
}
