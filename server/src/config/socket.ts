import { Server } from 'socket.io';

export function configureSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
  });
}
