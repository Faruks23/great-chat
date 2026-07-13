import { Router } from 'express';
import { getUsers, getCurrentUser, getUserById, addFriend, searchUser } from './user.controller';
import { authMiddleware } from '../../middlewares';

const router = Router();

router.get('/current', authMiddleware, getCurrentUser);
router.get('/search', authMiddleware, searchUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/:id/friends', authMiddleware, addFriend);

export default router;

