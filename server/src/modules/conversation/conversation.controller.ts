import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ConversationService } from './conversation.service';
import { UserService } from '../user/user.service';

export async function getConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversations = await ConversationService.getAllByUser(userId);
    const mapped = await Promise.all(
      conversations.map(async (conversation) => {
        let name = conversation.name;

        if (conversation.participants.length === 2) {
          const otherParticipant = conversation.participants.find((participant: string) => participant !== userId);
          if (otherParticipant) {
            const otherUser = await UserService.getById(otherParticipant);
            if (otherUser?.name) {
              name = otherUser.name;
            }
          }
        }

        return {
          id: conversation._id.toString(),
          name,
          participants: conversation.participants,
          lastMessage: conversation.lastMessage || '',
          time: new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0,
          online: false,
        };
      })
    );

    res.json(mapped);
  } catch (error) {
    next(error);
  }
}

export async function getConversationById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const conversationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!conversationId) {
      return res.status(400).json({ message: 'Conversation ID is required' });
    }

    const conversation = await ConversationService.getById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const participantMatch = conversation.participants.includes(userId) ||
      conversation.participants.includes(new mongoose.Types.ObjectId(userId) as any);
    if (!participantMatch) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let name = conversation.name;
    if (conversation.participants.length === 2) {
      const otherParticipant = conversation.participants.find((participant: string) => participant !== userId);
      if (otherParticipant) {
        const otherUser = await UserService.getById(otherParticipant);
        if (otherUser?.name) {
          name = otherUser.name;
        }
      }
    }

    res.json({
      id: conversation._id.toString(),
      name,
      participants: conversation.participants,
      lastMessage: conversation.lastMessage || '',
      time: new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      online: false,
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversationWithUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const participantId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    if (userId === participantId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    const conversation = await ConversationService.create('New Chat', [userId, participantId]);
    let name = conversation.name;

    if (conversation.participants.length === 2) {
      const otherParticipant = conversation.participants.find((participant: string) => participant !== userId);
      if (otherParticipant) {
        const otherUser = await UserService.getById(otherParticipant);
        if (otherUser?.name) {
          name = otherUser.name;
        }
      }
    }

    res.json({
      id: conversation._id.toString(),
      name,
      participants: conversation.participants,
      lastMessage: conversation.lastMessage || '',
      time: new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      online: false,
    });
  } catch (error) {
    next(error);
  }
}

export async function createConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { name, participants } = req.body;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = await ConversationService.create(name, participants);
    res.json({
      id: conversation._id.toString(),
      name: conversation.name,
      participants: conversation.participants,
      lastMessage: conversation.lastMessage || '',
      time: new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      online: false,
    });
  } catch (error) {
    next(error);
  }
}
