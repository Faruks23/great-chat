export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export type InstallPlatform = 'ios' | 'android' | 'desktop' | 'unknown';

export function getInstallPlatform(): InstallPlatform {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIos) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export const registerServiceWorker = async () => {
  if (typeof window === 'undefined') return;

  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported.');
    return;
  }

  // Development → Remove all service workers
  if (process.env.NODE_ENV !== 'production') {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();

      await Promise.all(
        registrations.map((registration) => registration.unregister())
      );

      console.log('Development Service Workers removed.');
    } catch (err) {
      console.warn('Failed to remove service workers', err);
    }

    return;
  }

  try {
    // Wait until page fully loaded
    await new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve(true);
      } else {
        window.addEventListener('load', () => resolve(true), { once: true });
      }
    });

    // Don't register twice
    const existing = await navigator.serviceWorker.getRegistration('/');

    if (existing) {
      console.log('Service Worker already registered.');
      return existing;
    }

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration.scope);

    return registration;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return null;
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
  if (typeof window === 'undefined') return null;

  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported.');
    return null;
  }

  if (!('PushManager' in window)) {
    console.warn('Push API is not supported.');
    return null;
  }

  // Push requires HTTPS (except localhost)
  if (
    location.protocol !== 'https:' &&
    location.hostname !== 'localhost'
  ) {
    console.warn('Push notifications require HTTPS.');
    return null;
  }

  // Notification permission
  if (!('Notification' in window)) return null;

  if (Notification.permission === 'denied') {
    console.warn('Notification permission denied.');
    return null;
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('Notification permission not granted.');
      return null;
    }
  }

  try {
    // Wait until Service Worker is active
    const registration = await navigator.serviceWorker.ready;

    let subscription =
      await registration.pushManager.getSubscription();

    // Get VAPID key
    const response = await fetch(
      `${API_BASE}/notifications/vapidPublicKey`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch VAPID public key');
    }

    const { publicKey } = await response.json();

    if (!publicKey) {
      throw new Error('Invalid VAPID public key');
    }

    // Subscribe only if not already subscribed
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    // Always sync with server
    try {
      const { registerPushSubscription } = await import(
        '@/services/notificationService'
      );

      await registerPushSubscription(subscription);
    } catch (err) {
      console.error('Server registration failed', err);
    }

    return subscription;
  } catch (err) {
    console.error('Push subscription failed:', err);
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
