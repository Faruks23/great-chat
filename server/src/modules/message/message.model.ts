import mongoose, { Schema, Document, model } from 'mongoose';

export interface MessageDocument extends Document {
  conversationId: string;
  senderId: string;
  text: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    status: { type: String, default: 'sent' },
  },
  { timestamps: true }
);

const MessageModel = mongoose.models.Message || model<MessageDocument>('Message', MessageSchema);
export default MessageModel;
