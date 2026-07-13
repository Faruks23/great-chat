'use client';

import { useEffect, useMemo, useState, useRef, createContext, useContext } from 'react';
import socket from '@/lib/socket';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import { clearAuthSession, getAuthUser, getAuthToken } from '@/lib/auth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setConversationOnline } from '@/store/chatSlice';
import { useQueryClient } from '@tanstack/react-query';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  logout: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setUser(getAuthUser());
    setIsReady(true);
  }, []);

  let queryClient: any = null;
  try {
    queryClient = useQueryClient();
  } catch (e) {
    // QueryClientProvider may not be present during server build — we'll skip cache updates in that case.
    queryClient = null;
  }

  const presenceBufferRef = useRef<Record<string, boolean>>({});
  const flushTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }

    const flushBuffer = () => {
      try {
        if (queryClient) {
          queryClient.setQueryData(['currentUser'], (old: any) => {
            if (!old || !Array.isArray(old.friends)) {
              presenceBufferRef.current = {};
              return old;
            }
            const buffered = presenceBufferRef.current;
            const friends = old.friends.map((f: any) => (buffered.hasOwnProperty(f.id) ? { ...f, online: Boolean(buffered[f.id]) } : f));
            presenceBufferRef.current = {};
            return { ...old, friends };
          });
        } else {
          presenceBufferRef.current = {};
        }
      } catch (e) {
        // ignore
        presenceBufferRef.current = {};
      }
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };

    const scheduleFlush = () => {
      if (flushTimerRef.current) return;
      // 250ms debounce window
      flushTimerRef.current = window.setTimeout(flushBuffer, 250) as unknown as number;
    };

    const handlePresenceStatus = (payload: { id: string; online: boolean }) => {
      dispatch(setConversationOnline({ userId: payload.id, online: payload.online }));

      // Buffer cache update and debounce flush
      try {
        presenceBufferRef.current[payload.id] = payload.online;
        scheduleFlush();
      } catch (e) {
        // ignore
      }
    };

    const handlePresenceInit = (onlineUsers: string[]) => {
      // Build a Set for faster lookup
      const onlineSet = new Set(onlineUsers);

      // Update conversations presence
      onlineUsers.forEach((id) => dispatch(setConversationOnline({ userId: id, online: true })));

      // Also update currentUser cache in batch immediately
      try {
        if (queryClient) {
          queryClient.setQueryData(['currentUser'], (old: any) => {
            if (!old) return old;
            const friends = Array.isArray(old.friends)
              ? old.friends.map((f: any) => ({ ...f, online: onlineSet.has(f.id) }))
              : old.friends;
            return { ...old, friends };
          });
        }
      } catch (e) {
        // ignore
      }
    };

    const syncPresence = () => {
      if (!user?.id) return;
      socket.emit('presence:update', { id: user.id, online: true });
      socket.emit('presence:request', { id: user.id });
    };

    const handleBeforeUnload = () => {
      if (user?.id) {
        socket.emit('presence:update', { id: user.id, online: false });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncPresence();
      }
    };

    socket.on('connect', syncPresence);
    socket.on('presence:init', handlePresenceInit);
    socket.on('presence:update', handlePresenceStatus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (socket.connected && user?.id) {
      syncPresence();
    }

    return () => {
      socket.off('connect', syncPresence);
      socket.off('presence:init', handlePresenceInit);
      socket.off('presence:update', handlePresenceStatus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      presenceBufferRef.current = {};
      if (user?.id) {
        try {
          socket.emit('presence:update', { id: user.id, online: false });
        } catch (e) {
          // ignore
        }
      }
    };
  }, [dispatch, user, queryClient]);

  const token = useMemo(() => getAuthToken(), [user]);
  const isAuthenticated = Boolean(token && (user || !isReady));

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  const refresh = () => {
    setUser(getAuthUser());
    setIsReady(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isReady, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
