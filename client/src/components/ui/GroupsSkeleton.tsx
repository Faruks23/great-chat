"use client";

import Skeleton from './Skeleton';

export default function GroupsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48"><Skeleton className="h-8 w-48" /></div>
          <div className="mt-2 h-4 w-64"><Skeleton className="h-4 w-64" /></div>
        </div>
        <div className="h-10 w-32"><Skeleton className="h-10 w-32" /></div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="h-6 w-32 mb-2"><Skeleton className="h-6 w-32" /></div>
                <div className="h-4 w-20"><Skeleton className="h-4 w-20" /></div>
              </div>
              <div className="h-12 w-12"><Skeleton className="h-12 w-12 rounded-full" /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
