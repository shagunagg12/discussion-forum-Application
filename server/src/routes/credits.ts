import { Router } from 'express';
import {
  getConfig,
  updateConfig,
  getUserCredits,
  configValidation,
} from '../controllers/creditController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/config', authenticate, getConfig);
router.put('/config', authenticate, configValidation, updateConfig);
router.get('/users/:id', authenticate, getUserCredits);

export default router;
