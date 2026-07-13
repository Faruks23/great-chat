import { Application } from 'express';
import authRoute from '../modules/auth/auth.route';
import userRoute from '../modules/user/user.route';
import conversationRoute from '../modules/conversation/conversation.route';
import messageRoute from '../modules/message/message.route';
import groupRoute from '../modules/group/group.route';
import callRoute from '../modules/call/call.route';
import notificationRoute from '../modules/notification/notification.route';
import uploadRoute from '../modules/upload/upload.route';
import settingsRoute from '../modules/settings/settings.route';

export function registerRoutes(app: Application) {
  app.use('/api/auth', authRoute);
  app.use('/api/users', userRoute);
  app.use('/api/conversations', conversationRoute);
  app.use('/api/messages', messageRoute);
  app.use('/api/groups', groupRoute);
  app.use('/api/calls', callRoute);
  app.use('/api/notifications', notificationRoute);
  app.use('/api/upload', uploadRoute);
  app.use('/api/settings', settingsRoute);
}
