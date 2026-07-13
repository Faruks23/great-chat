export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  if (process.env.NODE_ENV !== 'production') {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    } catch (error) {
      console.warn('Service worker cleanup failed', error);
    }
    return;
  }

  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (error) {
    console.error('Service worker registration failed', error);
  }
};

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
};

export const showBrowserNotification = async (
  title: string,
  body: string,
  data?: { url?: string; conversationId?: string; senderId?: string }
) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    data: {
      url: data?.url ?? '/chat',
      conversationId: data?.conversationId,
      senderId: data?.senderId,
    },
  });
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const subscribeToPush = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  try {
    const res = await fetch(`${API_BASE}/notifications/vapidPublicKey`);
    const data = await res.json();
    const publicKey = data.publicKey as string;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // use app api client to ensure auth headers are included
    try {
      const { registerPushSubscription } = await import('@/services/notificationService');
      await registerPushSubscription(subscription as unknown as PushSubscription);
    } catch (e) {
      // fallback to fetch if api client not available
      await fetch(`${API_BASE}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    }
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push', error);
    return null;
  }
};

export const unsubscribeFromPush = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    // inform server via axios wrapper
    try {
      const { unsubscribePush } = await import('@/services/notificationService');
      await unsubscribePush(endpoint);
    } catch (e) {
      await fetch(`${API_BASE}/notifications/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
    }
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe', error);
    return false;
  }
};
