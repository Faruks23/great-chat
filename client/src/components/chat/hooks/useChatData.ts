'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const ACTIVE_CONVERSATION_STORAGE_KEY = 'great-chat:activeConversation';

function getStoredActiveConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(ACTIVE_CONVERSATION_STORAGE_KEY);
}

function setStoredActiveConversationId(conversationId: string | null) {
  if (typeof window === 'undefined') return;
  if (conversationId) {
    window.sessionStorage.setItem(ACTIVE_CONVERSATION_STORAGE_KEY, conversationId);
    return;
  }
  window.sessionStorage.removeItem(ACTIVE_CONVERSATION_STORAGE_KEY);
}
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import type { Conversation, ChatMessage } from '@/store/chatSlice';
import {
  markMessagesAsRead,
  setActiveConversation,
  setConversations,
  setDraft,
  setMessagesForConversation,
} from '@/store/chatSlice';
import { getSocket } from '@/lib/socket';
import { fetchConversationByUser, fetchConversations, fetchMessages } from '@/services/chatService';
import { normalizeMessage } from '@/components/chat/utils/chat';
import type { User } from '@/types';

export function useChatData(initialUser: User | null) {
  const dispatch = useAppDispatch();
  const { conversations, activeId } = useAppSelector((state) => state.chat);
  const { isAuthenticated, user: authUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const participantId = searchParams.get('userId');
  const conversationId = searchParams.get('conversationId');
  const groupId = searchParams.get('groupId');
  const [isConversationClosed, setIsConversationClosed] = useState(false);
  const [hasHydratedSelection, setHasHydratedSelection] = useState(false);

  const normalizedParticipantId = participantId?.trim() && participantId !== 'undefined' && participantId !== 'null' ? participantId.trim() : null;
  const normalizedConversationId = conversationId?.trim() && conversationId !== 'undefined' && conversationId !== 'null' ? conversationId.trim() : null;
  const normalizedGroupId = groupId?.trim() && groupId !== 'undefined' && groupId !== 'null' ? groupId.trim() : null;
  const normalizedActiveId = activeId?.trim() && activeId !== 'undefined' && activeId !== 'null' ? activeId.trim() : null;
  const isSelfConversation = normalizedParticipantId && authUser?.id ? normalizedParticipantId === authUser.id : false;
  const shouldFetchMessages = Boolean(isAuthenticated && authUser && normalizedActiveId);

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    enabled: Boolean(isAuthenticated && authUser),
  });

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => import('@/services/groupService').then((mod) => mod.getGroups()),
    enabled: Boolean(isAuthenticated && authUser),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', normalizedActiveId],
    queryFn: () => fetchMessages(normalizedActiveId!),
    enabled: shouldFetchMessages,
  });

  const conversationByUserQuery = useQuery({
    queryKey: ['conversationByUser', normalizedParticipantId],
    queryFn: () => fetchConversationByUser(normalizedParticipantId ?? ''),
    enabled: Boolean(isAuthenticated && authUser && normalizedParticipantId && !isSelfConversation),
  });

  useEffect(() => {
    if (!hasHydratedSelection) {
      const storedActiveConversationId = getStoredActiveConversationId();
      if (storedActiveConversationId && storedActiveConversationId !== activeId) {
        dispatch(setActiveConversation(storedActiveConversationId));
      }
      setHasHydratedSelection(true);
    }
  }, [activeId, dispatch, hasHydratedSelection]);

  useEffect(() => {
    const privateConversations = conversationsQuery.isSuccess && Array.isArray(conversationsQuery.data) ? conversationsQuery.data : [];
    const groupConversations = groupsQuery.isSuccess && Array.isArray(groupsQuery.data)
      ? groupsQuery.data.map((group) => ({
        id: group.conversationId ?? group._id,
        name: group.name,
        participants: group.members,
        isGroup: true,
        groupId: group._id,
        unread: 0,
        online: false,
        lastMessage: '',
        time: '',
      }))
      : [];

    if (privateConversations.length === 0 && groupConversations.length === 0) {
      return;
    }

    const merged = [...privateConversations, ...groupConversations].reduce<Conversation[]>((acc, item) => {
      if (!acc.some((existing) => existing.id === item.id)) {
        acc.push(item);
      }
      return acc;
    }, []);

    dispatch(setConversations(merged));

    const requestedConversation = normalizedConversationId
      ? merged.find((conversation) => conversation.id === normalizedConversationId)
      : normalizedGroupId
        ? merged.find((conversation) => conversation.groupId === normalizedGroupId || conversation.id === normalizedGroupId)
        : undefined;

    if (requestedConversation) {
      if (activeId !== requestedConversation.id) {
        dispatch(setActiveConversation(requestedConversation.id));
      }
      setIsConversationClosed(false);
      return;
    }

    const foundActive = merged.some((conversation) => conversation.id === activeId);
    const storedActiveConversationId = getStoredActiveConversationId();
    const hasStoredActiveConversation = Boolean(storedActiveConversationId && merged.some((conversation) => conversation.id === storedActiveConversationId));

    if (!foundActive && !normalizedParticipantId && !isConversationClosed && merged.length > 0 && !hasStoredActiveConversation) {
      dispatch(setActiveConversation(merged[0].id));
    }
  }, [activeId, conversationByUserQuery.isSuccess, conversationId, conversationsQuery.data, conversationsQuery.isSuccess, dispatch, groupId, groupsQuery.data, groupsQuery.isSuccess, isConversationClosed, participantId]);

  useEffect(() => {
    if (activeId) {
      setStoredActiveConversationId(activeId);
    }
  }, [activeId]);

  useEffect(() => {
    if (!normalizedConversationId && !normalizedGroupId) {
      if (conversationByUserQuery.isSuccess && conversationByUserQuery.data) {
        const conversation = conversationByUserQuery.data;
        if (!conversations.some((item: Conversation) => item.id === conversation.id)) {
          dispatch(setConversations([...conversations, conversation]));
        }
        if (activeId !== conversation.id) {
          dispatch(setActiveConversation(conversation.id));
          setIsConversationClosed(false);
        }
      }
      return;
    }

    if (normalizedConversationId && activeId !== normalizedConversationId) {
      dispatch(setActiveConversation(normalizedConversationId));
      setIsConversationClosed(false);
    }
  }, [activeId, conversationByUserQuery.data, conversationByUserQuery.isSuccess, normalizedConversationId, conversations, dispatch, normalizedGroupId]);

  useEffect(() => {
    if (messagesQuery.data && activeId) {
      // Normalize and dedupe incoming messages by id to avoid duplicate entries
      const normalized = messagesQuery.data.map((message) => normalizeMessage(message, authUser?.id));
      const seen = new Set<string>();
      const unique: typeof normalized = [];
      for (const msg of normalized) {
        const key = String(msg.id);
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(msg);
        }
      }

      dispatch(
        setMessagesForConversation({
          id: activeId,
          messages: unique,
        })
      );
      dispatch(markMessagesAsRead(activeId));
      // Notify server/participants that the current user has read messages
      try {
        const socket = getSocket();
        if (!socket) return;
        if (!socket.connected) socket.connect();
        socket.emit('chat:read', { conversationId: activeId, readerId: authUser?.id });
      } catch (err) {
        // ignore socket errors silently
      }
    }
  }, [activeId, authUser?.id, dispatch, messagesQuery.data]);

  const setDraftValue = (value: string) => {
    dispatch(setDraft(value));
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find((item: Conversation) => item.id === id);
    const nextParams = new URLSearchParams(searchParams.toString());

    if (conversation?.isGroup || conversation?.groupId) {
      nextParams.delete('userId');
      nextParams.delete('conversationId');
      nextParams.set('groupId', conversation.groupId ?? id);
    } else {
      const otherParticipantId = conversation?.participants?.find((participantIdValue: string) => participantIdValue !== authUser?.id);
      nextParams.delete('groupId');
      nextParams.delete('conversationId');
      if (otherParticipantId) {
        nextParams.set('userId', otherParticipantId);
      } else {
        nextParams.delete('userId');
      }
    }

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);

    dispatch(setActiveConversation(id));
    setStoredActiveConversationId(id);
    setIsConversationClosed(false);
  };

  const handleCreateConversation = (conversation: Conversation) => {
    if (!conversations.some((item: Conversation) => item.id === conversation.id)) {
      dispatch(setConversations([...conversations, conversation]));
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (conversation.isGroup || conversation.groupId) {
      nextParams.delete('userId');
      nextParams.delete('conversationId');
      nextParams.set('groupId', conversation.groupId ?? conversation.id);
    } else {
      const otherParticipantId = conversation.participants?.find((participantIdValue: string) => participantIdValue !== authUser?.id);
      nextParams.delete('groupId');
      nextParams.delete('conversationId');
      if (otherParticipantId) {
        nextParams.set('userId', otherParticipantId);
      } else {
        nextParams.delete('userId');
      }
    }

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);

    dispatch(setActiveConversation(conversation.id));
    setStoredActiveConversationId(conversation.id);
    setIsConversationClosed(false);
  };

  const handleCloseConversation = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('userId');
    nextParams.delete('groupId');
    nextParams.delete('conversationId');
    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);

    dispatch(setActiveConversation(''));
    setStoredActiveConversationId(null);
    setIsConversationClosed(true);
  };

  return {
    messagesQuery,
    setDraftValue,
    handleSelectConversation,
    handleCreateConversation,
    handleCloseConversation,
  };
}
