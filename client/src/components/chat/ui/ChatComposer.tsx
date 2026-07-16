'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Mic, Paperclip, Search, Send, X } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import { Button } from '@/components/ui/button';
import type { MessageAttachment } from '@/store/chatSlice';

type ChatComposerProps = {
  draft: string;
  attachments: MessageAttachment[];
  isRecording: boolean;
  searchValue: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handler = () => setShowEmojiPicker(false);
    window.addEventListener('emojiPicker:close', handler as EventListener);
    return () => window.removeEventListener('emojiPicker:close', handler as EventListener);
  }, []);

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

      {attachments.length ? (
        <div className="mb-3 space-y-2">
          {attachments.map((attachment, index) => {
            const progress = attachment.progress ?? 0;
            const isUploading = attachment.isUploading;
            const label = attachment.name ?? (attachment.type === 'image' ? 'Image' : attachment.type === 'video' ? 'Video' : 'Attachment');

            return (
              <div key={attachment.id ?? `${label}-${index}`} className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 truncate font-medium">{label}</div>
                      {isUploading ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Uploading</span> : null}
                    </div>
                    {attachment.type === 'image' && attachment.url ? (
                      <img src={attachment.url} alt={attachment.name} className="h-24 w-full rounded-2xl object-cover" />
                    ) : attachment.type === 'video' && attachment.url ? (
                      <video controls src={attachment.url} className="h-24 w-full rounded-2xl bg-zinc-950 object-cover" />
                    ) : attachment.type === 'voice' && attachment.url ? (
                      <audio controls src={attachment.url} className="w-full" />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    onClick={() => onRemoveAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>{attachment.mimeType || 'Unknown file type'}</span>
                  {attachment.size ? <span>{Math.round(attachment.size / 1024)} KB</span> : null}
                </div>
                {isUploading ? (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="flex gap-5 md:gap-3 flex-row !justify-between items-center">
        <div className="flex items-center gap-2">
          {/** File attachment button, hidden file input triggers the browser dialog. */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={(event) => {
              const files = event.target.files;
              if (files) {
                Array.from(files).forEach((file) => void onAttachFile(file));
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
          <div className="relative">
            <Button
              variant="ghost"
              className="inline-flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="Open emoji picker"
              onClick={() => setShowEmojiPicker((s) => !s)}
            >
              <span className="text-lg">😊</span>
            </Button>
            {showEmojiPicker && (
              <div className="absolute left-0 bottom-12">
                <EmojiPicker
                  onSelect={(emoji) => {
                    onAddEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}
          </div>

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
              disabled={(!draft.trim() && attachments.length === 0) || attachments.some((attachment) => attachment.isUploading)}
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
