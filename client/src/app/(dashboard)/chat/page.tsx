'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatUI from '@/components/chat/ChatUI';
import { useAuth } from '@/hooks/useAuth';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && (!isAuthenticated || !user)) {
      router.replace('/login');
    }
  }, [isAuthenticated, isReady, router, user]);

  if (!isReady || !isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="p-0 m-0">
      <ChatUI />
    </div>
  );
}
