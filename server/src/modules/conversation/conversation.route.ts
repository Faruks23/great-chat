import { Router } from 'express';
import { getConversations, getConversationWithUser, getConversationById, createConversation } from './conversation.controller';
import { authMiddleware } from '../../middlewares';
import { validateConversation } from './conversation.validation';

/**
 * Conversation routes expose endpoints to list, inspect, and create chat conversations.
 */
const router = Router();

router.get('/', authMiddleware, getConversations);
router.get('/with/:id', authMiddleware, getConversationWithUser);
router.get('/:id', authMiddleware, getConversationById);
router.post('/', authMiddleware, validateConversation, createConversation);

export default router;
