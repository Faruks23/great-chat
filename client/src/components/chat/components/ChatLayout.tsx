'use client';

import { useMemo } from 'react';
import type { RefObject, KeyboardEvent } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ChatSidebar } from '@/components/chat/ui/ChatSidebar';
import ChatHeader from '@/components/chat/ui/ChatHeader';
import ChatMessageList from '@/components/chat/ui/ChatMessageList';
import { useAutoScroll } from '@/components/chat/hooks/useAutoScroll';
import ChatComposer from '@/components/chat/ui/ChatComposer';
import IncomingCallModal from '@/components/chat/components/IncomingCallModal';
import type { Conversation, ChatMessage } from '@/store/chatSlice';
import type { UseQueryResult } from '@tanstack/react-query';
import type { IncomingCallPayload } from '@/components/chat/hooks/useChatSocket';
import type { User } from '@/types';

export type ChatLayoutProps = {
  activeId?: string;
  isTyping: boolean;
  messagesQuery: UseQueryResult<ChatMessage[], Error>;
  draft: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  attachments: any[];
  isRecording: boolean;
  searchTerm: string;
  replyTo: { id: number | string; text: string; sender: 'me' | 'them'; name?: string } | null;
  incomingCall: IncomingCallPayload | null;
  onReply: (message: ChatMessage) => void;
  onReact: (messageId: number | string, emoji: string) => void;
  onSend: () => void;
  onAttachFile: (file: File) => Promise<void>;
  onAddEmoji: (emoji: string) => void;
  onToggleRecording: () => void;
  onRemoveAttachment: (index: number) => void;
  onSearchChange: (value: string) => void;
  onUpdateDraft: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onDeclineCall: () => void;
  onCancelReply: () => void;
  onToggleSidebar: () => void;
  onCloseConversation: () => void;
  query: string;
  sidebarOpen: boolean;
  theme: string;
  notificationState: 'default' | 'granted' | 'denied' | 'unsupported';
  onRequestNotifications: () => void;
  canInstall: boolean;
  onInstallApp: () => void;
  onQueryChange: (value: string) => void;
  onSelectConversation: (id: string) => void;
  onCreateConversation: (conversation: Conversation) => void;
  onStartChatWithFriend: (friendId: string) => void;
  onFriendAdded: (friend: User, conversationId?: string) => void;
  onToggleTheme: () => void;
  friends: User[];
};

/**
 * ChatLayout renders the full chat page structure.
 * It combines sidebar, header, message list, composer, and incoming call UI.
 */
