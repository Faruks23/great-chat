import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from '@/providers/Providers';
import ServiceWorker from '@/components/ServiceWorker';

import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});
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
    <html lang="en" suppressHydrationWarning  className={geist.variable}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="safe-x font-sans">
         <ServiceWorker></ServiceWorker>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
