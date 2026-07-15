import api from '@/lib/axios';

export async function getVapidPublicKey(): Promise<{ publicKey: string }> {
  const res = await api.get('/notifications/vapidPublicKey');
  return res.data;
}

export async function registerPushSubscription(subscription: PushSubscription) {
  const res = await api.post('/notifications/subscribe', subscription);
  return res.data;
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
