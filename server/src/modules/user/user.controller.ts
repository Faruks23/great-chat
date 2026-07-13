import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ConversationService } from '../conversation/conversation.service';

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

    const updatedUser = await UserService.addFriend(userId, friendId);
    await ConversationService.create('New Chat', [userId, friendId]);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
}

