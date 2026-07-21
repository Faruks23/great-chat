import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Great Chat - Auth',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-dvh items-center justify-center bg-zinc-100 px-4 py-6 safe-top safe-bottom dark:bg-zinc-950 sm:px-6 sm:py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Great Chat
          </Link>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Secure access to your team messaging.</p>
        </div>
        {children}
        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
