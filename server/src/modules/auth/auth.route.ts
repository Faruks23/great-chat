import { Router } from 'express';
import { login, register, refresh } from './auth.controller';
import { validateAuth } from './auth.validation';

const router = Router();

router.post('/login', validateAuth, login);
router.post('/register', validateAuth, register);
router.post('/refresh', refresh);

export default router;
