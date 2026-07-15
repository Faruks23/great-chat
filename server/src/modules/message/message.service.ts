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

  /**
   * Mark messages in a conversation as read for all messages not sent by the reader.
   */
  static async markAsRead(conversationId: string, readerId: string) {
    return MessageModel.updateMany(
      { conversationId, senderId: { $ne: readerId }, status: { $ne: 'read' } },
      { $set: { status: 'read' } }
    );
  }
}
