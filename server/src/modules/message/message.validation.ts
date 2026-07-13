import { Request, Response, NextFunction } from 'express';

export function validateMessage(req: Request, res: Response, next: NextFunction) {
  const { conversationId, senderId, text } = req.body;
  if (!conversationId || !senderId || !text) {
    return res.status(400).json({ message: 'conversationId, senderId, and text are required.' });
  }
  next();
}
