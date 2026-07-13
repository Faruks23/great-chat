import { Server } from 'socket.io';

/**
 * notificationSocket relays notification events between clients.
 *
 * Clients emit `notification:send` to ask the server to distribute a notification
 * to other connected sockets. The server rebroadcasts as `notification:receive`.
 * Keep this channel lightweight: persistent notification storage and push delivery
 * are handled separately by notification services.
 */
export default function notificationSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.on('notification:send', (payload) => {
      if (payload?.data?.recipientId) {
        io.to(`user:${payload.data.recipientId}`).emit('notification:receive', payload);
      } else {
        socket.broadcast.emit('notification:receive', payload);
      }
    });
  });
}
