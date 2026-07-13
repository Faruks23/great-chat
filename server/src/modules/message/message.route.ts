import { Router } from 'express';
import { getMessages, createMessage } from './message.controller';
import { validateMessage } from './message.validation';
import { authMiddleware } from '../../middlewares';

/**
 * Message routes provide endpoints for retrieving and storing chat messages.
 */
const router = Router();

router.get('/', authMiddleware, getMessages);
router.post('/', authMiddleware, validateMessage, createMessage);

export default router;
