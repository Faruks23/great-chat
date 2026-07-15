'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import socket from '@/lib/socket';
import { appendMessage, markMessagesReadForSender } from '@/store/chatSlice';
import type { ChatMessage } from '@/store/chatSlice';
import { normalizeMessage } from '@/components/chat/utils/chat';
import { playNotificationSound, playRingtoneSound, stopRingtoneSound } from '@/components/chat/utils/audio';
import { showBrowserNotification } from '@/lib/pwa';
import type { User } from '@/types';

/**
 * Payload shape for incoming call data.
 */
export type IncomingCallPayload = {
  room: string;
  from?: string;
  mode?: string;
  kind?: string;
  debug?: boolean;
  timestamp?: number;
};

type UseChatSocketOptions = {
  activeId: string | null;
  activeConversationName?: string;
  user: User | null;
  setIsTyping: (value: boolean) => void;
};

/**
 * useChatSocket registers socket event listeners for the chat page.
 * It handles incoming messages, typing status, presence changes, and incoming call notifications.
 */
export function useChatSocket({ activeId, activeConversationName, user, setIsTyping }: UseChatSocketOptions) {
  const dispatch = useAppDispatch();
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);

  useEffect(() => {
    if (!incomingCall) {
      stopRingtoneSound();
    }
  }, [incomingCall]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleIncomingMessage = (message: ChatMessage & { conversationId: string }) => {
      dispatch(
        appendMessage({
          conversationId: message.conversationId?.toString() ?? '',
          message: normalizeMessage(message, user?.id),
        })
      );

      if (message.senderId !== user?.id) {
        playNotificationSound('message');
        void showBrowserNotification(activeConversationName || 'Great Chat', normalizeMessage(message, user?.id).text, {
          conversationId: message.conversationId?.toString(),
          senderId: message.senderId,
          url: `/chat${message.conversationId ? `?userId=${message.senderId}` : ''}`,
        });
      }
    };

    const handleTyping = ({ conversationId, isTyping }: { conversationId: string; isTyping: boolean }) => {
      if (conversationId === activeId) {
        setIsTyping(isTyping);
        if (isTyping) {
          playNotificationSound('typing');
        }
      }
    };

    const handleIncomingNotification = async (payload: { type: string; title: string; body: string; data?: { url?: string; conversationId?: string; senderId?: string } }) => {
      playNotificationSound('message');
      await showBrowserNotification(payload.title, payload.body, payload.data);
    };

    const handleIncomingCall = (payload: IncomingCallPayload) => {
      const normalizedPayload = {
        room: payload.room,
        from: payload.from,
        mode: payload.mode ?? 'voice',
        kind: payload.kind ?? 'direct',
        debug: payload.debug,
        timestamp: payload.timestamp ?? Date.now(),
      };

      if (incomingCall?.room === normalizedPayload.room && incomingCall?.timestamp === normalizedPayload.timestamp) {
        return;
      }

      playRingtoneSound();
      void showBrowserNotification('Incoming call', `Call from ${payload.from ?? 'Someone'}`, {
        conversationId: payload.room,
        url: `/calls?room=${payload.room}&mode=${normalizedPayload.mode}&auto=1&type=${encodeURIComponent(normalizedPayload.kind ?? 'direct')}`,
      });
      setIncomingCall(normalizedPayload);
    };

    socket.on('chat:message', handleIncomingMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:read', ({ conversationId, readerId }: { conversationId: string; readerId: string }) => {
      // If someone (the other participant) read messages in the active conversation,
      // mark outgoing messages as read for the sender's UI.
      if (conversationId === activeId) {
        if (user?.id && readerId !== user.id) {
          dispatch(markMessagesReadForSender(conversationId));
        } else if (!user?.id) {
          dispatch(markMessagesReadForSender(conversationId));
        }
      }
    });
    socket.on('notification:receive', handleIncomingNotification);
    socket.on('call:incoming', handleIncomingCall);

    return () => {
      stopRingtoneSound();
      socket.off('chat:message', handleIncomingMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:read');
      socket.off('notification:receive', handleIncomingNotification);
      socket.off('call:incoming', handleIncomingCall);
    };
  }, [activeConversationName, activeId, dispatch, incomingCall?.room, incomingCall?.timestamp, setIsTyping, user]);

  return { incomingCall, setIncomingCall };
}
