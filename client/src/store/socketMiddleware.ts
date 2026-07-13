import type { Middleware } from '@reduxjs/toolkit';
import socket from '@/lib/socket';
import { appendMessage, setActiveConversation } from '@/store/chatSlice';

/**
 * socketMiddleware centralizes socket side-effects for Redux actions.
 * - Joins/leaves conversation rooms when active conversation changes.
 * - Emits outgoing chat messages when `appendMessage` is dispatched for local sends.
 */
export const socketMiddleware: Middleware = (store) => (next) => (action) => {
  const prevActive = store.getState().chat.activeId as string | undefined;

  const result = next(action);

  try {
    // When active conversation changes, leave previous and join new room.
    if (action.type === setActiveConversation.type) {
      const newActive = action.payload as string;
      if (prevActive && prevActive !== newActive) {
        socket.emit('chat:leave', prevActive);
      }
      if (newActive) {
        if (!socket.connected) socket.connect();
        socket.emit('chat:join', newActive);
      }
    }

    // When an optimistic/local message is appended, emit it to the server.
    if (action.type === appendMessage.type) {
      const { conversationId, message } = action.payload as { conversationId: string; message: any };
      // Only emit messages originating from this client (marked `from: 'me'`).
      if (message && message.from === 'me') {
        if (!socket.connected) socket.connect();
        socket.emit('chat:message', message);
      }
    }
  } catch (err) {
    // swallow middleware errors but log for debugging
    // eslint-disable-next-line no-console
    console.error('socketMiddleware error', err);
  }

  return result;
};

export default socketMiddleware;
