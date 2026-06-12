import CreditConfig from '../models/CreditConfig';
import CreditTransaction from '../models/CreditTransaction';
import User from '../models/User';
import { Types } from 'mongoose';

/**
 * Returns the credit amount for a given depth using the arithmetic progression
 * stored in CreditConfig: credit = startValue + (depth - 1) * increment
 */
export const computeCredit = async (depth: number): Promise<number> => {
  let config = await CreditConfig.findOne();
  if (!config) {
    // Seed default config if missing
    config = await CreditConfig.create({ startValue: 1, increment: 2 });
  }
  return config.startValue + (depth - 1) * config.increment;
};

/**
 * Awards credits to the OP (post author) for a new comment.
 * Creates a CreditTransaction and increments the user's total.
 */
export const awardCredit = async (
  postId: Types.ObjectId,
  commentId: Types.ObjectId,
  opId: Types.ObjectId,
  depth: number
): Promise<void> => {
  const amount = await computeCredit(depth);

  await CreditTransaction.create({
    postId,
    commentId,
    opId,
    amount,
    depth,
    isReversed: false,
  });

  await User.findByIdAndUpdate(opId, { $inc: { credits: amount } });
};

/**
 * Reverses credits awarded for a comment (called on soft-delete).
 * Finds the active transaction, marks it reversed, and decrements the user's total.
 */
export const reverseCredit = async (commentId: Types.ObjectId): Promise<void> => {
  const tx = await CreditTransaction.findOne({ commentId, isReversed: false });
  if (!tx) return;

  tx.isReversed = true;
  await tx.save();

  await User.findByIdAndUpdate(tx.opId, { $inc: { credits: -tx.amount } });
};
