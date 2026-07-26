import React from 'react'

function EmptyState( {onToggleSidebar,onQueryChange}:any) {
  return (
    <div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        {/**
             * Empty state shown when no conversation is selected.
             * This UI encourages the user to open the sidebar or start a new chat.
             */}
        <div className="w-full max-w-2xl rounded-[2rem] border border-dashed border-zinc-200 bg-white/90 p-10 text-center shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">No conversation selected</p>
          <h2 className="mt-4 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Pick a chat or start a new conversation</h2>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Select a conversation from the list, or open the sidebar to begin a new private message.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={onToggleSidebar} className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
              Open chats
            </button>
            <button onClick={() => onQueryChange('')} className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
              Enable notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyState