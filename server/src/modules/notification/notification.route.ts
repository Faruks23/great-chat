import { Router } from 'express';
import { getNotifications, createNotification } from './notification.controller';
import { validateNotification } from './notification.validation';
import { getPublicKey, subscribe, broadcast } from './push.controller';
import { unsubscribe } from './unsubscribe.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

/**
 * Notification routes cover both backend notification records and Web Push endpoints.
 */
const router = Router();

router.get('/', getNotifications);
router.post('/', validateNotification, createNotification);

// Web Push endpoints
router.get('/vapidPublicKey', getPublicKey);
// subscribe route requires authenticated user to associate subscription
router.post('/subscribe', authMiddleware, subscribe);
router.post('/broadcast', broadcast);
router.post('/unsubscribe', authMiddleware, unsubscribe);

export default router;
