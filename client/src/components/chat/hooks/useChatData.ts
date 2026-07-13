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
    queryKey: ['messages', activeId],
    queryFn: () => fetchMessages(activeId),
    enabled: Boolean(isAuthenticated && authUser && activeId),
  });

  const conversationByUserQuery = useQuery({
    queryKey: ['conversationByUser', participantId],
    queryFn: () => fetchConversationByUser(participantId ?? ''),
    enabled: Boolean(isAuthenticated && authUser && participantId),
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

    const requestedConversation = conversationId
      ? merged.find((conversation) => conversation.id === conversationId)
      : groupId
        ? merged.find((conversation) => conversation.groupId === groupId || conversation.id === groupId)
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

    if (!foundActive && !participantId && !isConversationClosed && merged.length > 0 && !hasStoredActiveConversation) {
      dispatch(setActiveConversation(merged[0].id));
    }
  }, [activeId, conversationByUserQuery.isSuccess, conversationId, conversationsQuery.data, conversationsQuery.isSuccess, dispatch, groupId, groupsQuery.data, groupsQuery.isSuccess, isConversationClosed, participantId]);

  useEffect(() => {
    if (activeId) {
      setStoredActiveConversationId(activeId);
    }
  }, [activeId]);

  useEffect(() => {
    if (!conversationId && !groupId) {
      if (conversationByUserQuery.isSuccess && conversationByUserQuery.data) {
        const conversation = conversationByUserQuery.data;
        if (!conversations.some((item) => item.id === conversation.id)) {
          dispatch(setConversations([...conversations, conversation]));
        }
        if (activeId !== conversation.id) {
          dispatch(setActiveConversation(conversation.id));
          setIsConversationClosed(false);
        }
      }
      return;
    }

    if (activeId !== conversationId) {
      dispatch(setActiveConversation(conversationId));
      setIsConversationClosed(false);
    }
  }, [activeId, conversationByUserQuery.data, conversationByUserQuery.isSuccess, conversationId, conversations, dispatch, groupId]);

  useEffect(() => {
    if (messagesQuery.data && activeId) {
      dispatch(
        setMessagesForConversation({
          id: activeId,
          messages: messagesQuery.data.map((message) => normalizeMessage(message, authUser?.id)),
        })
      );
      dispatch(markMessagesAsRead(activeId));
    }
  }, [activeId, authUser?.id, dispatch, messagesQuery.data]);

  const setDraftValue = (value: string) => {
    dispatch(setDraft(value));
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find((item) => item.id === id);
    const nextParams = new URLSearchParams(searchParams.toString());

    if (conversation?.isGroup || conversation?.groupId) {
      nextParams.delete('userId');
      nextParams.delete('conversationId');
      nextParams.set('groupId', conversation.groupId ?? id);
    } else {
      const otherParticipantId = conversation?.participants?.find((participantIdValue) => participantIdValue !== authUser?.id);
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
    if (!conversations.some((item) => item.id === conversation.id)) {
      dispatch(setConversations([...conversations, conversation]));
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (conversation.isGroup || conversation.groupId) {
      nextParams.delete('userId');
      nextParams.delete('conversationId');
      nextParams.set('groupId', conversation.groupId ?? conversation.id);
    } else {
      const otherParticipantId = conversation.participants?.find((participantIdValue) => participantIdValue !== authUser?.id);
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
