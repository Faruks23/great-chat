import { Server } from 'socket.io';

/**
 * callSocket function
 *
 * এই function-এর কাজ হলো Socket.io এর মাধ্যমে
 * Voice Call / Video Call এর জন্য
 * সমস্ত socket event register করা।
 *
 * io => Socket.io server instance
 */
export default function callSocket(io: Server) {

  /**
   * যখন নতুন একজন user socket server এ connect হয়
   */
  io.on('connection', (socket) => {

    /**
     * ===============================
     * call:join
     * ===============================
     *
     * User যখন call এ join করে তখন এই event execute হয়।
     *
     * room => Call Room ID
     * peerId => User ID
     */
    socket.on('call:join', (room: string, peerId?: string) => {

      /**
       * User কে call room এ join করানো হচ্ছে।
       *
       * Example:
       * room = abc123
       *
       * তাহলে socket join করবে
       *
       * call:abc123
       */
      socket.join(`call:${room}`);

      /**
       * যদি peerId থাকে
       * তাহলে user এর জন্য একটি private room তৈরি হবে।
       *
       * Example
       *
       * peer:64389
       */
      if (peerId) {
        socket.join(`peer:${peerId}`);
      }

      /**
       * Room এর অন্য সবাইকে জানানো হচ্ছে
       * নতুন একজন join করেছে।
       *
       * নিজে এই event receive করবে না।
       */
      socket.to(`call:${room}`).emit('call:participant-joined', {
        room,
        peerId,
      });
    });

    /**
     * ===============================
     * call:leave
     * ===============================
     *
     * User call leave করলে execute হবে।
     */
    socket.on('call:leave', (room: string, peerId?: string) => {

      /**
       * Call Room থেকে বের হয়ে যাচ্ছে।
       */
      socket.leave(`call:${room}`);

      /**
       * নিজের peer room থেকেও বের হচ্ছে।
       */
      if (peerId) {
        socket.leave(`peer:${peerId}`);
      }

      /**
       * অন্য সবাইকে জানানো হচ্ছে
       * user call leave করেছে।
       */
      socket.to(`call:${room}`).emit('call:participant-left', {
        room,
        peerId,
      });
    });

    /**
     * ===============================
     * call:signal
     * ===============================
     *
     * WebRTC Signaling এর জন্য ব্যবহৃত হয়।
     *
     * এখানে Offer
     * Answer
     * ICE Candidate
     * exchange হয়।
     */
    socket.on('call:signal', (payload) => {

      try {

        /**
         * যদি payload এ targetId থাকে
         *
         * তাহলে signal শুধুমাত্র ওই user এর কাছে যাবে।
         *
         * One-to-One Signaling
         */
        if (payload && (payload as any).targetId) {

          const targetId = (payload as any).targetId;

          /**
           * User এর private room
           */
          const peerRoom = `peer:${targetId}`;

          console.log(`call:signal targeted to peer:${targetId}`);

          /**
           * শুধু target user signal receive করবে।
           */
          io.to(peerRoom).emit('call:signal', payload);

        } else {

          /**
           * targetId না থাকলে
           * পুরো call room এ broadcast হবে।
           *
           * Sender বাদে সবাই receive করবে।
           */
          socket.broadcast
            .to(`call:${payload.room}`)
            .emit('call:signal', payload);
        }

      } catch (err) {

        /**
         * Signal error log
         */
        console.error('call:signal error', err);
      }
    });

    /**
     * ===============================
     * presence:update
     * ===============================
     *
     * User online/offline update।
     *
     * Example
     *
     * {
     *    id:"123",
     *    online:true
     * }
     */
    socket.on('presence:update', (user: { id?: string; online?: boolean }) => {

      /**
       * User ID না থাকলে কিছুই হবে না।
       */
      if (!user?.id) return;

      console.log(
        `call.socket presence:update user=${user.id} online=${user.online} socket=${socket.id}`
      );

      /**
       * Socket এর ভিতরে userId store করা হচ্ছে।
       */
      socket.data.userId = user.id;

      /**
       * User online হলে
       * তার personal room এ join করবে।
       */
      if (user.online) {

        /**
         * user:123
         */
        socket.join(`user:${user.id}`);

        console.log(
          `call.socket: socket ${socket.id} joined user:${user.id}`
        );
      }
    });

    /**
     * ===============================
     * call:invite
     * ===============================
     *
     * কাউকে Call Invitation পাঠানোর event।
     *
     * WhatsApp / Messenger এর Incoming Call এর মতো।
     */
    socket.on(
      'call:invite',
      (
        payload: {
          room: string;
          from?: string;
          targets?: string[];
          mode?: string;
          kind?: string;
        }
      ) => {

        try {

          /**
           * শুধুমাত্র valid target রাখা হচ্ছে।
           */
          const targets = Array.isArray(payload.targets)
            ? payload.targets.filter(Boolean)
            : [];

          /**
           * Incoming Call এর payload তৈরি।
           */
          const eventPayload = {

            /**
             * Room ID
             */
            room: payload.room,

            /**
             * কে call করছে
             */
            from: payload.from,

            /**
             * voice অথবা video
             */
            mode: payload.mode || 'voice',

            /**
             * direct/group
             */
            kind: payload.kind || 'direct',

            /**
             * Current Time
             */
            timestamp: Date.now(),
          };

          console.log('call:invite', {
            room: payload.room,
            from: payload.from,
            targets,
            mode: payload.mode,
          });

          /**
           * যদি target list থাকে
           */
          if (targets.length > 0) {

            targets.forEach((targetId) => {

              /**
               * User এর private room
               */
              const targetRoom = `user:${targetId}`;

              console.log(
                `emitting call:incoming to user:${targetId}`
              );

              /**
               * Incoming Call Event
               */
              io.to(targetRoom).emit(
                'call:incoming',
                eventPayload
              );

              /**
               * Notification পাঠানো হচ্ছে।
               */
              io.to(targetRoom).emit(
                'notification:receive',
                {

                  /**
                   * Notification Type
                   */
                  type: 'call',

                  /**
                   * Notification Title
                   */
                  title: 'Incoming call',

                  /**
                   * Notification Body
                   */
                  body: `Incoming ${eventPayload.mode} call`,

                  /**
                   * Extra Data
                   */
                  data: {
                    room: payload.room,
                    mode: eventPayload.mode,
                  },
                }
              );
            });

          } else {

            /**
             * যদি target না থাকে
             *
             * Debug Mode
             *
             * সবাই receive করবে।
             */
            console.log(
              'call:invite has no targets, broadcasting to all clients'
            );

            io.emit('call:incoming', {
              ...eventPayload,
              debug: true,
            });
          }

        } catch (err) {

          /**
           * Invitation Error
           */
          console.error('call:invite error', err);
        }
      }
    );
  });
}