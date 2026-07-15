"use client";

export default function Skeleton({ className = 'h-4 w-full rounded bg-zinc-200/60 animate-pulse' }: { className?: string }) {
  return <div className={className} />;
}
