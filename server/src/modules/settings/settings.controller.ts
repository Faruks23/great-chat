import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await SettingsService.getAll();
    res.json(settings);
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await SettingsService.update(req.body);
    res.json(settings);
  } catch (error) {
    next(error);
  }
}
