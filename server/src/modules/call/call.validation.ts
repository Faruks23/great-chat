import { Request, Response, NextFunction } from 'express';

export function validateCall(req: Request, res: Response, next: NextFunction) {
  const { participants, type } = req.body;
  if (!Array.isArray(participants) || participants.length === 0 || !type) {
    return res.status(400).json({ message: 'Participants and type are required.' });
  }
  next();
}
