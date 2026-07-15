import api from '@/lib/axios';
import type { ChatMessage, Conversation, MessageAttachment } from '@/store/chatSlice';

export type ChatMessagePayload = {
  conversationId: string;
  senderId: string;
  text: string;
  attachments?: MessageAttachment[];
};

/**
 * Fetch the list of private and group conversations for the current user.
 */
export async function fetchConversations(): Promise<Conversation[]> {
  const response = await api.get<Conversation[]>('/conversations');
  return response.data;
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!conversationId?.trim()) {
    console.warn('fetchMessages called without a valid conversationId');
    return [];
  }

  const response = await api.get<ChatMessage[]>('/messages', {
    params: { conversationId: conversationId.trim() },
  });
  return response.data;
}

/**
 * Load an existing private conversation for a specific participant.
 */
export async function fetchConversationByUser(participantId: string): Promise<Conversation> {
  const response = await api.get<Conversation>(`/conversations/with/${participantId}`);
  return response.data;
}

export async function createConversation(payload: { name: string; participants: string[] }): Promise<Conversation> {
  const response = await api.post<Conversation>('/conversations', payload);
  return response.data;
}

/**
 * Send a new chat message to the backend and persist it in the current conversation.
 */
export async function sendChatMessage(message: ChatMessagePayload): Promise<ChatMessage> {
  const response = await api.post<ChatMessage>('/messages', message);
  return response.data;
}

