import { Server } from 'socket.io';

/**
 * typingSocket forwards lightweight typing indicators to all connected clients.
 *
 * Clients emit `typing:update` when the user starts/stops typing. The server
 * rebroadcasts the payload to other connected sockets so UIs can show "typing..." states.
 * This socket intentionally keeps logic minimal (no room joins) because typing
 * indicators are global or filtered client-side by conversation id.
 */
export default function typingSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.on('typing:update', (payload) => {
      socket.broadcast.emit('typing:update', payload);
    });
  });
}
