import { Request, Response, NextFunction } from 'express';
import { CallService } from './call.service';

export async function getCalls(req: Request, res: Response, next: NextFunction) {
  try {
    const calls = await CallService.getAll();
    res.json(calls);
  } catch (error) {
    next(error);
  }
}
