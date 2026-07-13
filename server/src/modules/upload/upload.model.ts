import mongoose, { Schema, Document, model } from 'mongoose';

export interface UploadDocument extends Document {
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema = new Schema<UploadDocument>(
  {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

const UploadModel = mongoose.models.Upload || model<UploadDocument>('Upload', UploadSchema);
export default UploadModel;
