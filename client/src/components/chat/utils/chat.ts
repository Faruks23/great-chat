'use client';

import type { ChatMessage } from '@/store/chatSlice';
import type { User } from '@/types';

/**
 * normalizeMessage converts backend message payloads into the client ChatMessage shape.
 * It handles legacy field mappings, sender normalization, and default values.
 */
export function normalizeMessage(message: any, currentUserId?: string | null): ChatMessage {
  // Ensure we always produce a stable string id for client-side deduplication
  const rawId = message._id ?? message.id ?? message._doc?._id ?? message.clientId ?? message.tempId ?? Date.now();
  const id = typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : JSON.stringify(rawId);

  return {
    id,
    conversationId: message.conversationId ? String(message.conversationId) : undefined,
    senderId: message.senderId,
    from: message.from
      ? message.from
      : message.senderId && currentUserId
        ? message.senderId === currentUserId
          ? 'me'
          : 'them'
        : 'them',
    text: message.text ?? '',
    time: message.time ?? (message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    day: message.day ?? 'Today',
    status: message.status,
    replyTo: message.replyTo,
    attachments: message.attachments,
    reactions: message.reactions,
  };
}
