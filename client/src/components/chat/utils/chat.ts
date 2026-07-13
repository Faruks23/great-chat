'use client';

import type { ChatMessage } from '@/store/chatSlice';
import type { User } from '@/types';

/**
 * normalizeMessage converts backend message payloads into the client ChatMessage shape.
 * It handles legacy field mappings, sender normalization, and default values.
 */
export function normalizeMessage(message: any, currentUserId?: string | null): ChatMessage {
  return {
    id: message.id ?? message._id ?? Date.now(),
    conversationId: message.conversationId,
    senderId: message.senderId,
    from: message.from
      ? message.from
      : message.senderId && currentUserId
        ? message.senderId === currentUserId
          ? 'me'
          : 'them'
        : 'them',
    text: message.text,
    time: message.time ?? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    day: message.day ?? 'Today',
    status: message.status,
    replyTo: message.replyTo,
    attachments: message.attachments,
    reactions: message.reactions,
  };
}
