import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import Post from '../models/Post';
import { validate } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const postValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 chars'),
  body('body').trim().isLength({ min: 10 }).withMessage('Body must be at least 10 chars'),
  validate,
];

export const getPosts = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username credits')
      .lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const getPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username credits')
      .lean();
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.create({
      title: req.body.title,
      body: req.body.body,
      author: req.userId,
    });
    await post.populate('author', 'username credits');
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};
