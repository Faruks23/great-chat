import mongoose, { Schema, Document, model } from 'mongoose';

export interface ConversationDocument extends Document {
  name: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: Date;
  createdAt: Date;
}

const ConversationSchema = new Schema<ConversationDocument>(
  {
    name: { type: String, required: true },
    participants: [{ type: String, required: true }],
    lastMessage: { type: String },
  },
  { timestamps: true }
);

const ConversationModel = mongoose.models.Conversation || model<ConversationDocument>('Conversation', ConversationSchema);
export default ConversationModel;
