import webpush from 'web-push';
import SubscriptionModel from './subscription.model';
import { env } from '../../config/env';

let initialized = false;

export function initVapid() {
  if (initialized) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    const keys = webpush.generateVAPIDKeys();
    process.env.VAPID_PUBLIC_KEY = keys.publicKey;
    process.env.VAPID_PRIVATE_KEY = keys.privateKey;
  }

  webpush.setVapidDetails('mailto:admin@greatchat.local', process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  initialized = true;
}

export function getPublicVapidKey() {
  initVapid();
  return process.env.VAPID_PUBLIC_KEY!;
}

export async function saveSubscription(userId: string | undefined, sub: any) {
  const existing = await SubscriptionModel.findOne({ endpoint: sub.endpoint }).lean();
  if (!existing) {
    await SubscriptionModel.create({ userId, endpoint: sub.endpoint, keys: sub.keys });
  }
}

export async function sendPushToSubscription(subscription: any, payload: object) {
  initVapid();
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };

  try {
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to send push', err);
  }
}

export async function broadcastPush(payload: object) {
  const subs = await SubscriptionModel.find().lean();
  for (const s of subs) {
    await sendPushToSubscription({ endpoint: s.endpoint, keys: s.keys }, payload);
  }
}
