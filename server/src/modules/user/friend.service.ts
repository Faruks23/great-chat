import { UserService } from "./user.service";
import { ConversationService } from "../conversation/conversation.service";
import { getIoServer } from "../../config/socket";
import { BadRequestError } from "../../common/errors/BadRequestError";
import { NotFoundError } from "../../common/errors/NotFoundError";
import { ConflictError } from "../../common/errors/ConflictError";

export class FriendService {
  /**
   * Add a friend and automatically create a conversation.
   */
  static async addFriend(userId: string, friendId: string) {
    if (!friendId) {
      throw new BadRequestError("Friend ID is required");
    }

    if (userId === friendId) {
      throw new BadRequestError("You cannot add yourself as a friend");
    }

    const friend = await UserService.getById(friendId);

    if (!friend) {
      throw new NotFoundError("Friend account not found");
    }

    const updatedUser = await UserService.addFriend(userId, friendId);

    if (!updatedUser) {
      throw new ConflictError("Failed to add friend");
    }

    const conversation = await ConversationService.create(
      "New Chat",
      [userId, friendId]
    );

    const currentUser = await UserService.getById(userId);

    const friends = updatedUser.friends?.length
      ? await UserService.getByIds(updatedUser.friends)
      : [];

    const io = getIoServer();

    if (io) {
      io.to(`user:${friendId}`).emit("notification:receive", {
        type: "friend",
        title: "New friend added",
        body: `${currentUser?.name ?? "Someone"} added you as a friend.`,
        data: {
          url: `/chat?userId=${currentUser?.id ?? userId}`,
          conversationId: conversation._id?.toString(),
        },
      });
    }

    return {
      ...updatedUser,
      friends,
      conversationId: conversation._id?.toString(),
    };
  }
}