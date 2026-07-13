'use client';

import { Fragment, useEffect, useMemo } from 'react';
import { ChevronDown, Check, MessageCircleReply, SmilePlus } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ChatMessage, Conversation } from '@/store/chatSlice';

type GroupedChatMessage = ChatMessage & {
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
};

type ChatMessageListProps = {
  active: Conversation;
  groupedMessages: GroupedChatMessage[];
  messages: ChatMessage[];
  isTyping: boolean;
  showScrollBtn: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  scrollToBottom: () => void;
  messagesQuery: UseQueryResult<ChatMessage[], Error>;
  onReply?: (message: ChatMessage) => void;
  onReact?: (messageId: number | string, emoji: string) => void;
};

/**
 * ChatMessageList renders the conversation message history.
 * It supports virtualization for large message lists and displays reply/reaction controls.
 */
export default function ChatMessageList({
  active,
  groupedMessages,
  messages,
  isTyping,
  showScrollBtn,
  scrollRef,
  bottomRef,
  handleScroll,
  scrollToBottom,
  messagesQuery,
  onReply,
  onReact,
}: ChatMessageListProps) {
  const visibleMessages = groupedMessages;

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ WebkitOverflowScrolling: 'touch' }}
        className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 pb-28 touch-pan-y sm:px-6 sm:py-6"
      >
        {messages.length === 0 && !messagesQuery.isLoading ? (
          <div className="mx-auto mt-12 flex max-w-md flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">No messages yet</p>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Send the first message</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Use the composer below to start chatting with {active.name}.</p>
          </div>
        ) : null}

        {visibleMessages.map((message, index) => {
          const actualIndex = index;
          const previous = groupedMessages[actualIndex - 1];
          const showDay = actualIndex === 0 || message.day !== previous?.day;
          const isMine = message.from === 'me';
          const bubbleBase = isMine
            ? 'relative px-4 py-3 text-sm text-white shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'relative px-4 py-3 text-sm text-zinc-900 shadow-sm bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100';
          const bubbleCorners = isMine
            ? `${message.isFirstInGroup ? 'rounded-tl-3xl' : 'rounded-tl-xl'} ${message.isLastInGroup ? 'rounded-br-3xl' : 'rounded-br-xl'} rounded-tr-3xl ${message.isLastInGroup ? 'rounded-bl-3xl' : 'rounded-bl-xl'}`
            : `${message.isFirstInGroup ? 'rounded-tr-3xl' : 'rounded-tr-xl'} ${message.isLastInGroup ? 'rounded-bl-3xl' : 'rounded-bl-xl'} rounded-tl-3xl ${message.isLastInGroup ? 'rounded-br-3xl' : 'rounded-br-xl'}`;

          return (
            <Fragment key={message.id}>
              {showDay ? (
                <div className="mx-auto mb-4 w-fit rounded-full bg-zinc-100 px-4 py-1 text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                  {message.day}
                </div>
              ) : null}

              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className="max-w-[80%] space-y-1">
                  {message.isFirstInGroup && !isMine ? (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{active.name}</p>
                  ) : null}
                  <div className={`${bubbleBase} ${bubbleCorners}`}>
                    {message.replyTo ? (
                      <div className={`mb-2 rounded-2xl border px-3 py-2 text-xs ${isMine ? 'border-white/30 bg-white/10' : 'border-zinc-200 bg-white/70 dark:border-zinc-700 dark:bg-zinc-900/60'}`}>
                        <p className="font-medium">Replying to {message.replyTo.name ?? 'message'}</p>
                        <p className="truncate opacity-80">{message.replyTo.text}</p>
                      </div>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words md:leading-6">{message.text}</p>
                    {message.attachments?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {message.attachments.map((attachment) => (
                          <span key={`${message.id}-${attachment.type}`} className={`rounded-full px-2 py-1 ${isMine ? 'bg-white/20' : 'bg-white dark:bg-zinc-900'}`}>
                            {attachment.type === 'voice' ? '🎤 Voice' : attachment.name ?? attachment.type}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {message.reactions?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.reactions.map((reaction) => (
                          <span key={`${message.id}-${reaction.emoji}`} className={`rounded-full px-2 py-1 text-[11px] ${isMine ? 'bg-white/20' : 'bg-white dark:bg-zinc-900'}`}>
                            {reaction.emoji} {reaction.users.length}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                      <span>{message.time}</span>
                      {isMine && message.status ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" />
                          {message.status === 'read' ? 'Read' : 'Sent'}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" onClick={() => onReply?.(message)} className="rounded-full p-1 text-zinc-400 hover:text-emerald-600">
                      <MessageCircleReply className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => onReact?.(message.id, '👍')} className="rounded-full p-1 text-zinc-400 hover:text-emerald-600">
                      <SmilePlus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-3xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-400" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.1s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.2s]" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">....</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-md transition hover:scale-105 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <ChevronDown className="mr-1 inline h-3.5 w-3.5" />
          Scroll to bottom
        </button>
      )}
    </>
  );
}
