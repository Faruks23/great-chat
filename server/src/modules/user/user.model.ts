import mongoose, { Schema, Document, model } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
  friends?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, trim: true, sparse: true },
    phone: { type: String, unique: true, trim: true, sparse: true },
    password: { type: String, required: true },
    avatar: { type: String },
    friends: [{ type: String, ref: 'User' }],
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || model<UserDocument>('User', UserSchema);
export default UserModel;
