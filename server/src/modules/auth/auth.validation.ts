import { Request, Response, NextFunction } from 'express';

export function validateAuth(req: Request, res: Response, next: NextFunction) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  req.body.email = email || undefined;
  req.body.phone = phone || undefined;
  req.body.password = password;

  if ((!email && !phone) || !password) {
    return res.status(400).json({ message: 'Email or phone and password are required.' });
  }

  next();
}
