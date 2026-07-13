import React, { createContext, useContext } from 'react';
import { useCallSession, type CallKind, type CallMode } from '@/hooks/useCallSession';

type CallSessionContextType = ReturnType<typeof useCallSession> | null;

const CallSessionContext = createContext<CallSessionContextType>(null);

type CallSessionProviderProps = {
  children: React.ReactNode;
  room: string;
  mode: CallMode;
  kind: CallKind;
};

export function CallSessionProvider({ children, room, mode, kind }: CallSessionProviderProps) {
  const callSession = useCallSession({ room, mode, kind });
  return <CallSessionContext.Provider value={callSession}>{children}</CallSessionContext.Provider>;
}

export function useCallSessionContext() {
  const context = useContext(CallSessionContext);
  if (!context) {
    throw new Error('useCallSessionContext must be used within a CallSessionProvider');
  }
  return context;
}
