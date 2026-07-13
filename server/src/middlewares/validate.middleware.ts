import { Request, Response, NextFunction } from 'express';

export function validateMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ message: 'Invalid request body' });
  }
  next();
}
