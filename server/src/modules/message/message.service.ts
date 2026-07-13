import MessageModel from './message.model';
import { MessageData } from './message.interface';

/**
 * MessageService encapsulates CRUD operations for chat messages.
 * It provides database access for listing and creating messages.
 */
export class MessageService {
  static async getAll() {
    return MessageModel.find().lean();
  }

  static async getByConversation(conversationId: string) {
    return MessageModel.find({ conversationId }).sort({ createdAt: 1 }).lean();
  }

  /**
   * Persist a new chat message to the database.
   */
  static async create(data: MessageData) {
    return MessageModel.create(data);
  }
}
