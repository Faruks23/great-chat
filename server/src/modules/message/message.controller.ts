import { Request, Response, NextFunction } from 'express';
import { MessageService } from './message.service';

/**
 * Controller for message API requests.
 * It retrieves and creates messages used by the chat client.
 */
export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const conversationId = req.query.conversationId as string;
    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    const messages = await MessageService.getByConversation(conversationId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
}

export async function createMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const message = await MessageService.create(req.body);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
}
