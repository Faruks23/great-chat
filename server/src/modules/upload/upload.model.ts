import mongoose, { Schema, Document, model } from 'mongoose';

export interface UploadDocument extends Document {
  originalName: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  resourceType: string;
  publicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema = new Schema<UploadDocument>(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    resourceType: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);

const UploadModel = mongoose.models.Upload || model<UploadDocument>('Upload', UploadSchema);
export default UploadModel;
