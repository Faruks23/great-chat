import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { getSocket } from '@/lib/socket';
import { endCall, setActiveCall, updateCallStatus } from '@/store/chatSlice';

export type CallMode = 'voice' | 'video';
export type CallKind = 'direct' | 'group' | 'meeting';
export type CallConnectionState = 'idle' | 'joining' | 'connected' | 'error';

type CallSignalPayload = {
  room: string;
  senderId: string;
  mode: string;
  kind?: CallKind;
  targetId?: string;
  signalType: 'ready' | 'offer' | 'answer' | 'candidate';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

type CallUiState = {
  connected: boolean;
  connectionState: CallConnectionState;
  events: string[];
  permissionError: string | null;
  permissionHint: string | null;
  mediaPermissionState: PermissionState | null;
  callStarted: boolean;
  role: 'offerer' | 'answerer' | 'waiting';
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  hasLocalMedia: boolean;
  hasRemoteMedia: boolean;
  showPanel: boolean;
  showParticipants: boolean;
  isJoining: boolean;
  statusMessage: string;
};

type UseCallSessionProps = {
  room: string;
  mode: CallMode;
  kind: CallKind;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
};

const createInitialState = (mode: CallMode): CallUiState => ({
  connected: false,
  connectionState: 'idle',
  events: [],
  permissionError: null,
  permissionHint: null,
  mediaPermissionState: null,
  callStarted: false,
  role: 'waiting',
  isMuted: false,
  isVideoEnabled: mode === 'video',
  isScreenSharing: false,
  hasLocalMedia: false,
  hasRemoteMedia: false,
  showPanel: false,
  showParticipants: false,
  isJoining: false,
  statusMessage: 'Start a call to connect with someone in this room.',
});

export function useCallSession({ room, mode, kind }: UseCallSessionProps) {
  const dispatch = useAppDispatch();
  const [uiState, setUiState] = useState<CallUiState>(() => createInitialState(mode));
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [participants, setParticipants] = useState<string[]>([]);
  const participantsRef = useRef<string[]>([]);
  const [connectedAt, setConnectedAt] = useState<Date | null>(null);

  const updateParticipants = (updater: (current: string[]) => string[]) => {
    setParticipants((current) => {
      const next = updater(current);
      participantsRef.current = next;
      return next;
    });
  };

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const remoteStreamsRef = useRef<Record<string, MediaStream>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const isScreenSharingRef = useRef(false);

  const generateLocalId = () => {
    const socket = getSocket();
    return socket?.id || `user-${Math.random().toString(36).slice(2, 11)}`;
  };

  const localId = useRef<string>(generateLocalId());
  const pendingOffersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setNow(new Date());
    const intervalId = window.setInterval(() => setNow(new Date()), 1000 * 30);
    return () => window.clearInterval(intervalId);
  }, []);

  const updateUi = (updates: Partial<CallUiState>) => {
    setUiState((current) => ({ ...current, ...updates }));
  };

  const setLog = (message: string) => {
    setUiState((current) => ({
      ...current,
      events: [message, ...current.events].slice(0, 16),
    }));
  };

  const connectionStatus = useMemo(() => {
    if (uiState.permissionError) return 'Media unavailable';
    if (uiState.connectionState === 'connected') return 'Connected';
    if (uiState.connectionState === 'joining') return 'Connecting';
    if (uiState.connectionState === 'error') return 'Needs attention';
    return 'Ready to join';
  }, [uiState.connectionState, uiState.permissionError]);

  const remoteParticipantName = useMemo(() => {
    const remoteIds = participants.filter((id) => id && id !== localId.current);
    if (remoteIds.length === 0) return null;
    const firstRemoteId = remoteIds[0];
    if (firstRemoteId.startsWith('user-')) {
      return `Participant ${firstRemoteId.slice(5, 9)}`;
    }
    return `Participant ${firstRemoteId.slice(-4)}`;
  }, [participants]);

  const callDuration = useMemo(() => {
    if (!connectedAt || !now) return '00:00';
    const seconds = Math.max(0, Math.floor((now.getTime() - connectedAt.getTime()) / 1000));
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainderSeconds).padStart(2, '0')}`;
  }, [connectedAt, now]);

  useEffect(() => {
    if (uiState.connectionState === 'connected') {
      setConnectedAt((current) => current ?? new Date());
    } else {
      setConnectedAt(null);
    }
  }, [uiState.connectionState]);

  const attachLocalStream = (stream: MediaStream) => {
    localStreamRef.current = stream;
    if (localVideoRef.current && mode === 'video') {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      void localVideoRef.current.play().catch(() => undefined);
    }
    updateUi({
      permissionError: null,
      permissionHint: null,
      mediaPermissionState: 'granted',
      hasLocalMedia: true,
    });
  };

  useEffect(() => {
    if (!localVideoRef.current || !localStreamRef.current || mode !== 'video') return;
    localVideoRef.current.srcObject = localStreamRef.current;
    localVideoRef.current.muted = true;
    void localVideoRef.current.play().catch(() => undefined);
  }, [mode, uiState.callStarted, uiState.isVideoEnabled, uiState.connectionState]);

  useEffect(() => {
    if (!remoteVideoRef.current || Object.keys(remoteStreamsRef.current).length === 0) return;
    const stream = Object.values(remoteStreamsRef.current)[0];
    remoteVideoRef.current.srcObject = stream;
    remoteVideoRef.current.playsInline = true;
    void remoteVideoRef.current.play().catch(() => undefined);
  }, [remoteStreams]);

  const checkMediaPermissions = async () => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return null;
    try {
      const audioStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      const videoStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const nextState = audioStatus.state === 'denied' || videoStatus.state === 'denied'
        ? 'denied'
        : audioStatus.state === 'granted' || videoStatus.state === 'granted'
          ? 'granted'
          : 'prompt';
      updateUi({ mediaPermissionState: nextState });
      return nextState;
    } catch {
      return null;
    }
  };

  const requestMediaPermissions = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const message = 'This browser does not support secure call media access.';
      updateUi({
        permissionError: message,
        permissionHint: 'Please use a modern Chromium-based browser such as Chrome or Edge.',
        mediaPermissionState: 'denied',
      });
      setLog(message);
      return;
    }

    try {
      setLog('Requesting media access…');
      const stream = await navigator.mediaDevices.getUserMedia(mode === 'video' ? { audio: true, video: true } : { audio: true });
      attachLocalStream(stream);
      setLog('Media access ready');
      updateUi({ statusMessage: 'Your microphone and camera are ready.' });
    } catch (error) {
      const errMsg = (error as Error).message;
      updateUi({
        permissionError: errMsg,
        permissionHint: 'Allow microphone and camera access when prompted, or change browser permissions in site settings.',
        mediaPermissionState: 'denied',
        hasLocalMedia: false,
      });
      setLog(`Permission request failed: ${errMsg}`);
    }
  };

  const startCall = async () => {
    updateUi({ isJoining: true, connectionState: 'joining', statusMessage: 'Requesting microphone and camera access…' });
    setLog('User initiated call');

    try {
      if (!localStreamRef.current) {
        await requestMediaPermissions();
      }

      if (!localStreamRef.current) {
        updateUi({ connectionState: 'error', statusMessage: 'We could not start the call.' });
        return;
      }

      updateUi({
        permissionError: null,
        callStarted: true,
        statusMessage: kind === 'meeting' ? 'Creating a meeting room…' : kind === 'group' ? 'Opening a group call…' : 'Connecting directly…',
      });
      setLog(`Call session started as ${kind}`);
    } catch (error) {
      const errMsg = (error as Error).message;
      updateUi({
        permissionError: errMsg,
        connectionState: 'error',
        statusMessage: 'We could not start the call.',
      });
      setLog(`Start call failed: ${errMsg}`);
    } finally {
      updateUi({ isJoining: false });
    }
  };

  useEffect(() => {
    if (!mounted || !uiState.callStarted) return;

    const socket = getSocket();
    if (!socket) {
      updateUi({
        connectionState: 'error',
        statusMessage: 'The call connection could not be initialized.',
      });
      return;
    }

    let active = true;
    let handleSignal: ((payload: CallSignalPayload) => void) | null = null;
    let handleParticipantJoined: ((payload: { peerId?: string; room?: string }) => void) | null = null;
    let handleParticipantLeft: ((payload: { peerId?: string; room?: string }) => void) | null = null;

    const cleanupPeers = () => {
      Object.values(peersRef.current).forEach((peer) => peer.close());
      peersRef.current = {};
      remoteStreamsRef.current = {};
      setRemoteStreams({});
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      updateUi({ hasLocalMedia: false, hasRemoteMedia: false });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };

    const ensureSocketConnected = async () => {
      if (socket.connected) {
        localId.current = socket.id || localId.current;
        return;
      }
      socket.connect();
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('Socket connection timed out')), 6000);
        socket.once('connect', () => {
          localId.current = socket.id || localId.current;
          window.clearTimeout(timeout);
          resolve();
        });
        socket.once('connect_error', () => {
          window.clearTimeout(timeout);
          reject(new Error('Socket connection failed'));
        });
      });
    };

    const createPeerConnection = (peerId: string) => {
      if (peersRef.current[peerId]) return peersRef.current[peerId];

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current[peerId] = pc;
      setLog(`Peer connection created for ${peerId}`);

      // When a new peer connection is created, add local tracks. If screen sharing
      // is active, replace the video track with the screen track when adding.
      // Add local tracks (audio + video) normally.
      localStreamRef.current?.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, localStreamRef.current!);
        } catch (e) {
          // ignore addTrack errors per peer
        }
      });

      // If screen sharing is active, replace existing video sender(s) with screen track
      // rather than adding new senders. Add defensive logging if multiple video senders exist.
      if (isScreenSharingRef.current && screenStreamRef.current) {
        const screenTrack = screenStreamRef.current.getVideoTracks()[0];
        if (screenTrack) {
          const senders = pc.getSenders();
          const videoSenders = senders.filter((s) => s.track && s.track.kind === 'video');
          if (videoSenders.length > 1) {
            console.warn(`Peer ${peerId} has ${videoSenders.length} video senders; replacing tracks to avoid duplicates.`, videoSenders.map((s) => s.track?.id));
          } else {
            console.debug(`Peer ${peerId} video senders: ${videoSenders.length}`);
          }

          videoSenders.forEach((sender) => {
            try {
              sender.replaceTrack(screenTrack);
            } catch (e) {
              // ignore per-sender replace errors
            }
          });
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('call:signal', {
            room,
            senderId: localId.current,
            targetId: peerId,
            mode,
            kind,
            signalType: 'candidate',
            candidate: event.candidate.toJSON(),
          } as CallSignalPayload);
        }
      };

      pc.ontrack = (event) => {
        const track = event.track;
        const isScreenTrack = track.kind === 'video' && track.label.toLowerCase().includes('screen');
        if (isScreenTrack) {
          // Screen-share tracks are handled by the UI layer separately. Do not
          // replace the main remote video stream with the screen track here.
          setLog(`Received screen-share track from ${peerId}`);
          return;
        }

        const stream = event.streams?.[0] ?? (track ? new MediaStream([track]) : null);
        if (!stream) return;
        remoteStreamsRef.current[peerId] = stream;
        setRemoteStreams({ ...remoteStreamsRef.current });
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.playsInline = true;
          void remoteVideoRef.current.play().catch(() => undefined);
        }
        updateUi({ hasRemoteMedia: true });
        setLog(`Received media from ${peerId}`);
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === 'connected') {
          updateUi({ connected: true, connectionState: 'connected', statusMessage: 'You are connected.' });
          dispatch(updateCallStatus('connected'));
        } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
          delete peersRef.current[peerId];
          delete remoteStreamsRef.current[peerId];
          setRemoteStreams({ ...remoteStreamsRef.current });
          updateUi({
            connected: Object.keys(peersRef.current).length > 0,
            connectionState: Object.keys(peersRef.current).length > 0 ? 'connected' : 'error',
            statusMessage: Object.keys(peersRef.current).length > 0 ? 'You are connected.' : 'The call dropped. You can try again.',
          });
        }
      };

      return pc;
    };

    const createOffer = async (peerId: string) => {
      if (pendingOffersRef.current.has(peerId)) return;
      pendingOffersRef.current.add(peerId);
      try {
        const pc = createPeerConnection(peerId);
        if (pc.signalingState !== 'stable') {
          pendingOffersRef.current.delete(peerId);
          return;
        }
        setLog(`Creating offer for ${peerId}`);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('call:signal', {
          room,
          senderId: localId.current,
          targetId: peerId,
          mode,
          kind,
          signalType: 'offer',
          sdp: offer,
        } as CallSignalPayload);
        setLog(`Offer sent to ${peerId}`);
      } catch (error) {
        setLog(`Offer creation failed for ${peerId}: ${(error as Error).message}`);
      } finally {
        pendingOffersRef.current.delete(peerId);
      }
    };

    const setupCall = async () => {
      try {
        updateUi({ connectionState: 'joining' });
        setLog(`Joining room ${room}`);
        dispatch(setActiveCall({ room, mode, status: 'connecting' }));
        await ensureSocketConnected();

        handleParticipantJoined = (payload) => {
          if (!payload.peerId || payload.peerId === localId.current) return;
          updateParticipants((current) => {
            if (current.includes(payload.peerId!)) return current;
            return [...current, payload.peerId!];
          });
          setLog(`${payload.peerId} joined the room`);
        };

        handleParticipantLeft = (payload) => {
          if (!payload.peerId) return;
          updateParticipants((current) => current.filter((participant) => participant !== payload.peerId));
          if (peersRef.current[payload.peerId]) {
            peersRef.current[payload.peerId].close();
            delete peersRef.current[payload.peerId];
            delete remoteStreamsRef.current[payload.peerId];
            setRemoteStreams({ ...remoteStreamsRef.current });
          }
        };

        handleSignal = async (payload: CallSignalPayload) => {
          if (!active || payload.room !== room || payload.senderId === localId.current) return;
          const remotePeerId = payload.senderId;
          if (!participantsRef.current.includes(remotePeerId)) {
            updateParticipants((current) => (current.includes(remotePeerId) ? current : [...current, remotePeerId]));
          }

          setLog(`Signal ${payload.signalType} from ${remotePeerId}`);
          const pc = createPeerConnection(remotePeerId);

          try {
            switch (payload.signalType) {
              case 'ready': {
                if (pc.signalingState === 'stable') {
                  await createOffer(remotePeerId);
                }
                break;
              }
              case 'offer': {
                if (!payload.sdp) return;
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('call:signal', {
                  room,
                  senderId: localId.current,
                  targetId: remotePeerId,
                  mode,
                  kind,
                  signalType: 'answer',
                  sdp: answer,
                } as CallSignalPayload);
                updateUi({ role: 'answerer' });
                setLog(`Answer sent to ${remotePeerId}`);
                break;
              }
              case 'answer': {
                if (!payload.sdp) return;
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                updateUi({ connected: true, connectionState: 'connected', statusMessage: 'You are connected.' });
                dispatch(updateCallStatus('connected'));
                setLog(`Remote answer applied from ${remotePeerId}`);
                break;
              }
              case 'candidate': {
                if (!payload.candidate) return;
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                } catch (error) {
                  setLog(`ICE candidate error for ${remotePeerId}: ${(error as Error).message}`);
                }
                break;
              }
              default:
                break;
            }
          } catch (error) {
            setLog(`Signal handling error: ${(error as Error).message}`);
          }
        };

        socket.on('call:signal', handleSignal);
        socket.on('call:participant-joined', handleParticipantJoined);
        socket.on('call:participant-left', handleParticipantLeft);
        socket.emit('call:join', room, localId.current);
        updateParticipants((current) => (current.includes(localId.current) ? current : [localId.current, ...current]));

        const currentPermission = await checkMediaPermissions();
        if (currentPermission === 'denied') {
          updateUi({
            permissionError: 'Camera or microphone permission is denied.',
            permissionHint: 'Allow access in the browser site settings and retry.',
            connectionState: 'error',
            statusMessage: 'Microphone or camera access is blocked.',
          });
          setLog('Permissions denied for the call');
          return;
        }

        if (!localStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia(mode === 'video' ? { audio: true, video: true } : { audio: true });
          attachLocalStream(stream);
          setLog('Local media acquired');
        }

        socket.emit('call:signal', { room, senderId: localId.current, mode, kind, signalType: 'ready' } as CallSignalPayload);
        setLog('Ready signal sent');
        updateUi({
          statusMessage: kind === 'meeting' ? 'Waiting for others to join the meeting…' : kind === 'group' ? 'Waiting for the group to connect…' : 'Waiting for the other participant to join…',
        });
      } catch (error) {
        const errMsg = (error as Error).message;
        updateUi({
          permissionError: errMsg,
          connectionState: 'error',
          statusMessage: 'The call could not be established.',
        });
        setLog(`Setup error: ${errMsg}`);
      }
    };

    void setupCall();

    return () => {
      active = false;
      if (handleSignal) {
        socket.off('call:signal', handleSignal);
      }
      if (handleParticipantJoined) {
        socket.off('call:participant-joined', handleParticipantJoined);
      }
      if (handleParticipantLeft) {
        socket.off('call:participant-left', handleParticipantLeft);
      }
      socket.emit('call:leave', room, localId.current);
      cleanupPeers();
      updateUi({
        connected: false,
        connectionState: 'idle',
        role: 'waiting',
        statusMessage: 'Join the room and invite someone to connect.',
      });
      dispatch(endCall());
    };
  }, [dispatch, mounted, mode, room, kind, uiState.callStarted]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    updateUi({ isMuted: !uiState.isMuted });
    setLog(uiState.isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const toggleCamera = () => {
    if (mode !== 'video') return;
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    updateUi({ isVideoEnabled: !uiState.isVideoEnabled });
    setLog(uiState.isVideoEnabled ? 'Camera disabled' : 'Camera enabled');
  };

  const hangupCall = () => {
    Object.values(peersRef.current).forEach((peer) => peer.close());
    peersRef.current = {};
    remoteStreamsRef.current = {};
    setRemoteStreams({});
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    updateUi({
      connected: false,
      connectionState: 'idle',
      role: 'waiting',
      isMuted: false,
      isVideoEnabled: mode === 'video',
      callStarted: false,
      hasLocalMedia: false,
      hasRemoteMedia: false,
      statusMessage: 'The call ended. You can start a fresh session anytime.',
    });
    getSocket()?.emit('call:leave', room, localId.current);
    dispatch(endCall());
    setLog('Call ended');
  };

  const resendReady = () => {
    getSocket()?.emit('call:signal', {
      room,
      senderId: localId.current,
      mode,
      kind,
      signalType: 'ready',
    } as CallSignalPayload);
    setLog('Ready signal re-sent');
  };

  const copyRoomLink = async () => {
    const sharedUrl = `${window.location.origin}/calls?room=${encodeURIComponent(room)}&mode=${mode}&type=${kind}`;
    try {
      await navigator.clipboard.writeText(sharedUrl);
      updateUi({ statusMessage: 'Room link copied. Share it with someone else.' });
      setLog('Room link copied to clipboard');
    } catch {
      updateUi({ statusMessage: 'Sharing is not available in this browser.' });
    }
  };

  const timeLabel = now ? now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  const dateLabel = now ? now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : '';

  // Screen share control: start and stop screen sharing and replace outgoing video tracks
  const startScreenShare = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setLog('Screen sharing is not supported in this browser');
      updateUi({ statusMessage: 'Screen sharing is not supported in this browser.' });
      return null;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as unknown as MediaTrackConstraints,
        audio: false,
        // Chromium uses this hint to avoid offering the current tab as a share
        // source. That prevents the call UI from being captured recursively.
        selfBrowserSurface: 'exclude',
      } as unknown as MediaStreamConstraints);
      const screenTrack = displayStream.getVideoTracks()[0];
      if (!screenTrack) return null;

      // store original camera track so we can restore it
      originalVideoTrackRef.current = localStreamRef.current?.getVideoTracks()?.[0] ?? null;
      screenStreamRef.current = displayStream;
      isScreenSharingRef.current = true;

      // replace video sender track for each peer
      Object.values(peersRef.current).forEach((pc) => {
        pc.getSenders().forEach((sender) => {
          if (sender.track && sender.track.kind === 'video') {
            try {
              sender.replaceTrack(screenTrack);
            } catch (e) {
              // some browsers may throw, ignore per-sender errors
            }
          }
        });
      });

      // Keep the local picture-in-picture on the camera. Rendering the captured
      // display inside the window being shared produces an infinite mirror on
      // the receiver when the user shares their monitor or this browser tab.

      // when user stops sharing from browser UI, restore camera
      screenTrack.onended = () => {
        stopScreenShare();
      };

      updateUi({ isScreenSharing: true, statusMessage: 'You are sharing your screen.' });
      setLog('Screen sharing started');
      return displayStream;
    } catch (err) {
      setLog(`Screen share failed: ${(err as Error).message}`);
      return null;
    }
  };

  const stopScreenShare = () => {
    if (!isScreenSharingRef.current) return;

    const screenStream = screenStreamRef.current;
    const originalTrack = originalVideoTrackRef.current;

    // restore original camera track on each peer sender
    Object.values(peersRef.current).forEach((pc) => {
      pc.getSenders().forEach((sender) => {
        if (sender.track && sender.track.kind === 'video') {
          try {
            // prefer the original camera track, otherwise enable null
            sender.replaceTrack(originalTrack ?? null);
          } catch (e) {
            // swallow per-sender errors
          }
        }
      });
    });

    // restore local preview to camera stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current ?? null;
      if (localStreamRef.current) void localVideoRef.current.play().catch(() => undefined);
    }

    // stop screen stream tracks
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
    }

    screenStreamRef.current = null;
    originalVideoTrackRef.current = null;
    isScreenSharingRef.current = false;

    updateUi({ isScreenSharing: false, statusMessage: 'Screen sharing stopped' });
    setLog('Screen sharing stopped');
  };

  return {
    ...uiState,
    connectionStatus,
    remoteParticipantName,
    callDuration,
    localVideoRef,
    remoteVideoRef,
    timeLabel,
    dateLabel,
    localId: localId.current,
    remoteStreams,
    participants,
    mode,
    kind,
    room,
    startCall,
    requestMediaPermissions,
    toggleMute,
    toggleCamera,
    hangupCall,
    resendReady,
    copyRoomLink,
    startScreenShare,
    stopScreenShare,
    setShowPanel: (value: boolean | ((current: boolean) => boolean)) => {
      setUiState((current) => ({
        ...current,
        showPanel: typeof value === 'function' ? value(current.showPanel) : value,
      }));
    },
    setShowParticipants: (value: boolean | ((current: boolean) => boolean)) => {
      setUiState((current) => ({
        ...current,
        showParticipants: typeof value === 'function' ? value(current.showParticipants) : value,
      }));
    },
  };
}
