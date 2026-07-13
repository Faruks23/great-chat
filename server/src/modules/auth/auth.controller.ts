import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuthService.register(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuthService.refresh(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
