'use client';

import Link from 'next/link';
import { Search, Moon, Sun, MoreVertical, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import ChatAvatar from './ChatAvatar';
import AddUserChatModal from './AddUserChatModal';
import type { Conversation } from '@/store/chatSlice';
import type { User } from '@/types';
import { timeAgoShort, timeAgoLong } from '@/lib/time';

const workspaceLinks = [
  { href: '/chat', label: 'Chat' },
  { href: '/groups', label: 'Groups' },
  { href: '/calls', label: 'Calls' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

type ChatSidebarProps = {
  conversations: Conversation[];
  activeId: string;
  filteredConversations: Conversation[];
  query: string;
  sidebarOpen: boolean;
  theme: string;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onSelectConversation: (id: string) => void;
  onCreateConversation: (conversation: Conversation) => void;
  onStartChatWithFriend?: (friendId: string) => void;
  friends?: User[];
  onToggleTheme: () => void;
};

/**
 * ChatSidebar renders the left navigation and conversation list.
 * It includes search, current user info, new chat creation, and theme controls.
 */
export function ChatSidebar({
  conversations,
  activeId,
  filteredConversations,
  query,
  sidebarOpen,
  theme,
  onClose,
  onQueryChange,
  onSelectConversation,
  onCreateConversation,
  onStartChatWithFriend,
  friends = [],
  onToggleTheme,
}: ChatSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const { user, logout } = useAuth();


  return (
    <>
      {/** Modal to create a new chat with another user. */}
      <AddUserChatModal
        open={showNewChat}
        currentUserId={user?.id ?? null}
        onClose={() => setShowNewChat(false)}
        onFriendAdded={(friend, conversationId) => {
          if (conversationId) {
            onCreateConversation({
              id: conversationId,
              name: friend.name,
              participants: [user?.id ?? '', friend.id],
              lastMessage: '',
              time: '',
              unread: 0,
              online: false,
            });
          }
        }}
      />

      {sidebarOpen ? (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-full max-w-[min(100vw,380px)] flex-col overflow-hidden border-r border-zinc-200 bg-white shadow-xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950 md:static md:h-full md:w-80 md:min-w-80 md:max-w-80 md:flex-shrink-0 md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="border-b border-zinc-200 bg-white px-4 py-4 safe-top dark:border-zinc-800 dark:bg-zinc-950 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Chats</h2>
            </div>
            <div className="flex items-center gap-2">
              {/** New chat button opens the add-user modal. */}
              <Button variant="ghost" onClick={() => setShowNewChat(true)} className="rounded-full border border-zinc-200 p-2 text-zinc-700 shadow-sm transition hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-600">
                <Plus className="h-4 w-4" />
              </Button>
              {/** Theme toggle button switches between light and dark. */}
              <Button variant="ghost" onClick={onToggleTheme} className="rounded-full border border-zinc-200 p-2 text-zinc-700 shadow-sm transition hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-600">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {/** Workspace menu contains navigation links and logout. */}
              <div className="relative hidden md:block">
                <Button variant="ghost" onClick={() => setMenuOpen((open) => !open)} className="rounded-full border border-zinc-200 p-2 text-zinc-700 shadow-sm transition hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-600">
                  <MoreVertical className="h-4 w-4" />
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-950">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">Workspace</div>
                    {workspaceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                        window.location.assign('/login');
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <Button variant="ghost" className="rounded-full border border-zinc-200 p-2 text-zinc-700 shadow-sm transition hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-600 md:hidden" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
          <Link
            href="/profile"
            onClick={onClose}
            className="mt-5 flex items-center gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-3 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <ChatAvatar name={user?.name ?? 'You'} online size={38} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user?.name ?? 'You'}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">View profile</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 md:hidden">
          {workspaceLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-2 py-2.5 text-center text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
              window.location.assign('/login');
            }}
            className="rounded-2xl border border-rose-200 bg-rose-50 px-2 py-2.5 text-center text-xs font-medium text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/60"
          >
            Logout
          </button>
        </div>

        {/** Conversation search input and filter summary. */}
        <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-5">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search chats"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 py-2.5 pl-10 pr-4 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20"
            />
          </label>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{filteredConversations.length} conversations</span>
            {query ? <span>Filtered results</span> : <span>Tap a chat to open</span>}
          </div>
        </div>

        {/** Conversation list items. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 safe-bottom md:px-4 md:py-4">
          {filteredConversations.length === 0 ? (
            <div className="mx-4 mt-6 rounded-3xl border border-dashed border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              No chats match your search.
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const lastSeen = (conversation as any).lastSeen as string | undefined | null;
              const convoTimeAgo = lastSeen ? timeAgoShort(lastSeen) : '';
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    onClose();
                  }}
                  className={`group mb-2 flex w-full items-center gap-3 rounded-3xl border border-transparent bg-white px-4 py-3 text-left transition duration-150 hover:border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 ${conversation.id === activeId ? 'border-emerald-500/30 bg-emerald-50 shadow-sm dark:bg-emerald-500/10' : ''}`}
                >
                  <ChatAvatar name={conversation.name} online={conversation.online} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{conversation.name}</p>
                        {!conversation.online && convoTimeAgo ? (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">· {convoTimeAgo}</span>
                        ) : null}
                      </div>
                      <span className="text-[11px] text-zinc-400">{conversation.time}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{conversation.lastMessage}</p>
                      {conversation.unread > 0 ? (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                          {conversation.unread}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">No unread</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}

          {/* Contacts / Friends section (compact last-seen shown) */}
          {friends && friends.length > 0 ? (
            <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contacts</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Tap a friend to start a chat</p>
                </div>
              </div>
              <div className="space-y-3">
                {friends.map((friend) => {
                  const lastSeen = (friend as any).lastSeen as string | undefined | null;
                  const online = Boolean((friend as any).online);
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => {
                        if (typeof onStartChatWithFriend === 'function') onStartChatWithFriend(friend.id);
                        onClose();
                      }}
                      className="group flex w-full items-center justify-between gap-3 rounded-3xl border border-transparent bg-white px-4 py-3 text-left transition duration-150 hover:border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-3">
                        <ChatAvatar name={friend.name} online={online} lastSeen={lastSeen} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{friend.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{(friend as any).email || (friend as any).phone}</p>
                            {!online && lastSeen ? (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">· {timeAgoShort(lastSeen)}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-zinc-400">Chat</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
