"use client";

import Skeleton from './Skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="w-full max-w-3xl">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-8 w-48 mb-2"><Skeleton className="h-8 w-48" /></div>
              <div className="h-4 w-40"><Skeleton className="h-4 w-40" /></div>
            </div>
            <div className="h-16 w-16"><Skeleton className="h-16 w-16 rounded-full" /></div>
          </div>
        </div>
      </div>

      <div>
        <div className="h-6 w-40 mb-4"><Skeleton className="h-6 w-40" /></div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10"><Skeleton className="h-10 w-10 rounded-full" /></div>
                <div className="flex-1">
                  <div className="h-4 w-32 mb-2"><Skeleton className="h-4 w-32" /></div>
                  <div className="h-3 w-40"><Skeleton className="h-3 w-40" /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
