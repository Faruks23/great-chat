import mongoose from 'mongoose';
import GroupModel from './group.model';
import { GroupData } from './group.interface';
import { ConversationService } from '../conversation/conversation.service';

export class GroupService {
  static async getAll() {
    return GroupModel.find().lean();
  }

  static async getByUser(userId: string) {
    const query: any = { members: userId };
    if (mongoose.isValidObjectId(userId)) {
      query.members = { $in: [userId, new mongoose.Types.ObjectId(userId)] };
    }
    return GroupModel.find(query).lean();
  }

  static async getById(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }
    return GroupModel.findById(id).lean();
  }

  static async create(data: GroupData) {
    const conversation = await ConversationService.create(data.name, data.members);
    return GroupModel.create({
      ...data,
      conversationId: conversation._id.toString(),
    });
  }

  static async setConversationId(groupId: string, conversationId: string) {
    return GroupModel.findByIdAndUpdate(groupId, { conversationId }, { new: true }).lean();
  }
}
