'use client';

import { Search } from 'lucide-react';

type SidebarSearchProps = {
  value: string;
  conversationCount: number;
  onChange: (value: string) => void;
};

export default function SidebarSearch({
  value,
  conversationCount,
  onChange,
}: SidebarSearchProps) {
  return (
    <div className="sticky top-[78px] z-20 border-b border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95">

      <label className="relative block">

        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search chats..."
          className="
            w-full
            rounded-full
            border
            border-zinc-200
            bg-zinc-100
            py-3
            pl-11
            pr-4
            text-sm
            outline-none
            transition-all
            focus:border-emerald-500
            focus:bg-white
            focus:ring-4
            focus:ring-emerald-100
            dark:border-zinc-700
            dark:bg-zinc-900
            dark:focus:bg-zinc-950
            dark:focus:ring-emerald-500/20
          "
        />
      </label>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">

        <span>
          {conversationCount} Conversations
        </span>

        <span>
          {value ? "Searching..." : "Recent"}
        </span>

      </div>
    </div>
  );
}