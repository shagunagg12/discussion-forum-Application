import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPost extends Document {
  title: string;
  body: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    body: { type: String, required: true, minlength: 10 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });

export default mongoose.model<IPost>('Post', PostSchema);
