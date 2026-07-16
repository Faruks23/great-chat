import type { AnyAction, Middleware } from 'redux';
import { getSocket } from '@/lib/socket';
import { appendMessage, setActiveConversation } from '@/store/chatSlice';
import type { RootState } from '@/store/store';

/**
 * socketMiddleware centralizes socket side-effects for Redux actions.
 * - Joins/leaves conversation rooms when active conversation changes.
 * - Emits outgoing chat messages when `appendMessage` is dispatched for local sends.
 */
const socketMiddlewareImplementation = (store: any) =>
  (next: any) =>
    (action: any) => {
      const anyAction = action as AnyAction;
      const prevActive = store.getState().chat.activeId as string | undefined;

      const result = next(action);

      try {
        const socket = getSocket();
        if (!socket) return result;

        // When active conversation changes, leave previous and join new room.
        if (anyAction.type === setActiveConversation.type) {
          const newActive = anyAction.payload as string;
          if (prevActive && prevActive !== newActive) {
            socket.emit('chat:leave', prevActive);
          }
          if (newActive) {
            if (!socket.connected) socket.connect();
            socket.emit('chat:join', newActive);
          }
        }

        // When an optimistic/local message is appended, emit it to the server.
        if (anyAction.type === appendMessage.type) {
          const { conversationId, message } = anyAction.payload as { conversationId: string; message: any };
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

export const socketMiddleware = socketMiddlewareImplementation;

export default socketMiddleware;
