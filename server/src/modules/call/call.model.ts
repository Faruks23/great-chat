import mongoose, { Schema, Document, model } from 'mongoose';

export interface CallDocument extends Document {
  participants: string[];
  type: string;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema = new Schema<CallDocument>(
  {
    participants: [{ type: String, required: true }],
    type: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

const CallModel = mongoose.models.Call || model<CallDocument>('Call', CallSchema);
export default CallModel;
