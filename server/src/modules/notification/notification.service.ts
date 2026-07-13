import NotificationModel from './notification.model';
import { NotificationData } from './notification.interface';

/**
 * NotificationService wraps database operations for notification storage.
 */
export class NotificationService {
  static async getAll() {
    return NotificationModel.find().lean();
  }

  /**
   * Create a new notification record in storage.
   */
  static async create(data: NotificationData) {
    return NotificationModel.create(data);
  }
}
