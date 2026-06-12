import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  credits: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    credits: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
