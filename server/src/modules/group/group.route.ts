import { Router } from 'express';
import { getGroups, getGroupById, createGroup } from './group.controller';
import { authMiddleware } from '../../middlewares';

const router = Router();

router.get('/', authMiddleware, getGroups);
router.get('/:id', authMiddleware, getGroupById);
router.post('/', authMiddleware, createGroup);

export default router;
