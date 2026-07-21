'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { AuthProvider } from '@/providers/AuthProvider';
import { registerServiceWorker } from '@/lib/pwa';
import { getAuthToken } from '@/lib/auth';

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
  useEffect(() => {
    registerServiceWorker();

    (async () => {
      try {
        if (
          Notification.permission !== "granted"
        ) {
          return;
        }

        const token = getAuthToken();

        if (!token) return;

        const { subscribeToPush } =
          await import("@/lib/pwa");

        await subscribeToPush();
      } catch (err) {
        console.warn(err);
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
