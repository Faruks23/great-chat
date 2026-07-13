import { Request, Response, NextFunction } from 'express';
import { getPublicVapidKey, saveSubscription, broadcastPush } from './push.service';

export async function getPublicKey(req: Request, res: Response, next: NextFunction) {
  try {
    const key = getPublicVapidKey();
    res.json({ publicKey: key });
  } catch (error) {
    next(error);
  }
}

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const subscription = req.body;
    await saveSubscription(userId, subscription);
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function broadcast(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    await broadcastPush(payload);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
