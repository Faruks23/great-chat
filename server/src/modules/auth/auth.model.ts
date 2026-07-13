import mongoose, { Schema, Document, model } from 'mongoose';

export interface AuthUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthUserSchema = new Schema<AuthUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const AuthUserModel = mongoose.models.AuthUser || model<AuthUserDocument>('AuthUser', AuthUserSchema);

export default AuthUserModel;
