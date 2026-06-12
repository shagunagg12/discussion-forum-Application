import { Router } from 'express';
import {
  register,
  login,
  getMe,
  registerValidation,
  loginValidation,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);

export default router;
