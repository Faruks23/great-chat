import mongoose, { Schema, Document, model } from 'mongoose';

export interface NotificationDocument extends Document {
  recipientId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    recipientId: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.models.Notification || model<NotificationDocument>('Notification', NotificationSchema);
export default NotificationModel;
