import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICreditTransaction extends Document {
  postId: Types.ObjectId;
  commentId: Types.ObjectId;
  opId: Types.ObjectId;
  amount: number;
  depth: number;
  isReversed: boolean;
  createdAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', required: true, unique: true },
    opId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    depth: { type: Number, required: true },
    isReversed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CreditTransactionSchema.index({ opId: 1 });
CreditTransactionSchema.index({ commentId: 1 });

export default mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);
