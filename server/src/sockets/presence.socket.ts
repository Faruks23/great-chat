import { Server } from 'socket.io';
import { getPendingNotifications } from './notificationStore';
import UserModel from '../modules/user/user.model';

/**
 * ============================================================
 * onlineCounts
 * ============================================================
 *
 * প্রতিটি User বর্তমানে কয়টি Socket Connection ব্যবহার করছে
 * তা Store করে।
 *
 * Example
 *
 * user1 => 2
 * user2 => 1
 *
 * যদি একই User Mobile + Browser + Desktop এ Login থাকে,
 * তাহলে Count হবে 3
 */
const onlineCounts = new Map<string, number>();

/**
 * ============================================================
 * presenceSocket()
 * ============================================================
 *
 * এই Socket Module এর কাজ হলো
 *
 * ✔ Online Status Track করা
 * ✔ Offline Status Track করা
 * ✔ Last Seen Save করা
 * ✔ Pending Notification পাঠানো
 * ✔ সকল User কে Online/Offline Update দেওয়া
 *
 * io => Socket.io Server Instance
 */
export default function presenceSocket(io: Server) {

  /**
   * ============================================================
   * যখন নতুন Socket Connect হয়
   * ============================================================
   */
  io.on('connection', (socket) => {

    /**
     * নতুন User Connect হওয়ার সাথে সাথে
     * বর্তমানে Online থাকা সকল User এর List পাঠানো হচ্ছে।
     *
     * Event:
     * presence:init
     */
    socket.emit(
      'presence:init',
      Array.from(onlineCounts.keys())
    );

    /**
     * ============================================================
     * presence:request
     * ============================================================
     *
     * Client যখন আবার Online User List চাইবে
     * তখন এই Event চলবে।
     */
    socket.on('presence:request', () => {

      socket.emit(
        'presence:init',
        Array.from(onlineCounts.keys())
      );
    });

    /**
     * ============================================================
     * presence:update
     * ============================================================
     *
     * User Online অথবা Offline হলে
     * এই Event Execute হয়।
     */
    socket.on(
      'presence:update',
      (
        user: {
          id: string;
          online: boolean;
        }
      ) => {

        /**
         * User ID না থাকলে কিছুই হবে না।
         */
        if (!user?.id) return;

        console.log(
          `presence:update received for user=${user.id} online=${user.online} socket=${socket.id}`
        );

        /**
         * Socket এর ভিতরে User ID Save করা হচ্ছে।
         */
        socket.data.userId = user.id;

        /**
         * ============================================================
         * User Online
         * ============================================================
         */
        if (user.online) {

          /**
           * User এর Existing Connection Count বের করা হচ্ছে।
           */
          const count =
            (onlineCounts.get(user.id) || 0) + 1;

          /**
           * নতুন Count Save করা হচ্ছে।
           */
          onlineCounts.set(user.id, count);

          /**
           * User এর Personal Room এ Join করানো হচ্ছে।
           *
           * Example
           *
           * user:68445
           */
          socket.join(`user:${user.id}`);

          console.log(
            `socket ${socket.id} joined room user:${user.id} (count=${count})`
          );

          /**
           * যদি এটি User এর প্রথম Connection হয়
           *
           * তাহলে সবাইকে Broadcast করা হবে
           * যে User Online হয়েছে।
           */
          if (count === 1) {

            socket.broadcast.emit(
              'presence:update',
              {
                id: user.id,
                online: true,
              }
            );
          }

          /**
           * ============================================================
           * Pending Notification
           * ============================================================
           *
           * Offline থাকাকালীন যে Notification Queue তে ছিল
           * সেগুলো নিয়ে আসা হচ্ছে।
           */
          const pending =
            getPendingNotifications(user.id);

          /**
           * যদি Pending Notification থাকে
           */
          if (pending.length > 0) {

            pending.forEach((notification) => {

              /**
               * প্রতিটি Notification User কে পাঠানো হচ্ছে।
               */
              socket.emit(
                'notification:receive',
                {

                  /**
                   * Notification Type
                   */
                  type: 'message',

                  /**
                   * Title
                   */
                  title: 'New message',

                  /**
                   * Notification Text
                   */
                  body: notification.text,

                  /**
                   * Extra Data
                   */
                  data: {

                    /**
                     * কোন Conversation
                     */
                    conversationId:
                      notification.conversationId,
                  },
                }
              );
            });
          }

        } else {

          /**
           * ============================================================
           * User Offline
           * ============================================================
           */

          /**
           * Connection Count কমানো হচ্ছে।
           */
          const count =
            (onlineCounts.get(user.id) || 0) - 1;

          /**
           * যদি আরও Socket Connected থাকে
           */
          if (count > 0) {

            /**
             * শুধু Count Update হবে।
             */
            onlineCounts.set(
              user.id,
              count
            );

          } else {

            /**
             * User পুরোপুরি Offline।
             *
             * তাই Map থেকে Remove করা হচ্ছে।
             */
            onlineCounts.delete(user.id);

            /**
             * সবাইকে জানানো হচ্ছে
             * User Offline।
             */
            socket.broadcast.emit(
              'presence:update',
              {
                id: user.id,
                online: false,
              }
            );

            /**
             * ============================================================
             * Last Seen Save
             * ============================================================
             *
             * Database এ Current Time Save করা হচ্ছে।
             */
            try {

              UserModel
                .findByIdAndUpdate(
                  user.id,
                  {
                    lastSeen:
                      new Date(),
                  }
                )
                .catch(() => { });

            } catch (e) {

              /**
               * Error Ignore
               */
            }
          }

          console.log(
            `presence:update offline for user=${user.id} socket=${socket.id} newCount=${count}`
          );
        }
      }
    );

    /**
     * ============================================================
     * disconnect
     * ============================================================
     *
     * Browser বন্ধ করলে,
     * Internet Disconnect হলে,
     * Refresh করলে,
     * Socket Close হলে
     *
     * এই Event Execute হয়।
     */
    socket.on(
      'disconnect',
      () => {

        /**
         * Socket থেকে User ID বের করা হচ্ছে।
         */
        const userId =
          socket.data.userId as
          | string
          | undefined;

        /**
         * User ID না থাকলে Return।
         */
        if (!userId) return;

        /**
         * Connection Count কমানো হচ্ছে।
         */
        const count =
          (onlineCounts.get(userId) || 0) - 1;

        /**
         * যদি আরও Connection থাকে
         */
        if (count > 0) {

          onlineCounts.set(
            userId,
            count
          );

        } else {

          /**
           * User পুরোপুরি Offline।
           */
          onlineCounts.delete(userId);

          /**
           * সবাইকে Offline Broadcast।
           */
          socket.broadcast.emit(
            'presence:update',
            {
              id: userId,
              online: false,
            }
          );

          /**
           * Database এ Last Seen Save।
           */
          try {

            UserModel
              .findByIdAndUpdate(
                userId,
                {
                  lastSeen:
                    new Date(),
                }
              )
              .catch(() => { });

          } catch (e) {

            /**
             * Error Ignore
             */
          }
        }

        console.log(
          `socket disconnected ${socket.id} for user=${userId} newCount=${count}`
        );
      }
    );
  });
}