import { Request, Response, NextFunction } from 'express';

export function validateMessage(req: Request, res: Response, next: NextFunction) {
  const { conversationId, senderId, text, attachments } = req.body;
  const hasText = typeof text === 'string' && text.trim().length > 0;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

  if (!conversationId || !senderId) {
    return res.status(400).json({ message: 'conversationId and senderId are required.' });
  }

  if (!hasText && !hasAttachments) {
    return res.status(400).json({ message: 'A message must include text or at least one attachment.' });
  }

  next();
}
