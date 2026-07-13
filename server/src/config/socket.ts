import { Server } from 'socket.io';

let ioServer: Server | null = null;

export function configureSocket(io: Server) {
  ioServer = io;
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
  });
}

export function getIoServer() {
  return ioServer;
}
