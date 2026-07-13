export interface MessageAttachmentData {
  type: 'image' | 'video' | 'file' | 'voice';
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

export interface MessageReplyData {
  id: string;
  text: string;
  sender: 'me' | 'them';
  name?: string;
}

export interface MessageData {
  conversationId: string;
  senderId: string;
  text?: string;
  status?: string;
  attachments?: MessageAttachmentData[];
  replyTo?: MessageReplyData;
}
