'use client';

import { cn } from '@/lib/utils';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'online', label: 'Online' },
  { id: 'groups', label: 'Groups' },
  { id: 'archived', label: 'Archived' },
  { id: 'favorites', label: 'Favorites' },
];

type SidebarFiltersProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SidebarFilters({
  value,
  onChange,
}: SidebarFiltersProps) {
  return (
    <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">

        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",

              value === filter.id
                ? "bg-emerald-500 text-white shadow"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            {filter.label}
          </button>
        ))}

      </div>

    </div>
  );
}