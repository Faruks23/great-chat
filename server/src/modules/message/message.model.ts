import mongoose, { Schema, Document, model } from 'mongoose';

export interface MessageAttachmentDocument {
  type: 'image' | 'video' | 'file' | 'voice';
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

export interface MessageReplyDocument {
  id: string;
  text: string;
  sender: 'me' | 'them';
  name?: string;
}

export interface MessageDocument extends Document {
  conversationId: string;
  senderId: string;
  text: string;
  status: string;
  attachments?: MessageAttachmentDocument[];
  replyTo?: MessageReplyDocument;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true },
    text: { type: String, default: '' },
    status: { type: String, default: 'sent' },
    attachments: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        name: { type: String },
        mimeType: { type: String },
        size: { type: Number },
      },
    ],
    replyTo: {
      id: { type: String },
      text: { type: String },
      sender: { type: String, enum: ['me', 'them'] },
      name: { type: String },
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.models.Message || model<MessageDocument>('Message', MessageSchema);
export default MessageModel;
