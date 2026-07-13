# Call System Implementation Guide

## Architecture Overview

The call system has been redesigned with a modular, component-based architecture that separates concerns and improves maintainability.

### Core Hooks

#### 1. `useCallSession` (Main Hook)
The primary hook managing the complete call lifecycle.

**Key Features:**
- WebRTC peer connection management
- Media stream handling
- State management for UI
- Socket event handling
- Call signal processing (offer/answer/candidate)

**Usage:**
```typescript
const {
  // State
  callStarted,
  connected,
  isMuted,
  isVideoEnabled,
  showPanel,
  showParticipants,
  
  // Data
  remoteStreams,
  participants,
  mode,
  kind,
  room,
  
  // Refs
  localVideoRef,
  remoteVideoRef,
  
  // Methods
  startCall,
  toggleMute,
  toggleCamera,
  hangupCall,
  setShowPanel,
  setShowParticipants,
} = useCallSession({ room, mode, kind });
```

#### 2. `useWebRTCPeer` (Specialized Hook)
Manages individual peer connections.

**Usage:**
```typescript
const {
  createPeerConnection,
  addStream,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
  close,
} = useWebRTCPeer({
  onTrack: (event) => console.log('Received track', event),
  onConnectionStateChange: (state) => console.log('Connection state:', state),
  onIceCandidate: (candidate) => socket.emit('ice:candidate', candidate),
});
```

#### 3. `useMediaStream` (Media Management Hook)
Manages local media stream and permissions.

**Usage:**
```typescript
const {
  stream,
  isMuted,
  isVideoEnabled,
  error,
  requestStream,
  stopStream,
  toggleMute,
  toggleVideo,
} = useMediaStream({ audio: true, video: true });
```

### Context API

#### CallSessionContext
Provides call session data to all components without prop drilling.

**Provider Setup:**
```typescript
<CallSessionProvider room="general" mode="video" kind="group">
  <YourCallComponent />
</CallSessionProvider>
```

**Usage in Components:**
```typescript
const {
  callStarted,
  connected,
  remoteStreams,
  participants,
  // ... all hook data
} = useCallSessionContext();
```

## Component Hierarchy

```
CallsPage
├── ErrorBoundary
└── CallSessionProvider
    └── CallsPageContent
        ├── CallLobby (pre-call state)
        │   ├── Video preview
        │   ├── Call info
        │   ├── Join button
        │   └── Permission error handling
        │
        └── Active Call View
            ├── CallHeader
            │   ├── Time and date
            │   ├── Room name
            │   ├── Participant count
            │   └── Connection status
            │
            ├── Video Container
            │   ├── CallVideoGrid
            │   │   ├── Remote video 1
            │   │   ├── Remote video 2
            │   │   └── Remote video N
            │   │
            │   └── LocalVideoPreview
            │       ├── Local video
            │       └── Live indicator
            │
            ├── CallActivityPanel (toggleable)
            │   └── Event log
            │
            ├── ParticipantsList (toggleable)
            │   ├── Participant count
            │   └── Participant list
            │       ├── Avatar
            │       ├── Name
            │       └── Actions (mute, remove)
            │
            └── CallControls
                ├── Mute button
                ├── Camera button
                ├── Resend ready button
                ├── Activity panel toggle
                ├── Participants toggle
                └── Hangup button
```

## Call Modes and Types

### Modes
- `'voice'`: Audio-only calls
- `'video'`: Video + audio calls

### Call Types (Kind)
- `'direct'`: One-to-one calls
- `'group'`: Multiple participants
- `'meeting'`: Persistent meeting rooms

## State Flow

### Initialization
1. User navigates to `/calls?room=XXX&mode=video&type=group`
2. CallSessionProvider initializes useCallSession hook
3. CallLobby displays with permission checks
4. User clicks "Join call"

### Call Establishment
1. `startCall()` is invoked
2. Media permissions are requested
3. Local stream is acquired
4. Socket.io emits `call:join` with localId
5. Server notifies other participants
6. `handleParticipantJoined` is triggered for each existing participant
7. Offers are created for each peer
8. WebRTC handshake begins (offer/answer/candidate)
9. Once streams are received, video appears

