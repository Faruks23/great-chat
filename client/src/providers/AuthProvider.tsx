'use client';

import { useEffect, useMemo, useState, createContext, useContext } from 'react';
import socket from '@/lib/socket';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import { clearAuthSession, getAuthUser, getAuthToken } from '@/lib/auth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setConversationOnline } from '@/store/chatSlice';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handlePresenceStatus = (payload: { id: string; online: boolean }) => {
      dispatch(setConversationOnline({ userId: payload.id, online: payload.online }));
    };

    const handlePresenceInit = (onlineUsers: string[]) => {
      onlineUsers.forEach((id) => handlePresenceStatus({ id, online: true }));
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
      if (user?.id) {
        try {
          socket.emit('presence:update', { id: user.id, online: false });
        } catch (e) {
          // ignore
        }
      }
    };
  }, [dispatch, user]);

  const token = useMemo(() => getAuthToken(), [user]);
  const isAuthenticated = Boolean(token && user);

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  const refresh = () => {
    setUser(getAuthUser());
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, logout, refresh }}>
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
