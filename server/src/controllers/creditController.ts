import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import CreditConfig from '../models/CreditConfig';
import CreditTransaction from '../models/CreditTransaction';
import User from '../models/User';
import { validate } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const configValidation = [
  body('startValue').isInt({ min: 0 }).withMessage('startValue must be non-negative integer'),
  body('increment').isInt({ min: 0 }).withMessage('increment must be non-negative integer'),
  validate,
];

export const getConfig = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let config = await CreditConfig.findOne();
    if (!config) {
      config = await CreditConfig.create({ startValue: 1, increment: 2 });
    }
    res.json(config);
  } catch (err) {
    next(err);
  }
};

export const updateConfig = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startValue, increment } = req.body;

    let config = await CreditConfig.findOne();
    if (!config) {
      config = await CreditConfig.create({ startValue, increment });
    } else {
      config.startValue = startValue;
      config.increment = increment;
      await config.save();
    }

    res.json(config);
  } catch (err) {
    next(err);
  }
};

export const getUserCredits = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('username credits');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const transactions = await CreditTransaction.find({ opId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('commentId', 'body depth')
      .populate('postId', 'title')
      .lean();

    res.json({ user, transactions });
  } catch (err) {
    next(err);
  }
};
