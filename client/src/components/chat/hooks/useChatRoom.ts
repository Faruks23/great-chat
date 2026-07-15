'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

/**
 * useChatRoom joins the active chat room on the socket whenever the active conversation changes.
 * It leaves the previous room before joining the new one.
 */
export function useChatRoom(activeId: string | null) {
  const currentRoom = useRef<string | null>(null);

  useEffect(() => {
    if (!activeId) return;

    const socket = getSocket();
    if (!socket) return;

    if (currentRoom.current !== null) {
      socket.emit('chat:leave', currentRoom.current);
    }

    socket.emit('chat:join', activeId);
    currentRoom.current = activeId;
  }, [activeId]);
}