export default function ChatLayout({
  activeId,
  isTyping,
  messagesQuery,
  draft,
  textareaRef,
  attachments,
  isRecording,
  searchTerm,
  replyTo,
  incomingCall,
  onReply,
  onReact,
  onSend,
  onAttachFile,
  onAddEmoji,
  onToggleRecording,
  onRemoveAttachment,
  onSearchChange,
  onUpdateDraft,
  onKeyDown,
  onDeclineCall,
  onCancelReply,
  onToggleSidebar,
  onCloseConversation,
  query,
  sidebarOpen,
  theme,
  notificationState,
  onRequestNotifications,
  canInstall,
  onInstallApp,
  onQueryChange,
  onSelectConversation,
  onCreateConversation,
  onStartChatWithFriend,
  onFriendAdded,
  friends,
  onToggleTheme,
}: ChatLayoutProps) {
  const chatState = useAppSelector((state) => state.chat);
  const activeConversation = useMemo(
    () => (activeId ? chatState.conversations.find((conversation: Conversation) => conversation.id === activeId) : undefined),
    [activeId, chatState.conversations]
  );
  const messages = activeConversation?.id ? chatState.messagesByConv[activeConversation.id] ?? [] : [];
  const filteredConversations = useMemo(
    () =>
      chatState.conversations.filter((conversation: Conversation) =>
        conversation.name.toLowerCase().includes(query.toLowerCase()) || conversation.lastMessage.toLowerCase().includes(query.toLowerCase())
      ),
    [chatState.conversations, query]
  );
  const groupedMessages = useMemo(
    () =>
      messages
        .filter((message: ChatMessage) => (searchTerm ? message.text.toLowerCase().includes(searchTerm.toLowerCase()) : true))
        .map((message: ChatMessage, index: number) => {
          const previous = messages[index - 1];
          const next = messages[index + 1];
          return {
            ...message,
            isFirstInGroup: !previous || previous.from !== message.from,
            isLastInGroup: !next || next.from !== message.from,
          };
        }),
    [messages, searchTerm]
  );
  const { scrollRef, bottomRef, showScrollBtn, handleScroll, scrollToBottom } = useAutoScroll({
    messagesLength: messages.length,
    activeId: activeId ?? '',
    isTyping,
  });
  return (
    <div className="relative flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden border border-zinc-200 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:h-[calc(100vh-2rem)] md:min-h-[calc(100vh-2rem)]  md:max-h-[calc(100vh-2rem)]">
      {/** Incoming call modal appears above everything else. */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={() => {
            const url = `/calls?room=${encodeURIComponent(incomingCall.room)}&mode=${encodeURIComponent(incomingCall.mode ?? 'voice')}&auto=1&type=${encodeURIComponent(incomingCall.kind ?? 'direct')}`;
            window.location.assign(url);
          }}
          onDecline={onDeclineCall}
        />
      )}

      {/** Sidebar contains conversation list, search, and theme toggle. */}
      <ChatSidebar
        conversations={chatState.conversations}
        activeId={activeConversation?.id ?? ''}
        filteredConversations={filteredConversations}
        friends={friends}
        query={query}
        sidebarOpen={sidebarOpen}
        theme={theme}
        onClose={onToggleSidebar}
        onQueryChange={onQueryChange}
        onSelectConversation={onSelectConversation}
        onCreateConversation={onCreateConversation}
        onStartChatWithFriend={onStartChatWithFriend}
        onToggleTheme={onToggleTheme}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
        {activeConversation ? (
          <>
            {/** Header shows active chat details and close button. */}
            <ChatHeader active={activeConversation} onToggleSidebar={onToggleSidebar} onCloseConversation={onCloseConversation} />

            {/** Main message list region with scrolling and replies. */}
            <div className="relative flex-1 min-h-0 overflow-hidden">
              <ChatMessageList
                active={activeConversation}
                groupedMessages={groupedMessages}
                messages={messages}
                isTyping={isTyping}
                showScrollBtn={showScrollBtn}
                scrollRef={scrollRef}
                bottomRef={bottomRef}
                handleScroll={handleScroll}
                scrollToBottom={scrollToBottom}
                messagesQuery={messagesQuery}
                onReply={onReply}
                onReact={onReact}
              />
            </div>

            {/** Composer area for sending messages and attachments. */}
            <ChatComposer
              draft={draft}
              textareaRef={textareaRef}
              attachments={attachments}
              isRecording={isRecording}
              searchValue={searchTerm}
              onDraftChange={onUpdateDraft}
              onKeyDown={onKeyDown}
              onSend={onSend}
              onAttachFile={onAttachFile}
              onAddEmoji={onAddEmoji}
              onToggleRecording={onToggleRecording}
              onRemoveAttachment={onRemoveAttachment}
              onSearchChange={onSearchChange}
              replyTo={replyTo ?? undefined}
              onCancelReply={onCancelReply}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 py-8">
            {/**
             * Empty state shown when no conversation is selected.
             * This UI encourages the user to open the sidebar or start a new chat.
             */}
            <div className="w-full max-w-2xl rounded-[2rem] border border-dashed border-zinc-200 bg-white/90 p-10 text-center shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">No conversation selected</p>
              <h2 className="mt-4 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Pick a chat or start a new conversation</h2>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Select a conversation from the list, or open the sidebar to begin a new private message.</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button onClick={onToggleSidebar} className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
                  Open chats
                </button>
                <button onClick={() => onQueryChange('')} className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
                  Enable notifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
