"use client";

import { useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import AddUserChatModal from "./AddUserChatModal";
import type { Conversation } from "@/store/chatSlice";
import type { User } from "@/types";

import SidebarHeader from "../components/SidebarHeader";
import SidebarSearch from "../components/SidebarSearch";
import SidebarFilters from "../components/SidebarFilters";
import ConversationList from "../components/ConversationList";
import ContactsSection from "../components/ContactsSection";

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
  const [activeFilter, setActiveFilter] = useState("all");

  const handleConversationSelect = (conversation: Conversation) => {
    onSelectConversation(conversation.id);

    onClose();
  };

  const handleFriendSelect = (friend: User) => {
    onStartChatWithFriend?.(friend.id);

    onClose();
  };
  const visibleConversations = useMemo(() => {
    const filters = {
      unread: (c: Conversation) => c.unread > 0,
      online: (c: Conversation) => c.online,
      groups: (c: Conversation) => c.type === "group",
      favorites: (c: Conversation) => c.favorite,
      archived: (c: Conversation) => c.archived,
    };

    return activeFilter === "all"
      ? filteredConversations
      : filteredConversations.filter(
          filters[activeFilter as keyof typeof filters],
        );
  }, [filteredConversations, activeFilter]);

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
              participants: [user?.id ?? "", friend.id],
              lastMessage: "",
              time: "",
              unread: 0,
              online: false,
            });
          }
        }}
      />

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-full max-w-[min(100vw,380px)] flex-col overflow-hidden border-r border-zinc-200 bg-white shadow-xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950 md:static md:h-full md:w-90
xl:w-97.5 md:shrink-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <SidebarHeader
          user={user}
          theme={theme}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((v) => !v)}
          onToggleTheme={onToggleTheme}
          onNewChat={() => setShowNewChat(true)}
          onClose={onClose}
          logout={() => {
            logout();
            window.location.assign("/login");
          }}
        />

        {/* <div className="grid grid-cols-3 gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 md:hidden">
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
              window.location.assign("/login");
            }}
            className="rounded-2xl border border-rose-200 bg-rose-50 px-2 py-2.5 text-center text-xs font-medium text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/60"
          >
            Logout
          </button>
        </div> */}

        <SidebarSearch
          value={query}
          conversationCount={filteredConversations.length}
          onChange={onQueryChange}
        />
        <SidebarFilters value={activeFilter} onChange={setActiveFilter} />

        {/** Conversation list items. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 safe-bottom md:px-4 md:py-4">
          <ConversationList
            conversations={visibleConversations}
            activeConversationId={activeId}
            onSelect={handleConversationSelect}
          />

          {/* Contacts / Friends section (compact last-seen shown) */}
          <ContactsSection contacts={friends} onSelect={handleFriendSelect} />
        </div>
      </aside>
    </>
  );
}
