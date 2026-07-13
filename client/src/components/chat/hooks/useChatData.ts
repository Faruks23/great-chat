'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const participantId = searchParams.get('userId');
  const conversationId = searchParams.get('conversationId');
  const [isConversationClosed, setIsConversationClosed] = useState(false);

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
    const foundActive = merged.some((conversation) => conversation.id === activeId);
    if (!foundActive && !participantId && !isConversationClosed && merged.length > 0) {
      dispatch(setActiveConversation(merged[0].id));
    }
  }, [activeId, conversationByUserQuery.isSuccess, conversationsQuery.data, conversationsQuery.isSuccess, dispatch, groupsQuery.data, groupsQuery.isSuccess, isConversationClosed, participantId]);

  useEffect(() => {
    if (!conversationId) {
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
  }, [activeId, conversationByUserQuery.data, conversationByUserQuery.isSuccess, conversationId, conversations, dispatch]);

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
    dispatch(setActiveConversation(id));
    setIsConversationClosed(false);
  };

  const handleCreateConversation = (conversation: Conversation) => {
    if (!conversations.some((item) => item.id === conversation.id)) {
      dispatch(setConversations([...conversations, conversation]));
    }
    dispatch(setActiveConversation(conversation.id));
    setIsConversationClosed(false);
  };

  const handleCloseConversation = () => {
    dispatch(setActiveConversation(''));
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
