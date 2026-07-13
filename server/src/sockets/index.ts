import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import { configureSocket } from '../config/socket';
import chatSocket from './chat.socket';
import callSocket from './call.socket';
import typingSocket from './typing.socket';
import presenceSocket from './presence.socket';
import notificationSocket from './notification.socket';

/**
 * initSockets initializes Socket.IO and registers all socket namespaces and handlers.
 */
export function initSockets(server: Server) {
  const io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  configureSocket(io);
  chatSocket(io);
  callSocket(io);
  typingSocket(io);
  presenceSocket(io);
  notificationSocket(io);
}
