import { io } from 'socket.io-client';

let socket: ReturnType<typeof io> | null = null;

export function getSocket() {
  if (typeof window === 'undefined') {
    return null; // SSR safety
  }

  if (!socket) {
    try {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:5000', {
        autoConnect: false,
      });
    } catch (error) {
      console.error('Socket initialization failed:', error);
      return null;
    }
  }

  return socket;
}

export default getSocket();
