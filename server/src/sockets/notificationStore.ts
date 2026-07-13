type PendingNotification = {
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  recipientId: string;
};

const pendingNotifications = new Map<string, PendingNotification[]>();

export function queuePendingNotification(recipientId: string, payload: PendingNotification) {
  const existing = pendingNotifications.get(recipientId) ?? [];
  existing.push(payload);
  pendingNotifications.set(recipientId, existing);
}

export function getPendingNotifications(recipientId: string) {
  const pending = pendingNotifications.get(recipientId) ?? [];
  pendingNotifications.delete(recipientId);
  return pending;
}

export function hasPendingNotifications(recipientId: string) {
  return (pendingNotifications.get(recipientId) ?? []).length > 0;
}
