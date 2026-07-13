'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { AuthProvider } from '@/providers/AuthProvider';
import { registerServiceWorker } from '@/lib/pwa';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    void registerServiceWorker();
    // attempt to subscribe to push notifications once SW is ready and permissions allowed
    void (async () => {
      try {
        if (Notification.permission === 'granted') {
          // lazy import to avoid SSR issues
          const { subscribeToPush } = await import('@/lib/pwa');
          await subscribeToPush();
        }
      } catch (e) {
        console.warn('Push subscription failed', e);
      }
    })();
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
