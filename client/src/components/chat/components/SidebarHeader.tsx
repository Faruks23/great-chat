'use client';

import Link from 'next/link';
import { Moon, Sun, MoreVertical, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatAvatar from '../ui/ChatAvatar';


const workspaceLinks = [
  { href: '/chat', label: 'Chats' },
  { href: '/groups', label: 'Groups' },
  { href: '/calls', label: 'Calls' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

type SidebarHeaderProps = {
  user?: {
    name?: string;
  } | null;

  theme: string;

  menuOpen: boolean;

  onToggleMenu: () => void;

  onToggleTheme: () => void;

  onNewChat: () => void;

  onClose: () => void;

  logout: () => void;
};

export default function SidebarHeader({
  user,
  theme,
  menuOpen,
  onToggleMenu,
  onToggleTheme,
  onNewChat,
  onClose,
  logout,
}: SidebarHeaderProps) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good Morning'
      : hour < 18
        ? 'Good Afternoon'
        : 'Good Evening';

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          {/* User */}

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-2xl transition hover:bg-zinc-100 p-1 dark:hover:bg-zinc-900"
          >
            <ChatAvatar
              name={user?.name ?? 'You'}
              online
              size={46}
            />

            <div className="min-w-0">
              <p className="text-xs text-zinc-500">
                {greeting}
              </p>

              <h2 className="truncate text-base font-semibold">
                {user?.name ?? 'You'}
              </h2>
            </div>
          </Link>

          {/* Actions */}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <div className="relative hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMenu}
                className="rounded-full"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="py-2">
                    {workspaceLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        {item.label}
                      </Link>
                    ))}

                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}