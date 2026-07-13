import { Request, Response, NextFunction } from 'express';
import SubscriptionModel from './subscription.model';

export async function unsubscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { endpoint } = req.body;
    if (!endpoint && !userId) return res.status(400).json({ message: 'endpoint or authenticated user required' });

    const query: any = {};
    if (endpoint) query.endpoint = endpoint;
    if (userId) query.userId = userId;

    await SubscriptionModel.deleteMany(query);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
