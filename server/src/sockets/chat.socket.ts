import { Server } from 'socket.io';
import { MessageService } from '../modules/message/message.service';
import { getPendingNotifications, queuePendingNotification } from './notificationStore';

/**
 * chatSocket registers socket listeners for chat room participation and messaging.
 * It persists messages, forwards them to conversation members, and queues offline notifications.
 */
export default function chatSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.on('chat:join', (conversationId: string) => {
      console.log(`socket ${socket.id} joining conversation:${conversationId}`);
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('chat:message', async (message) => {
      const savedMessage = await MessageService.create(message);
      const payload = savedMessage.toObject();
      const recipients = Array.isArray(message.participants) ? message.participants : [];
      const recipientId = recipients.find((id: string) => id !== message.senderId);

      socket.broadcast.to(`conversation:${message.conversationId}`).emit('chat:message', {
        ...payload,
        from: 'them',
        senderId: payload.senderId ?? message.senderId,
      });

      if (recipientId) {
        const socketId = io.sockets.adapter.rooms.get(`user:${recipientId}`);
        const isOnline = Boolean(socketId && socketId.size > 0);

        const notificationPayload = {
          type: 'message',
          title: 'New message',
          body: message.text,
          data: {
            conversationId: message.conversationId,
            senderId: message.senderId,
          },
        };

        if (isOnline) {
          io.to(`user:${recipientId}`).emit('notification:receive', notificationPayload);
        } else {
          queuePendingNotification(recipientId, {
            conversationId: message.conversationId,
            senderId: message.senderId,
            text: message.text,
            createdAt: new Date().toISOString(),
            recipientId,
          });
        }
      }
    });

    socket.on('chat:typing', (payload) => {
      socket.broadcast.to(`conversation:${payload.conversationId}`).emit('chat:typing', payload);
    });

    socket.on('chat:leave', (conversationId: string) => {
      console.log(`socket ${socket.id} leaving conversation:${conversationId}`);
      socket.leave(`conversation:${conversationId}`);
    });
  });
}
