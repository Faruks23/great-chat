import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from '@/providers/Providers';

export const metadata: Metadata = {
  title: 'Great Chat',
  description: 'A modern chat application.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.svg',
    shortcut: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="safe-x">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
