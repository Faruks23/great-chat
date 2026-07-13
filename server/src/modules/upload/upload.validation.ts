import { Request, Response, NextFunction } from 'express';

export function validateUpload(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return res.status(400).json({ message: 'File is required.' });
  }
  next();
}
