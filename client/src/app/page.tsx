'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InstallAppButton } from '@/components/InstallAppButton';
import { getAuthToken } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (token) router.replace('/chat');
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.20),_transparent_40%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_35%)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-2 items-center">

          <section className="text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur">
              Great Chat • Fast • Secure • Modern
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Connect, chat, and collaborate in one place.
            </h1>

            <p className="mt-5 max-w-xl text-base text-white/70 sm:text-lg">
              Create teams, send messages instantly, and manage your profile with a smooth, elegant experience.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="/login"
                className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-[1.02] hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-white/15 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:scale-[1.02] hover:bg-white/15"
              >
                Register
              </Link>
              <InstallAppButton />
            </div>
            <p className="mt-4 text-sm text-white/60">
              Install on your phone or computer for quick access from your home screen or desktop.
            </p>
          </section>

          <section className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="rounded-2xl bg-slate-950/70 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-indigo-600 px-4 py-3 text-sm">
                      Welcome to Great Chat 👋
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-white/10 px-4 py-3 text-sm text-white/85">
                      Build teams, share ideas, and stay connected.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-cyan-500/90 px-4 py-3 text-sm text-slate-950 font-medium">
                      Fast, clean, and ready to use.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-cyan-400/30 blur-3xl" />
          </section>
        </div>
      </div>
    </main>
  );
}
