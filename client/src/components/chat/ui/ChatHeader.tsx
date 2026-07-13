'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, MoreVertical, Phone, Video, LogOut, X } from 'lucide-react';
import ChatAvatar from './ChatAvatar';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import socket from '@/lib/socket';
import type { Conversation } from '@/store/chatSlice';
import { setActiveCall } from '@/store/chatSlice';

type ChatHeaderProps = {
  active: Conversation;
  onToggleSidebar: () => void;
  onCloseConversation: () => void;
};

/**
 * ChatHeader renders the top bar for the current conversation.
 * It provides call buttons, close conversation action, and optional menu actions.
 */
export default function ChatHeader({ active, onToggleSidebar, onCloseConversation }: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();

  const ensureSocketConnected = async () => {
    if (socket.connected) return;

    socket.connect();

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        socket.off('connect', onConnect);
        socket.off('connect_error', onError);
        reject(new Error('Socket connection timed out'));
      }, 6000);

      const onConnect = () => {
        window.clearTimeout(timeout);
        socket.off('connect_error', onError);
        resolve();
      };

      const onError = () => {
        window.clearTimeout(timeout);
        socket.off('connect', onConnect);
        reject(new Error('Socket connection failed'));
      };

      socket.once('connect', onConnect);
      socket.once('connect_error', onError);
    });
  };

  const startCall = async (mode: 'voice' | 'video') => {
    const callType = active.isGroup ? 'group' : 'direct';

    dispatch(
      setActiveCall({
        room: active.id.toString(),
        mode,
        status: 'connecting',
      })
    );

    try {
      await ensureSocketConnected();
      const userId = user?.id;
      const participants: any[] = (active as any).participants || [];
      const targetIds = participants
        .map((p) => (typeof p === 'object' && p?.id ? p.id : p))
        .filter((id) => id && id !== userId);

      socket.emit('call:invite', {
        room: active.id.toString(),
        from: userId,
        targets: targetIds,
        mode,
        kind: callType,
      });
    } catch (err) {
      // If call invitation fails, continue to call page navigation.
    }

    const autoParams = `&auto=1&type=${encodeURIComponent(callType)}`;
    window.location.assign(`/calls?room=${encodeURIComponent(active.id)}&mode=${mode}${autoParams}`);
  };

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 sm:px-5 sm:py-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="sm:hidden" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <ChatAvatar name={active.name} online={active.online} size={32} />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{active.name}</p>
            <span className={`h-2.5 w-2.5 rounded-full ${active.online ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{active.online ? 'Online' : 'Last seen recently'}</p>
        </div>
      </div>

      <div className="flex flex-nowrap md:flex-wrap items-center justify-end md:gap-2 gap-1">
        <Button variant="ghost" aria-label="Close conversation" onClick={onCloseConversation}>
          <X className="h-4 w-4" />
        </Button>
        <Button variant="ghost" aria-label="Voice call" onClick={() => startCall('voice')}>
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" aria-label="Video call" onClick={() => startCall('video')}>
          <Video className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          aria-label="Logout"
          onClick={() => {
            logout();
            window.location.assign('/login');
          }}
          className="hidden sm:inline-flex"
        >
          <LogOut className="h-4 w-4" />
        </Button>
        <div className="relative ml-auto hidden md:inline-flex">
          <Button variant="ghost" aria-label="More options" onClick={() => setMenuOpen((open) => !open)}>
            <MoreVertical className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-950">
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => {
                  setMenuOpen(false);
                  startCall('voice');
                }}
              >
                Voice call
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => {
                  setMenuOpen(false);
                  startCall('video');
                }}
              >
                Video call
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  window.location.assign('/login');
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
