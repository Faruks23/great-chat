import mongoose, { Schema, Document, model } from 'mongoose';

export interface SubscriptionDocument extends Document {
  userId?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const SubscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: { type: String },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const SubscriptionModel = mongoose.models.PushSubscription || model<SubscriptionDocument>('PushSubscription', SubscriptionSchema);
export default SubscriptionModel;
