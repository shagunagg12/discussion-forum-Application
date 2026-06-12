import mongoose, { Schema } from 'mongoose';

export interface ICreditConfig {
  _id: mongoose.Types.ObjectId;
  startValue: number;
  increment: number;
  updatedAt: Date;
  createdAt: Date;
}

const CreditConfigSchema = new Schema<ICreditConfig>(
  {
    startValue: { type: Number, required: true, default: 1 },
    increment: { type: Number, required: true, default: 2 },
  },
  { timestamps: true }
);

export default mongoose.model<ICreditConfig>('CreditConfig', CreditConfigSchema);
