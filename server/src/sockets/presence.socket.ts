import { Server } from 'socket.io';
import { getPendingNotifications } from './notificationStore';
import UserModel from '../modules/user/user.model';

const onlineCounts = new Map<string, number>();

/**
 * presenceSocket tracks connected users and broadcasts online/offline status.
 * It also replays pending notifications to users when they come back online.
 */
export default function presenceSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.emit('presence:init', Array.from(onlineCounts.keys()));

    socket.on('presence:request', () => {
      socket.emit('presence:init', Array.from(onlineCounts.keys()));
    });

    socket.on('presence:update', (user: { id: string; online: boolean }) => {
      if (!user?.id) return;
      console.log(`presence:update received for user=${user.id} online=${user.online} socket=${socket.id}`);
      socket.data.userId = user.id;

      if (user.online) {
        const count = (onlineCounts.get(user.id) || 0) + 1;
        onlineCounts.set(user.id, count);
        socket.join(`user:${user.id}`);
        console.log(`socket ${socket.id} joined room user:${user.id} (count=${count})`);
        if (count === 1) {
          socket.broadcast.emit('presence:update', { id: user.id, online: true });
        }

        const pending = getPendingNotifications(user.id);
        if (pending.length > 0) {
          pending.forEach((notification) => {
            socket.emit('notification:receive', {
              type: 'message',
              title: 'New message',
              body: notification.text,
              data: { conversationId: notification.conversationId },
            });
          });
        }
      } else {
        const count = (onlineCounts.get(user.id) || 0) - 1;
        if (count > 0) {
          onlineCounts.set(user.id, count);
        } else {
          onlineCounts.delete(user.id);
          socket.broadcast.emit('presence:update', { id: user.id, online: false });
          // persist lastSeen for the user when they go fully offline
          try {
            UserModel.findByIdAndUpdate(user.id, { lastSeen: new Date() }).catch(() => {});
          } catch (e) {
            // ignore
          }
        }
        console.log(`presence:update offline for user=${user.id} socket=${socket.id} newCount=${count}`);
      }
    });

    socket.on('disconnect', () => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) return;
      const count = (onlineCounts.get(userId) || 0) - 1;
      if (count > 0) {
        onlineCounts.set(userId, count);
      } else {
        onlineCounts.delete(userId);
        socket.broadcast.emit('presence:update', { id: userId, online: false });
        // persist lastSeen when socket fully disconnects
        try {
          UserModel.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(() => {});
        } catch (e) {
          // ignore
        }
      }
      console.log(`socket disconnected ${socket.id} for user=${userId} newCount=${count}`);
    });
  });
}
