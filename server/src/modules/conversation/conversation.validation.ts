import { Request, Response, NextFunction } from 'express';

export function validateConversation(req: Request, res: Response, next: NextFunction) {
  const { name, participants } = req.body;
  const isValidParticipants =
    Array.isArray(participants) &&
    participants.length >= 2 &&
    participants.every((participant) => typeof participant === 'string' && participant.trim());

  if (!name || typeof name !== 'string' || !isValidParticipants) {
    return res.status(400).json({ message: 'Name and at least two valid participant IDs are required.' });
  }
  next();
}
