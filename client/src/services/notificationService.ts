import api from '@/lib/axios';

export async function getVapidPublicKey(): Promise<{ publicKey: string }> {
  const res = await api.get('/notifications/vapidPublicKey');
  return res.data;
}

export async function registerPushSubscription(
  subscription: PushSubscription
) {
  try {
    const { data } = await api.post(
      "/notifications/subscribe",
      subscription.toJSON()
    );

    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn("Push skipped");
      return null;
    }

    throw error;
  }
}

export async function broadcastTest(payload: any) {
  const res = await api.post('/notifications/broadcast', payload);
  return res.data;
}

export async function unsubscribePush(endpoint?: string) {
  const res = await api.post('/notifications/unsubscribe', { endpoint });
  return res.data;
}

export async function sendSocketNotification(payload: {
  type: string;
  title: string;
  body: string;
  data?: { url?: string; conversationId?: string; senderId?: string; recipientId?: string };
}) {
  const socketModule = await import('@/lib/socket');
  const socket = socketModule.getSocket();
  if (!socket) return;
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('notification:send', payload);
}
