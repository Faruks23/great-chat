"use client";

import React, { useEffect, useRef } from 'react';

type Props = {
  onSelect: (emoji: string) => void;
  className?: string;
};

const EMOJIS = [
  '😊', '😂', '👍', '❤️', '🎉', '😮', '😢', '🙏', '🔥', '😄', '😅', '🤔', '😎', '👏', '💯',
];

export default function EmojiPicker({ onSelect, className = '' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        const ev = new CustomEvent('emojiPicker:close');
        window.dispatchEvent(ev);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div ref={ref} className={`z-50 w-56 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 ${className}`}>
      <div className="grid grid-cols-6 gap-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Insert ${emoji}`}
            onClick={() => onSelect(emoji)}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <span className="text-lg">{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
