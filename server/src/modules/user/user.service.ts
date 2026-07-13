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

  static async addFriend(userId: string, friendId: string) {
    await UserModel.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });
    await UserModel.findByIdAndUpdate(friendId, { $addToSet: { friends: userId } });
    const user = await UserModel.findById(userId).lean();
    return normalizeUser(user);
  }

  static async create(data: UserData) {
    return UserModel.create(data);
  }
}
