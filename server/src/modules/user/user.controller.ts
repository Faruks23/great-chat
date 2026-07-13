import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ConversationService } from '../conversation/conversation.service';
import { getIoServer } from '../../config/socket';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await UserService.getAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await UserService.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function searchUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const query = String(req.query.q ?? '').trim();

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const user = await UserService.findByEmailOrPhone(query);
    if (!user || user.id === userId) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await UserService.getById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friends = user.friends?.length ? await UserService.getByIds(user.friends) : [];
    res.json({ ...user, friends });
  } catch (error) {
    next(error);
  }
}

export async function addFriend(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const friendId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!friendId) {
      return res.status(400).json({ message: 'Friend ID is required' });
    }

    if (userId === friendId) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend' });
    }

    const friend = await UserService.getById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'Friend account not found' });
    }

    const updatedUser = await UserService.addFriend(userId, friendId);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to add friend' });
    }

    const conversation = await ConversationService.create('New Chat', [userId, friendId]);
    const currentUser = await UserService.getById(userId);
    const friends = updatedUser.friends?.length ? await UserService.getByIds(updatedUser.friends) : [];

    const io = getIoServer();
    if (io) {
      io.to(`user:${friendId}`).emit('notification:receive', {
        type: 'friend',
        title: 'New friend added',
        body: `${currentUser?.name ?? 'Someone'} added you as a friend.`,
        data: {
          url: `/chat?userId=${currentUser?.id ?? userId}`,
          conversationId: conversation._id?.toString?.(),
        },
      });
    }

    res.json({ ...updatedUser, friends, conversationId: conversation._id?.toString?.() });
  } catch (error) {
    next(error);
  }
}

