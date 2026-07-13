import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';

/**
 * Notification controller handles simple API endpoints for notification records.
 */
export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await NotificationService.getAll();
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function createNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await NotificationService.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
}
