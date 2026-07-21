import { Server } from 'socket.io';
import { MessageService } from '../modules/message/message.service';
import { getPendingNotifications, queuePendingNotification } from './notificationStore';

/**
 * ===============================================
 * chatSocket()
 * ===============================================
 *
 * এই function-এর কাজ হলো
 * Chat সম্পর্কিত সমস্ত Socket Event Register করা।
 *
 * যেমন:
 * - Chat Join
 * - Send Message
 * - Typing
 * - Read Receipt
 * - Leave Conversation
 *
 * io => Socket.io Server Instance
 */
export default function chatSocket(io: Server) {

  /**
   * যখন নতুন User Socket Server এ Connect হয়
   */
  io.on('connection', (socket) => {

    /**
     * ==================================================
     * chat:join
     * ==================================================
     *
     * User যখন কোনো Conversation Open করে
     * তখন সেই Conversation Room এ Join হয়।
     *
     * Example:
     *
     * conversation:6845asd6
     */
    socket.on('chat:join', (conversationId: string) => {

      console.log(
        `socket ${socket.id} joining conversation:${conversationId}`
      );

      /**
       * Conversation Room এ Join করা হচ্ছে।
       */
      socket.join(`conversation:${conversationId}`);
    });

    /**
     * ==================================================
     * chat:message
     * ==================================================
     *
     * User যখন নতুন Message Send করে।
     */
    socket.on('chat:message', async (message) => {

      /**
       * Message Database এ Save করা হচ্ছে।
       */
      const savedMessage = await MessageService.create(message);

      /**
       * Mongo Document কে Plain Object এ Convert করা হচ্ছে।
       */
      const payload = savedMessage.toObject();

      /**
       * Conversation এর সকল Participant।
       */
      const recipients = Array.isArray(message.participants)
        ? message.participants
        : [];

      /**
       * Sender বাদে Receiver কে বের করা হচ্ছে।
       *
       * Example
       *
       * Sender = A
       * Participants = [A,B]
       *
       * তাহলে Receiver = B
       */
      const recipientId = recipients.find(
        (id: string) => id !== message.senderId
      );

      /**
       * ==================================================
       * Client এ পাঠানোর জন্য Final Message Object
       * ==================================================
       */
      const emission = {

        /**
         * Database Message
         */
        ...payload,

        /**
         * Optimistic Update এর tempId Preserve করা।
         *
         * Frontend Message Match করতে পারবে।
         */
        tempId: message.tempId ?? undefined,

        /**
         * Frontend UI এর জন্য।
         */
        from: 'them',

        /**
         * Sender Id
         */
        senderId: payload.senderId ?? message.senderId,
      };

      /**
       * ==================================================
       * পুরো Conversation Room এ Message পাঠানো হচ্ছে।
       *
       * Sender সহ সবাই Message Receive করবে।
       *
       * এতে Optimistic Message Replace করা সহজ হয়।
       * ==================================================
       */
      io.to(
        `conversation:${message.conversationId}`
      ).emit(
        'chat:message',
        emission
      );

      /**
       * ==================================================
       * Notification Section
       * ==================================================
       */
      if (recipientId) {

        /**
         * Receiver Online কিনা Check করা হচ্ছে।
         */
        const socketId =
          io.sockets.adapter.rooms.get(
            `user:${recipientId}`
          );

        /**
         * যদি User Room এ Socket থাকে
         * তাহলে Online।
         */
        const isOnline =
          Boolean(socketId && socketId.size > 0);

        /**
         * Notification Payload তৈরি।
         */
        const notificationPayload = {

          /**
           * Notification Type
           */
          type: 'message',

          /**
           * Notification Title
           */
          title: 'New message',

          /**
           * Notification Body
           */
          body: message.text,

          /**
           * Extra Data
           */
          data: {

            /**
             * কোন Conversation
             */
            conversationId:
              message.conversationId,

            /**
             * কে Message পাঠিয়েছে
             */
            senderId:
              message.senderId,
          },
        };

        /**
         * ==================================================
         * যদি Receiver Online থাকে
         * ==================================================
         */
        if (isOnline) {

          /**
           * সাথে সাথে Notification পাঠানো হচ্ছে।
           */
          io.to(
            `user:${recipientId}`
          ).emit(
            'notification:receive',
            notificationPayload
          );

        } else {

          /**
           * ==================================================
           * যদি Offline থাকে
           *
           * Notification Queue তে Store করা হচ্ছে।
           * পরে Online হলে Receive করবে।
           * ==================================================
           */
          queuePendingNotification(
            recipientId,
            {

              /**
               * Conversation
               */
              conversationId:
                message.conversationId,

              /**
               * Sender
               */
              senderId:
                message.senderId,

              /**
               * Message Text
               */
              text:
                message.text,

              /**
               * Created Time
               */
              createdAt:
                new Date().toISOString(),

              /**
               * Receiver
               */
              recipientId,
            }
          );
        }
      }
    });

    /**
     * ==================================================
     * chat:typing
     * ==================================================
     *
     * User Typing করলে
     * Conversation এর অন্য সবাইকে জানানো হয়।
     *
     * Sender Receive করবে না।
     */
    socket.on('chat:typing', (payload) => {

      socket.broadcast
        .to(
          `conversation:${payload.conversationId}`
        )
        .emit(
          'chat:typing',
          payload
        );
    });

    /**
     * ==================================================
     * chat:read
     * ==================================================
     *
     * User Message পড়লে।
     *
     * Database Update হবে।
     *
     * তারপর অন্য User Read Receipt Receive করবে।
     */
    socket.on(
      'chat:read',
      async (
        payload: {
          conversationId: string;
          readerId: string;
        }
      ) => {

        try {

          /**
           * Payload থেকে Data বের করা।
           */
          const {
            conversationId,
            readerId,
          } = payload;

          /**
           * Database এ Message Read Update।
           */
          await MessageService.markAsRead(
            conversationId,
            readerId
          );

          /**
           * Conversation এর সবাইকে জানানো হচ্ছে
           * Message Read হয়েছে।
           */
          io.to(
            `conversation:${conversationId}`
          ).emit(
            'chat:read',
            {
              conversationId,
              readerId,
            }
          );

        } catch (err) {

          /**
           * Error Log
           */
          console.error(
            'Error handling chat:read',
            err
          );
        }
      }
    );

    /**
     * ==================================================
     * chat:leave
     * ==================================================
     *
     * User Conversation Close করলে
     * Room Leave করবে।
     */
    socket.on(
      'chat:leave',
      (conversationId: string) => {

        console.log(
          `socket ${socket.id} leaving conversation:${conversationId}`
        );

        /**
         * Conversation Room Leave
         */
        socket.leave(
          `conversation:${conversationId}`
        );
      }
    );
  });
}