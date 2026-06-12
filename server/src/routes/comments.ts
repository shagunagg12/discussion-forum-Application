import { Router } from 'express';
import {
  getComments,
  createComment,
  deleteComment,
  commentValidation,
} from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Mounted at /api/posts/:postId/comments
router.get('/', getComments);
router.post('/', authenticate, commentValidation, createComment);

export default router;
