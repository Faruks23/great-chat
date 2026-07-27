
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { UserService } from "./user.service";

import { FriendService } from "./friend.service";
import { NotFoundError } from "../../common/errors/NotFoundError";
import { catchAsync } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/ApiResponse";
import { UnauthorizedError } from "../../common/errors/UnauthorizedError";
import { BadRequestError } from "../../common/errors/BadRequestError";
/**
 * ==========================================
 * GET /users
 * সব User এর তালিকা নিয়ে আসে।
 * ==========================================
 */
export const getUsers = catchAsync(async (req, res) => {
  const users = await UserService.getAll();
  // Client কে JSON আকারে response পাঠায়।
  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: users,
    message: "All user Retribe successfully",
  });
});

/**
 * ==========================================
 * GET /users/:id
 * নির্দিষ্ট User এর তথ্য নিয়ে আসে।
 * ==========================================
 */
export const getUserById = catchAsync(async (req, res) => {
  const user = await UserService.getById(req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users fetched successfully",
    data: user,
  });
});

/**
 * ==========================================
 * GET /users/search?q=value
 * Email অথবা Phone দিয়ে User Search করে।
 * ==========================================
 */
export const searchUser = catchAsync<AuthenticatedRequest>(
  async (req, res) => {
    const userId = req.user?.id;
    const query = String(req.query.q ?? "").trim();

    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    if (!query) {
      throw new BadRequestError("Search query is required");
    }

    const user = await UserService.findByEmailOrPhone(query);

    if (!user || user.id === userId) {
      throw new NotFoundError("User not found");
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User found successfully",
      data: user,
    });
  }
);

/**
 * ==========================================
 * GET /users/me
 * Get current logged in user
 * ==========================================
 */
export const getCurrentUser = catchAsync<>(
  async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const user = await UserService.getById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const friends = user.friends?.length
      ? await UserService.getByIds(user.friends)
      : [];

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Current user fetched successfully",
      data: {
        ...user,
        friends,
      },
    });
  }
);

/**
 * ==========================================
 * POST /users/:id/add-friend
 * Add a new friend
 * ==========================================
 */
export const addFriend = catchAsync(
  async (req, res) => {
    const result = await FriendService.addFriend(
      req.user.id,
      req.params.id
    );

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Friend added successfully",
      data: result,
    });
  }
);