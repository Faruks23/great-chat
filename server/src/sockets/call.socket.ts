import { Server } from 'socket.io';

/**
 * callSocket coordinates call signaling, invitations, and presence channels for real-time calls.
 */
export default function callSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.on('call:join', (room: string, peerId?: string) => {
      socket.join(`call:${room}`);
      if (peerId) {
        socket.join(`peer:${peerId}`);
      }
      socket.to(`call:${room}`).emit('call:participant-joined', { room, peerId });
    });

    socket.on('call:leave', (room: string, peerId?: string) => {
      socket.leave(`call:${room}`);
      if (peerId) {
        socket.leave(`peer:${peerId}`);
      }
      socket.to(`call:${room}`).emit('call:participant-left', { room, peerId });
    });

    socket.on('call:signal', (payload) => {
      try {
        if (payload && (payload as any).targetId) {
          const targetId = (payload as any).targetId;
          const peerRoom = `peer:${targetId}`;
          console.log(`call:signal targeted to peer:${targetId}`);
          io.to(peerRoom).emit('call:signal', payload);
        } else {
          socket.broadcast.to(`call:${payload.room}`).emit('call:signal', payload);
        }
      } catch (err) {
        console.error('call:signal error', err);
      }
    });

    socket.on('presence:update', (user: { id?: string; online?: boolean }) => {
      if (!user?.id) return;
      console.log(`call.socket presence:update user=${user.id} online=${user.online} socket=${socket.id}`);
      socket.data.userId = user.id;
      if (user.online) {
        socket.join(`user:${user.id}`);
        console.log(`call.socket: socket ${socket.id} joined user:${user.id}`);
      }
    });

    socket.on('call:invite', (payload: { room: string; from?: string; targets?: string[]; mode?: string; kind?: string }) => {
      try {
        const targets = Array.isArray(payload.targets) ? payload.targets.filter(Boolean) : [];
        const eventPayload = {
          room: payload.room,
          from: payload.from,
          mode: payload.mode || 'voice',
          kind: payload.kind || 'direct',
          timestamp: Date.now(),
        };

        console.log('call:invite', { room: payload.room, from: payload.from, targets, mode: payload.mode });

        if (targets.length > 0) {
          targets.forEach((targetId) => {
            const targetRoom = `user:${targetId}`;
            console.log(`emitting call:incoming to user:${targetId}`);
            io.to(targetRoom).emit('call:incoming', eventPayload);
            io.to(targetRoom).emit('notification:receive', {
              type: 'call',
              title: 'Incoming call',
              body: `Incoming ${eventPayload.mode} call`,
              data: { room: payload.room, mode: eventPayload.mode },
            });
          });
        } else {
          console.log('call:invite has no targets, broadcasting to all clients');
          io.emit('call:incoming', { ...eventPayload, debug: true });
        }
      } catch (err) {
        console.error('call:invite error', err);
      }
    });
  });
}
