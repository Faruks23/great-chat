import UserModel from './user.model';
import { UserData } from './user.interface'; import { toUserDto } from "./user.mapper";

/**
 * =====================================================
 * Database থেকে পাওয়া User Object কে Client এর জন্য
 * Clean করে Return করে।
 *
 * MongoDB Return করে:
 * {
 *   _id,
 *   __v,
 *   password,
 *   ...
 * }
 *
 * কিন্তু Client এর Password বা __v দরকার নেই।
 * =====================================================
 */


export class UserService {

  /**
   * =====================================================
   * Database থেকে সব User নিয়ে আসে।
   * =====================================================
   */
  static async getAll() {

    /**
     * find()
     *
     * সব User নিয়ে আসে।
     *
     * lean()
     *
     * Mongoose Document না দিয়ে
     * Plain JavaScript Object Return করে।
     *
     * Performance বেশি ভালো।
     */
    const users = await UserModel.find().lean();

    /**
     * প্রত্যেক User কে Clean করছে।
     */
    return users.map(toUserDto);
  }

  /**
   * =====================================================
   * ID দিয়ে একটি User নিয়ে আসে।
   * =====================================================
   */
  static async getById(id: string) {

    /**
     * MongoDB _id দিয়ে Search।
     */
    const user = await UserModel.findById(id).lean();

    /**
     * Clean করে Return।
     */
    return toUserDto(user);
  }

  /**
   * =====================================================
   * অনেকগুলো ID দিয়ে User List নিয়ে আসে।
   * =====================================================
   */
  static async getByIds(ids: string[]) {

    /**
     * MongoDB Query
     *
     * _id IN (...)
     *
     * SQL Example:
     *
     * SELECT *
     * FROM users
     * WHERE id IN (...)
     */
    const users = await UserModel.find({
      _id: {
        $in: ids,
      },
    }).lean();

    return users.map(toUserDto);
  }

  /**
   * =====================================================
   * Email অথবা Phone দিয়ে User Search।
   * =====================================================
   */
  static async findByEmailOrPhone(query: string) {

    /**
     * Email Search এর জন্য
     * সব ছোট হাতের করে।
     */
    const normalizedQuery =
      query.trim().toLowerCase();

    /**
     * Phone Number থেকে
     * শুধু Digit রেখে দেয়।
     *
     * Example
     *
     * +880 1712-345678
     *
     * becomes
     *
     * 8801712345678
     */
    const digitsOnly =
      query.replace(/\D/g, '');

    /**
     * MongoDB Query Condition
     */
    const conditions: any[] = [];

    /**
     * যদি Email হয়।
     */
    if (normalizedQuery.includes('@')) {

      conditions.push({
        email: normalizedQuery,
      });
    }

    /**
     * যদি Number হয়।
     */
    if (digitsOnly.length > 0) {

      /**
       * Exact Match
       */
      conditions.push({
        phone: digitsOnly,
      });

      /**
       * Partial Match
       *
       * Example
       *
       * Search:
       * 171
       *
       * Match:
       * 01712345678
       */
      conditions.push({
        phone: {
          $regex: digitsOnly,
          $options: 'i',
        },
      });
    }

    /**
     * Email ও না
     * Phone ও না।
     *
     * দুইটাই Search করবে।
     */
    if (conditions.length === 0) {

      conditions.push(
        {
          email: normalizedQuery,
        },
        {
          phone: normalizedQuery,
        }
      );
    }

    /**
     * MongoDB OR Query।
     */
    const user =
      await UserModel.findOne({
        $or: conditions,
      }).lean();

    return toUserDto(user);
  }

  /**
   * =====================================================
   * Friend Add।
   * =====================================================
   */
  static async addFriend(
    userId: string,
    friendId: string
  ) {

    /**
     * দুইজন User Database থেকে।
     */
    const user =
      await UserModel.findById(userId);

    const friend =
      await UserModel.findById(friendId);

    /**
     * একজন না থাকলেও Fail।
     */
    if (!user || !friend) {
      return null;
    }

    /**
     * Current Friend List।
     */
    const userFriends =
      user.friends || [];

    const friendFriends =
      friend.friends || [];

    /**
     * Duplicate Friend Add হবে না।
     */
    if (!userFriends.includes(friendId)) {

      user.friends = [
        ...userFriends,
        friendId,
      ];
    }

    /**
     * অন্য User এর Friend List ও Update।
     */
    if (!friendFriends.includes(userId)) {

      friend.friends = [
        ...friendFriends,
        userId,
      ];
    }

    /**
     * দুইজনকেই Database এ Save।
     */
    await user.save();
    await friend.save();

    /**
     * Updated User Return।
     */
    return toUserDto(
      user.toObject()
    );
  }

  /**
   * =====================================================
   * নতুন User Create।
   * =====================================================
   */
  static async create(
    data: UserData
  ) {

    /**
     * MongoDB তে নতুন User Save।
     */
    return UserModel.create(data);
  }
}