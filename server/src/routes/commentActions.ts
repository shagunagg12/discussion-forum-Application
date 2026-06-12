import { Router } from 'express';
import { deleteComment } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// DELETE /api/comments/:id  (standalone delete route)
router.delete('/:id', authenticate, deleteComment);

export default router;