### Participant Changes
- New participant joins → `handleParticipantJoined` → create offer
- Participant leaves → `handleParticipantLeft` → close connection

### Call Termination
1. User clicks hangup
2. `hangupCall()` is invoked
3. All peer connections are closed
4. Media tracks are stopped
5. Socket.io emits `call:leave`
6. UI returns to CallLobby

## Video Grid Layout Algorithm

The video grid automatically adjusts based on participant count:

```typescript
const getGridClass = (count: number) => {
  if (count === 0) return '';           // Empty
  if (count === 1) return 'grid-cols-1'; // Single large video
  if (count === 2) return 'grid-cols-2'; // Two columns
  if (count === 3) return 'grid-cols-3'; // Three columns
  if (count === 4) return 'grid-cols-2 lg:grid-cols-2'; // 2x2 grid
  return 'grid-cols-2 lg:grid-cols-3'; // 2-3 column layout for 5+
};
```

## WebRTC Signaling Flow

```
Local User                   Remote User
    |                            |
    |------ offer ------>|       |
    |                    | accepts offer
    |                    |------ answer ----->|
    |<-- ice-candidate---|       |
    |                    |<-- ice-candidate--|
    |                    | (multiple candidates)
    |
    |======== connected========|
    |   ICE gathering complete
    |   ready for media
```

## Error Handling

### Permission Errors
- Display in CallLobby
- Show hint text for resolution
- Provide "Try again" and "Reload" buttons

### Connection Errors
- Automatically logged in CallActivityPanel
- Connection state color changes (amber → emerald → red)
- Status message updates

### Graceful Degradation
- If one peer connection fails, others continue
- Participant is removed from list
- UI remains responsive

## Performance Considerations

### Optimization Strategies
1. **Ref Management**: Using useRef to avoid unnecessary re-renders
2. **Conditional Rendering**: Grid only renders if streams exist
3. **Lazy State Updates**: Batching participant updates
4. **Proper Cleanup**: Destroying peer connections on unmount

### Scalability
- Current implementation supports up to 10-15 participants per browser
- GPU limitations on video processing
- Network bandwidth constraints at ~1Mbps per participant

## Testing Checklist

- [ ] Single direct call (1-to-1)
- [ ] Group call with 3+ participants
- [ ] Media permission denial handling
- [ ] Mute/unmute functionality
- [ ] Camera on/off
- [ ] Participant join/leave
- [ ] Activity panel toggle
- [ ] Participants panel toggle
- [ ] Hangup and cleanup
- [ ] Reconnection handling
- [ ] Error recovery

## Extending the System

### Adding Participant Actions
```typescript
// In ParticipantsList.tsx
<button
  onClick={() => onMuteParticipant(peerId)}
  className="..."
>
  <MicIcon />
</button>
```

### Custom Layouts
Create new layout components and add toggle in CallControls:
```typescript
<button onClick={() => setLayout('speaker')}>Speaker View</button>
<button onClick={() => setLayout('gallery')}>Gallery View</button>
```

### Screen Sharing
Add screen stream to remoteStreams:
```typescript
const screenStream = await navigator.mediaDevices.getDisplayMedia();
addStreamToCall(screenStream, { isScreenShare: true });
```

### Recording
Record canvas or media streams:
```typescript
const mediaRecorder = new MediaRecorder(localStream);
mediaRecorder.start();
```

## Common Issues and Solutions

### Videos Not Appearing
- Check permission errors in CallActivityPanel
- Verify socket connection
- Check browser console for WebRTC errors

### Audio Lag or Sync Issues
- Reduce participant count
- Check network bandwidth
- Verify codec compatibility

### One-way Audio/Video
- Check browser permissions
- Verify firewall settings
- Test STUN server connectivity

### High CPU Usage
- Reduce video resolution
- Lower participant count
- Check browser hardware acceleration settings
