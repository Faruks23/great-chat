import UserModel from './user.model';
import { UserData } from './user.interface';

function normalizeUser(user: any) {
  if (!user) return null;
  const { _id, __v, password, ...rest } = user;
  return {
    id: _id?.toString() ?? user.id,
    ...rest,
  };
}

export class UserService {
  static async getAll() {
    const users = await UserModel.find().lean();
    return users.map(normalizeUser);
  }

  static async getById(id: string) {
    const user = await UserModel.findById(id).lean();
    return normalizeUser(user);
  }

  static async getByIds(ids: string[]) {
    const users = await UserModel.find({ _id: { $in: ids } }).lean();
    return users.map(normalizeUser);
  }

    static async findByEmailOrPhone(query: string) {
    const normalizedQuery = query.trim().toLowerCase();
    const digitsOnly = query.replace(/\D/g, '');

    const conditions: any[] = [];
    if (normalizedQuery.includes('@')) {
      conditions.push({ email: normalizedQuery });
    }
    if (digitsOnly.length > 0) {
      conditions.push({ phone: digitsOnly });
      conditions.push({ phone: { $regex: digitsOnly, $options: 'i' } });
    }
    if (conditions.length === 0) {
      conditions.push({ email: normalizedQuery }, { phone: normalizedQuery });
    }

    const user = await UserModel.findOne({ $or: conditions }).lean();
    return normalizeUser(user);
  }


  static async addFriend(userId: string, friendId: string) {
    const user = await UserModel.findById(userId);
    const friend = await UserModel.findById(friendId);
    if (!user || !friend) {
      return null;
    }

    const userFriends = user.friends || [];
    const friendFriends = friend.friends || [];

    if (!userFriends.includes(friendId)) {
      user.friends = [...userFriends, friendId];
    }
    if (!friendFriends.includes(userId)) {
      friend.friends = [...friendFriends, userId];
    }

    await user.save();
    await friend.save();

    return normalizeUser(user.toObject());
  }

  static async create(data: UserData) {
    return UserModel.create(data);
  }
}
