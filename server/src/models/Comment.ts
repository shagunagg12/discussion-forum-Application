import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  postId: Types.ObjectId;
  parentId: Types.ObjectId | null;
  depth: number;
  author: Types.ObjectId;
  body: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    depth: { type: Number, required: true, min: 1 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, minlength: 1, maxlength: 5000 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Efficient subtree and parent queries
CommentSchema.index({ postId: 1, createdAt: 1 });
CommentSchema.index({ parentId: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
