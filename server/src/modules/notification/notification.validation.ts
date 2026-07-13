import { Request, Response, NextFunction } from 'express';

export function validateNotification(req: Request, res: Response, next: NextFunction) {
  const { recipientId, title, body } = req.body;
  if (!recipientId || !title || !body) {
    return res.status(400).json({ message: 'recipientId, title, and body are required.' });
  }
  next();
}
