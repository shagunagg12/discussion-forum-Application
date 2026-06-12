import { Router } from 'express';
import { getPosts, getPost, createPost, postValidation } from '../controllers/postController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', authenticate, postValidation, createPost);

export default router;
