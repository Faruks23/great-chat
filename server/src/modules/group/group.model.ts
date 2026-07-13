import mongoose, { Schema, Document, model } from 'mongoose';

export interface GroupDocument extends Document {
  name: string;
  members: string[];
  conversationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<GroupDocument>(
  {
    name: { type: String, required: true },
    members: [{ type: String, required: true }],
    conversationId: { type: String },
  },
  { timestamps: true }
);

const GroupModel = mongoose.models.Group || model<GroupDocument>('Group', GroupSchema);
export default GroupModel;
