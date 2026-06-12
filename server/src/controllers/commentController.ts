import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { Types } from 'mongoose';
import Comment, { IComment } from '../models/Comment';
import Post from '../models/Post';
import { validate } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { awardCredit, reverseCredit } from '../services/creditService';

export const commentValidation = [
  body('body').trim().isLength({ min: 1, max: 5000 }).withMessage('Comment body required (max 5000 chars)'),
  body('parentId').optional({ nullable: true }).isMongoId().withMessage('Invalid parentId'),
  validate,
];

// ── Build nested comment tree from flat array ─────────────────────────────────
interface CommentNode extends IComment {
  children: CommentNode[];
}

const buildTree = (comments: IComment[]): CommentNode[] => {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const c of comments) {
    map.set(c._id.toString(), { ...c, children: [] } as unknown as CommentNode);
  }

  for (const node of map.values()) {
    const parentId = (node as IComment).parentId?.toString();
    if (!parentId) {
      roots.push(node);
    } else {
      const parent = map.get(parentId);
      if (parent) parent.children.push(node);
      else roots.push(node); // orphan safety
    }
  }

  return roots;
};

export const getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'username')
      .lean();

    const tree = buildTree(comments as unknown as IComment[]);
    res.json(tree);
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { postId } = req.params;
    const { body: commentBody, parentId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    let depth = 1;
    if (parentId) {
      const parent = await Comment.findById(parentId);
      if (!parent || parent.isDeleted) {
        res.status(404).json({ message: 'Parent comment not found or deleted' });
        return;
      }
      depth = parent.depth + 1;
    }

    const comment = await Comment.create({
      postId,
      parentId: parentId || null,
      depth,
      author: req.userId,
      body: commentBody,
    });

    // Award credits to OP (post author) — not if OP is commenting on their own post
    if (post.author.toString() !== req.userId) {
      await awardCredit(
        post._id as Types.ObjectId,
        comment._id as Types.ObjectId,
        post.author as Types.ObjectId,
        depth
      );
    }

    await comment.populate('author', 'username');
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.author.toString() !== req.userId) {
      res.status(403).json({ message: 'Not authorized to delete this comment' });
      return;
    }

    if (comment.isDeleted) {
      res.status(400).json({ message: 'Comment already deleted' });
      return;
    }

    comment.isDeleted = true;
    await comment.save();

    // Reverse credit awarded to OP
    await reverseCredit(comment._id as Types.ObjectId);

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};
