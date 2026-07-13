import mongoose, { Schema, Document, model } from 'mongoose';

export interface SettingsDocument extends Document {
  notificationsEnabled: boolean;
  theme: string;
  language: string;
  updatedAt: Date;
  createdAt: Date;
}

const SettingsSchema = new Schema<SettingsDocument>(
  {
    notificationsEnabled: { type: Boolean, default: true },
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

const SettingsModel = mongoose.models.Settings || model<SettingsDocument>('Settings', SettingsSchema);
export default SettingsModel;
