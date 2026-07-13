import { Request, Response, NextFunction } from 'express';

export function validateGroup(req: Request, res: Response, next: NextFunction) {
  const { name, members } = req.body;
  if (!name || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ message: 'Name and members are required.' });
  }
  next();
}
