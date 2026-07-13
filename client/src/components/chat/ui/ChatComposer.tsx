'use client';

import { Mic, Paperclip, Search, Send, Smile, X } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { MessageAttachment } from '@/store/chatSlice';

type ChatComposerProps = {
  draft: string;
  attachments: MessageAttachment[];
  isRecording: boolean;
  searchValue: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onDraftChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onAttachFile: (file: File) => Promise<void>;
  onAddEmoji: (emoji: string) => void;
  onToggleRecording: () => void;
  onRemoveAttachment: (index: number) => void;
  onSearchChange: (value: string) => void;
  replyTo?: { id: number | string; text: string; sender: 'me' | 'them'; name?: string };
  onCancelReply?: () => void;
};

/**
 * ChatComposer renders the bottom input area for drafting and sending messages.
 * It also supports attachments, emoji insertion, voice recording, and reply previews.
 */
export default function ChatComposer({
  draft,
  attachments,
  isRecording,
  searchValue,
  textareaRef,
  onDraftChange,
  onKeyDown,
  onSend,
  onAttachFile,
  onAddEmoji,
  onToggleRecording,
  onRemoveAttachment,
  onSearchChange,
  replyTo,
  onCancelReply,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 md:static md:px-4 md:py-4">
      {replyTo ? (
        <div className="mb-2 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-300">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em]">Replying to {replyTo.name ?? 'message'}</p>
            <p className="truncate">{replyTo.text}</p>
          </div>
          <button type="button" onClick={onCancelReply} className="rounded-full p-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex gap-5 md:gap-3 flex-row !justify-between items-center">
        <div className="flex items-center gap-2">
          {/** File attachment button, hidden file input triggers the browser dialog. */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void onAttachFile(file);
              }
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          />
          <Button
            variant="ghost"
            className="inline-flex h-8 md:h-10 w-8 md:w-10 min-w-[2.5rem] items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Attach file"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/** Add a quick emoji to the draft text. */}
          <Button
            variant="ghost"
            className="inline-flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Add emoji"
            onClick={() => onAddEmoji('😊')}
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/** Toggle voice recording mode. */}
          <Button
            variant="ghost"
            className="inline-flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
            onClick={onToggleRecording}
          >
            <Mic className="h-4 w-4" />
          </Button>

          {/** Toggle the search field or clear it if already active. */}
          <Button
            variant="ghost"
            className="inline-flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Search messages"
            onClick={() => onSearchChange(searchValue === '' ? 'search' : '')}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-row gap-2 flex-1 items-center">
          <div className="min-h-[2.5rem] rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:border-emerald-400 dark:focus-within:ring-emerald-500/20">
            {/** The actual message input textarea. */}
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message"
              rows={1}
              className="max-h-9 md:min-h-[2rem] w-full resize-none bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100"
            />
          </div>
          <div className="flex justify-end">
            {/** Send button becomes enabled when there is draft text. */}
            <Button
              type="button"
              onClick={onSend}
              disabled={!draft.trim()}
              className="inline-flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
