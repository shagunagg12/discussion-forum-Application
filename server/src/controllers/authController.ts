import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import User from '../models/User';
import { validate } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const registerValidation = [
  body('username').trim().isLength({ min: 2, max: 30 }).withMessage('Username must be 2–30 chars'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  validate,
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
];

const signToken = (userId: string): string =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(409).json({ message: 'Email or username already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });

    const token = signToken(user._id.toString());
    res.status(201).json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, credits: user.credits },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = signToken(user._id.toString());
    res.json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, credits: user.credits },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};
