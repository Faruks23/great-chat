import { Request, Response, NextFunction } from 'express';
import { GroupService } from './group.service';
import { ConversationService } from '../conversation/conversation.service';

export async function getGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const groups = await GroupService.getByUser(userId);
    const updatedGroups = await Promise.all(
      groups.map(async (group) => {
        if (group.conversationId) {
          return group;
        }

        const conversation = await ConversationService.create(group.name, group.members);
        await GroupService.setConversationId(group._id.toString(), conversation._id.toString());
        return { ...group, conversationId: conversation._id.toString() };
      })
    );

    res.json(updatedGroups);
  } catch (error) {
    next(error);
  }
}

export async function getGroupById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const groupId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const group = await GroupService.getById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!group.conversationId) {
      const conversation = await ConversationService.create(group.name, group.members);
      await GroupService.setConversationId(group._id.toString(), conversation._id.toString());
      group.conversationId = conversation._id.toString();
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
}

export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { name, members } = req.body;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Group name and members are required' });
    }

    const normalizedMembers = Array.from(new Set([...members, userId]));
    const group = await GroupService.create({ name, members: normalizedMembers });
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
}
