"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import socket from '@/lib/socket';
import { requestNotificationPermission } from '@/lib/pwa';
import { uploadFile } from '@/services/uploadService';
import { fetchConversationByUser } from '@/services/chatService';
import { getCurrentUser } from '@/services/userService';
import { useChatData } from '@/components/chat/hooks/useChatData';
import { useChatSocket } from '@/components/chat/hooks/useChatSocket';
import { useChatRoom } from '@/components/chat/hooks/useChatRoom';
import ChatLayout from '@/components/chat/components/ChatLayout';
import SuspenseBoundary from '@/components/ui/SuspenseBoundary';
import { addReactionToMessage, appendMessage } from '@/store/chatSlice';
import type { ChatMessage, MessageAttachment } from '@/store/chatSlice';
import type { User } from '@/types';

export default function ChatUI() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [notificationState, setNotificationState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();

  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
    // Avoid throwing during render if backend is down; handle errors gracefully
    // suspense: false,
    retry: false,
    // onError: (err) => {
    //   // log and let UI continue; Suspense boundaries will still catch other queries
    //   console.error('currentUserQuery error', err);
    // },
  });

  const {
    messagesQuery,
    setDraftValue,
    handleSelectConversation,
    handleCreateConversation,
    handleCloseConversation,
  } = useChatData(user);

  const { conversations, activeId, draft } = useAppSelector((state) => state.chat);
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number | string; text: string; sender: 'me' | 'them'; name?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const activeConversation = useMemo(
    () => (activeId ? conversations.find((conversation) => conversation.id === activeId) : undefined),
    [activeId, conversations]
  );

  const { incomingCall, setIncomingCall } = useChatSocket({
    activeId,
    activeConversationName: activeConversation?.name,
    user,
    setIsTyping,
  });

  useChatRoom(activeId);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      void requestNotificationPermission().then((status) => setNotificationState(status as typeof notificationState));
    } else {
      setNotificationState('unsupported');
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => setMounted(true), []);

  const getAttachmentType = (file: File): MessageAttachment['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'voice';
    return 'file';
  };

  const revokePreviewUrl = (url?: string) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  };

  const handleAttachFile = async (file: File) => {
    const type = getAttachmentType(file);
    const attachmentId = `${Date.now()}-${file.name}`;
    const previewUrl = URL.createObjectURL(file);
    const placeholder: MessageAttachment = {
      id: attachmentId,
      type,
      url: previewUrl,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      progress: 0,
      isUploading: true,
    };

    setAttachments((current) => [...current, placeholder]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploaded = await uploadFile(formData, (progress) => {
        setAttachments((current) =>
          current.map((attachment) =>
            attachment.id === attachmentId ? { ...attachment, progress, isUploading: true } : attachment
          )
        );
      });

      setAttachments((current) =>
        current.map((attachment) => {
          if (attachment.id !== attachmentId) return attachment;
          revokePreviewUrl(attachment.url);
          return {
            ...attachment,
            url: uploaded.url,
            progress: 100,
            isUploading: false,
          };
        })
      );
    } catch (error) {
      console.error('File upload failed', error);
      setAttachments((current) => {
        const failed = current.find((a) => a.id === attachmentId);
        if (failed) revokePreviewUrl(failed.url);
        return current.filter((a) => a.id !== attachmentId);
      });
    }
  };

  const handleToggleRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      recorderRef.current = null;
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        await handleAttachFile(file);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (error) {
      console.error('Unable to record audio', error);
    }
  };

  const handleAddEmoji = (emoji: string) => setDraftValue(`${draft}${emoji}`);

  const handleRemoveAttachment = (index: number) => {
    setAttachments((current) => {
      const removed = current[index];
      if (removed) revokePreviewUrl(removed.url);
      return current.filter((_, idx) => idx !== index);
    });
  };

  const handleReply = (message: ChatMessage) => setReplyTo({ id: message.id, text: message.text, sender: message.from, name: activeConversation?.name });

  const handleReact = (messageId: number | string, emoji: string) => {
    if (!activeId) return;
    dispatch(addReactionToMessage({ conversationId: activeId, messageId, emoji }));
  };

  const handleStartChatWithFriend = async (friendId: string) => {
    const existingConversation = conversations.find((c) => c.participants?.includes(friendId));
    if (existingConversation) {
      handleSelectConversation(existingConversation.id);
      return;
    }

    try {
      const conversation = await fetchConversationByUser(friendId);
      handleCreateConversation(conversation);
    } catch (error) {
      console.error('Unable to start chat with friend', error);
    }
  };

  const handleFriendAdded = async (friend: User, conversationId?: string) => {
    if (currentUserQuery.refetch) await currentUserQuery.refetch();
    if (conversationId) {
      handleCreateConversation({
        id: conversationId,
        name: friend.name,
        participants: [user?.id ?? '', friend.id],
        lastMessage: '',
        time: '',
        unread: 0,
        online: false,
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
      return;
    }

    if (!activeId) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('chat:typing', { conversationId: activeId, isTyping: true });
    typingTimeoutRef.current = setTimeout(() => socket.emit('chat:typing', { conversationId: activeId, isTyping: false }), 800);
  };

  const sendMessage = async () => {
    if (!activeId) return;
    const text = draft.trim();
    if (!text && attachments.length === 0) return;
    if (attachments.some((a) => a.isUploading)) return;

    const preparedAttachments = attachments.map(({ progress, isUploading, id, ...rest }) => rest as any);
    const now = new Date();
    const localId = `local-${Date.now()}`;
    const optimisticMessage: ChatMessage & { conversationId: string; senderId: string; attachments?: MessageAttachment[]; tempId?: string } = {
      id: localId,
      tempId: localId,
      conversationId: activeId,
      senderId: user?.id ?? '',
      from: 'me',
      text,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      day: 'Today',
      status: 'sent',
      replyTo: replyTo ?? undefined,
      attachments: preparedAttachments.length ? attachments : undefined,
    };

    dispatch(
      appendMessage({
        conversationId: activeId,
        message: optimisticMessage,
      })
    );

    setDraftValue('');
    setReplyTo(null);
    socket.emit('chat:typing', { conversationId: activeId, isTyping: false });
    setAttachments([]);
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setCanInstall(false);
    setDeferredPrompt(null);
  };

  if (messagesQuery && messagesQuery.isLoading) {
    return <div className="p-6 text-center text-sm text-zinc-500">Loading conversations…</div>;
  }

  return (
    <SuspenseBoundary>
      <div className={mounted && theme === 'dark' ? 'dark' : ''}>
        <ChatLayout
          activeId={activeId ?? undefined}
          isTyping={isTyping}
          messagesQuery={messagesQuery}
          draft={draft}
          textareaRef={textareaRef}
          attachments={attachments}
          isRecording={recording}
          searchTerm={searchTerm}
          replyTo={replyTo}
          incomingCall={incomingCall}
          onReply={handleReply}
          onReact={handleReact}
          onSend={sendMessage}
          onAttachFile={handleAttachFile}
          onAddEmoji={handleAddEmoji}
          onToggleRecording={handleToggleRecording}
          onRemoveAttachment={handleRemoveAttachment}
          onSearchChange={setSearchTerm}
          onUpdateDraft={setDraftValue}
          onKeyDown={handleKeyDown}
          onDeclineCall={() => setIncomingCall(null)}
          onCancelReply={() => setReplyTo(null)}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onCloseConversation={handleCloseConversation}
          query={query}
          sidebarOpen={sidebarOpen}
          theme={theme ?? 'light'}
          notificationState={notificationState}
          onRequestNotifications={() => void requestNotificationPermission().then((status) => setNotificationState(status as typeof notificationState))}
          canInstall={canInstall}
          onInstallApp={handleInstallApp}
          onQueryChange={setQuery}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
          onStartChatWithFriend={handleStartChatWithFriend}
          onFriendAdded={handleFriendAdded}
          friends={currentUserQuery.data?.friends ?? []}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
      </div>
    </SuspenseBoundary>
  );
}
