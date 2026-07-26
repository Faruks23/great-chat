'use client';

import { Check, CheckCheck, Pin } from 'lucide-react';
import ChatAvatar from '../ui/ChatAvatar';

import { cn } from '@/lib/utils';

type ConversationItemProps = {
  conversation: any;
  active: boolean;
  onClick: () => void;
};

export default function ConversationItem({
  conversation,
  active,
  onClick,
}: ConversationItemProps) {
  const unread = conversation.unreadCount ?? 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200',
        active
          ? 'bg-emerald-50 shadow-sm dark:bg-emerald-500/10'
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
      )}
    >
      <div className="relative">
        <ChatAvatar
          name={conversation.name}
          src={conversation.avatar}
          online={conversation.online}
          size={54}
        />

        {conversation.online && (
          <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950" />
        )}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between gap-3">

          <h3 className="truncate font-semibold">
            {conversation.name}
          </h3>

          <span className="text-xs text-zinc-500">
            {conversation.time}
          </span>

        </div>

        <div className="mt-1 flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-1 text-sm text-zinc-500">

            {conversation.sent && (
              conversation.seen
                ? <CheckCheck className="h-4 w-4 text-sky-500" />
                : <Check className="h-4 w-4" />
            )}

            <p className="truncate">

              {conversation.typing
                ? (
                  <span className="font-medium text-emerald-500">
                    Typing...
                  </span>
                )
                : conversation.lastMessage}

            </p>

          </div>

          <div className="flex items-center gap-2">

            {conversation.pinned && (
              <Pin className="h-3.5 w-3.5 text-zinc-400" />
            )}

            {unread > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-semibold text-white">
                {unread}
              </span>
            )}

          </div>

        </div>

      </div>
    </button>
  );
}