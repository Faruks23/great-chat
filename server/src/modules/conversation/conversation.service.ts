import mongoose from 'mongoose';
import ConversationModel from './conversation.model';

export class ConversationService {
  static async getAllByUser(userId: string) {
    const query: any = { participants: { $in: [userId] } };
    if (mongoose.isValidObjectId(userId)) {
      query.participants.$in.push(new mongoose.Types.ObjectId(userId));
    }

    return ConversationModel.find(query).lean();
  }

  static async getById(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    return ConversationModel.findById(id).lean();
  }

  static async findByParticipants(participants: string[]) {
    const existing = await ConversationModel.findOne({ participants: { $all: participants, $size: participants.length } }).lean();
    if (existing) {
      return existing;
    }

    const objectIdParticipants = participants.map((item) => (mongoose.isValidObjectId(item) ? new mongoose.Types.ObjectId(item) : item));
    if (objectIdParticipants.some((item, index) => item !== participants[index])) {
      return ConversationModel.findOne({ participants: { $all: objectIdParticipants, $size: objectIdParticipants.length } }).lean();
    }

    return null;
  }

  static async create(name: string, participants: string[]) {
    const existing = await this.findByParticipants(participants);
    if (existing) return existing;
    return ConversationModel.create({ name, participants, lastMessage: '' });
  }

  static async createGroupConversation(name: string, participants: string[]) {
    return ConversationModel.create({ name, participants, lastMessage: '' });
  }
}
