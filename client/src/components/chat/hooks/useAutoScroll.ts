'use client';

import { useEffect, useRef, useState } from 'react';

type UseAutoScrollOptions = {
  messagesLength: number;
  activeId: string | null;
  isTyping: boolean;
};

/**
 * useAutoScroll manages the scrolling behavior of the chat message list.
 * It keeps the view pinned to the bottom when new messages arrive,
 * but allows the user to scroll up without being forced back down.
 */
export function useAutoScroll({ messagesLength, activeId, isTyping }: UseAutoScrollOptions) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const isAutoScrollEnabledRef = useRef(true);
  const previousActiveIdRef = useRef<string | null>(null);
  const previousMessagesLengthRef = useRef(0);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !activeId) return;

    const switchedConversation = previousActiveIdRef.current !== activeId;
    const hasNewMessages = messagesLength > previousMessagesLengthRef.current;
    const shouldAutoScroll = isAutoScrollEnabledRef.current && (switchedConversation || hasNewMessages || isTyping);

    if (!shouldAutoScroll) {
      previousActiveIdRef.current = activeId;
      previousMessagesLengthRef.current = messagesLength;
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      } else {
        element.scrollTo({ top: element.scrollHeight, behavior: 'auto' });
      }
    });

    previousActiveIdRef.current = activeId;
    previousMessagesLengthRef.current = messagesLength;

    return () => window.cancelAnimationFrame(frame);
  }, [activeId, isTyping, messagesLength]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;

    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 220;
    isAutoScrollEnabledRef.current = isNearBottom;
    setShowScrollBtn(!isNearBottom);
  };

  const scrollToBottom = () => {
    const element = scrollRef.current;
    if (!element) return;

    isAutoScrollEnabledRef.current = true;
    setShowScrollBtn(false);
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
    }
  };

  return { scrollRef, bottomRef, showScrollBtn, handleScroll, scrollToBottom };
}
