'use client';

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchConversations, fetchMessages, sendChatMessage } from '@/services/chatService';

export type Conversation = {
  id: string;
  name: string;
  participants?: string[];
  isGroup?: boolean;
  groupId?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

export type MessageAttachment = {
  type: 'image' | 'file' | 'voice';
  url?: string;
  name?: string;
  mimeType?: string;
  size?: number;
  duration?: number;
};

export type MessageReaction = {
  emoji: string;
  users: string[];
};

export type MessageReply = {
  id: number | string;
  text: string;
  sender: 'me' | 'them';
  name?: string;
};

export type ChatMessage = {
  id: number | string;
  conversationId?: number | string;
  senderId?: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  day: string;
  status?: 'sent' | 'read';
  replyTo?: MessageReply;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
};

export type ActiveCall = {
  room: string;
  mode: 'voice' | 'video';
  status: 'idle' | 'connecting' | 'connected';
};

export type ChatState = {
  conversations: Conversation[];
  activeId: string;
  messagesByConv: Record<string, ChatMessage[]>;
  draft: string;
  darkMode: boolean;
  activeCall?: ActiveCall;
};

const initialState: ChatState = {
  conversations: [],
  activeId: '',
  messagesByConv: {},
  draft: '',
  darkMode: false,
  activeCall: undefined,
};

/**
 * Async thunks to load and send chat data using the existing service layer.
 */
export const fetchConversationsThunk = createAsyncThunk('chat/fetchConversations', async () => {
  const data = await fetchConversations();
  return data;
});

export const fetchMessagesThunk = createAsyncThunk('chat/fetchMessages', async (conversationId: string) => {
  const data = await fetchMessages(conversationId);
  return { id: conversationId, messages: data };
});

export const sendChatMessageThunk = createAsyncThunk('chat/sendMessage', async (payload: { conversationId: string; senderId: string; text: string; attachments?: MessageAttachment[] }) => {
  const data = await sendChatMessage(payload);
  return { conversationId: payload.conversationId, message: data };
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<Conversation[]>) {
      const incoming = action.payload;
      const previousById = new Map(state.conversations.map((conversation) => [conversation.id, conversation]));

      state.conversations = incoming.map((conversation) => {
        const existing = previousById.get(conversation.id);
        return {
          ...conversation,
          online: existing?.online === true || Boolean(conversation.online),
        };
      });
    },
    setMessagesForConversation(state, action: PayloadAction<{ id: string; messages: ChatMessage[] }>) {
      state.messagesByConv[action.payload.id] = action.payload.messages;
    },
    appendMessage(state, action: PayloadAction<{ conversationId: string; message: ChatMessage }>) {
      const { conversationId, message } = action.payload;
      state.messagesByConv[conversationId] = [...(state.messagesByConv[conversationId] || []), message];
      const conversation = state.conversations.find((c) => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = message.text;
        conversation.time = message.time;
        if (message.from === 'them') {
          conversation.unread += 1;
        } else {
          conversation.unread = 0;
        }
      }
    },
    setConversationOnline(state, action: PayloadAction<{ userId: string; online: boolean }>) {
      const { userId, online } = action.payload;
      state.conversations = state.conversations.map((conversation) => {
        if (conversation.participants?.includes(userId)) {
          return { ...conversation, online };
        }
        return conversation;
      });
    },
    markMessagesAsRead(state, action: PayloadAction<string>) {
      const conversationId = action.payload;
      state.messagesByConv[conversationId] = (state.messagesByConv[conversationId] || []).map((message) =>
        message.from === 'them' ? { ...message, status: 'read' } : message
      );
      const conversation = state.conversations.find((item) => item.id === conversationId);
      if (conversation) {
        conversation.unread = 0;
      }
    },
    addReactionToMessage(state, action: PayloadAction<{ conversationId: string; messageId: number | string; emoji: string }>) {
      const { conversationId, messageId, emoji } = action.payload;
      const messages = state.messagesByConv[conversationId] || [];
      state.messagesByConv[conversationId] = messages.map((message) => {
        if (message.id !== messageId) return message;
        const existing = message.reactions ?? [];
        const current = existing.find((item) => item.emoji === emoji);
        if (!current) {
          return { ...message, reactions: [...existing, { emoji, users: ['me'] }] };
        }

        const hasMe = current.users.includes('me');
        return {
          ...message,
          reactions: existing.map((item) => {
            if (item.emoji !== emoji) return item;
            return {
              ...item,
              users: hasMe ? item.users.filter((user) => user !== 'me') : [...item.users, 'me'],
            };
          }),
        };
      });
    },
    setActiveConversation(state, action: PayloadAction<string>) {
      state.activeId = action.payload;
    },
    setDraft(state, action: PayloadAction<string>) {
      state.draft = action.payload;
    },
    setActiveCall(state, action: PayloadAction<ActiveCall>) {
      state.activeCall = action.payload;
    },
    updateCallStatus(state, action: PayloadAction<ActiveCall['status']>) {
      if (state.activeCall) {
        state.activeCall.status = action.payload;
      }
    },
    endCall(state) {
      state.activeCall = undefined;
    },
    sendMessage(state) {
      const text = state.draft.trim();
      if (!text) return;
      const now = new Date();
      const message: ChatMessage = {
        id: Date.now(),
        from: 'me',
        text,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        day: 'Today',
        status: 'sent',
      };
      state.messagesByConv[state.activeId] = [...(state.messagesByConv[state.activeId] || []), message];
      state.draft = '';
      const conversation = state.conversations.find((c) => c.id === state.activeId);
      if (conversation) {
        conversation.lastMessage = message.text;
        conversation.time = message.time;
        conversation.unread = 0;
      }
    },
    receiveMessage(state, action: PayloadAction<{ id: number; text: string; time: string }>) {
      const { id, text, time } = action.payload;
      const message: ChatMessage = { id, from: 'them', text, time, day: 'Today' };
      state.messagesByConv[state.activeId] = [...(state.messagesByConv[state.activeId] || []), message];
      const conversation = state.conversations.find((c) => c.id === state.activeId);
      if (conversation) {
        conversation.lastMessage = text;
        conversation.time = time;
        conversation.unread += 1;
      }
    },
    toggleTheme(state) {
      state.darkMode = !state.darkMode;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchConversationsThunk.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    });

    builder.addCase(fetchMessagesThunk.fulfilled, (state, action: PayloadAction<{ id: string; messages: ChatMessage[] }>) => {
      const { id, messages } = action.payload;
      state.messagesByConv[id] = messages;
    });

    builder.addCase(sendChatMessageThunk.fulfilled, (state, action: PayloadAction<{ conversationId: string; message: ChatMessage }>) => {
      const { conversationId, message } = action.payload;
      state.messagesByConv[conversationId] = [...(state.messagesByConv[conversationId] || []), message];
      const conversation = state.conversations.find((c) => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = message.text;
        conversation.time = message.time;
        if (message.from === 'them') conversation.unread += 1; else conversation.unread = 0;
      }
    });
  },
});

export const {
  setConversations,
  setMessagesForConversation,
  appendMessage,
  setConversationOnline,
  markMessagesAsRead,
  addReactionToMessage,
  setActiveConversation,
  setDraft,
  setActiveCall,
  updateCallStatus,
  endCall,
  sendMessage,
  receiveMessage,
  toggleTheme,
} = chatSlice.actions;
export default chatSlice.reducer;
